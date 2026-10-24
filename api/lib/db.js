import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME || 'ai_camp'

if (!uri) {
  console.warn('[WARN] MONGODB_URI is not set in environment variables!')
}

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    connectTimeoutMS: 10000,
  })

  await client.connect()
  const db = client.db(dbName)

  // Ensure unique index on email
  try {
    await db.collection('registrations').createIndex({ email: 1 }, { unique: true })
  } catch {
    // Index already exists
  }

  cachedClient = client
  cachedDb = db

  return { client, db }
}
