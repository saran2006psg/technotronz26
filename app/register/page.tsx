"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FloatingParticles } from "@/components/floating-particles"

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  collegeName: z.string().min(1, "College name is required"),
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  yearOfStudy: z.enum(["1st Year", "2nd Year", "3rd Year", "4th Year"], {
    required_error: "Year of study is required",
  }),
  department: z.string().min(1, "Department is required"),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export default function RegisterPage() {
  const { user, refetch } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: user?.name || "",
    },
  })

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/user/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }
      
      console.log("[Register] Registration successful, refreshing session...")
      
      // Refresh user data
      await refetch()
      
      console.log("[Register] Session refreshed, redirecting to about page...")
      
      // Redirect to /about
      router.replace("/about")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <div className="relative z-20 max-w-2xl mx-auto px-4 py-20 sm:py-28">
        {/* Header */}
        <div className="text-center mb-12 animate-content-fade-in">
          <h1 className="font-serif text-3xl sm:text-5xl text-red-600 tracking-widest mb-4 animate-flicker">
            COMPLETE REGISTRATION
          </h1>
          <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto animate-energy-beam" />
        </div>

        {/* Registration Form Card */}
        <div className="relative bg-black/90 border border-red-800/40 p-6 sm:p-8 rounded-sm overflow-hidden animate-content-fade-in-delay">
          <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-red-600/40" />
          <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-red-600/40" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-red-600/40" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-red-600/40" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-red-500 font-mono text-xs tracking-widest mb-2 uppercase">
                Full Name
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-3 bg-black/50 border border-red-900/50 text-gray-300 font-mono focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-red-500 text-xs font-mono">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* College Name */}
            <div>
              <label className="block text-red-500 font-mono text-xs tracking-widest mb-2 uppercase">
                College Name
              </label>
              <input
                {...register("collegeName")}
                type="text"
                className="w-full px-4 py-3 bg-black/50 border border-red-900/50 text-gray-300 font-mono focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
                placeholder="Enter your college name"
              />
              {errors.collegeName && (
                <p className="mt-1 text-red-500 text-xs font-mono">
                  {errors.collegeName.message}
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-red-500 font-mono text-xs tracking-widest mb-2 uppercase">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 bg-black/30 border border-red-900/30 text-gray-500 font-mono cursor-not-allowed"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-red-500 font-mono text-xs tracking-widest mb-2 uppercase">
                Mobile Number
              </label>
              <input
                {...register("mobileNumber")}
                type="tel"
                maxLength={10}
                className="w-full px-4 py-3 bg-black/50 border border-red-900/50 text-gray-300 font-mono focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
                placeholder="10 digit mobile number"
              />
              {errors.mobileNumber && (
                <p className="mt-1 text-red-500 text-xs font-mono">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>

            {/* Year of Study */}
            <div>
              <label className="block text-red-500 font-mono text-xs tracking-widest mb-2 uppercase">
                Year of Study
              </label>
              <select
                {...register("yearOfStudy")}
                className="w-full px-4 py-3 bg-black/50 border border-red-900/50 text-gray-300 font-mono focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              {errors.yearOfStudy && (
                <p className="mt-1 text-red-500 text-xs font-mono">
                  {errors.yearOfStudy.message}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-red-500 font-mono text-xs tracking-widest mb-2 uppercase">
                Department
              </label>
              <input
                {...register("department")}
                type="text"
                className="w-full px-4 py-3 bg-black/50 border border-red-900/50 text-gray-300 font-mono focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all"
                placeholder="Enter your department"
              />
              {errors.department && (
                <p className="mt-1 text-red-500 text-xs font-mono">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-950/30 border border-red-900/50">
                <p className="text-red-500 text-sm font-mono">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-transparent border border-red-600 text-red-500 font-mono tracking-wider uppercase hover:bg-red-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT REGISTRATION"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
