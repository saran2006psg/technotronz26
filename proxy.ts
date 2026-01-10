import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuthFromRequest } from "./lib/auth"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/reset-password", "/forgot-password", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Allow public routes
  if (isPublicRoute) {
    console.log(`[Proxy Guard] ✓ Public route allowed: ${pathname}`)
    return NextResponse.next()
  }

  // Get auth from JWT cookie
  const auth = getAuthFromRequest(request)
  
  console.log(`[Proxy Guard] ${pathname}`, {
    userId: auth?.userId?.substring(0, 8) + "..." || "none",
    email: auth?.email || "none",
    registrationCompleted: auth?.registrationCompleted,
  })

  // Unauthenticated user trying to access protected area
  if (!auth) {
    console.log(`[Proxy Guard] ✗ Unauthenticated, redirect /login`)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protected routes that require completed registration
  const requiresRegistration = !pathname.startsWith("/register") && !pathname.startsWith("/api")
  
  if (requiresRegistration && !auth.registrationCompleted) {
    console.log(`[Proxy Guard] ✗ Registration incomplete, redirect /register`)
    return NextResponse.redirect(new URL("/register", request.url))
  }

  // If already registered, redirect away from /register
  if (pathname === "/register" && auth.registrationCompleted) {
    console.log(`[Proxy Guard] ✓ Registration complete, redirect /events`)
    return NextResponse.redirect(new URL("/events", request.url))
  }

  console.log(`[Proxy Guard] ✓ Access granted`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
