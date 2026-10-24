import { MongoClient } from 'mongodb'

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  const uri = (process.env.MONGODB_URI || '').trim()
  const dbName = (process.env.DB_NAME || 'ai_camp').trim()

  if (!uri) {
    throw new Error('متغير البيئة MONGODB_URI غير موجود أو فارغ في إعدادات Vercel')
  }

  if (cachedClient && cachedDb) {
    try {
      // Quick ping to check if cached connection is still alive
      await cachedDb.command({ ping: 1 })
      return { client: cachedClient, db: cachedDb }
    } catch {
      cachedClient = null
      cachedDb = null
    }
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    connectTimeoutMS: 8000,
    serverSelectionTimeoutMS: 8000,
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
