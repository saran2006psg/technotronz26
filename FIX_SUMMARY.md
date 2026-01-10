# Auth.js Email Magic Link - Fix Summary

## Problem Statement
New users could not complete email magic link authentication, receiving `/api/auth/error?error=Configuration` error. Existing users worked fine.

**Root Cause:** MongoDB index conflicts between custom Mongoose User schema and Auth.js adapter collections.

---

## Changes Made

### 1. ✓ Fixed User Schema (models/User.ts)
**What was changed:**
- Removed the email index: `UserSchema.index({ email: 1 })`

**Why:**
- The Auth.js adapter manages its own `users` collection with email uniqueness
- Our custom User model (`userprofiles` collection) is SEPARATE
- Any email index in our schema could interfere with adapter operations
- Auth.js needs exclusive control over user creation and email handling

**Result:**
```typescript
// Before: Had email index
UserSchema.index({ email: 1 })

// After: No email index
// Kept only:
// - authUserId: unique index (links to Auth.js user)
// - tzId: unique index (app-specific identifier)
```

**Safe to keep:**
- `authUserId: { unique: true }` - Links to Auth.js user, safe to unique
- `tzId: { unique: true, sparse: true }` - App-specific, doesn't conflict
- `autoIndex: false` - Prevents auto-creation of unwanted indexes

---

### 2. ✓ Verified Auth.js Configuration (app/api/auth/[...nextauth]/route.ts)
**Already correct - no changes needed:**

✓ MongoDBAdapter properly configured
✓ Email provider only (no OAuth)
✓ JWT session strategy
✓ events.createUser callback properly syncs app user profiles
✓ No signIn callbacks that block adapter
✓ No CredentialsProvider
✓ Correct logger configuration

**Key points:**
```typescript
// The adapter manages these collections:
adapter: MongoDBAdapter(clientPromise),

// App profile is created separately AFTER Auth.js creates user:
events: {
  async createUser({ user }) {
    // Creates in userprofiles collection (separate from adapter)
    await User.create({
      authUserId: user.id,  // Link to Auth.js user
      email: user.email,
      tzId,
      // ... other app fields
    })
  }
}
```

---

### 3. ✓ Verified UserPayment Schema (models/UserPayment.ts)
**Already correct - no changes needed:**

✓ `autoIndex: false` prevents unwanted indexes
✓ `unique: true` on authUserId only (safe)
✓ No email or sensitive indexes
✓ Properly links to Auth.js user

---

## MongoDB Cleanup Required

**CRITICAL:** Old indexes in MongoDB must be dropped to allow Auth.js to create collections correctly.

### Run these MongoDB commands:

```javascript
// Connect to your database
mongosh "mongodb://your-connection-string/your-database"

// Drop ALL indexes from adapter-managed collections
db.users.dropIndexes()
db.accounts.dropIndexes()
db.verification_tokens.dropIndexes()

// Verify (should only have _id index)
db.users.getIndexes()
```

**Why:**
- Auth.js adapter creates specific indexes on first use
- Old/conflicting indexes prevent adapter from initializing correctly
- MongoDB error message may show "duplicate index" or similar
- Dropping indexes doesn't delete data, just resets index structure

**After cleanup:**
- Indexes are automatically recreated when Auth.js accesses collections
- App data in `userprofiles` is untouched
- Existing user profiles continue to work

---

## Architecture After Fix

### MongoDB Collections Structure

```
auth (Auth.js managed by adapter)
├── users
│   └── Fields: _id, email, emailVerified, image, name, createdAt, updatedAt
├── accounts (empty - OAuth removed)
├── verification_tokens
│   └── Fields: _id, token, email, expires
└── sessions (empty - JWT strategy)

app (Custom app data - Mongoose)
├── userprofiles
│   └── Fields: _id, authUserId, tzId, registrationCompleted, eventsRegistered, etc.
└── userpayments
    └── Fields: _id, authUserId, eventFeePaid, workshopsPaid
```

### Auth Flow for New User

