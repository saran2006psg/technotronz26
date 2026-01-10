/**
 * Cleanup Script: Remove Duplicate Profiles
 * 
 * This script fixes duplicate profiles caused by email-based lookups.
 * It keeps ONE profile per authUserId (the one linked to Auth.js users collection)
 * and deletes orphaned profiles.
 * 
 * SAFE TO RUN: Only deletes profiles where authUserId doesn't exist in Auth.js users collection
 * 
 * Usage: npx tsx scripts/cleanup-duplicates.ts
 */

import mongoose from "mongoose"
import connectDB from "../lib/db"
import User from "../models/User"
import clientPromise from "../lib/mongodb"

interface DuplicateGroup {
  email: string
  count: number
  profiles: Array<{
    _id: string
    authUserId: string
    registrationCompleted: boolean
    createdAt: Date
  }>
}

async function main() {
  console.log("=".repeat(60))
  console.log("DUPLICATE PROFILE CLEANUP SCRIPT")
  console.log("=".repeat(60))
  
  // Connect to MongoDB
  await connectDB()
  const client = await clientPromise
  const db = client.db()
  
  console.log("\n1️⃣ Finding duplicate profiles by email...")
  
  // Find emails with multiple profiles
  const duplicates = await User.aggregate([
    {
      $group: {
        _id: "$email",
        count: { $sum: 1 },
        profiles: {
          $push: {
            _id: "$_id",
            authUserId: "$authUserId",
            registrationCompleted: "$registrationCompleted",
            createdAt: "$createdAt",
          },
        },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ])
  
  if (duplicates.length === 0) {
    console.log("✓ No duplicate profiles found!")
    console.log("\nDatabase is clean. No action needed.")
    await mongoose.disconnect()
    return
  }
  
  console.log(`\n⚠️  Found ${duplicates.length} emails with duplicate profiles:`)
  
  const duplicateGroups: DuplicateGroup[] = duplicates.map((d) => ({
    email: d._id,
    count: d.count,
    profiles: d.profiles,
  }))
  
  // Display duplicates
  for (const group of duplicateGroups) {
    console.log(`\n  📧 ${group.email} (${group.count} profiles):`)
    for (const profile of group.profiles) {
      console.log(`    - authUserId: ${profile.authUserId.substring(0, 12)}... | registered: ${profile.registrationCompleted} | created: ${profile.createdAt.toISOString()}`)
    }
  }
  
  console.log("\n2️⃣ Checking which authUserIds exist in Auth.js users collection...")
  
  const usersCollection = db.collection("users")
  const toDelete: string[] = []
  const toKeep: string[] = []
  
  for (const group of duplicateGroups) {
    console.log(`\n  📧 Processing ${group.email}...`)
    
    // Check each profile's authUserId against Auth.js users collection
    for (const profile of group.profiles) {
      // Auth.js stores user id as string in _id field
      const authUser = await usersCollection.findOne({ _id: profile.authUserId as any })
      
      if (authUser) {
        console.log(`    ✓ KEEP: authUserId ${profile.authUserId.substring(0, 12)}... exists in Auth.js users`)
        toKeep.push(profile._id.toString())
      } else {
        console.log(`    ✗ DELETE: authUserId ${profile.authUserId.substring(0, 12)}... is orphaned (not in Auth.js users)`)
        toDelete.push(profile._id.toString())
      }
    }
  }
  
  console.log("\n3️⃣ Summary:")
  console.log(`  - Profiles to keep:   ${toKeep.length}`)
  console.log(`  - Profiles to delete: ${toDelete.length}`)
  
  if (toDelete.length === 0) {
    console.log("\n⚠️  All duplicate profiles have valid authUserIds!")
    console.log("This indicates a different issue - profiles were created with different authUserIds for same email.")
    console.log("Manual review recommended. Script will not delete anything.")
    await mongoose.disconnect()
    return
  }
  
  console.log("\n4️⃣ Deleting orphaned profiles...")
  
  for (const profileId of toDelete) {
    const profile = await User.findById(profileId)
    if (profile) {
      console.log(`  🗑️  Deleting profile: ${profile.email} (authUserId: ${profile.authUserId.substring(0, 12)}...)`)
      await User.findByIdAndDelete(profileId)
    }
  }
  
  console.log("\n✓ Cleanup complete!")
  console.log(`  - Deleted: ${toDelete.length} orphaned profiles`)
  console.log(`  - Kept:    ${toKeep.length} valid profiles`)
  
  console.log("\n5️⃣ Verifying unique constraint...")
  
  // Check if any duplicates remain
  const remainingDuplicates = await User.aggregate([
    {
      $group: {
        _id: "$email",
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ])
  
  if (remainingDuplicates.length > 0) {
    console.log(`\n⚠️  WARNING: ${remainingDuplicates.length} emails still have duplicates!`)
    console.log("Manual review required.")
  } else {
    console.log("\n✓ No remaining duplicates!")
  }
  
  console.log("\n" + "=".repeat(60))
  console.log("CLEANUP COMPLETE")
  console.log("=".repeat(60))
  
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error("\n❌ Script failed:", error)
  process.exit(1)
})
