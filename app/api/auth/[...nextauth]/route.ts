export const runtime = "nodejs"

import NextAuth, { type NextAuthConfig } from "next-auth"
import Email from "next-auth/providers/email"
import connectDB from "@/lib/db"
import User from "@/models/User"
import UserPayment from "@/models/UserPayment"
import nodemailer from "nodemailer"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { generateTzId } from "@/lib/generateTzId"


// Normalize and sanitize EMAIL config
const emailPort = Number(process.env.EMAIL_SERVER_PORT || 587)

// CRITICAL: Validate all required Auth.js config variables
const requiredVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
  EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
  EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
  EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
}

const missingVars = Object.entries(requiredVars).filter(([key, value]) => !value).map(([key]) => key)

if (missingVars.length > 0) {
  console.error('[CRITICAL] Missing required environment variables:', missingVars)
  console.error('[CRITICAL] These must be set for Auth.js to work:')
  missingVars.forEach(v => console.error(`  - ${v}`))
}

// Server-side checks (safe: do NOT log secrets)
console.log('[ENV] NEXTAUTH_SECRET set:', process.env.NEXTAUTH_SECRET ? 'YES' : 'MISSING')
console.log('[ENV] NEXTAUTH_URL:', process.env.NEXTAUTH_URL ?? 'MISSING (CRITICAL - magic links will fail!)')
console.log('[ENV] EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST ?? 'MISSING')
console.log('[ENV] EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT ?? 'MISSING')
console.log('[ENV] EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER ? process.env.EMAIL_SERVER_USER.trim() : 'MISSING')
console.log('[ENV] EMAIL_FROM:', process.env.EMAIL_FROM ?? 'MISSING')

// Validate NEXTAUTH_URL - critical for magic link callbacks
if (!process.env.NEXTAUTH_URL) {
  console.error('[CRITICAL] NEXTAUTH_URL is not set! Magic links will fail.')
  console.error('[CRITICAL] Set NEXTAUTH_URL=http://localhost:3000 for dev or your production URL')
}

if (process.env.EMAIL_SERVER_PASSWORD && /\s/.test(process.env.EMAIL_SERVER_PASSWORD)) {
  console.warn('[SMTP] Warning: EMAIL_SERVER_PASSWORD contains whitespace — removing spaces for connection. Use an app password without spaces.')
}

const emailServerConfig = {
  host: process.env.EMAIL_SERVER_HOST,
  port: emailPort,
  auth: {
    user: process.env.EMAIL_SERVER_USER?.trim(),
    // Remove internal whitespace if present (some UIs display app passwords with spaces)
    pass: process.env.EMAIL_SERVER_PASSWORD ? process.env.EMAIL_SERVER_PASSWORD.replace(/\s+/g, '') : undefined,
  },
  secure: emailPort === 465,
}

// Verify SMTP connection early so the server logs show a clear error if credentials are invalid
;(async function verifySMTP() {
  if (!emailServerConfig.host) return
  try {
    const transporter = nodemailer.createTransport(emailServerConfig)
    await transporter.verify()
    console.log("[SMTP] verification succeeded")
  } catch (err) {
    console.error("[SMTP] verification failed:", err)
  }
})()

// Ensure MongoDB adapter is properly configured
// The adapter manages: users, accounts, sessions, verification_tokens collections
// DO NOT manually create/delete these - let the adapter handle them

// CRITICAL: Pass clientPromise directly to adapter
// The adapter handles promise resolution internally
// This ensures proper singleton behavior in dev mode

const config: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  // MongoDB adapter is REQUIRED for Email (Magic Link) authentication
  // It stores verification tokens in the verification_tokens collection
  // CRITICAL: Adapter uses native MongoDB driver (NOT Mongoose) - separate from app's Mongoose connection
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Email({
      server: emailServerConfig,
      from: process.env.EMAIL_FROM?.trim(),
      // PATCH 2: Harden token expiry - ensure tokens last at least 1 hour
      // Increased to 24 hours (86400 seconds) to prevent premature expiry
      maxAge: 24 * 60 * 60, // 24 hours in seconds (3600 seconds = 1 hour minimum)
      // CRITICAL: Let NextAuth handle email sending with default implementation
      // Do NOT override sendVerificationRequest - it can break token handling
      // The default uses nodemailer which we configured above
    }),
  ],
  logger: {
    error: (error: Error) => {
      // CRITICAL: Log all errors with full details
      console.error("[NextAuth Error]", error.message, error)
      
      // Enhanced error logging for configuration issues
      const msg = error.message || ""
      if (msg.includes("Configuration") || msg.includes("ADAPTER")) {
        console.error("[NextAuth Configuration Error] Details:")
        console.error("  - Check MongoDB connection")
        console.error("  - Ensure NEXTAUTH_SECRET is set")
        console.error("  - Verify adapter initialization")
      }
      
      // Magic link specific errors
      if (msg.includes("Email") || msg.includes("token")) {
        console.error("[Magic Link] Token verification failed. Possible causes:")
        console.error("  - Token expired (check server time sync)")
        console.error("  - Token already used (email client may have scanned link)")
        console.error("  - NEXTAUTH_URL mismatch (callback URL doesn't match)")
        console.error("  - Database connection issue (verification_tokens collection)")
      }
    },
    warn: (message: string) => {
      console.warn("[NextAuth Warn]", message)
    },
    debug: (message: string) => {
      // Enhanced debug logging for token operations
      if (message.includes("EMAIL") || message.includes("CALLBACK")) {
        console.debug("[NextAuth Debug]", message, {
          timestamp: new Date().toISOString(),
          serverTime: Date.now(),
        })
      } else {
        console.debug("[NextAuth Debug]", message)
      }
    },
  },
  // REMOVED: events.createUser
  // Profile creation moved to callback page AFTER successful authentication
  // This prevents adapter interference and ensures auth completes first
  callbacks: {
    async signIn({ user }) {
      console.log(`[Auth] signIn callback - email verified: ${user?.email}`)
      return true // Allow all verified email sign-ins
    },
    
    async jwt({ token, user, trigger, session: updateSession }) {
      // Initial sign-in: set basic auth info only
      if (user) {
        token.authUserId = user.id
        token.email = user.email
        console.log(`[JWT] Initial token for ${user.email}, authUserId: ${user.id.substring(0, 8)}...`)
      }
      
      // Session update after registration
      if (trigger === "update" && updateSession) {
        console.log(`[JWT] Update trigger for ${token.email}`)
        try {
          await connectDB()
          const authUserId = token.authUserId as string
          
          if (authUserId) {
            const profile = await User.findOne({ authUserId })
            
            if (profile) {
              token.id = profile._id.toString()
              token.tzId = profile.tzId
              token.registrationCompleted = profile.registrationCompleted ?? false
              token.workshopPayments = (profile.workshopPayments || {}) as { [workshopId: string]: "PAID" | "NOT_PAID" }
              
              const payment = await UserPayment.findOne({ authUserId })
              if (payment) {
                token.eventFeePaid = payment.eventFeePaid
                token.eventFeeAmount = payment.eventFeeAmount
              }
              
              console.log(`[JWT] ✓ Updated: registrationCompleted=${profile.registrationCompleted}`)
            } else {
              console.warn(`[JWT] ✗ No profile found for authUserId: ${authUserId.substring(0, 8)}...`)
            }
          }
        } catch (error) {
          console.error("[JWT] Update error:", error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.authUserId = token.authUserId as string | undefined
        session.user.id = token.id as string
        session.user.tzId = token.tzId as string | undefined
        session.user.registrationCompleted = (token.registrationCompleted ?? false) as boolean
        session.user.eventFeePaid = token.eventFeePaid as boolean | undefined
        session.user.eventFeeAmount = token.eventFeeAmount as number | undefined
        session.user.workshopPayments = token.workshopPayments as {
          [workshopId: string]: "PAID" | "NOT_PAID"
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log(`[Redirect] url: ${url}, baseUrl: ${baseUrl}`)
      
      // Always redirect to /auth/callback after authentication
      if (url.includes("/api/auth/callback")) {
        const callbackUrl = `${baseUrl}/auth/callback`
        console.log(`[Redirect] Going to callback: ${callbackUrl}`)
        return callbackUrl
      }
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // Validate same origin
      try {
        const urlOrigin = new URL(url).origin
        if (urlOrigin === baseUrl) {
          return url
        }
      } catch (e) {
        // Invalid URL
      }
      
      // Default: callback
      return `${baseUrl}/auth/callback`
    },
  },
  pages: {
    signIn: "/login",
    // FIX: Remove custom error page - let NextAuth handle errors naturally
    // The redirect callback will handle post-auth redirects server-side
  },
  session: {
    strategy: "jwt",
    maxAge: 2592000, // 30 days in seconds
  },
}

// CRITICAL: Create Auth.js configuration with error handling
let authExport: any

try {
  console.log("[NextAuth] Creating Auth.js configuration...")
  authExport = NextAuth(config)
  console.log("[NextAuth] Configuration successful!")
} catch (error) {
  console.error("[NextAuth] Configuration failed:", error)
  console.error("[NextAuth] Full error details:", JSON.stringify(error, null, 2))
  // Re-throw so the server logs the error clearly
  throw error
}

export const { handlers, auth, signIn, signOut } = authExport

// Wrap handlers to intercept HEAD requests from email security scanners
// Email clients (Outlook SafeLinks, Gmail link scanning) pre-fetch links with HEAD requests
// This can consume magic link tokens before users click them
async function handleRequest(
  request: Request,
  handler: (req: Request) => Promise<Response>
) {
  // Check if this is a HEAD request (email scanner)
  if (request.method === "HEAD") {
    const url = new URL(request.url)
    
    // Log HEAD requests for debugging
    if (url.searchParams.has("token") || url.searchParams.has("callbackUrl")) {
      console.log("[Magic Link] HEAD request detected (email scanner):", {
        path: url.pathname,
        hasToken: url.searchParams.has("token"),
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date().toISOString(),
      })
    }
    
    // Return 200 OK without processing token - prevents premature consumption
    return new Response(null, { status: 200 })
  }
  
  // For GET/POST, proceed with normal handler
  return handler(request)
}

// Export GET and POST handlers with HEAD request protection
export const GET = (request: Request) => handleRequest(request, handlers.GET)
export const POST = (request: Request) => handleRequest(request, handlers.POST)
export const HEAD = async (request: Request) => {
  // Explicit HEAD handler as fallback
  const url = new URL(request.url)
  console.log("[Magic Link] HEAD request:", {
    path: url.pathname,
    userAgent: request.headers.get("user-agent"),
  })
  return new Response(null, { status: 200 })
}

