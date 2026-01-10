import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import connectDB from "@/lib/db"
import User from "@/models/User"
import PasswordResetToken from "@/models/PasswordResetToken"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token, newPassword } = body

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Find reset tokens for this user
    const resetTokens = await PasswordResetToken.find({
      userId: user._id,
      expiresAt: { $gt: new Date() },
    })

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Verify token
    let validToken = null
    for (const resetToken of resetTokens) {
      const isValid = await bcrypt.compare(token, resetToken.tokenHash)
      if (isValid) {
        validToken = resetToken
        break
      }
    }

    if (!validToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await User.findByIdAndUpdate(user._id, { passwordHash })

    // Delete all reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error: any) {
    console.error("[Reset Password API] Error:", error)
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}
