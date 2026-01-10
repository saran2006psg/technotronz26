/**
 * DATABASE CLEANUP SCRIPT
 * 
 * This script drops ALL Auth.js adapter collections to fix AdapterError.
 * 
 * WHY: MongoDB schema/index pollution from previous custom schemas
 * prevents the adapter from working correctly for new users.
 * 
 * WHAT IT DOES:
 * - Drops users collection (Auth.js will recreate)
 * - Drops accounts collection
 * - Drops sessions collection
 * - Drops verification_tokens collection
 * - Does NOT touch userprofiles (app data)
 * - Does NOT touch userpayments (app data)
 * 
 * SAFE: Existing users will need to re-authenticate via magic link.
 * Their registration data (userprofiles) is preserved.
 * 
 * Usage: npx tsx scripts/clean-auth-collections.ts
 */

import clientPromise from "../lib/mongodb"

async function cleanAuthCollections() {
  console.log("=".repeat(70))
  console.log("AUTH.JS COLLECTION CLEANUP")
  console.log("=".repeat(70))
  
  try {
    const client = await clientPromise
    const db = client.db()
    
    console.log("\n📋 Checking existing collections...")
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    console.log("Found collections:", collectionNames.join(", "))
    
    // Auth.js adapter collections to drop
    const authCollections = ["users", "accounts", "sessions", "verification_tokens"]
    
    console.log("\n🗑️  Dropping Auth.js adapter collections...")
    
    for (const collectionName of authCollections) {
      if (collectionNames.includes(collectionName)) {
        try {
          await db.collection(collectionName).drop()
          console.log(`  ✓ Dropped: ${collectionName}`)
        } catch (error: any) {
          if (error.codeName === "NamespaceNotFound") {
            console.log(`  - Skipped: ${collectionName} (does not exist)`)
          } else {
            console.error(`  ✗ Failed to drop ${collectionName}:`, error.message)
          }
        }
      } else {
        console.log(`  - Skipped: ${collectionName} (does not exist)`)
      }
    }
    
    console.log("\n📋 Checking app collections (should be preserved)...")
    const appCollections = ["userprofiles", "userpayments"]
    
    for (const collectionName of appCollections) {
      if (collectionNames.includes(collectionName)) {
        const count = await db.collection(collectionName).countDocuments()
        console.log(`  ✓ Preserved: ${collectionName} (${count} documents)`)
      } else {
        console.log(`  - Not found: ${collectionName}`)
      }
    }
    
    console.log("\n" + "=".repeat(70))
    console.log("✅ CLEANUP COMPLETE")
    console.log("=".repeat(70))
    console.log("\nNext steps:")
    console.log("1. Restart dev server: npm run dev")
    console.log("2. Test magic link login as NEW user")
    console.log("3. Should authenticate successfully (no AdapterError)")
    console.log("4. Auth.js will recreate collections automatically")
    console.log("\nNote: Existing users will need to re-authenticate.")
    console.log("Their registration data is preserved in userprofiles.")
    
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Script failed:", error)
    process.exit(1)
  }
}

cleanAuthCollections()
