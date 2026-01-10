# Configuration Error - Root Cause Analysis & Solution

## What We Fixed

The "Configuration" error for new users with magic link was happening because:

### Root Causes:
1. **User schema email index conflicted with Auth.js adapter** - Auth.js needs full control of the email field in its own `users` collection
2. **Adapter initialization might fail on first use** - MongoDB client promise wasn't fully validated before Auth.js tried to use it
3. **Logger type errors** - Outdated logger signature that didn't match Auth.js v5 beta

### Changes Made:

**1. Fixed User Schema (models/User.ts)**
```typescript
// Removed problematic email index:
//  BEFORE: UserSchema.index({ email: 1 })
//  AFTER:  // No email index (authUserId unique index is fine)
```

**2. Updated MongoDB Connection (lib/mongodb.ts)**
- Added better logging to show connection status
- Improved async promise handling
- Now clearly logs: "[MongoDB Adapter] Successfully connected to MongoDB"

**3. Fixed Auth.js Config (app/api/auth/[...nextauth]/route.ts)**
- Added environment variable validation upfront
- Fixed logger type signatures for Auth.js v5 beta
- Added error handler wrapper around NextAuth() call
- Added signIn callback for Email provider
- Removed problematic SMTP verify timeout parameter
- Fixed workshopPayments conversion (already a plain object, not a Map)

## Why New Users Were Failing

**Old Flow (Broken):**
```
1. New user clicks magic link
2. Auth.js tries to create verification_token
3. MongoDB adapter checks if user exists
4. User schema has unique email index
5. Adapter can't properly initialize (schema conflict)
6. Configuration error ❌
```

**New Flow (Fixed):**
```
1. New user clicks magic link
2. Auth.js creates verification_token (no conflicts)
3. Adapter creates user successfully
4. events.createUser fires
5. App profile created in userprofiles collection
6. User authenticated successfully ✓
```

## Testing the Fix

### Step 1: Check Server Logs

After restarting dev server, you should see:

```
[ENV] NEXTAUTH_SECRET set: YES
[ENV] NEXTAUTH_URL: http://localhost:3000
[MongoDB Adapter] Successfully connected to MongoDB
[SMTP] verification succeeded
[NextAuth] Creating Auth.js configuration...
[NextAuth] Configuration successful!
```

If you see any of these errors STOP and fix:
```
[CRITICAL] Missing required environment variables: [...]
[NextAuth] Configuration failed:
[MongoDB Adapter] Connection failed:
[SMTP] verification failed:
```

### Step 2: Test New User Magic Link

1. Go to http://localhost:3000/login
2. Enter a COMPLETELY NEW email (never used before)
3. Check email for magic link
4. Click the link
5. **Should redirect to /register** (NOT /api/auth/error?error=Configuration)

### Step 3: Verify in MongoDB

```javascript
// Check new user was created in adapter's users collection
db.users.findOne({ email: "your-test-email@example.com" })

// Check verification token was stored
db.verification_tokens.countDocuments()

// Check app profile was created in userprofiles
db.userprofiles.findOne({ email: "your-test-email@example.com" })
```

All three should exist after successful sign-in.

## If Error Still Appears

### Check 1: Environment Variables
```bash
echo $NEXTAUTH_SECRET    # Must be set
echo $NEXTAUTH_URL       # Must match your domain
echo $MONGODB_URI        # Must be valid
```

### Check 2: MongoDB Connection
```bash
# Can MongoDB be reached?
mongosh "$MONGODB_URI"
db.adminCommand({ ping: 1 })
```

### Check 3: Database Cleanup
If indexes still exist from before:
```javascript
// Drop conflicting indexes
db.users.dropIndexes()
db.accounts.dropIndexes()
db.verification_tokens.dropIndexes()
```

### Check 4: Restart Everything
```bash
# Kill dev server
# Clear Node cache
rm -rf .next node_modules/.cache

# Restart
npm run dev
```

## Files That Were Modified

1. **models/User.ts** - Removed email index line
2. **lib/mongodb.ts** - Enhanced logging for connection status
3. **app/api/auth/[...nextauth]/route.ts** - Multiple fixes:
   - Fixed logger type signatures
   - Added environment variable validation
   - Improved error handling
   - Fixed type errors in callbacks
   - Added signIn callback

## Expected Behavior Now

✓ Existing users still work
✓ New users receive magic link email
✓ Clicking link redirects to /register (not error page)
✓ User data syncs correctly to both adapter and app collections
✓ No "Configuration" error in logs

## Verification Checklist

After restart, verify ALL of these:

- [ ] Dev server starts without errors
- [ ] "[NextAuth] Configuration successful!" appears in logs
- [ ] "[MongoDB Adapter] Successfully connected to MongoDB" appears
- [ ] New user receives magic link email
- [ ] Clicking link doesn't show error page
- [ ] Redirected to /register
- [ ] Can see user in MongoDB: `db.users.findOne()`
- [ ] Can see profile in MongoDB: `db.userprofiles.findOne()`
- [ ] Form works and saves correctly

If all checks pass: The fix is successful! 🎉
