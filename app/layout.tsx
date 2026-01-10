import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Providers } from "@/components/providers"

// Fonts are loaded via CSS (e.g. Google Fonts) to avoid next/font/turbopack issues

export const metadata: Metadata = {
  title: "TECHNOTRONZ 2025 | Enter the Upside Down",
  description: "Welcome to TECHNOTRONZ 2025 - The Upside Down of Technology. A supernatural tech experience awaits.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-black`}>
        <Providers>
          <ProfileDropdown />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
