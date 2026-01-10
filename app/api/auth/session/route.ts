import { NextRequest, NextResponse } from "next/server"
import { getAuthFromCookies } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const auth = getAuthFromCookies(cookieStore)

    if (!auth) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    await connectDB()

    const user = await User.findById(auth.userId).select("-passwordHash")
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        tzId: user.tzId,
        registrationCompleted: user.registrationCompleted,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[Session API] Error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