```
1. User enters email at /login
2. Auth.js creates verification_token (stores in DB)
3. Email sent with magic link
4. User clicks link
5. Auth.js validates token
6. Auth.js creates user in users collection
7. events.createUser fires
8. Custom User profile created in userprofiles
9. JWT token created
10. Redirect to /auth/callback
11. Redirect to /register or /about
```

---

## Verification Checklist

### Before Testing
- [ ] Code changes applied (User schema fixed)
- [ ] MongoDB cleanup commands run
- [ ] Dev server restarted

### Testing New User Registration
- [ ] Go to http://localhost:3000/login
- [ ] Enter a BRAND NEW email (not in any existing user)
- [ ] Click "Send Magic Link"
- [ ] Check email inbox for magic link
- [ ] Click magic link in email
- [ ] Should see /register page (NOT /api/auth/error)
- [ ] Complete registration form
- [ ] Check MongoDB:
  ```javascript
  db.users.findOne({ email: "test@example.com" })      // Should exist
  db.userprofiles.findOne({ email: "test@example.com" }) // Should exist
  ```

### Testing Existing User
- [ ] Existing users can still log in normally
- [ ] Session data still correct
- [ ] tzId and registration status preserved

### Log Checks
- [ ] No "AdapterError" in console
- [ ] No "Configuration" error
- [ ] See "[Auth] Created custom user profile" message
- [ ] SMTP verification succeeds

---

## Expected Error Messages (Before Fix)

These should NOT appear anymore:

```
Error: "Configuration"
AdapterError: ...
useVerificationToken error
Duplicate index on email
```

---

## Safe Post-Fix Changes

After this fix, you can safely:
- ✓ Rename User model to AppUser (if desired)
- ✓ Add more app-specific fields to userprofiles
- ✓ Create additional app collections
- ✓ Modify JWT payload with additional fields

**DO NOT:**
- ✗ Add `unique` index on email in any app schema
- ✗ Change adapter: MongoDBAdapter configuration
- ✗ Add CredentialsProvider
- ✗ Remove events.createUser
- ✗ Manually create users in signIn callback

---

## Files Changed

1. **models/User.ts** - Removed email index (1 line deleted)
   - Was: `UserSchema.index({ email: 1 })`
   - Now: No email index

2. **Documentation added:**
   - MONGODB_CLEANUP.md - MongoDB cleanup commands
   - DIAGNOSTIC.sh - Diagnostic script
   - FIX_SUMMARY.md - This file

---

## Why This Fix Works

### Before:
1. User signs up with email
2. Auth.js tries to create verification_token
3. User table has custom email index
4. Adapter can't create proper schema structure
5. Configuration error (index conflict)

### After:
1. User signs up with email
2. Auth.js creates verification_token (no conflicts)
3. Auth.js creates user in users collection
4. events.createUser creates app profile (separate collection)
5. User is properly authenticated

---

## Support Information

### If magic link still fails:

1. **Check MongoDB connection:**
   ```javascript
   mongosh "your-connection-string"
   db.adminCommand({ ping: 1 })
   ```

2. **Verify indexes were dropped:**
   ```javascript
   db.users.getIndexes()
   // Should show only: [{ "v": 2, "key": { "_id": 1 } }]
   ```

3. **Check server logs for:**
   - SMTP connection errors
   - NEXTAUTH_URL not set
   - NEXTAUTH_SECRET not set
   - Database connection issues

4. **Verify environment variables:**
   - NEXTAUTH_URL (must be set)
   - NEXTAUTH_SECRET (must be set)
   - MONGODB_URI (must be valid)
   - EMAIL_SERVER_HOST/PORT/USER/PASSWORD

---

## Questions?

Review:
- app/api/auth/[...nextauth]/route.ts - Auth configuration
- lib/mongodb.ts - MongoDB connection
- models/User.ts - App user schema
- MONGODB_CLEANUP.md - Index cleanup steps

All changes follow Auth.js v5 best practices with Email provider and MongoDB adapter.
