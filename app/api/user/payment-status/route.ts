import { NextRequest, NextResponse } from "next/server"
import { getAuthFromRequest } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import UserPayment from "@/models/UserPayment"

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(auth.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find or create UserPayment document
    let userPayment = await UserPayment.findOne({ userId: auth.userId })

    if (!userPayment) {
      // No payment record exists - create default one
      const isPSGStudent = auth.email.endsWith("@psgtech.ac.in")
      const eventFeeAmount = isPSGStudent ? 150 : 200

      userPayment = await UserPayment.create({
        userId: auth.userId,
        eventFeePaid: false,
        eventFeeAmount,
        workshopsPaid: [],
      })
    }

    return NextResponse.json({
      eventFeePaid: userPayment.eventFeePaid,
      eventFeeAmount: userPayment.eventFeeAmount,
      workshopsPaid: userPayment.workshopsPaid,
    })
  } catch (error) {
    console.error("Error fetching payment status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


