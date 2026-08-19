import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Truck, RotateCcw, ShieldCheck, Lock } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { fadeUp, fadeLeft, fadeRight } from '../lib/motion'
import { createOrder, register, getStoredEmail, getToken } from '../lib/api'

const GOLD   = '#C9A84C'
const GOLD2  = '#F5D27A'
const BLUE   = '#605CFF'
const PURPLE = '#C86DD7'

const COLORS = [
  { name: 'Titanium Gold', hex: '#C9A84C' },
  { name: 'Cosmic Black',  hex: '#1C1C1E' },
  { name: 'Lunar Silver',  hex: '#C0C0C0' },
]
const SIZES = ['5', '6', '7', '8', '9', '10', '11', '12']
const UNIT_PRICE = 149

const POLICY_FAQS = [
  {
    icon: Truck,
    q: 'Shipping',
    a: 'We ship to US addresses only for now. A free sizing kit ships first so you can confirm your size before the ring itself goes out — this avoids most size-exchange returns. Once your Signal Ring ships, standard delivery runs 3–5 business days via USPS or UPS; expedited options will be offered at checkout when payment goes live.',
  },
  {
    icon: RotateCcw,
    q: 'Returns & exchanges',
    a: '30-day return window from the delivery date, unworn and in original packaging, for a full refund to your original payment method. Size exchanges are free within that window. To start a return, email support@yativerse.ai with your order ID.',
  },
  {
    icon: ShieldCheck,
    q: 'Warranty',
    a: 'Every Signal Ring includes a 1-year limited warranty against manufacturing defects. Accidental damage isn\'t covered, but reach out — we handle these case by case.',
  },
]

function Stepper({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-display font-bold"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>–</button>
      <span className="font-display font-semibold text-white w-6 text-center">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(5, value + 1))}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-display font-bold"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>+</button>
    </div>
  )
}

