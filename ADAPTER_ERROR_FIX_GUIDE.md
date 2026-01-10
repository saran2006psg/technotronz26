# ADAPTER ERROR FIX - Complete Setup Guide

## Current Status
AdapterError still occurring because MongoDB connection is failing.

Error: `connect ECONNREFUSED 159.41.197.18:27017`

This is a **network connectivity issue**, not a code issue.

---

## Fixes Applied (Code Changes)

### ✅ 1. Removed events.createUser from Auth.js Config
**File**: [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)

**Before**: Profile created during authentication (could interfere with adapter)  
**After**: Profile creation moved to callback page AFTER authentication succeeds

**Why**: events.createUser can cause race conditions and adapter failures. Safer to create profile after auth completes.

---

### ✅ 2. Simplified JWT and signIn Callbacks
**File**: [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)

**Before**: Heavy database queries during initial authentication  
**After**: Minimal callbacks - just set authUserId and email

**Why**: Reduce complexity during adapter operations. Profile data loaded later via session.update().

---

### ✅ 3. Fixed Callback Page to Create Profile
**File**: [app/auth/callback/page.tsx](app/auth/callback/page.tsx)

**Before**: Redirected to /register if profile missing (profile never created)  
**After**: Creates profile if missing, THEN redirects

**Why**: Profile must exist before registration form. Creating it in callback ensures it's there.

---

### ✅ 4. Fixed Route Guards
**File**: [proxy.ts](proxy.ts)

**Before**: `registrationCompleted` blocked access to /events  
**After**: `registrationCompleted` only applies to /about page

**Why**: Registration is for ONBOARDING only. Once authenticated, users can access /events, /profile, etc.

---

### ✅ 5. Created Database Cleanup Script
**File**: [scripts/clean-auth-collections.ts](scripts/clean-auth-collections.ts)

Drops Auth.js collections to remove schema pollution:
- users
- accounts
- sessions
- verification_tokens

Preserves app data:
- userprofiles
- userpayments

---

## CRITICAL: Database Connection Issue

The AdapterError is caused by **MongoDB connection failure**:

```
[MongoDB Adapter] Connection failed: MongoServerSelectionError: connect ECONNREFUSED 159.41.197.18:27017
```

### Possible Causes:

1. **MongoDB server is down**
2. **Network connectivity issue**
3. **Incorrect MONGODB_URI in .env**
4. **Firewall blocking connection**
5. **MongoDB Atlas IP whitelist**

### Fix Steps:

#### Option 1: Check MongoDB URI
```bash
# Open .env.local
# Verify MONGODB_URI is correct

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority

# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/<database>
```

#### Option 2: Test Connection
```bash
# In MongoDB shell or Compass, try connecting with the same URI
# If connection fails, MongoDB is not accessible
```

#### Option 3: MongoDB Atlas IP Whitelist
```
1. Go to MongoDB Atlas dashboard
2. Network Access > IP Access List
3. Add current IP address or use 0.0.0.0/0 (allow all - for testing only)
4. Wait 2-3 minutes for changes to propagate
```

#### Option 4: Check Network/VPN
```
- Are you behind a corporate firewall?
- Try disabling VPN if using one
- Try different network (mobile hotspot)
```

---

## Setup Steps (After DB Connection Fixed)

### Step 1: Clean Database Collections
```bash
npx tsx scripts/clean-auth-collections.ts
```

**What it does**:
- Drops Auth.js adapter collections
- Preserves userprofiles and userpayments
- Removes schema pollution

**Why**: Existing database may have corrupted indexes/schemas from previous code.

---

### Step 2: Clear Build Cache
```bash
# PowerShell
Remove-Item .next -Recurse -Force

# Or manually delete .next folder
```

---

### Step 3: Restart Dev Server
```bash
npm run dev
```

Watch for:
- `[MongoDB Adapter] Successfully connected to MongoDB` ✓
- No AdapterError
- No connection errors

---

### Step 4: Test Magic Link Flow

#### For New User:
1. Clear browser cookies
2. Go to localhost:3000/login
3. Enter email
4. Click magic link in email
5. **Should see**: localhost:3000/register (NOT error page)
6. Fill registration form
7. Submit
8. **Should see**: localhost:3000/about → localhost:3000/events

#### For Existing User:
1. Click magic link
2. **Should see**: localhost:3000/events immediately
3. No redirect to /register

---

## Expected Flow (After Fixes)

### New User Journey:
```
1. User clicks magic link
   ↓
2. Auth.js verifies token → Creates user in adapter's "users" collection
   ↓
3. JWT callback sets authUserId
   ↓
4. Redirect callback fires → /auth/callback
   ↓
5. Callback page creates profile in "userprofiles" collection
   ↓
6. Redirect to /register
   ↓
7. User fills form → POST /api/user/complete-registration
   ↓
8. Profile updated: registrationCompleted = true
   ↓
9. session.update() refreshes JWT
   ↓
10. Redirect to /about → /events
```

### Existing User Journey:
```
1. User clicks magic link
   ↓
2. Auth.js verifies token → User exists in "users"
   ↓
3. JWT callback sets authUserId
   ↓
4. Redirect callback fires → /auth/callback
   ↓
5. Callback page finds existing profile (registrationCompleted = true)
   ↓
6. Redirect to /events immediately
```

---

## Files Changed Summary

1. **[app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)**
   - Removed events.createUser
   - Simplified signIn callback
   - Simplified JWT callback (minimal for initial auth)

2. **[app/auth/callback/page.tsx](app/auth/callback/page.tsx)**
   - Added profile creation if missing
   - Uses authUserId as foreign key
   - Creates tzId for new profiles

3. **[proxy.ts](proxy.ts)**
   - Fixed registrationCompleted logic
   - Only blocks /about if incomplete
   - Allows /events, /profile regardless of registration

4. **[scripts/clean-auth-collections.ts](scripts/clean-auth-collections.ts)**
   - New script to drop Auth.js collections
   - Preserves app data

5. **[models/User.ts](models/User.ts)**
   - Already uses "userprofiles" collection ✓
   - No changes needed

---

## Troubleshooting

### Issue: Still seeing AdapterError
**Cause**: MongoDB connection failure  
**Fix**: Check MONGODB_URI, network, IP whitelist

### Issue: Profile not created
**Cause**: Callback page not executing  
**Fix**: Check redirect callback actually sends to /auth/callback

### Issue: Redirect loops
**Cause**: registrationCompleted not updating  
**Fix**: Check registration API updates profile correctly

### Issue: Session shows null
**Cause**: JWT not refreshing after registration  
**Fix**: Ensure session.update() is called after form submit

---

## Status: ✅ Code Fixes Complete

Next action: **Fix MongoDB connection issue**

1. Verify MONGODB_URI in .env.local
2. Test MongoDB connection
3. Check IP whitelist (if using Atlas)
4. Run cleanup script
5. Test magic link flow

---

##Known Limitation

MongoDB Adapter requires valid MongoDB connection. Code changes are complete but cannot test until database is accessible.
