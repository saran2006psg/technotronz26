# Quick Start - Email Magic Link Fix

## TL;DR - The Problem and Solution

**Problem:** New users get `/api/auth/error?error=Configuration` after clicking magic link.

**Root Cause:** MongoDB indexes conflict with Auth.js adapter.

**Solution:** Remove email index from User schema + clean up MongoDB + restart.

---

## 3-Minute Fix

### 1. Code Already Fixed ✓
The User schema has been updated. Email index removed.

### 2. Clean MongoDB (Copy-Paste)
```javascript
// Paste this into MongoDB shell (mongosh):

db.users.dropIndexes()
db.accounts.dropIndexes()
db.verification_tokens.dropIndexes()
db.sessions.dropIndexes()

console.log("✓ Done!")
```

### 3. Restart Dev Server
```bash
# Kill with Ctrl+C, then:
npm run dev
```

### 4. Test It
- Go to http://localhost:3000/login
- Use a NEW email (not in system)
- Click magic link in email
- Should see /register page ✓

---

## What Was Fixed

| File | Change | Why |
|------|--------|-----|
| `models/User.ts` | Removed `UserSchema.index({ email: 1 })` | Conflicts with Auth.js adapter |

That's it! Just 1 line removed.

---

## Why It Works

**Before:** User schema email index → Auth.js adapter fails → Configuration error

**After:** User schema has no email index → Auth.js can create collections → Magic link works

---

## If It Still Doesn't Work

1. ✓ Is dev server running? `npm run dev`
2. ✓ Did you run MongoDB cleanup? See MONGODB_COMMANDS.md
3. ✓ Check `NEXTAUTH_URL` is set? Should be `http://localhost:3000`
4. ✓ Using brand-new email? (not existing user)
5. ✓ Check console for errors? Look for `[Auth]` or `[NextAuth Error]` messages

---

## Details

- **Code changes:** 1 line in models/User.ts ✓
- **MongoDB work required:** Yes, see MONGODB_COMMANDS.md
- **UI changes:** None
- **Email config changes:** None
- **Data loss:** None

---

## Files to Read

| File | When to Read |
|------|--------------|
| **IMPLEMENTATION_CHECKLIST.md** | Full step-by-step guide |
| **FIX_SUMMARY.md** | Detailed explanation |
| **MONGODB_COMMANDS.md** | MongoDB commands |
| **MONGODB_CLEANUP.md** | MongoDB guide |

---

## Verification

After fix, test:
```bash
# 1. Start server
npm run dev

# 2. Try new user signup
# Go to /login, use new email, click magic link

# 3. Check MongoDB
mongosh "your-connection-string"
db.users.findOne({ email: "test@example.com" })      # Should exist
db.userprofiles.findOne({ email: "test@example.com" }) # Should exist
```

---

## Success = No Errors

You should see in logs:
```
[Auth] Created custom user profile for user@example.com
```

You should NOT see:
```
Configuration error
AdapterError
useVerificationToken failed
```

---

## One Thing You MUST Do

**Run the MongoDB cleanup commands!**

This is critical - old indexes block the adapter.

See: MONGODB_COMMANDS.md

---

Done! Magic links should now work for new users. 🎉
