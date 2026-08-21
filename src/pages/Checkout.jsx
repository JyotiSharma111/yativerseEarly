import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ArrowRight, Check, Lock, ShoppingBag, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import { fadeUp, fadeLeft, fadeRight } from '../lib/motion'
import { createOrder, createPaymentIntent, register, getStoredEmail, getToken } from '../lib/api'
import { getStripe } from '../lib/stripe'
import { useCart } from '../lib/cart'

const GOLD  = '#C9A84C'
const GOLD2 = '#F5D27A'
const BLUE  = '#605CFF'

function centsToStr(cents) {
  return (cents / 100).toFixed(2)
}

const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: GOLD,
    colorBackground: '#14120a',
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255,255,255,0.55)',
    colorDanger: '#FF6B8A',
    fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)' },
    '.Input:focus': { border: `1px solid ${GOLD}80` },
    '.Label': { color: 'rgba(255,255,255,0.55)', fontSize: '12px' },
    '.Tab': { border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.03)' },
    '.Tab--selected': { border: `1px solid ${GOLD}60` },
  },
}

/** The actual card-entry form, mounted once a clientSecret exists. */
function PaymentForm({ totalCents, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError('')
    setSubmitting(true)

    // redirect: 'if_required' keeps the customer on yativerse.ai for the
    // vast majority of cards — Stripe only navigates away for payment
    // methods that have no in-page confirmation path at all, which card
    // payments (the only method this checkout offers) essentially never
    // hit. 3-D Secure challenges, when a card requires one, show as an
    // in-page modal via Stripe.js, not a full-page redirect.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please check your card details and try again.')
      setSubmitting(false)
      return
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess()
      return
    }

    if (paymentIntent && paymentIntent.status === 'processing') {
      setError("Your payment is processing — we'll email you the moment it's confirmed. You can safely close this page.")
      setSubmitting(false)
      return
    }

    setError('Payment did not complete. Please try again.')
    setSubmitting(false)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <PaymentElement />
      {error && (
        <p className="font-body text-sm text-center" style={{ color: '#FF6B8A' }}>{error}</p>
      )}
      <button type="submit" disabled={!stripe || submitting}
        className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: `0 0 30px rgba(201,168,76,0.3)` }}>
        {submitting ? 'Processing…' : `Pay $${centsToStr(totalCents)}`} <Lock className="w-4 h-4" />
      </button>
      <p className="font-body text-[11px] text-white/30 text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3 h-3" /> Payment processed securely by Stripe — your card details never touch yativerse.ai's servers.
      </p>
    </form>
  )
}

