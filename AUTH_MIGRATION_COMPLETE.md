# Authentication Migration Complete ✅

## Summary

Successfully migrated from **Auth.js (NextAuth) with Magic Links** to **Email + Password authentication with JWT**.

---

## What Was Changed

### 1. **Removed Auth.js**
- ❌ Deleted `next-auth` and `@auth/mongodb-adapter` packages
- ❌ Deleted `/app/api/auth/[...nextauth]/route.ts`
- ❌ Deleted `/app/auth/callback` page
- ✅ Added `bcrypt`, `jsonwebtoken`, `@types/bcrypt`, `@types/jsonwebtoken`

### 2. **Database Schema** (Single Source of Truth)
**Collection: `users`**
```typescript
{
  _id: ObjectId,
  email: string (unique),
  passwordHash: string,
  name: string,
  tzId: string,
  registrationCompleted: boolean,
  role: "user" | "admin",
  collegeName, mobileNumber, yearOfStudy, department,
  eventsRegistered: string[],
  workshopsRegistered: string[],
  workshopPayments: Map,
  createdAt, updatedAt
}
```

**Collection: `password_reset_tokens`**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  tokenHash: string,
  expiresAt: Date,
  createdAt
}
```

**Collection: `userpayments`**
```typescript
{
  userId: ObjectId (ref User),
  eventFeePaid: boolean,
  eventFeeAmount: number,
  workshopsPaid: string[]
}
```

**Removed Collections:**
- ❌ `verification_tokens` (Auth.js magic links)
- ❌ No more separate `users` collection for Auth.js

---

## New Authentication Flow

### Registration
```
POST /api/auth/register
Body: { email, password, name }
→ Creates user with registrationCompleted: false
→ Sets JWT cookie
→ Redirects to /register (onboarding form)
```

### Login
```
POST /api/auth/login
Body: { email, password }
→ Validates credentials
→ Sets JWT cookie
→ Redirects to /events (if registered) or /register
```

### Session Check
```
GET /api/auth/session
→ Reads JWT from cookie
→ Returns user data or null
```

### Logout
```
POST /api/auth/logout
→ Clears auth_token cookie
```

### Forgot Password
```
POST /api/auth/forgot-password
Body: { email }
→ Generates reset token
→ Sends email with reset link
```

### Reset Password
```
POST /api/auth/reset-password
Body: { email, token, newPassword }
→ Validates token
→ Updates password
→ Deletes reset token
```

---

## Route Protection

### Middleware ([proxy.ts](proxy.ts))
- Public routes: `/`, `/login`, `/register`, `/reset-password`, `/forgot-password`, `/api/auth/*`
- Protected routes: Everything else requires valid JWT
- Incomplete registration: Redirects to `/register`
- Complete registration: Allows access to all routes

### JWT Cookie
- Name: `auth_token`
- HttpOnly: `true`
- Secure: `true` (production only)
- SameSite: `lax`
- Max-Age: 30 days
- Payload: `{ userId, email, registrationCompleted }`

---

## Files Created

### Models
- [models/User.ts](models/User.ts) - Unified user model (auth + profile)
- [models/PasswordResetToken.ts](models/PasswordResetToken.ts) - Password reset tokens

### Utilities
- [lib/jwt.ts](lib/jwt.ts) - JWT signing and verification
- [lib/auth.ts](lib/auth.ts) - Auth helpers for server components

### API Routes
- [app/api/auth/register/route.ts](app/api/auth/register/route.ts) - User registration
- [app/api/auth/login/route.ts](app/api/auth/login/route.ts) - User login
- [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts) - User logout
- [app/api/auth/session/route.ts](app/api/auth/session/route.ts) - Get current user
- [app/api/auth/forgot-password/route.ts](app/api/auth/forgot-password/route.ts) - Request reset
- [app/api/auth/reset-password/route.ts](app/api/auth/reset-password/route.ts) - Reset password

### UI Pages
- [app/login/page.tsx](app/login/page.tsx) - Login/register page
- [app/forgot-password/page.tsx](app/forgot-password/page.tsx) - Forgot password page
- [app/reset-password/page.tsx](app/reset-password/page.tsx) - Reset password page

---

## Files Modified

- [package.json](package.json) - Updated dependencies
- [proxy.ts](proxy.ts) - JWT-based route guards
- [app/api/user/complete-registration/route.ts](app/api/user/complete-registration/route.ts) - Uses JWT auth
- [app/api/user/me/route.ts](app/api/user/me/route.ts) - Uses JWT auth
- [models/UserPayment.ts](models/UserPayment.ts) - Changed `authUserId` to `userId`

---

## Environment Variables Required

```env
# MongoDB
MONGODB_URI=mongodb://...

# JWT Secret (CRITICAL - must be set)
JWT_SECRET=your-secret-key-here

# Email (for password reset)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@domain.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=Your App <your-email@domain.com>

# Base URL
NEXTAUTH_URL=http://localhost:3000
```

---

## Next Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env.local` and add `JWT_SECRET`:
```env
JWT_SECRET=your-random-secret-key-minimum-32-characters
```

### 3. Database Migration (Optional)
If you have existing users from Auth.js:
- Auth.js `users` collection → Not used anymore
- Old `userprofiles` with `authUserId` → Need to migrate to new schema

Migration script would:
```javascript
// For each old userprofile:
// 1. Find matching user in Auth.js users collection by email
// 2. Create new user with email, generated password, and profile data
// 3. Delete old records
```

### 4. Test Authentication
1. Register new user → Should create account and redirect to /register
2. Complete registration form → Should update profile and redirect to /events
3. Logout → Should clear session
4. Login → Should authenticate and redirect appropriately
5. Forgot password → Should send email with reset link
6. Reset password → Should update password

---

## Security Features

✅ **Passwords hashed with bcrypt** (10 rounds)
✅ **JWT stored in httpOnly cookies** (not accessible via JavaScript)
✅ **Password reset tokens hashed** (stored securely)
✅ **Tokens expire** (JWT: 30 days, Reset tokens: 1 hour)
✅ **Email uniqueness enforced** (database constraint)
✅ **No password exposure** (never returned in API responses)
✅ **Rate limiting recommended** (implement at API gateway level)

---

## Key Differences from Auth.js

| Feature | Auth.js | New System |
|---------|---------|------------|
| Auth Method | Magic Link (email) | Email + Password |
| Session | JWT with adapter | JWT only (stateless) |
| Database | 3+ collections | 2 collections |
| User Creation | Automatic on email verify | Manual registration |
| Password Reset | Not needed | Custom flow |
| Adapters | MongoDB Adapter | None (direct Mongoose) |
| Complexity | High | Low |
| Control | Limited | Full |

---

## Benefits

✅ **No adapter conflicts** - Direct database access
✅ **No duplicate users** - Email is unique constraint
✅ **No AdapterError** - No adapter to fail
✅ **No redirect loops** - Simple JWT-based guards
✅ **Full control** - Custom logic for everything
✅ **Easy debugging** - All code is in your project
✅ **Stateless** - No server-side sessions
✅ **Production-ready** - Secure, tested patterns

---

## Troubleshooting

### "JWT_SECRET is not defined"
Add `JWT_SECRET` to `.env.local`

### "Cannot connect to MongoDB"
Check `MONGODB_URI` in `.env.local`

### "Email already exists"
User with that email already registered

### "Invalid email or password"
Credentials don't match database

### "Invalid or expired reset token"
Reset link expired (1 hour) or already used

---

## Status: ✅ READY FOR TESTING

All code is implemented. Run `npm install` and add `JWT_SECRET` to start testing.
