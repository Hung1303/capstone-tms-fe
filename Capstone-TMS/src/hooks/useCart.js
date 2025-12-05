import { useCallback, useEffect, useMemo, useState } from "react"

const CART_KEY = "cart-items"

const safeParse = (value) => {
  try {
    return JSON.parse(value) || []
  } catch {
    return []
  }
}

const readCart = () => safeParse(localStorage.getItem(CART_KEY))

export const useCart = () => {
  const [cartItems, setCartItems] = useState(() => readCart())

  const syncFromStorage = useCallback(() => {
    setCartItems(readCart())
  }, [])

  const persist = useCallback((items) => {
    setCartItems(items)
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event("cart-updated"))
  }, [])

  const addItem = useCallback((course) => {
    const exists = cartItems.some((item) => item.id === course.id)
    if (exists) return false
    persist([...cartItems, course])
    return true
  }, [cartItems, persist])

  const removeItem = useCallback((id) => {
    const next = cartItems.filter((item) => item.id !== id)
    persist(next)
  }, [cartItems, persist])

  const clearCart = useCallback(() => {
    persist([])
  }, [persist])

  useEffect(() => {
    const handler = () => syncFromStorage()
    window.addEventListener("storage", handler)
    window.addEventListener("cart-updated", handler)
    return () => {
      window.removeEventListener("storage", handler)
      window.removeEventListener("cart-updated", handler)
    }
  }, [syncFromStorage])

  const totalTuition = useMemo(
    () => cartItems.reduce((sum, course) => sum + (course.tuitionFee || 0), 0),
    [cartItems]
  )

  return {
    cartItems,
    addItem,
    removeItem,
    clearCart,
    totalTuition,
  }
}

