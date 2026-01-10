import { NextRequest, NextResponse } from "next/server"
import { getAuthFromRequest } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import UserPayment from "@/models/UserPayment"
import { z } from "zod"

const updatePaymentSchema = z.object({
  userId: z.string().optional(),
  eventFeePaid: z.boolean().optional(),
  workshopsPaid: z.array(z.string()).optional(), // Array of workshop IDs that are paid
})

export async function PATCH(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Add admin check here
    // For now, allow any authenticated user to update payments
    // In production, add proper admin role checking

    const body = await request.json()

    // Validate request body
    const validationResult = updatePaymentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user by userId if provided, otherwise use auth user
    const targetUserId = validationResult.data.userId || auth.userId
    const user = await User.findById(targetUserId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get or create UserPayment document
    let userPayment = await UserPayment.findOne({ userId: targetUserId })

    if (!userPayment) {
      // Create new UserPayment document
      const userEmail = user.email
      const isPSGStudent = userEmail.endsWith("@psgtech.ac.in")
      const eventFeeAmount = isPSGStudent ? 150 : 200

      userPayment = await UserPayment.create({
        userId: targetUserId,
        eventFeePaid: false,
        eventFeeAmount,
        workshopsPaid: [],
      })
    }

    // Update event fee payment status
    if (validationResult.data.eventFeePaid !== undefined) {
      // Prevent duplicate payment if already paid
      if (userPayment.eventFeePaid && validationResult.data.eventFeePaid) {
        return NextResponse.json(
          { error: "Event fee already paid. Duplicate payment prevented." },
          { status: 409 }
        )
      }
      userPayment.eventFeePaid = validationResult.data.eventFeePaid
      
      // Ensure eventFeeAmount is set correctly based on email
      const userEmail = user.email
      const isPSGStudent = userEmail.endsWith("@psgtech.ac.in")
      userPayment.eventFeeAmount = isPSGStudent ? 150 : 200
    }

    // Update workshop payments
    if (validationResult.data.workshopsPaid !== undefined) {
      // Prevent duplicate workshop payments
      const newWorkshopsPaid = validationResult.data.workshopsPaid.filter(
        (id) => !userPayment.workshopsPaid.includes(id)
      )
      userPayment.workshopsPaid = [...userPayment.workshopsPaid, ...newWorkshopsPaid]

      // Also update User model's workshopPayments Map for backward compatibility
      if (!user.workshopPayments) {
        user.workshopPayments = new Map()
      }
      validationResult.data.workshopsPaid.forEach((workshopId) => {
        user.workshopPayments.set(workshopId, "PAID")
      })
      await user.save()
    }

    await userPayment.save()

    // Return updated payment status
    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      payment: {
        eventFeePaid: userPayment.eventFeePaid,
        eventFeeAmount: userPayment.eventFeeAmount,
        workshopsPaid: userPayment.workshopsPaid,
      },
    })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

