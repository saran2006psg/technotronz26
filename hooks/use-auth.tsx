"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  tzId: string
  registrationCompleted: boolean
  eventsRegistered: string[]
  workshopsRegistered: string[]
  payment?: {
    eventFeePaid: boolean
    eventFeeAmount: number
    workshopsPaid: string[]
  }
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  isLoading: boolean
  login: () => void
  logout: () => void
  refetch: () => Promise<void>
}

export function useAuth(): AuthContextType {
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUserData(data.user)
        } else {
          setUserData(null)
        }
      } else {
        setUserData(null)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const login = () => {
    router.push("/login")
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUserData(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    isLoggedIn: !!userData,
    user: userData,
    isLoading: loading,
    login,
    logout,
    refetch: fetchUserData,
  }
}
