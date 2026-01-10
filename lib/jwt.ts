import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || ""
const JWT_EXPIRES_IN = "30d"

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables")
}

export interface JWTPayload {
  userId: string
  email: string
  registrationCompleted: boolean
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}
