"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FloatingParticles } from "@/components/floating-particles"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage(data.message)
      } else {
        setMessage(data.error || "Failed to send reset email")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Base dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0000] to-[#1a0505]" />

      {/* Fog Layers */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 animate-fog-slow"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 20% 80%, rgba(127, 29, 29, 0.3) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 animate-fog-mid"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(153, 27, 27, 0.25) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* VHS Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scanline Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)",
        }}
      />

      <FloatingParticles />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-md px-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="font-serif text-3xl sm:text-4xl font-bold text-red-600 tracking-widest animate-flicker"
            style={{
              textShadow:
                "0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.4)",
            }}
          >
            RECOVER
          </h1>
          <p className="mt-3 text-xs sm:text-sm tracking-[0.3em] text-red-200/70 uppercase">
            Reset your password
          </p>
          
          <div className="flex items-center justify-center mt-4">
            <div className="relative h-0.5 w-32 sm:w-48 overflow-hidden rounded-full">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-energy-beam"
                style={{
                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.4)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div
          className="relative bg-black/60 backdrop-blur-md border border-red-900/30 rounded-lg p-6 sm:p-8"
          style={{
            boxShadow: "0 0 30px rgba(127, 29, 29, 0.2), inset 0 0 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="absolute inset-0 rounded-lg border border-red-600/20 animate-border-pulse pointer-events-none" />

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.2em] text-red-200/80 uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-red-900/40 rounded text-red-100 placeholder-red-900/50 focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/30 transition-all text-sm"
                  placeholder="you@example.com"
                  style={{
                    boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.3)",
                  }}
                />
              </div>

              {message && (
                <div
                  className="p-3 rounded bg-red-950/50 border border-red-800/50 text-red-300 text-sm text-center"
                  style={{ textShadow: "0 0 10px rgba(220, 38, 38, 0.5)" }}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-900 via-red-700 to-red-900 border border-red-600/50 rounded text-red-100 font-bold tracking-[0.2em] uppercase text-sm hover:from-red-800 hover:via-red-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                style={{
                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                  textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                }}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div
                className="p-4 rounded bg-green-950/30 border border-green-800/30 text-green-300 text-sm"
                style={{ textShadow: "0 0 10px rgba(34, 197, 94, 0.5)" }}
              >
                {message}
              </div>
              <p className="text-red-200/60 text-xs tracking-wide">
                Check your email for the reset link. It will expire in 1 hour.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-red-400/80 hover:text-red-300 text-xs tracking-[0.15em] uppercase transition-colors"
              style={{ textShadow: "0 0 10px rgba(220, 38, 38, 0.3)" }}
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
