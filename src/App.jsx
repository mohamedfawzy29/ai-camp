import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'student', label: 'طالب', icon: '🎓' },
  { value: 'graduate', label: 'خريج', icon: '📜' },
  { value: 'employee', label: 'موظف', icon: '💼' },
]

const USE_CASES = [
  'الدراسة والمذاكرة',
  'الشغل وزيادة الإنتاجية',
  'البرمجة',
  'صناعة المحتوى',
  'التسويق والسوشيال ميديا',
  'تحليل البيانات',
  'التصميم والصور',
  'أخرى',
]

const LEVELS = [
  { value: 'beginner', label: 'مبتدئ', hint: 'لسه بادئ أو مجربتهاش قبل كده' },
  { value: 'intermediate', label: 'متوسط', hint: 'بستخدم ChatGPT وأدوات شبهه بشكل عادي' },
  { value: 'advanced', label: 'متقدم', hint: 'بستخدم أدوات كتير وبعمل Prompts متقدمة' },
]

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  status: '',
  qualification: '',
  track: '',
  useCases: [],
  otherUseCase: '',
  level: '',
  _hp: '',
}

// Optional: set VITE_SUBMIT_URL in .env (e.g. a Google Apps Script / Formspree endpoint)
const SUBMIT_URL = import.meta.env.VITE_SUBMIT_URL || '/api/register'

function validate(data) {
  const errors = {}
  if (data.name.trim().length < 3) errors.name = 'من فضلك اكتب اسمك بالكامل'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'الإيميل مش صحيح'
  const phone = data.phone.replace(/[\s-]/g, '')
  if (!/^(\+?20|0020)?0?1[0125]\d{8}$/.test(phone)) errors.phone = 'اكتب رقم موبايل مصري صحيح (11 رقم)'
  if (!data.status) errors.status = 'اختار حالتك الدراسية'
  if (!data.qualification.trim()) errors.qualification = 'اكتب مؤهلك الدراسي'
  if (!data.track.trim()) errors.track = 'اكتب تخصصك أو اسم الـ Track'
  if (data.useCases.length === 0) errors.useCases = 'اختار حاجة واحدة على الأقل'
  if (data.useCases.includes('أخرى') && !data.otherUseCase.trim()) errors.otherUseCase = 'وضّح بتحب تستخدم الـ AI في إيه'
  if (!data.level) errors.level = 'اختار مستواك'
  return errors
}

