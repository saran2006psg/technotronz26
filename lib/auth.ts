import { NextRequest } from "next/server"
import { verifyJWT, JWTPayload } from "./jwt"

export function getAuthFromRequest(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get("auth_token")?.value
  if (!token) return null
  
  return verifyJWT(token)
}

export function getAuthFromCookies(cookies: { get: (name: string) => { value: string } | undefined }): JWTPayload | null {
  const token = cookies.get("auth_token")?.value
  if (!token) return null
  
  return verifyJWT(token)
}
