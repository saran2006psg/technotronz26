# MongoDB Index Cleanup Commands (Copy-Paste Ready)

## Step 1: Connect to MongoDB

```bash
mongosh "mongodb+srv://your-username:your-password@cluster.mongodb.net/your-database"
```

Or for local MongoDB:
```bash
mongosh mongodb://localhost:27017/your-database
```

## Step 2: Drop Indexes (Copy entire block and paste into mongosh)

```javascript
// Drop all indexes from adapter-managed collections
// This removes old/conflicting indexes

try {
  console.log("Dropping indexes from users collection...");
  db.users.dropIndexes();
  console.log("✓ users indexes dropped");
} catch (e) {
  console.log("Note: users collection may be empty or have no indexes:", e.message);
}

try {
  console.log("Dropping indexes from accounts collection...");
  db.accounts.dropIndexes();
  console.log("✓ accounts indexes dropped");
} catch (e) {
  console.log("Note: accounts collection may be empty or have no indexes:", e.message);
}

try {
  console.log("Dropping indexes from verification_tokens collection...");
  db.verification_tokens.dropIndexes();
  console.log("✓ verification_tokens indexes dropped");
} catch (e) {
  console.log("Note: verification_tokens collection may be empty or have no indexes:", e.message);
}

try {
  console.log("Dropping indexes from sessions collection...");
  db.sessions.dropIndexes();
  console.log("✓ sessions indexes dropped");
} catch (e) {
  console.log("Note: sessions collection may be empty or have no indexes:", e.message);
}

console.log("\n✓ Index cleanup complete!");
```

## Step 3: Verify Cleanup (Copy entire block and paste into mongosh)

```javascript
// Verify that indexes were properly dropped

console.log("\n=== VERIFICATION ===\n");

console.log("Users collection indexes:");
db.users.getIndexes();

console.log("\nAccounts collection indexes:");
db.accounts.getIndexes();

console.log("\nVerification tokens collection indexes:");
db.verification_tokens.getIndexes();

console.log("\nSessions collection indexes:");
db.sessions.getIndexes();

console.log("\n=== EXPECTED OUTPUT ===");
console.log("Each should show only:");
console.log('[ { "v" : 2, "key" : { "_id" : 1 } } ]');
console.log("\nIf you see more indexes, run the cleanup commands again.");
```

## Step 4: Verify Data Integrity (Optional)

```javascript
// Check that your existing app data is intact

console.log("\n=== DATA INTEGRITY CHECK ===\n");

console.log("Count of app user profiles:");
db.userprofiles.countDocuments();

console.log("\nCount of user payments:");
db.userpayments.countDocuments();

console.log("\n✓ If counts match before cleanup, data is safe!");
```

## Alternative: Full Reset (Only if needed)

⚠️ **WARNING: This will DELETE all auth data but keep app profiles**

```javascript
// Delete adapter collections (will be recreated by Auth.js)
db.users.deleteMany({});
db.accounts.deleteMany({});
db.verification_tokens.deleteMany({});
db.sessions.deleteMany({});

console.log("✓ Adapter collections cleared");
console.log("App data (userprofiles, userpayments) preserved");
```

## Troubleshooting

### If you get "command not allowed" error:
- Your MongoDB Atlas permissions may be restricted
- Ask your MongoDB admin to run these commands
- Or upgrade to Premium tier that allows index drops

### If "collection doesn't exist" error appears:
- That's normal - the collection will be created by Auth.js when needed
- It's safe to continue

### If you need to revert:
- Auth.js will automatically recreate correct indexes on next access
- Just restart your dev server and indexes will be automatically created

## What happens next?

After cleanup:
1. Restart your Next.js dev server
2. Try signing in with a new email
3. Auth.js will automatically recreate correct indexes
4. Magic link should work for new users

## Verification - After Cleanup

Test the fix:
1. `cd` to your project directory
2. Start dev server: `npm run dev`
3. Visit http://localhost:3000/login
4. Enter a brand-new email address
5. Check spam/promotions folder for email
6. Click the magic link
7. Should see /register page (not /api/auth/error)

If it works, the fix is successful!
