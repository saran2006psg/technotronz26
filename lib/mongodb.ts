// Stable MongoDB client singleton for NextAuth adapter
// This uses the native mongodb driver (NOT Mongoose) as required by @auth/mongodb-adapter
import { MongoClient, MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI

// Connection options for stability and retry handling
const options: MongoClientOptions = {
  // Use connection pooling for better performance
  maxPoolSize: 10,
  minPoolSize: 1,
  // Retry writes for transient failures
  retryWrites: true,
  // Server selection timeout - increased for reliability
  serverSelectionTimeoutMS: 10000,
  // Socket timeout
  socketTimeoutMS: 45000,
  // Connection timeout - increased for reliability
  connectTimeoutMS: 15000,
  // Keep connection alive
  heartbeatFrequencyMS: 10000,
  // Direct connection for better reliability
  directConnection: false,
}

let client: MongoClient | undefined
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development, use global to prevent multiple connections during HMR
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log("[MongoDB Adapter] Creating new connection in development mode...")
    client = new MongoClient(uri, options)
    // Connect and handle errors gracefully
    globalWithMongo._mongoClientPromise = (async () => {
      try {
        console.log("[MongoDB Adapter] Connecting to MongoDB...")
        const connectedClient = await client.connect()
        console.log("[MongoDB Adapter] Successfully connected to MongoDB")
        return connectedClient
      } catch (err) {
        console.error("[MongoDB Adapter] Connection failed:", err)
        // Clear the promise on error so it can be retried
        globalWithMongo._mongoClientPromise = undefined
        throw err
      }
    })()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production, create a new client instance
  console.log("[MongoDB Adapter] Creating new connection in production mode...")
  client = new MongoClient(uri, options)
  clientPromise = (async () => {
    try {
      console.log("[MongoDB Adapter] Connecting to MongoDB...")
      const connectedClient = await client.connect()
      console.log("[MongoDB Adapter] Successfully connected to MongoDB")
      return connectedClient
    } catch (err) {
      console.error("[MongoDB Adapter] Connection failed:", err)
      throw err
    }
  })()
}

// CRITICAL: Ensure connection is ready before adapter uses it
// NextAuth adapter will await this promise
export default clientPromise
