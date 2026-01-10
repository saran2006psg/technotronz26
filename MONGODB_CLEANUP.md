# MongoDB Index Cleanup for Auth.js Email Magic Link Fix

## Problem
Auth.js adapter fails to create new users with "Configuration" error because of index conflicts in MongoDB.

The adapter manages these collections:
- `users` - Auth.js user accounts
- `accounts` - Account provider info (not used now)
- `verification_tokens` - Email magic link tokens
- `sessions` - JWT sessions (not used with JWT strategy)

Old Mongoose indexes or conflicting unique constraints can block adapter operations.

## Solution
Drop all indexes from adapter-managed collections and let Auth.js recreate them correctly.

## MongoDB Commands to Run

### Step 1: Connect to MongoDB
```bash
mongosh "mongodb://your-connection-string/your-database"
```

### Step 2: Drop all indexes from adapter collections
```javascript
// Drop all indexes from users collection (except _id)
db.users.dropIndexes()

// Drop all indexes from accounts collection (except _id)
db.accounts.dropIndexes()

// Drop all indexes from verification_tokens collection (except _id)
db.verification_tokens.dropIndexes()

// Drop all indexes from sessions collection (except _id)
db.sessions.dropIndexes()
```

### Step 3: Verify indexes were dropped
```javascript
// Check users collection indexes
db.users.getIndexes()

// Expected output: Only [ { "v": 2, "key": { "_id": 1 } } ]
```

### Step 4: Optional - Clean old app data if needed
```javascript
// If you want to start fresh with app user profiles:
db.userprofiles.dropIndexes()
db.userpayments.dropIndexes()

// Then drop and recreate to clear any old data:
db.userprofiles.drop()
db.userpayments.drop()
```

## Why This Fixes the Issue

1. **Removes conflicting unique indexes** - Old indexes that block new user creation
2. **Lets Auth.js adapter create fresh indexes** - With correct schema expectations
3. **Clears any duplicate index warnings** - MongoDB won't complain about duplicates
4. **Ensures adapter can create users** - Verification tokens can be stored and consumed

## After Running Commands

1. Restart the Next.js dev server
2. Try signing in with a NEW email address
3. Check MongoDB to verify new collections are created:
   ```javascript
   db.getCollectionNames()
   ```
4. Verify tables are populated:
   ```javascript
   db.users.findOne()           // Should show new user
   db.verification_tokens.findOne() // Should show token
   ```

## Troubleshooting

### If you see "cannot drop index" errors
- The collections might be empty already - this is fine
- Continue to the next step

### If magic links still fail after cleanup
1. Check server logs for specific adapter errors
2. Verify NEXTAUTH_URL is set correctly
3. Verify MongoDB connection is working
4. Check that autoIndex: false is set in Mongoose schemas

### To see all collections
```javascript
db.getCollectionNames()
```

### To see all indexes in a collection
```javascript
db.users.getIndexes()
db.accounts.getIndexes()
db.verification_tokens.getIndexes()
```

## Notes

- The `userprofiles` collection (custom User model) is SEPARATE from Auth.js collections
- Do NOT drop indexes on `userprofiles` unless you're clearing all app data
- After cleanup, Auth.js will automatically create new indexes when it first accesses collections
- Existing users in userprofiles will NOT be affected by this cleanup
