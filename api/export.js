import { connectToDatabase } from './lib/db.js'

function escapeCSV(val) {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

function translateStatus(val) {
  switch (val) {
    case 'student': return 'طالب'
    case 'graduate': return 'خريج'
    case 'employee': return 'موظف'
    default: return val || ''
  }
}

function translateLevel(val) {
  switch (val) {
    case 'beginner': return 'مبتدئ'
    case 'intermediate': return 'متوسط'
    case 'advanced': return 'متقدم'
    default: return val || ''
  }
}

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
    const leads = await db.collection('registrations')
      .find({})
      .sort({ submittedAt: -1 })
      .toArray()

    const filename = `eraasoft_ai_camp_leads_${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // Write UTF-8 BOM for Microsoft Excel Arabic compatibility
    const BOM = '\uFEFF'

    const headers = [
      'م',
      'الاسم بالكامل',
      'البريد الإلكتروني',
      'رقم الموبايل',
      'الحالة الدراسية',
      'المؤهل الدراسي',
      'التخصص / Track',
      'مجالات استخدام الـ AI',
      'المستوى',
      'تاريخ ووقت التسجيل',
      'عنوان IP',
    ].map(escapeCSV).join(',')

    const rows = leads.map((lead, idx) => {
      const dateStr = lead.submittedAt
        ? new Date(lead.submittedAt).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })
        : ''

      return [
        escapeCSV(idx + 1),
        escapeCSV(lead.name),
        escapeCSV(lead.email),
        escapeCSV(lead.phone),
        escapeCSV(translateStatus(lead.status)),
        escapeCSV(lead.qualification),
        escapeCSV(lead.track),
        escapeCSV(lead.useCases),
        escapeCSV(translateLevel(lead.level)),
        escapeCSV(dateStr),
        escapeCSV(lead.clientIP),
      ].join(',')
    })

    const csvContent = BOM + [headers, ...rows].join('\r\n')
    return res.status(200).send(csvContent)
  } catch (err) {
    console.error('[ERROR] Export failed:', err)
    return res.status(500).json({
      success: false,
      error: 'تعذر تصدير البيانات',
      details: err?.message || String(err),
    })
  }
}