export default function Checkout() {
  const { items, subtotalCents, removeItems, clear } = useCart()

  const [phase, setPhase] = useState('shipping') // 'shipping' | 'payment' | 'done'
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    addressLine1: '', addressLine2: '', city: '', state: '', zip: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [placedOrders, setPlacedOrders] = useState(null) // [{ item, orderId, totalCents }]
  const [clientSecret, setClientSecret] = useState(null)

  // Resolved once, client-side: 'loading' | 'ready' | 'unavailable'.
  // getStripe() returns a promise that resolves to null both when
  // VITE_STRIPE_PUBLISHABLE_KEY is missing and when the js.stripe.com
  // script itself fails to load (blocked network, ad/privacy blocker) —
  // either way, tracking this explicitly means the payment step can show
  // one clear "payment isn't available" message instead of hanging in a
  // hidden hang state that <Elements stripe={somePromise}> doesn't surface.
  const [stripeState, setStripeState] = useState('loading')
  const [stripeInstance, setStripeInstance] = useState(null)

  useEffect(() => {
    const promise = getStripe()
    if (!promise) {
      setStripeState('unavailable')
      return
    }
    let cancelled = false
    promise.then((stripe) => {
      if (cancelled) return
      if (stripe) {
        setStripeInstance(stripe)
        setStripeState('ready')
      } else {
        setStripeState('unavailable')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Post-order optional account creation
  const [password, setPassword] = useState('')
  const [accountBusy, setAccountBusy] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [accountDone, setAccountDone] = useState(Boolean(getToken()))

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const startPaymentIntent = async (orders, email) => {
    setError('')
    try {
      const { clientSecret: secret } = await createPaymentIntent({
        email,
        orderIds: orders.map((o) => o.orderId),
      })
      setClientSecret(secret)
    } catch (err) {
      // Orders already exist at this point (they succeeded below) — no
      // need to touch the cart again. Just let the payment phase show the
      // error with a retry button that re-attempts this same call.
      setError(err.message)
    }
  }

  const submitShipping = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const placed = []
    const succeededIds = []
    try {
      for (const item of items) {
        try {
          const result = await createOrder({
            ...form,
            ringColor: item.colorName,
            ringSize: item.size,
            quantity: item.qty,
          })
          placed.push({ item, orderId: result.orderId, totalCents: result.totalCents ?? item.unitPriceCents * item.qty })
          succeededIds.push(item.id)
        } catch (err) {
          if (succeededIds.length) removeItems(succeededIds)
          throw new Error(
            placed.length
              ? `${item.name} (${item.colorName}, size ${item.size}) couldn't be reserved: ${err.message}. The item(s) before it went through — the rest are still in your cart.`
              : err.message,
          )
        }
      }
      // Every cart item became an order — clear the cart and move to payment.
      clear()
      setPlacedOrders(placed)
      setPhase('payment')
      await startPaymentIntent(placed, form.email)
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

  const grandTotalCents = placedOrders ? placedOrders.reduce((sum, r) => sum + r.totalCents, 0) : subtotalCents

  return (
    <>
      <SEO
        title="Checkout — yAtIverse"
        description="Review your Signal Ring order and pay securely with Stripe."
        path="/checkout"
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
                Checkout
              </div>
              <h1 className="font-display font-bold tracking-tight text-white mb-3" style={{ fontSize: 'clamp(2rem,4.5vw,3.2rem)' }}>
                {phase === 'done' ? <>Order <span style={{ color: GOLD }}>confirmed.</span></> : <>Review & <span style={{ color: GOLD }}>pay.</span></>}
              </h1>
              {phase === 'shipping' && (
                <p className="font-body text-white/55 max-w-lg mx-auto">
                  Enter your shipping details, then pay securely on the next step — everything happens right here on yativerse.ai.
                </p>
              )}
            </motion.div>

            {phase === 'done' ? (
              /* ── CONFIRMATION ── */
              <motion.div {...fadeUp(0.1)} className="max-w-md mx-auto rounded-3xl p-8 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}30` }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}40` }}>
                  <Check className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-2">Payment successful.</h2>
                <p className="font-body text-sm text-white/45 mb-4">You're all set — a confirmation email is on its way.</p>

                <div className="text-left space-y-2 mb-4">
                  {placedOrders.map((r) => (
                    <div key={r.orderId} className="rounded-xl px-4 py-3 flex items-center justify-between"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div>
                        <p className="font-body text-xs text-white/70">{r.item.name} — {r.item.colorName}, size {r.item.size} × {r.item.qty}</p>
                        <p className="font-mono text-[11px] text-white/40">Order ID: {r.orderId}</p>
                      </div>
                      <span className="font-display font-semibold text-sm text-white">${centsToStr(r.totalCents)}</span>
                    </div>
                  ))}
                </div>

                <p className="font-body text-sm text-white/55 mb-6">
                  Total charged: <span className="text-white font-semibold">${centsToStr(grandTotalCents)}</span>
                </p>

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
            ) : phase === 'payment' ? (
              /* ── PAYMENT ── */
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <motion.div {...fadeLeft(0.05)} className="lg:col-span-3 space-y-6">
                  <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Payment</p>
                    {error ? (
                      <div className="space-y-4">
                        <p className="font-body text-sm text-center" style={{ color: '#FF6B8A' }}>{error}</p>
                        <button type="button" onClick={() => startPaymentIntent(placedOrders, form.email)}
                          className="w-full py-3 rounded-full font-display font-semibold text-sm text-black transition-all"
                          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                          Retry payment
                        </button>
                        <p className="font-body text-[11px] text-white/30 text-center">
                          Your order (Order ID{placedOrders.length > 1 ? 's' : ''}: {placedOrders.map((o) => o.orderId).join(', ')}) is already saved — retrying here won't create a duplicate.
                        </p>
                      </div>
                    ) : stripeState === 'unavailable' ? (
                      <p className="font-body text-sm text-center" style={{ color: '#FF6B8A' }}>
                        Payment couldn't load (missing Stripe configuration, or a network/browser extension blocked it). Your order is saved — contact support@yativerse.ai to complete payment, or try reloading this page.
                      </p>
                    ) : clientSecret && stripeState === 'ready' ? (
                      <Elements stripe={stripeInstance} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
                        <PaymentForm totalCents={grandTotalCents} onSuccess={() => setPhase('done')} />
                      </Elements>
                    ) : (
                      <p className="font-body text-sm text-white/40 text-center py-6">Preparing secure payment…</p>
                    )}
                  </div>
                </motion.div>

                <motion.div {...fadeRight(0.1)} className="lg:col-span-2 space-y-6">
                  <div className="rounded-3xl p-6 sticky top-24" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Order summary</p>
                    <div className="space-y-3 mb-4">
                      {placedOrders.map((r) => (
                        <div key={r.orderId} className="flex gap-3 items-center">
                          <img src={r.item.image} alt={r.item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-xs text-white/80 truncate">{r.item.name} — {r.item.colorName}</p>
                            <p className="font-body text-[11px] text-white/40">Size {r.item.size} × {r.item.qty}</p>
                          </div>
                          <span className="font-body text-sm text-white/70 flex-shrink-0">${centsToStr(r.totalCents)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px my-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="flex justify-between font-display font-bold text-white text-lg">
                      <span>Total</span>
                      <span>${centsToStr(grandTotalCents)}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : items.length === 0 ? (
              /* ── EMPTY CART ── */
              <motion.div {...fadeUp(0.1)} className="max-w-md mx-auto rounded-3xl p-10 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30` }}>
                  <ShoppingBag className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">Your cart is empty</h2>
                <p className="font-body text-sm text-white/50 mb-6">Add a Signal Ring to your cart before checking out.</p>
                <Link to="/order"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-bold text-sm text-black transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                  Browse Signal Ring <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : (
              /* ── SHIPPING FORM ── */
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <motion.form {...fadeLeft(0.05)} onSubmit={submitShipping} className="lg:col-span-3 space-y-6">
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
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: BLUE }} />
                    <p className="font-body text-xs text-white/55 leading-relaxed">
                      Next step is secure payment, powered by Stripe — right here on yativerse.ai, no redirect. Your card details are never seen by our servers.
                    </p>
                  </div>

                  {error && (
                    <p className="font-body text-sm text-center" style={{ color: '#FF6B8A' }}>{error}</p>
                  )}

                  <button type="submit" disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full font-display font-bold text-sm text-black transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: `0 0 30px rgba(201,168,76,0.3)` }}>
                    {submitting ? 'Preparing payment…' : 'Continue to payment'} <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>

                <motion.div {...fadeRight(0.1)} className="lg:col-span-2 space-y-6">
                  <div className="rounded-3xl p-6 sticky top-24" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="font-mono text-[10px] tracking-widest uppercase text-white/38 mb-4">Order summary</p>
                    <div className="space-y-3 mb-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-xs text-white/80 truncate">{item.name} — {item.colorName}</p>
                            <p className="font-body text-[11px] text-white/40">Size {item.size} × {item.qty}</p>
                          </div>
                          <span className="font-body text-sm text-white/70 flex-shrink-0">${centsToStr(item.unitPriceCents * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px my-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="flex justify-between font-display font-bold text-white text-lg">
                      <span>Total</span>
                      <span>${centsToStr(subtotalCents)}</span>
                    </div>
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
