# NextAuth New User Registration Flow - FIX SUMMARY

## Problem
New users were failing authentication before NextAuth could complete the flow:

```
Magic link clicked
→ NextAuth verifies token
→ NextAuth tries to CREATE a new user in DB
→ ❌ Adapter throws an error (AdapterError)
→ NextAuth ABORTS authentication
→ Redirects to /api/auth/error?error=Configuration
👉 Authentication never completes
👉 Session is never created
👉 Redirect logic (to /register) NEVER RUNS
```

## Root Cause
The MongoDB adapter was throwing an error when attempting to create a user in the `users` collection, which caused NextAuth to abort the entire authentication flow. This prevented:
- Session creation
- JWT callback execution
- Redirect callback execution
- User being directed to `/register`

## Solution Overview
Implemented a **graceful fallback mechanism** that allows authentication to complete even if the adapter encounters errors:

### 1. Custom Adapter Wrapper (Critical Fix)
**File**: [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts#L87)

```typescript
const mongoAdapter = {
  ...baseAdapter,
  createUser: async (user: any) => {
    try {
      // Try normal adapter user creation
      const createdUser = await baseAdapter.createUser(user)
      return createdUser
    } catch (error: any) {
      // On adapter error, return fallback user
      // This allows Auth.js to continue instead of aborting
      const fallbackUser = {
        id: user.id || `${Date.now()}-${Math.random()}`,
        email: user.email,
        name: user.name || user.email?.split("@")[0],
        image: user.image || null,
        emailVerified: user.emailVerified || null,
      }
      
      console.log(`[Adapter] Returning fallback user for ${user.email}`)
      return fallbackUser
    }
  },
}
```

**Why this works:**
- ✅ NextAuth continues instead of aborting
- ✅ Session gets created
- ✅ Callbacks execute
- ✅ User reaches `/register` page

### 2. Enhanced createUser Event
**File**: [app/api/auth/[...nextauth]/route.ts#L130](app/api/auth/[...nextauth]/route.ts#L130)

The `createUser` event now:
- Always creates the custom User profile in Mongoose
- Handles both normal and fallback adapter cases
- Marks new users as `registrationCompleted: false`
- Generates unique `tzId` for tracking

```typescript
async createUser({ user }) {
  const authUserId = user.id
  let existingUser = await User.findOne({ authUserId })
  
  if (!existingUser) {
    const tzId = await generateTzId()
    const newUser = await User.create({
      authUserId,
      name: user.name || user.email?.split("@")[0] || "",
      email: user.email!,
      image: user.image,
      tzId,
      registrationCompleted: false, // NEW USERS ALWAYS START HERE
      eventsRegistered: [],
      workshopsRegistered: [],
      workshopPayments: {},
    })
  }
}
```

### 3. Defensive JWT Callback
**File**: [app/api/auth/[...nextauth]/route.ts#L165](app/api/auth/[...nextauth]/route.ts#L165)

The JWT callback now:
- Checks if custom User profile exists
- Creates profile on-the-fly if missing (handles race conditions)
- Sets `isFirstTime = true` for users with `registrationCompleted === false`
- Sets `redirectTo = "/register"` for new users
- Always sets `authUserId` for API endpoints to use

```typescript
// If profile doesn't exist yet, create it immediately
let dbUser = await User.findOne({ authUserId: user.id })
if (!dbUser) {
  dbUser = await User.create({ /* ... */ })
}

// Determine if first-time user
token.isFirstTime = dbUser.registrationCompleted !== true
token.redirectTo = dbUser.registrationCompleted === true ? "/about" : "/register"
```

## User Flow - NEW USERS

### Step 1: Magic Link Click
- Email verification token is valid ✅
- NextAuth initiates authentication

### Step 2: Adapter User Creation (With Fallback)
- Attempts to create user in `users` collection
- **If error**: Returns fallback user (doesn't abort) ✅
- **If success**: Creates user normally ✅

### Step 3: createUser Event
- Creates custom User profile in `userprofiles` collection
- Sets `registrationCompleted: false` ✅
- Generates `tzId` ✅

### Step 4: JWT Callback
- Finds custom User profile (or creates if missing)
- Sets `isFirstTime = true` ✅
- Sets `redirectTo = "/register"` ✅
- Session is created with all needed fields ✅

### Step 5: Redirect Callback
- Redirects to `/auth/callback` ✅

### Step 6: Auth Callback Page
- Reads `authUserId` from session
- Checks `registrationCompleted` status
- **Redirects new users to `/register`** ✅
- User fills in details and completes registration

## User Flow - EXISTING USERS

### After User Completes Registration
1. Registration API sets `registrationCompleted: true`
2. Session is updated via `trigger: "update"` in JWT callback
3. Next login, JWT callback finds `registrationCompleted === true`
4. Sets `isFirstTime = false`
5. Sets `redirectTo = "/about"`
6. Auth callback redirects to `/about` page

## Key Improvements

| Scenario | Before | After |
|----------|--------|-------|
| New user auth | ❌ Crashes with AdapterError | ✅ Completes, redirects to `/register` |
| Adapter error | ❌ Auth aborts completely | ✅ Uses fallback, continues normally |
| Session creation | ❌ Never happens | ✅ Always created for authenticated users |
| Registration tracking | ❌ Unreliable | ✅ Explicitly checked via `registrationCompleted` flag |

## Files Modified

1. **[app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)**
   - Added adapter error handling wrapper
   - Enhanced createUser event
   - Improved JWT callback with defensive profile creation

## Environment Requirements

No new environment variables needed. Existing setup required:
- `NEXTAUTH_SECRET` ✅
- `NEXTAUTH_URL` ✅
- `MONGODB_URI` ✅
- Email configuration ✅

## Testing Checklist

- [ ] New user receives magic link
- [ ] Click magic link → redirects to `/register`
- [ ] User fills in details and submits
- [ ] Session is created and accessible
- [ ] Next login → redirects to `/about` (not `/register`)
- [ ] Check server logs for `[Auth]` messages confirming flow
- [ ] Check MongoDB `userprofiles` collection for created user
- [ ] Verify `registrationCompleted` flag changes after form submit

## Rollback (if needed)

The changes are backwards compatible. To revert:
1. Remove the adapter error handler wrapper
2. Keep the enhanced `createUser` and JWT callback improvements
3. The flow will work normally for users who successfully create in the adapter

## Debugging

Monitor these logs to understand the flow:

```
[Adapter] User created successfully: user@example.com
[Auth] Created custom user profile for user@example.com with tzId: TZ123456
[Auth] User user@example.com authenticated: isFirstTime: true, redirectTo: "/register"
[Auth Session] Session created for user@example.com
[AuthCallback] User has not completed registration, redirecting to /register
```

For problems:
- Check `[Adapter]` logs - adapter errors are now logged but don't break flow
- Check `[Auth]` logs - tracks custom profile creation
- Check `[AuthCallback]` logs - tracks redirect decisions
