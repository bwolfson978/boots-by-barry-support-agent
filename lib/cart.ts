import { createHmac, timingSafeEqual } from "crypto"
import type { CartItem } from "@/lib/types"

const CART_COOKIE = "barry-cart"
const SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-in-production"

function signData(data: string): string {
  const mac = createHmac("sha256", SECRET).update(data).digest("hex")
  return `${Buffer.from(data).toString("base64url")}.${mac}`
}

function verifyData(token: string): string | null {
  const dot = token.lastIndexOf(".")
  if (dot === -1) return null
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  const expected = createHmac("sha256", SECRET).update(Buffer.from(payload, "base64url").toString()).digest("hex")
  try {
    if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null
  } catch {
    return null
  }
  return Buffer.from(payload, "base64url").toString()
}

export function parseCart(cookieStr: string): CartItem[] {
  const match = cookieStr.match(new RegExp(`(?:^|;\\s*)${CART_COOKIE}=([^;]+)`))
  if (!match) return []
  const raw = verifyData(decodeURIComponent(match[1]))
  if (!raw) return []
  try {
    return JSON.parse(raw) as CartItem[]
  } catch {
    return []
  }
}

export function serializeCart(items: CartItem[]): string {
  const data = JSON.stringify(items)
  const token = signData(data)
  return `${CART_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
}

export function clearCartCookie(): string {
  return `${CART_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`
}

export function addItem(cart: CartItem[], item: CartItem): CartItem[] {
  const existing = cart.findIndex(
    (c) => c.productId === item.productId && c.size === item.size
  )
  if (existing >= 0) {
    return cart.map((c, i) => (i === existing ? { ...c, qty: c.qty + item.qty } : c))
  }
  return [...cart, item]
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}
