import { NextRequest, NextResponse } from "next/server"
import { getAuthFromRequest } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { z } from "zod"

const registerWorkshopSchema = z.object({
  workshopId: z.string().min(1, "Workshop ID is required"),
})

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validationResult = registerWorkshopSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findById(auth.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if registration is completed
    if (!user.registrationCompleted) {
      return NextResponse.json(
        { error: "Registration not completed" },
        { status: 400 }
      )
    }

    // Note: Workshop registration is independent - no event fee payment required

    const { workshopId } = validationResult.data

    // Check if already registered
    if (user.workshopsRegistered.includes(workshopId)) {
      return NextResponse.json(
        { error: "Already registered for this workshop" },
        { status: 400 }
      )
    }

    // Add workshop to registered list
    user.workshopsRegistered.push(workshopId)

    // Set default payment status to NOT_PAID
    if (!user.workshopPayments) {
      user.workshopPayments = new Map()
    }
    user.workshopPayments.set(workshopId, "NOT_PAID")

    await user.save()

    return NextResponse.json({
      success: true,
      message: "Workshop registered successfully",
      workshopsRegistered: user.workshopsRegistered,
      workshopPayments: Object.fromEntries(user.workshopPayments),
    })
  } catch (error) {
    console.error("Error registering for workshop:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

