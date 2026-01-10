#!/bin/bash
# Diagnostic script to check Auth.js configuration and MongoDB status
# Run this to verify the setup is correct

echo "=========================================="
echo "Auth.js Email Magic Link - Diagnostic Check"
echo "=========================================="
echo ""

# Check environment variables
echo "1. CHECKING ENVIRONMENT VARIABLES"
echo "=================================="
if [ -z "$NEXTAUTH_URL" ]; then
  echo "❌ NEXTAUTH_URL is NOT set (CRITICAL for magic links)"
  echo "   Set it to: http://localhost:3000 (dev) or your production URL"
else
  echo "✓ NEXTAUTH_URL = $NEXTAUTH_URL"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ NEXTAUTH_SECRET is NOT set"
else
  echo "✓ NEXTAUTH_SECRET is set"
fi

if [ -z "$MONGODB_URI" ]; then
  echo "❌ MONGODB_URI is NOT set"
else
  echo "✓ MONGODB_URI is set (hidden for security)"
fi

if [ -z "$EMAIL_SERVER_HOST" ]; then
  echo "❌ EMAIL_SERVER_HOST is NOT set"
else
  echo "✓ EMAIL_SERVER_HOST = $EMAIL_SERVER_HOST"
fi

if [ -z "$EMAIL_FROM" ]; then
  echo "❌ EMAIL_FROM is NOT set"
else
  echo "✓ EMAIL_FROM = $EMAIL_FROM"
fi

echo ""
echo "2. CHECKING NEXTAUTH CONFIGURATION"
echo "===================================="
echo "Auth method: Email (magic link only)"
echo "Session strategy: JWT"
echo "Collections: users, accounts, verification_tokens (Auth.js managed)"
echo "App profile: userprofiles (separate, for app-specific data)"
echo ""

echo "3. CHECKING MONGODB CONNECTION"
echo "================================"
# This would need to be done via MongoDB shell
echo "Run in MongoDB shell:"
echo "  mongosh 'your-connection-string/your-database'"
echo ""
echo "Then check:"
echo "  db.getCollectionNames()  # Should show: users, accounts, verification_tokens, userprofiles"
echo "  db.users.getIndexes()    # Should have minimal indexes"
echo ""

echo "4. MAGIC LINK TEST CHECKLIST"
echo "============================="
echo "Before testing:"
echo "  ✓ Restart dev server"
echo "  ✓ Use a brand-new email (not in system)"
echo ""
echo "Testing steps:"
echo "  1. Go to /login"
echo "  2. Enter new email"
echo "  3. Check email for magic link"
echo "  4. Click link"
echo "  5. Should redirect to /register (not /api/auth/error)"
echo ""

echo "5. MongoDB CLEANUP (if needed)"
echo "==============================="
echo "If you see 'Configuration' error or AdapterError:"
echo "  1. Read MONGODB_CLEANUP.md"
echo "  2. Run MongoDB cleanup commands"
echo "  3. Restart dev server"
echo "  4. Try magic link again"
echo ""

echo "6. DEBUG LOG LOCATIONS"
echo "======================"
echo "Check these logs:"
echo "  - Dev server console: [Auth] messages"
echo "  - Dev server console: [SMTP] messages"
echo "  - Dev server console: [Magic Link] messages"
echo "  - Dev server console: [NextAuth Error] if errors occur"
echo ""

echo "=========================================="
echo "For detailed MongoDB commands, see:"
echo "  MONGODB_CLEANUP.md"
echo "=========================================="
