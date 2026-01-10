import { redirect } from "next/navigation"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { generateTzId } from "@/lib/generateTzId"

/**
 * Auth Callback Page - Server Component
 * 
 * Runs AFTER Auth.js authentication completes.
 * Responsibilities:
 * 1. Verify session exists (authUserId set)
 * 2. Create profile if missing (new user)
 * 3. Redirect based on registrationCompleted status
 */
export default async function AuthCallbackPage() {
  console.log("[Callback] Page loaded")
  
  const session = await auth()

  // No session - not authenticated
  if (!session?.user?.email) {
    console.log("[Callback] ✗ No session, redirect /login")
    redirect("/login")
  }

  const sessionUser = session.user as any
  const authUserId = sessionUser.authUserId
  const email = sessionUser.email
  
  console.log("[Callback] Authenticated:", {
    email,
    authUserId: authUserId?.substring(0, 8) + "...",
  })
  
  // Auth.js session exists but no authUserId
  // This means JWT callback didn't run or failed
  if (!authUserId) {
    console.error("[Callback] ✗ No authUserId in session")
    redirect("/login")
  }

  await connectDB()

  // Check if profile exists
  let profile = await User.findOne({ authUserId })

  // Create profile if missing (new user)
  if (!profile) {
    console.log(`[Callback] Creating profile for ${email}`)
    
    try {
      const tzId = await generateTzId()
      
      profile = await User.create({
        authUserId,
        name: sessionUser.name || email.split("@")[0],
        email,
        image: sessionUser.image,
        tzId,
        registrationCompleted: false,
        eventsRegistered: [],
        workshopsRegistered: [],
        workshopPayments: {},
      })
      
      console.log(`[Callback] ✓ Profile created:`, {
        authUserId: authUserId.substring(0, 8) + "...",
        tzId,
      })
    } catch (error: any) {
      console.error("[Callback] Profile creation error:", error.message)
      
      // Race condition: another request may have created it
      if (error.code === 11000) {
        console.log("[Callback] Duplicate key - fetching existing profile")
        profile = await User.findOne({ authUserId })
        
        if (!profile) {
          console.error("[Callback] ✗ Still no profile after duplicate error")
          redirect("/login")
        }
      } else {
        // Other error - fail safely
        throw error
      }
    }
  }

  console.log(`[Callback] Profile status:`, {
    email,
    registrationCompleted: profile.registrationCompleted,
    tzId: profile.tzId,
  })

  // Redirect based on registration status
  if (profile.registrationCompleted === true) {
    console.log(`[Callback] ✓ Registered, redirect /events`)
    redirect("/events")
  }

  console.log(`[Callback] → Not registered, redirect /register`)
  redirect("/register")
}
