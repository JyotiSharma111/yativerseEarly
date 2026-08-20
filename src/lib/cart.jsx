/**
 * Client-side cart. There is no cart/line-items concept in yati-api today —
 * the Orders table stores one flat row per order (see
 * yati-api-table-storage-reference.md). So the cart here is purely a
 * frontend convenience: at checkout, each distinct line item becomes its
 * own createOrder() call against the real, unmodified /api/orders endpoint.
 * Mixed variants in one cart (e.g. 2x Gold size 9 + 1x Black size 7) become
 * two linked order rows under the same email, not one order with two items.
 *
 * Persisted to localStorage so the cart survives a page reload, same
 * pattern as the session token in api.js.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CART_KEY = 'yati_cart'

const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function lineId({ sku, colorName, size }) {
  return `${sku}::${colorName}::${size}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, { colorName, colorHex, size, qty = 1, image }) => {
    const id = lineId({ sku: product.sku, colorName, size })
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i))
      }
      return [
        ...prev,
        {
          id,
          sku: product.sku,
          name: product.name,
          unitPriceCents: product.unitPriceCents,
          colorName,
          colorHex,
          size,
          qty,
          image,
        },
      ]
    })
    setIsOpen(true)
  }

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const setQty = (id, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)),
    )

  const removeItems = (ids) => setItems((prev) => prev.filter((i) => !ids.includes(i.id)))

  const clear = () => setItems([])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
  const subtotalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPriceCents * i.qty, 0),
    [items],
  )

  const value = {
    items,
    isOpen,
    count,
    subtotalCents,
    addItem,
    removeItem,
    setQty,
    removeItems,
    clear,
    openCart,
    closeCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
