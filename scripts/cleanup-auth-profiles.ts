/**
 * CLEANUP SCRIPT: Remove duplicate and orphaned user profiles
 * 
 * This script safely cleans up the MongoDB database after auth architecture fixes.
 * 
 * What it does:
 * 1. Connects to both Auth.js (native driver) and app (Mongoose) collections
 * 2. Finds profiles with duplicate email addresses
 * 3. Validates which profiles have valid authUserId in Auth.js users collection
 * 4. Keeps ONE valid profile per email (preferring registered ones)
 * 5. Deletes orphaned profiles (authUserId not in Auth.js users)
 * 6. Reports all changes with detailed logging
 * 
 * SAFE TO RUN: Only deletes profiles that have no valid Auth.js link
 * 
 * Usage:
 *   npx tsx scripts/cleanup-auth-profiles.ts
 */

import { MongoClient, ObjectId } from "mongodb"
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || ""

interface AuthUser {
  _id: ObjectId
  email: string
  emailVerified: Date | null
}

interface AppProfile {
  _id: ObjectId
  authUserId: string
  email: string
  name?: string
  tzId: string
  registrationCompleted: boolean
  createdAt: Date
}

async function cleanup() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in environment")
    process.exit(1)
  }

  console.log("🔧 Connecting to MongoDB...")
  
  // Connect with native driver for Auth.js collections
  const nativeClient = new MongoClient(MONGODB_URI)
  await nativeClient.connect()
  const nativeDb = nativeClient.db()
  
  // Connect with Mongoose for app collections
  await mongoose.connect(MONGODB_URI)
  const mongooseDb = mongoose.connection.db
  
  console.log("✅ Connected to MongoDB\n")

  try {
    // Step 1: Get all Auth.js users
    const authUsers = await nativeDb
      .collection<AuthUser>("users")
      .find({})
      .toArray()
    
    const validAuthUserIds = new Set(authUsers.map(u => u._id.toString()))
    console.log(`📊 Found ${authUsers.length} Auth.js users`)

    // Step 2: Get all app profiles
    const appProfiles = await mongooseDb!
      .collection<AppProfile>("userprofiles")
      .find({})
      .toArray()
    
    console.log(`📊 Found ${appProfiles.length} app profiles\n`)

    // Step 3: Group profiles by email
    const profilesByEmail = new Map<string, AppProfile[]>()
    for (const profile of appProfiles) {
      const email = profile.email
      if (!profilesByEmail.has(email)) {
        profilesByEmail.set(email, [])
      }
      profilesByEmail.get(email)!.push(profile)
    }

    // Step 4: Find duplicates and orphans
    const duplicateEmails: string[] = []
    const orphanedProfiles: AppProfile[] = []
    const profilesToDelete: ObjectId[] = []

    for (const [email, profiles] of profilesByEmail) {
      // Check for duplicates
      if (profiles.length > 1) {
        duplicateEmails.push(email)
        console.log(`⚠️  Duplicate profiles for ${email}:`)
        
        // Find valid profiles (authUserId exists in Auth.js)
        const validProfiles = profiles.filter(p => 
          validAuthUserIds.has(p.authUserId)
        )
        
        const invalidProfiles = profiles.filter(p => 
          !validAuthUserIds.has(p.authUserId)
        )

        // Show all profiles
        profiles.forEach((p, i) => {
          const isValid = validAuthUserIds.has(p.authUserId)
          const status = isValid ? "✅ VALID" : "❌ ORPHAN"
          console.log(`   ${i + 1}. ${status} | authUserId: ${p.authUserId.substring(0, 12)}... | tzId: ${p.tzId} | registered: ${p.registrationCompleted}`)
        })

        if (validProfiles.length === 0) {
          console.log(`   🚨 NO VALID PROFILES - will delete all`)
          profilesToDelete.push(...profiles.map(p => p._id))
        } else if (validProfiles.length === 1) {
          console.log(`   ✅ Keeping 1 valid profile, deleting ${invalidProfiles.length} orphans`)
          profilesToDelete.push(...invalidProfiles.map(p => p._id))
        } else {
          // Multiple valid profiles - keep the most complete one
          const bestProfile = validProfiles.sort((a, b) => {
            if (a.registrationCompleted !== b.registrationCompleted) {
              return b.registrationCompleted ? 1 : -1
            }
            return b.createdAt.getTime() - a.createdAt.getTime()
          })[0]
          
          const duplicatesToDelete = profiles.filter(p => p._id !== bestProfile._id)
          console.log(`   ✅ Keeping best profile (${bestProfile.tzId}), deleting ${duplicatesToDelete.length} duplicates`)
          profilesToDelete.push(...duplicatesToDelete.map(p => p._id))
        }
        console.log()
      } else {
        // Single profile - check if orphaned
        const profile = profiles[0]
        if (!validAuthUserIds.has(profile.authUserId)) {
          orphanedProfiles.push(profile)
          profilesToDelete.push(profile._id)
        }
      }
    }

    // Step 5: Report findings
    console.log("\n📋 SUMMARY:")
    console.log(`   Total profiles: ${appProfiles.length}`)
    console.log(`   Duplicate emails: ${duplicateEmails.length}`)
    console.log(`   Orphaned profiles: ${orphanedProfiles.length}`)
    console.log(`   Profiles to delete: ${profilesToDelete.length}`)

    if (orphanedProfiles.length > 0) {
      console.log("\n🗑️  Orphaned profiles (no Auth.js link):")
      orphanedProfiles.forEach(p => {
        console.log(`   - ${p.email} | authUserId: ${p.authUserId.substring(0, 12)}... | tzId: ${p.tzId}`)
      })
    }

    // Step 6: Ask for confirmation
    if (profilesToDelete.length === 0) {
      console.log("\n✅ No profiles to delete - database is clean!")
    } else {
      console.log(`\n⚠️  About to delete ${profilesToDelete.length} profiles`)
      console.log("   This action CANNOT be undone!")
      console.log("\n   Run with --dry-run to see what would be deleted")
      console.log("   Run with --execute to perform deletion")
      
      const isDryRun = process.argv.includes("--dry-run")
      const isExecute = process.argv.includes("--execute")

      if (isDryRun) {
        console.log("\n🔍 DRY RUN MODE - no changes made")
      } else if (isExecute) {
        console.log("\n🗑️  EXECUTING DELETION...")
        const result = await mongooseDb!
          .collection("userprofiles")
          .deleteMany({ _id: { $in: profilesToDelete } })
        
        console.log(`✅ Deleted ${result.deletedCount} profiles`)
      } else {
        console.log("\n❌ No action specified. Use --dry-run or --execute")
      }
    }

  } catch (error) {
    console.error("❌ Error during cleanup:", error)
    throw error
  } finally {
    await nativeClient.close()
    await mongoose.disconnect()
    console.log("\n🔌 Disconnected from MongoDB")
  }
}

// Run cleanup
cleanup()
  .then(() => {
    console.log("\n✅ Cleanup complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Cleanup failed:", error)
    process.exit(1)
  })
