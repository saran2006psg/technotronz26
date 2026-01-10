"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Copy, LogOut, User, Check, Clock } from "lucide-react"

export function ProfileDropdown() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(user.tzId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-red-900/50 bg-black overflow-hidden hover:border-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.6)] transition-all duration-300 group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-red-950 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center font-serif text-red-600 text-lg">
          {user.name.charAt(0)}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-black/95 border border-red-900/60 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-content-fade-in origin-top-right z-50">
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/20 to-transparent h-[200%] animate-scanline-scroll" />
          </div>

          <div className="p-4 sm:p-5 relative z-10">
            {/* User Info */}
            <div className="mb-4">
              <p className="font-serif text-lg text-red-500 tracking-wide">{user.name}</p>
              <p className="text-gray-500 text-xs font-mono lowercase">{user.email}</p>
              <div className="mt-2 flex items-center justify-between bg-red-950/20 border border-red-900/30 px-2 py-1.5 rounded-sm">
                <span className="text-[10px] font-mono text-red-400/80 tracking-tighter">ID: {user.tzId}</span>
                <button onClick={handleCopy} className="text-red-600 hover:text-red-400 transition-colors">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="h-px bg-red-900/30 my-4" />

            {/* Payment Status */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-mono text-gray-500 tracking-[0.2em] mb-2">EVENTS ACCESS</p>
                <div className="flex items-center gap-2">
                  {user.eventsPaymentStatus === "PAID" ? (
                    <span className="flex items-center gap-1.5 text-xs text-green-500 font-mono">
                      <Check size={12} /> PAID
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-yellow-500/80 font-mono">
                      <Clock size={12} className="animate-pulse" /> PENDING
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono text-gray-500 tracking-[0.2em] mb-2">WORKSHOPS</p>
                <div className="space-y-1.5">
                  {Object.entries(user.workshopsPaymentStatus || {}).map(([id, status]) => (
                    <div key={id} className="flex justify-between items-center font-mono text-[10px]">
                      <span className="text-gray-400">{id}</span>
                      <span className={status === "PAID" ? "text-green-500" : "text-red-700"}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-red-900/30 my-4" />

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 border border-red-900/50 text-[10px] font-mono text-gray-300 hover:bg-red-600/10 hover:text-red-400 transition-all"
              >
                <User size={12} /> PROFILE
              </Link>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1.5 py-2 border border-red-900/50 text-[10px] font-mono text-red-600 hover:bg-red-950/30 transition-all"
              >
                <LogOut size={12} /> LOGOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
