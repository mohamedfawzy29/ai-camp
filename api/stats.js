import { connectToDatabase } from './lib/db.js'

export default async function handler(req, res) {
  const adminSecret = process.env.ADMIN_SECRET || 'eraasoft_secret_2026'
  const providedSecret = req.query.secret || req.query.key || req.headers['x-admin-key']

  if (!providedSecret || providedSecret !== adminSecret) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح لك بالوصول (كلمة السر غير صحيحة أو مفقودة)',
    })
  }

  try {
    const { db } = await connectToDatabase()
    const coll = db.collection('registrations')

    const totalCount = await coll.countDocuments()

    const statusCountsRaw = await coll.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()

    const levelCountsRaw = await coll.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]).toArray()

    const byStatus = {}
    statusCountsRaw.forEach(item => {
      if (item._id) byStatus[item._id] = item.count
    })

    const byLevel = {}
    levelCountsRaw.forEach(item => {
      if (item._id) byLevel[item._id] = item.count
    })

    return res.status(200).json({
      success: true,
      data: {
        totalRegistrations: totalCount,
        byStatus,
        byLevel,
        serverTime: new Date().toISOString(),
      }
    })
  } catch (err) {
    console.error('[ERROR] Stats failed:', err)
    return res.status(500).json({ success: false, error: 'تعذر حساب الإحصائيات' })
  }
}
