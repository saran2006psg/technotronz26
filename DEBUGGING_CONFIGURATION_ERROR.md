# Auth.js Configuration Error - Detailed Debugging

## "Configuration" Error Meaning

In Auth.js v5, the "Configuration" error is thrown when:
1. The auth configuration object has invalid structure
2. Providers are misconfigured
3. The adapter fails to initialize
4. Required environment variables are missing
5. Callbacks throw errors during initialization

## How to Debug

### Step 1: Check Server Logs

When dev server starts, look for these messages:

```
[CRITICAL] Missing required environment variables: [...]
[NextAuth] Creating Auth.js configuration...
[NextAuth] Configuration successful!
[Adapter] createUser called with: {...}
[Adapter] getUserByEmail: {...}
```

If you see any `[NextAuth] Configuration failed:` message, that's the root cause.

### Step 2: Enable Debug Logging

The configuration already has enhanced logging. Check for:

```
[ENV] NEXTAUTH_SECRET set: YES
[ENV] NEXTAUTH_URL: http://localhost:3000
[MongoDB Adapter] Successfully connected to MongoDB
[SMTP] verification succeeded
```

### Step 3: Test Email Sending

Before testing magic link flow:

```javascript
// In a test file or curl
POST http://localhost:3000/api/auth/signin/email
Body: { email: "test@example.com" }

// You should see:
// - "[SMTP] verification succeeded" in console
// - Email should arrive in inbox
```

## Common "Configuration" Error Causes

### Cause 1: Missing NEXTAUTH_SECRET
```
Error: Configuration is missing SECRET
```

**Fix:**
```bash
# Generate secret
openssl rand -base64 32

# Set in .env.local
NEXTAUTH_SECRET=your-generated-secret
```

### Cause 2: Missing NEXTAUTH_URL
```
Error: You need to provide NEXTAUTH_URL environment variable
```

**Fix:**
```bash
# For dev
NEXTAUTH_URL=http://localhost:3000

# For production
NEXTAUTH_URL=https://yourdomain.com
```

### Cause 3: MongoDB Connection Failed
```
[NextAuth] Configuration failed: MongoNetworkError
```

**Fix:**
1. Check MONGODB_URI is correct
2. Verify MongoDB cluster is running
3. Check firewall/network access
4. Verify username/password in connection string

### Cause 4: Email Provider Configuration Invalid
```
[NextAuth] Configuration failed: Email provider requires 'server' configuration
```

**Fix:**
Ensure all email config variables are set:
- EMAIL_SERVER_HOST
- EMAIL_SERVER_PORT
- EMAIL_SERVER_USER
- EMAIL_SERVER_PASSWORD
- EMAIL_FROM

### Cause 5: Adapter Mismatch
```
[NextAuth] Configuration failed: Adapter does not support required methods
```

**Fix:**
- Ensure @auth/mongodb-adapter version matches next-auth version
- Currently: next-auth v5 beta + @auth/mongodb-adapter v3.11.1
- Check they're compatible

## Step-by-Step Debugging Workflow

### 1. Verify Environment Variables
```bash
# Check what's actually set
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
echo $MONGODB_URI
echo $EMAIL_SERVER_HOST
```

### 2. Check MongoDB Connection
```bash
# Can you connect to MongoDB?
mongosh "$MONGODB_URI"
# If this fails, fix your MONGODB_URI
```

### 3. Verify Adapter Compatibility
```bash
npm list next-auth @auth/mongodb-adapter
# Should show:
# next-auth@5.0.0-beta.25
# @auth/mongodb-adapter@3.11.1
```

### 4. Test Email SMTP
```bash
# In NodeJS REPL
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD.replace(/\s+/g, '')
  },
  secure: parseInt(process.env.EMAIL_SERVER_PORT) === 465
});
await transporter.verify();
// Should return true
```

### 5. Test Auth Configuration
```bash
# Kill dev server
# Restart it
npm run dev

# Watch the console for:
[ENV] variables check
[SMTP] verification
[MongoDB Adapter] connection
[NextAuth] Configuration successful!
```

## If Still Getting Configuration Error

After applying fixes, **ALL of these must be true**:

- [ ] NEXTAUTH_SECRET is set and valid
- [ ] NEXTAUTH_URL is set correctly (must match your domain)
- [ ] MONGODB_URI is valid and MongoDB is accessible
- [ ] EMAIL_SERVER_HOST/PORT/USER/PASSWORD are all set
- [ ] EMAIL_FROM is set
- [ ] Dev server shows "[NextAuth] Configuration successful!"
- [ ] No "[NextAuth] Configuration failed:" message in logs

## MongoDB Adapter Specific Issues

If you see adapter errors in logs:

```javascript
// MongoDB Adapter requires:
// 1. Proper connection via clientPromise
// 2. Collections: users, accounts, verification_tokens, sessions
// 3. Proper indexes (should be auto-created)
```

**Check adapter is working:**
```bash
mongosh "$MONGODB_URI"
db.getCollectionNames()
# Should eventually include: users, accounts, verification_tokens
```

## Real Issue You're Likely Facing

Based on your description, the issue is probably:

**1. MongoDB Adapter not initializing properly**
- The clientPromise might not be resolving before NextAuth tries to use it
- Solution: The updated mongodb.ts with better logging should show this

**2. Email provider token issue**
- New users' tokens might not be stored/retrieved correctly
- Solution: The enhanced adapter logging will show if createUser/getUserByEmail fail

**3. Custom User schema interfering**
- Even after removing email index, there might be residual conflicts
- Solution: Run MongoDB cleanup commands from MONGODB_CLEANUP.md

## Next Steps

1. **Restart dev server** with the new changes
2. **Watch console output** for all the [NextAuth] messages
3. **Copy exact error message** and check against causes above
4. **If still failing**, share the exact error message from console

The enhanced logging should now show EXACTLY where the configuration fails!

---

## File Changes Made for Debugging

1. **app/api/auth/[...nextauth]/route.ts**
   - Added env var validation
   - Added adapter error wrapper with logging
   - Added NextAuth try-catch with detailed error logging
   - Enhanced signIn callback

2. **lib/mongodb.ts**
   - Added connection logging
   - Better async handling
   - Clear error messages

These changes will help identify the exact point of failure!
