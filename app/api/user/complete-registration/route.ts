import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { getAuthFromCookies } from "@/lib/auth"
import { signJWT } from "@/lib/jwt"
import { cookies } from "next/headers"

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  collegeName: z.string().min(1, "College name is required"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  department: z.string().min(1, "Department is required"),
})

export async function POST(request: Request) {
  try {
    // Get auth from JWT cookie
    const cookieStore = await cookies()
    const auth = getAuthFromCookies(cookieStore)

    if (!auth) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    console.log("[Registration API] Processing for user:", auth.userId)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = registrationSchema.parse(body)

    await connectDB()

    // Update user profile
    const updateResult = await User.updateOne(
      { _id: auth.userId },
      {
        $set: {
          name: validatedData.name,
          collegeName: validatedData.collegeName,
          mobileNumber: validatedData.mobileNumber,
          yearOfStudy: validatedData.yearOfStudy,
          department: validatedData.department,
          registrationCompleted: true,
        },
      }
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    console.log("[Registration API] ✓ Profile updated successfully")

    // Create new JWT with updated registration status
    const token = signJWT({
      userId: auth.userId,
      email: auth.email,
      registrationCompleted: true,
    })

    // Return response with updated cookie
    const response = NextResponse.json({
      success: true,
      message: "Registration completed successfully!",
    })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return response
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("[Registration API] Error:", error)
    return NextResponse.json(
      { error: "Failed to complete registration" },
      { status: 500 }
    )
  }
}