function Field({ label, required, error, children, htmlFor }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-bold text-navy">
        {label}
        {required && <span className="ms-1 text-gold">*</span>}
      </label>
      {children}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  )
}

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-navy placeholder:text-muted/70 outline-none transition focus:border-brand focus:ring-4 focus:ring-sky/60 ${
    hasError ? 'border-red-400' : 'border-sky'
  }`

export default function App() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle') // idle | sending | done | error

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const toggleUseCase = (value) =>
    set(
      'useCases',
      form.useCases.includes(value) ? form.useCases.filter((v) => v !== value) : [...form.useCases, value],
    )

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Honeypot spam check: if filled by a bot, silently pretend success
    if (form._hp) {
      setState('done')
      return
    }

    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.querySelector(`[data-field="${Object.keys(found)[0]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const payload = {
      ...form,
      useCases: form.useCases.map((u) => (u === 'أخرى' ? `أخرى: ${form.otherUseCase}` : u)).join('، '),
      submittedAt: new Date().toISOString(),
    }
    delete payload.otherUseCase
    delete payload._hp

    setState('sending')
    try {
      if (SUBMIT_URL) {
        const res = await fetch(SUBMIT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        })
        if (!res.ok && res.status !== 0) {
          throw new Error(`Server returned ${res.status}`)
        }
      } else {
        console.log('Form submission:', payload)
        await new Promise((r) => setTimeout(r, 800))
      }
      setState('done')
    } catch (err) {
      console.error('Submission error:', err)
      setState('error')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden bg-navy pb-40 pt-8 text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-10 flex items-center justify-between">
            <div className="overflow-hidden rounded-2xl bg-white p-1 shadow-lg shadow-black/20">
              <img src="/eraasoft-logo.png" alt="EraaSoft" className="h-20 w-20 sm:h-24 sm:w-24" />
            </div>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-sm font-semibold text-gold">
              التسجيل مفتوح الآن
            </span>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            فورم التسجيل في <span dir="ltr" className="text-gold">AI Bootcamp</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-sky sm:text-lg">
            طوّر مهاراتك في الـ AI واتعلم إزاي تستخدم الذكاء الاصطناعي في الدراسة أو الشغل أو مجالك المهني.
            <br />
            سجّل بياناتك وهنتواصل معاك بتفاصيل الـ AI Bootcamp.
          </p>
        </div>
      </header>

      <main className="relative -mt-28 px-4 pb-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl shadow-navy/10 ring-1 ring-sky/60 sm:p-10">
          {state === 'done' ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-4xl text-white">
                ✓
              </div>
              <h2 className="text-2xl font-extrabold">تم التسجيل بنجاح 🎉</h2>
              <p className="mt-3 text-muted">
                شكرًا يا {form.name.split(' ')[0]}! هنتواصل معاك قريب على الواتساب بكل تفاصيل الـ Bootcamp.
              </p>
              <button
                onClick={() => {
                  setForm(INITIAL)
                  setState('idle')
                }}
                className="mt-8 rounded-xl border border-brand px-6 py-3 font-bold text-brand transition hover:bg-brand hover:text-white"
              >
                تسجيل شخص تاني
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-7">
              {/* Honeypot field for spam bots */}
              <div className="sr-only" aria-hidden="true">
                <input
                  type="text"
                  name="_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form._hp}
                  onChange={(e) => set('_hp', e.target.value)}
                />
              </div>

              <SectionTitle step="1" title="بياناتك الشخصية" />

              <div data-field="name">
                <Field label="الاسم" required error={errors.name} htmlFor="name">
                  <input
                    id="name"
                    name="name"
                    autoComplete="name"
                    className={inputClass(errors.name)}
                    placeholder="الاسم بالكامل"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                <div data-field="email">
                  <Field label="الإيميل" required error={errors.email} htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      dir="ltr"
                      className={`${inputClass(errors.email)} text-right`}
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                    />
                  </Field>
                </div>
                <div data-field="phone">
                  <Field label="رقم الموبايل (عليه واتساب)" required error={errors.phone} htmlFor="phone">
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        dir="ltr"
                        className={`${inputClass(errors.phone)} pl-11 text-right`}
                        placeholder="01xxxxxxxxx"
                        value={form.phone}
                        onChange={(e) => set('phone', e.target.value)}
                      />
                      <WhatsAppIcon />
                    </div>
                  </Field>
                </div>
              </div>

              <SectionTitle step="2" title="الدراسة والتخصص" />

              <div data-field="status">
                <Field label="الحالة الدراسية" required error={errors.status}>
                  <div className="grid grid-cols-3 gap-3">
                    {STATUS_OPTIONS.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        name="status"
                        checked={form.status === opt.value}
                        onChange={() => set('status', opt.value)}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="font-bold">{opt.label}</span>
                      </OptionCard>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                <div data-field="qualification">
                  <Field label="مؤهلك الدراسي" required error={errors.qualification} htmlFor="qualification">
                    <input
                      id="qualification"
                      name="qualification"
                      className={inputClass(errors.qualification)}
                      placeholder="مثال: بكالوريوس تجارة"
                      value={form.qualification}
                      onChange={(e) => set('qualification', e.target.value)}
                    />
                  </Field>
                </div>
                <div data-field="track">
                  <Field label="التخصص / اسم الـ Track" required error={errors.track} htmlFor="track">
                    <input
                      id="track"
                      name="track"
                      className={inputClass(errors.track)}
                      placeholder="مثال: Front-End، محاسبة، Marketing"
                      value={form.track}
                      onChange={(e) => set('track', e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <SectionTitle step="3" title="إنت والـ AI" />

              <div data-field="useCases">
                <Field label="إيه أكتر حاجة حابب تستخدم الـ AI فيها؟" required error={errors.useCases}>
                  <p className="-mt-1 text-xs text-muted">ممكن تختار أكتر من اختيار</p>
                  <div className="flex flex-wrap gap-2">
                    {USE_CASES.map((u) => {
                      const active = form.useCases.includes(u)
                      return (
                        <button
                          type="button"
                          key={u}
                          onClick={() => toggleUseCase(u)}
                          aria-pressed={active}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            active
                              ? 'border-brand bg-brand text-white shadow-md shadow-brand/30'
                              : 'border-sky bg-white text-navy hover:border-brand hover:text-brand'
                          }`}
                        >
                          {active && '✓ '}
                          {u}
                        </button>
                      )
                    })}
                  </div>
                </Field>
                {form.useCases.includes('أخرى') && (
                  <div data-field="otherUseCase" className="mt-3">
                    <input
                      className={inputClass(errors.otherUseCase)}
                      placeholder="وضّح بتحب تستخدمه في إيه..."
                      value={form.otherUseCase}
                      onChange={(e) => set('otherUseCase', e.target.value)}
                    />
                    {errors.otherUseCase && (
                      <p className="mt-2 text-sm font-medium text-red-600">{errors.otherUseCase}</p>
                    )}
                  </div>
                )}
              </div>

              <div data-field="level">
                <Field label="مستواك في استخدام الـ AI Tools" required error={errors.level}>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {LEVELS.map((lvl, i) => (
                      <OptionCard
                        key={lvl.value}
                        name="level"
                        checked={form.level === lvl.value}
                        onChange={() => set('level', lvl.value)}
                        align="start"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{lvl.label}</span>
                          <span className="flex gap-0.5">
                            {[0, 1, 2].map((b) => (
                              <span
                                key={b}
                                className={`h-3 w-1.5 rounded-full ${b <= i ? 'bg-gold' : 'bg-sky'}`}
                              />
                            ))}
                          </span>
                        </div>
                        <span className="text-xs leading-5 text-muted">{lvl.hint}</span>
                      </OptionCard>
                    ))}
                  </div>
                </Field>
              </div>

              {state === 'error' && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">
                  <p>حصلت مشكلة أثناء إرسال البيانات. من فضلك تأكد من الاتصال وجرّب تاني.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={state === 'sending'}
                className="w-full rounded-xl bg-brand py-4 text-lg font-extrabold text-white shadow-lg shadow-brand/30 transition hover:bg-navy disabled:cursor-wait disabled:opacity-70"
              >
                {state === 'sending' ? 'جاري الإرسال...' : 'سجّل دلوقتي'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted">© {new Date().getFullYear()} EraaSoft</p>
      </main>
    </div>
  )
}

function SectionTitle({ step, title }) {
  return (
    <div className="flex items-center gap-3 border-b border-sky/60 pb-3 pt-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-sm font-extrabold text-navy">
        {step}
      </span>
      <h2 className="text-lg font-extrabold text-navy">{title}</h2>
    </div>
  )
}

function OptionCard({ name, checked, onChange, children, align = 'center' }) {
  return (
    <label
      className={`flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-4 transition ${
        align === 'center' ? 'items-center text-center' : 'items-start'
      } ${checked ? 'border-brand bg-sky/30 text-brand' : 'border-sky/70 bg-white hover:border-brand/60'}`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-[#25D366]"
      aria-hidden="true"
    >
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zm8.4-18.2C18.2 1.3 15.2 0 12 0 5.5 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4z" />
    </svg>
  )
}
