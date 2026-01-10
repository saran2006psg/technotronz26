import { NextResponse } from "next/server"
import { getAuthFromCookies } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import UserPayment from "@/models/UserPayment"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const auth = getAuthFromCookies(cookieStore)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(auth.userId).select("-passwordHash")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch payment status
    let paymentData = null
    const userPayment = await UserPayment.findOne({ userId: user._id })
    if (userPayment) {
      paymentData = {
        eventFeePaid: userPayment.eventFeePaid,
        eventFeeAmount: userPayment.eventFeeAmount,
        workshopsPaid: userPayment.workshopsPaid,
      }
    }

    // Convert Mongoose document to plain object
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      tzId: user.tzId,
      collegeName: user.collegeName,
      mobileNumber: user.mobileNumber,
      yearOfStudy: user.yearOfStudy,
      department: user.department,
      registrationCompleted: user.registrationCompleted,
      eventsRegistered: user.eventsRegistered,
      tzId: user.tzId,
      registrationCompleted: user.registrationCompleted,
      role: user.role,
      eventsRegistered: user.eventsRegistered,
      workshopsRegistered: user.workshopsRegistered,
      workshopPayments: Object.fromEntries(user.workshopPayments || new Map()),
      payment: paymentData,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}