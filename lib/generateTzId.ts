import User from "@/models/User"
import connectDB from "@/lib/db"

/**
 * Generates a unique TZ ID in format TZ26-XXXXXX
 * Where XXXXXX is a random 6-character alphanumeric string
 */
export async function generateTzId(): Promise<string> {
  await connectDB()

  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    // Generate random 6-character alphanumeric string
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
      .replace(/[0-9]/g, (char) => {
        // Replace numbers with letters to ensure alphanumeric
        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        return letters[parseInt(char)]
      })
      .padEnd(6, "A")
      .substring(0, 6)

    const tzId = `TZ26-${randomPart}`

    // Check if TZ ID already exists
    const existingUser = await User.findOne({ tzId })

    if (!existingUser) {
      return tzId
    }

    attempts++
  }

  // Fallback: use timestamp-based ID if all random attempts fail
  const timestamp = Date.now().toString(36).toUpperCase().substring(0, 6)
  return `TZ26-${timestamp}`
}

