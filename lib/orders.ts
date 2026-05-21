import { createHmac, timingSafeEqual } from "crypto"
import { SEED_ORDERS } from "@/data/seed-orders"
import type { Order, ShippingAddress } from "@/lib/types"
import { getAddressMutations } from "@/lib/session-store"

const MUTATIONS_COOKIE = "barry-order-mutations"
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

interface Mutations {
  [orderId: string]: Partial<Order>
}

export function parseMutations(cookieStr: string): Mutations {
  const match = cookieStr.match(new RegExp(`(?:^|;\\s*)${MUTATIONS_COOKIE}=([^;]+)`))
  if (!match) return {}
  const raw = verifyData(decodeURIComponent(match[1]))
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Mutations
  } catch {
    return {}
  }
}

export function serializeMutations(mutations: Mutations): string {
  const data = JSON.stringify(mutations)
  const token = signData(data)
  return `${MUTATIONS_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
}

export function applyMutations(orders: Order[], mutations: Mutations): Order[] {
  return orders.map((order) => {
    const patch = mutations[order.id]
    if (!patch) return order
    return { ...order, ...patch }
  })
}

export function getOrders(userId: string, cookieStr = ""): Order[] {
  const base = SEED_ORDERS.filter((o) => o.userId === userId)
  // Apply cookie-based mutations (legacy path)
  const cookieMutations = parseMutations(cookieStr)
  let orders = applyMutations(base, cookieMutations)
  // Layer in in-memory mutations (written by the chat agent mid-stream)
  const inMemory = getAddressMutations(userId)
  for (const { orderId, newAddress } of inMemory) {
    orders = orders.map((o) =>
      o.id === orderId ? { ...o, shippingAddress: newAddress } : o
    )
  }
  return orders
}

export function getOrder(orderId: string, userId: string, cookieStr = ""): Order | { error: string } {
  const orders = getOrders(userId, cookieStr)
  const order = orders.find((o) => o.id === orderId)
  if (!order) return { error: "Order not found or does not belong to this account." }
  return order
}

export { MUTATIONS_COOKIE }

export function buildAddressUpdate(
  orderId: string,
  userId: string,
  newAddress: ShippingAddress,
  cookieStr = ""
): { token: string } | { error: string } {
  const orders = getOrders(userId, cookieStr)
  const order = orders.find((o) => o.id === orderId)

  if (!order) return { error: "Order not found or does not belong to this account." }
  if (order.status !== "processing") {
    return {
      error: `Cannot update address: order ${orderId} has already been ${order.status}. Address changes are only allowed before shipping.`,
    }
  }

  const existing = parseMutations(cookieStr)
  const updated: Mutations = {
    ...existing,
    [orderId]: { ...(existing[orderId] ?? {}), shippingAddress: newAddress },
  }

  const data = JSON.stringify(updated)
  return { token: signData(data) }
}
