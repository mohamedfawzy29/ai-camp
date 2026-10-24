import { connectToDatabase } from './lib/db.js'

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const phoneRegex = /^(\+?20|0020)?0?1[0125]\d{8}$/

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'طريقة الطلب غير مسموح بها، استخدم POST' })
  }

  try {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {
        return res.status(400).json({ success: false, error: 'تنسيق البيانات غير صالح' })
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'البيانات مفقودة' })
    }

    // Server-side validation
    const name = (body.name || '').trim()
    if (name.length < 3) {
      return res.status(400).json({ success: false, error: 'من فضلك اكتب اسمك بالكامل (3 أحرف على الأقل)' })
    }

    const email = (body.email || '').trim().toLowerCase()
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني غير صحيح' })
    }

    const cleanPhone = (body.phone || '').replace(/[\s-]/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'رقم الموبايل غير صحيح (يجب أن يكون رقم مصري مكون من 11 رقم)' })
    }

    const status = (body.status || '').trim()
    if (!status) {
      return res.status(400).json({ success: false, error: 'من فضلك اختر حالتك الدراسية' })
    }

    const qualification = (body.qualification || '').trim()
    if (!qualification) {
      return res.status(400).json({ success: false, error: 'من فضلك اكتب مؤهلك الدراسي' })
    }

    const track = (body.track || '').trim()
    if (!track) {
      return res.status(400).json({ success: false, error: 'من فضلك اكتب تخصصك أو الـ Track' })
    }

    const useCases = (body.useCases || '').trim()
    if (!useCases) {
      return res.status(400).json({ success: false, error: 'من فضلك اختر مجالات استخدام الـ AI' })
    }

    const level = (body.level || '').trim()
    if (!level) {
      return res.status(400).json({ success: false, error: 'من فضلك اختر مستواك في استخدام الـ AI' })
    }

    const clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
    const userAgent = req.headers['user-agent'] || ''

    const doc = {
      name,
      email,
      phone: cleanPhone,
      status,
      qualification,
      track,
      useCases,
      level,
      submittedAt: body.submittedAt ? new Date(body.submittedAt) : new Date(),
      clientIP: clientIP.split(',')[0].trim(),
      userAgent,
    }

    const { db } = await connectToDatabase()
    const result = await db.collection('registrations').insertOne(doc)

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل بياناتك بنجاح في AI Bootcamp!',
      id: result.insertedId,
    })
  } catch (err) {
    // Duplicate email error
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'هذا البريد الإلكتروني مسجل لدينا بالفعل!',
      })
    }

    console.error('[ERROR] Registration failed:', err)
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم أثناء حفظ البيانات، يرجى المحاولة لاحقاً',
    })
  }
}
