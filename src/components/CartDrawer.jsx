import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../lib/cart'

const GOLD = '#C9A84C'
const GOLD2 = '#F5D27A'

function centsToStr(cents) {
  return (cents / 100).toFixed(2)
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQty, subtotalCents } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 z-[80] h-full w-full sm:w-[420px] flex flex-col bg-[#0A0900]"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4.5 h-4.5" style={{ color: GOLD }} />
                <h2 className="font-display font-bold text-white text-base">Your cart</h2>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30` }}
                >
                  <ShoppingBag className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <p className="font-body text-sm text-white/50">Your cart is empty.</p>
                <Link
                  to="/order"
                  onClick={closeCart}
                  className="font-display font-semibold text-sm px-5 py-2.5 rounded-full text-black transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
                >
                  Browse Signal Ring
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-2xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-display font-semibold text-sm text-white leading-tight">{item.name}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="text-white/30 hover:text-[#FF6B8A] transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-body text-xs text-white/45 mt-0.5">
                          {item.colorName} · Size {item.size}
                        </p>
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty - 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs text-white w-4 text-center">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(item.id, item.qty + 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-display font-semibold text-sm text-white">
                            ${centsToStr(item.unitPriceCents * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5 border-t border-white/[0.07] space-y-4">
                  <div className="flex justify-between font-body text-sm text-white/60">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">${centsToStr(subtotalCents)}</span>
                  </div>
                  <p className="font-body text-[11px] text-white/30">
                    Secure checkout, powered by Stripe — you'll pay on the next step, right here on yativerse.ai.
                  </p>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-display font-bold text-sm text-black transition-all hover:scale-[1.01]"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}
                  >
                    Proceed to checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