function PolicyRow({ item, open, onToggle }) {
  const Icon = item.icon
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30` }}>
            <Icon className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
          </span>
          <span className="font-display font-semibold text-sm text-white">{item.q}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="font-body text-sm text-white/58 leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function Order() {
  const [color, setColor] = useState(0)
  const [size, setSize] = useState('9')
  const [qty, setQty] = useState(1)

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    addressLine1: '', addressLine2: '', city: '', state: '', zip: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null) // { orderId, totalCents } once placed

  const [openFaq, setOpenFaq] = useState(0)

  // Post-order optional account creation
  const [password, setPassword] = useState('')
  const [accountBusy, setAccountBusy] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [accountDone, setAccountDone] = useState(Boolean(getToken()))

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await createOrder({
        ...form,
        ringColor: COLORS[color].name,
        ringSize: size,
        quantity: qty,
      })
      setOrder(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const createAccount = async (e) => {
    e.preventDefault()
    setAccountError('')
    setAccountBusy(true)
    try {
      await register(form.email, password)
      setAccountDone(true)
    } catch (err) {
      setAccountError(err.message)
    } finally {
      setAccountBusy(false)
    }
  }

  const total = (UNIT_PRICE * qty).toFixed(2)

  return (
    <>
      <SEO
        title="Order Signal Ring — yAtIverse"
        description="Reserve your yAtIverse Signal Ring. Choose your finish and size, review shipping and returns, and lock in your spot — pay when checkout opens."
        path="/order"
      />
      <div className="bg-brand-bg text-white min-h-screen">
        <Navbar />

        <section className="relative pt-32 pb-24 px-4">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.08), transparent 70%)` }} />

          <div className="relative max-w-5xl mx-auto">
            <motion.div {...fadeUp(0)} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-5"
                style={{ border: `1px solid ${GOLD}40`, color: GOLD, background: `${GOLD}0D` }}>
                Reserve Signal Ring
              </div>
              <h1 className="font-display font-bold tracking-tight text-white mb-3" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>
                Order your <span style={{ color: GOLD }}>Signal Ring.</span>
              </h1>
              <p className="font-body text-white/55 max-w-lg mx-auto">
                Payment isn't open yet — placing an order today reserves your ring and locks your details in. We'll email you the moment checkout goes live.
              </p>
            </motion.div>

            {order ? (
              /* ── CONFIRMATION ── */
              <motion.div {...fadeUp(0.1)} className="max-w-md mx-auto rounded-3xl p-8 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}30` }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}40` }}>
                  <Check className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-2">You're reserved.</h2>
                <p className="font-body text-sm text-white/55 mb-1">Order ID: <span className="font-mono text-white/80">{order.orderId}</span></p>
                <p className="font-body text-sm text-white/55 mb-6">Total due at checkout: <span className="text-white font-semibold">${(order.totalCents / 100).toFixed(2)}</span></p>

                {accountDone ? (
                  <div className="rounded-2xl px-4 py-3 text-sm font-body" style={{ background: `${BLUE}12`, border: `1px solid ${BLUE}30`, color: '#fff' }}>
                    You're signed in as {getStoredEmail() || form.email}. Use the same email and password to log into the yAtI app once your ring arrives.
                  </div>
                ) : (
                  <form onSubmit={createAccount} className="text-left space-y-3">
                    <p className="font-body text-xs text-white/45 mb-1">
                      Want to track this order and use the same login in the yAtI app later? Set a password now — totally optional.
                    </p>
                    <input type="password" placeholder="Create a password (min. 8 characters)" value={password}
                      onChange={(e) => setPassword(e.target.value)} minLength={8}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                    {accountError && <p className="text-xs font-body" style={{ color: '#FF6B8A' }}>{accountError}</p>}
                    <button type="submit" disabled={accountBusy || password.length < 8}
                      className="w-full py-2.5 rounded-full font-display font-semibold text-xs text-black transition-all disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                      {accountBusy ? 'Creating account…' : 'Create my account'}
                    </button>
                    <p className="font-body text-[11px] text-white/30 text-center">
                      Prefer to skip this? You can create your account anytime in the yAtI app with {form.email || 'this same email'}.
                    </p>
                  </form>
                )}

                <Link to="/" className="inline-flex items-center gap-1.5 mt-6 text-xs font-body text-white/40 hover:text-white/70">
                  Back to yativerse.ai <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            ) : (
              /* ── ORDER FORM ── */
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: config + shipping form */}
                <motion.form {...fadeLeft(0.05)} onSubmit={submit} className="lg:col-span-3 space-y-6">
                  <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Finish</p>
                    <div className="flex gap-3 mb-6">
                      {COLORS.map((c, i) => (
                        <button key={c.name} type="button" onClick={() => setColor(i)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-body transition-all"
                          style={{
                            background: color === i ? `${GOLD}18` : 'rgba(255,255,255,0.04)',
                            border: color === i ? `1px solid ${GOLD}60` : '1px solid rgba(255,255,255,0.10)',
                            color: color === i ? GOLD : 'rgba(255,255,255,0.6)',
                          }}>
                          <span className="w-4 h-4 rounded-full" style={{ background: c.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                          {c.name}
                        </button>
                      ))}
                    </div>

                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Size — not sure? Free sizing kit ships first.</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {SIZES.map((s) => (
                        <button key={s} type="button" onClick={() => setSize(s)}
                          className="w-10 h-10 rounded-xl font-mono text-sm font-semibold transition-all"
                          style={{
                            background: size === s ? `${GOLD}18` : 'rgba(255,255,255,0.05)',
                            border: size === s ? `1px solid ${GOLD}60` : '1px solid rgba(255,255,255,0.10)',
                            color: size === s ? GOLD : '#fff',
                          }}>{s}</button>
                      ))}
                    </div>

                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Quantity</p>
                    <Stepper value={qty} onChange={setQty} />
                  </div>

                  <div className="rounded-3xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/38">Shipping details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input name="name" required placeholder="Full name" value={form.name} onChange={change}
                        className="col-span-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                      <input name="email" type="email" required placeholder="Email" value={form.email} onChange={change}
                        className="col-span-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                      <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={change}
                        className="col-span-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                      <input name="addressLine1" required placeholder="Address line 1" value={form.addressLine1} onChange={change}
                        className="col-span-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                      <input name="addressLine2" placeholder="Address line 2 (optional)" value={form.addressLine2} onChange={change}
                        className="col-span-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                      <input name="city" required placeholder="City" value={form.city} onChange={change}
                        className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                      <input name="state" required placeholder="State" value={form.state} onChange={change}
                        className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                      <input name="zip" required placeholder="ZIP code" value={form.zip} onChange={change}
                        className="col-span-2 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-purple/50 font-body" />
                    </div>
                    <p className="font-body text-[11px] text-white/30">Shipping to US addresses only for now.</p>
                  </div>

                  <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{ background: `${BLUE}0D`, border: `1px solid ${BLUE}25` }}>
                    <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: BLUE }} />
                    <p className="font-body text-xs text-white/55 leading-relaxed">
                      Payment isn't collected today — Stripe checkout is being set up. Submitting reserves your ring with the details above; we'll email you to complete payment once checkout opens.
                    </p>
                  </div>

                  {error && (
                    <p className="font-body text-sm text-center" style={{ color: '#FF6B8A' }}>{error}</p>
                  )}

                  <button type="submit" disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: `0 0 30px rgba(201,168,76,0.3)` }}>
                    {submitting ? 'Reserving…' : 'Reserve My Ring'} <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>

                {/* Right: order summary + policy */}
                <motion.div {...fadeRight(0.1)} className="lg:col-span-2 space-y-6">
                  <div className="rounded-3xl p-6 sticky top-24" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Order summary</p>
                    <div className="flex justify-between font-body text-sm text-white/70 mb-2">
                      <span>Signal Ring — {COLORS[color].name}, size {size} × {qty}</span>
                      <span>${(UNIT_PRICE * qty).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm text-white/40 mb-4">
                      <span>Sizing kit</span>
                      <span>Free</span>
                    </div>
                    <div className="h-px my-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="flex justify-between font-display font-bold text-white text-lg">
                      <span>Total</span>
                      <span>${total}</span>
                    </div>
                    <p className="font-body text-[11px] text-white/30 mt-2">Due at checkout, not today.</p>
                  </div>

                  <div className="space-y-3">
                    {POLICY_FAQS.map((item, i) => (
                      <PolicyRow key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
