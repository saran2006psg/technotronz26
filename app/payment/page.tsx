"use client"

import { FloatingParticles } from "@/components/floating-particles"
import Link from "next/link"
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

const WORKSHOP_PRICES: Record<string, number> = {
  "W-01": 500,
  "W-02": 750,
  "W-03": 1000,
}

const WORKSHOP_IDS = ["W-01", "W-02", "W-03"]

export default function PaymentPage() {
  const { user, isLoading: authLoading, isLoggedIn } = useAuth()
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const message = searchParams.get("message")

  useEffect(() => {
    async function fetchPaymentStatus() {
      if (!authLoading && isLoggedIn && user?.email) {
        try {
          const response = await fetch("/api/user/payment-status")
          if (response.ok) {
            const data = await response.json()
            setPaymentStatus(data)
          } else {
            // Default to unpaid if no payment record exists
            const userEmail = user.email
            const isPSGStudent = userEmail.endsWith("@psgtech.ac.in")
            setPaymentStatus({
              eventFeePaid: false,
              eventFeeAmount: isPSGStudent ? 150 : 200,
              workshopsPaid: [],
            })
          }
        } catch (error) {
          console.error("Error fetching payment status:", error)
        } finally {
          setLoading(false)
        }
      } else if (!authLoading && !isLoggedIn) {
        setLoading(false)
      }
    }
    fetchPaymentStatus()
  }, [authLoading, isLoggedIn, user])

  if (loading) {
    return (
      <main className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-red-500 font-mono">Loading...</div>
      </main>
    )
  }

  const eventFeeAmount = paymentStatus?.eventFeeAmount || 200
  const eventFeePaid = paymentStatus?.eventFeePaid || false
  const workshopsPaid = paymentStatus?.workshopsPaid || []
  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <FloatingParticles />

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black" />
      <div
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.03] animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-20 max-w-3xl mx-auto px-4 py-20 sm:py-28">
        {/* Header */}
        <div className="text-center mb-12 animate-content-fade-in">
          <h1 className="font-serif text-3xl sm:text-5xl text-red-600 tracking-widest mb-4 animate-flicker">
            PAYMENT PORTAL
          </h1>
          <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto animate-energy-beam" />
        </div>

        {/* Payment Instructions Card */}
        <div className="relative bg-black/90 border border-red-800/40 p-6 sm:p-8 rounded-sm overflow-hidden animate-content-fade-in-delay">
          <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-red-600/40" />
          <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-red-600/40" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-red-600/40" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-red-600/40" />

          <div className="space-y-6">
            {/* Info Alert */}
            <div className="flex items-start gap-4 p-4 bg-red-950/20 border border-red-900/50">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-mono text-sm font-semibold mb-1">
                  EXTERNAL PAYMENT PROCESS
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Payments are processed externally through the college payment system. After completing your payment, the admin will update your payment status manually.
                </p>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-red-600" />
                <h2 className="text-red-500 font-serif text-xl tracking-wider uppercase">
                  Payment Instructions
                </h2>
              </div>

              <div className="space-y-3 text-gray-300">
                <div className="pl-4 border-l-2 border-red-900/50">
                  <p className="font-mono text-sm">
                    <span className="text-red-500">1.</span> Visit the college help desk or payment counter
                  </p>
                </div>
                <div className="pl-4 border-l-2 border-red-900/50">
                  <p className="font-mono text-sm">
                    <span className="text-red-500">2.</span> Provide your TZ ID and registration details
                  </p>
                </div>
                <div className="pl-4 border-l-2 border-red-900/50">
                  <p className="font-mono text-sm">
                    <span className="text-red-500">3.</span> Complete the payment for events and/or workshops
                  </p>
                </div>
                <div className="pl-4 border-l-2 border-red-900/50">
                  <p className="font-mono text-sm">
                    <span className="text-red-500">4.</span> Your payment status will be updated within 24-48 hours
                  </p>
                </div>
                <div className="pl-4 border-l-2 border-red-900/50">
                  <p className="font-mono text-sm">
                    <span className="text-red-500">5.</span> Check your profile page to verify payment status
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {message && (
              <div className="p-4 bg-yellow-950/20 border border-yellow-900/50 text-yellow-400 text-sm font-mono">
                {message}
              </div>
            )}

            {/* Payment Details */}
            <div className="pt-4 border-t border-red-900/30">
              <h3 className="text-red-500 font-serif text-lg tracking-wider mb-4 uppercase">
                Payment Status & Pricing
              </h3>
              <div className="space-y-4">
                {/* Event Fee */}
                <div className="p-4 bg-red-950/10 border border-red-900/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-red-400 font-mono text-sm font-semibold mb-1">
                        Events Access Pass
                      </p>
                      <p className="text-gray-400 text-xs mb-2">
                        One-time payment grants access to all 12 intercollegiate symposium events.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {eventFeePaid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-mono text-sm">
                      Amount: <span className="text-red-400">₹{eventFeeAmount}</span>
                    </span>
                    <span
                      className={`font-mono text-xs px-2 py-1 ${
                        eventFeePaid
                          ? "bg-green-950/30 text-green-400 border border-green-900/50"
                          : "bg-red-950/30 text-red-400 border border-red-900/50"
                      }`}
                    >
                      {eventFeePaid ? "PAID" : "UNPAID"}
                    </span>
                  </div>
                </div>

                {/* Workshops */}
                <div className="p-4 bg-red-950/10 border border-red-900/30">
                  <p className="text-red-400 font-mono text-sm font-semibold mb-2">
                    Workshop Registration
                  </p>
                  <p className="text-gray-400 text-xs mb-3">
                    Individual payment for each workshop. You can register and pay for workshops separately.
                  </p>
                  <div className="space-y-2">
                    {WORKSHOP_IDS.map((workshopId) => {
                      const isPaid = workshopsPaid.includes(workshopId)
                      const price = WORKSHOP_PRICES[workshopId]
                      return (
                        <div
                          key={workshopId}
                          className="flex items-center justify-between p-2 bg-black/30 border border-red-900/20"
                        >
                          <div className="flex items-center gap-2">
                            {isPaid ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-gray-300 font-mono text-sm">{workshopId}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-mono text-xs">
                              ₹{price}
                            </span>
                            <span
                              className={`font-mono text-[10px] px-2 py-0.5 ${
                                isPaid
                                  ? "bg-green-950/30 text-green-400 border border-green-900/50"
                                  : "bg-red-950/30 text-red-400 border border-red-900/50"
                              }`}
                            >
                              {isPaid ? "PAID" : "UNPAID"}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-4 bg-black/50 border border-red-900/30">
              <p className="text-gray-500 text-xs font-mono italic">
                Note: Payment status updates are handled manually by administrators. If your payment status is not updated within 48 hours, please contact the help desk.
              </p>
            </div>

            {/* Back Button */}
            <div className="pt-6">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-6 py-3 border border-red-900/50 text-red-500 font-mono text-sm tracking-wider hover:bg-red-600/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                BACK TO PROFILE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

