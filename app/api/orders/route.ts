import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { parseMutations, serializeMutations } from "@/lib/orders"
import { parseCart, clearCartCookie } from "@/lib/cart"
import type { Order, ShippingAddress } from "@/lib/types"

export async function POST(req: Request) {
  const session = getSession(req)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cookieStr = req.headers.get("cookie") ?? ""
  const cart = parseCart(cookieStr)
  if (cart.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 })

  const body = await req.json()
  const shippingAddress = body.shippingAddress as ShippingAddress

  const orderId = `ORD-${Date.now()}`
  const newOrder: Order = {
    id: orderId,
    userId: session.userId,
    items: cart,
    status: "processing",
    shippingAddress,
    placedAt: new Date().toISOString(),
  }

  // Persist new order as a mutation (appended to seed orders via cookie)
  const mutations = parseMutations(cookieStr)
  const updatedMutations = { ...mutations, [orderId]: newOrder }

  const orderCookie = serializeMutations(updatedMutations)
  const cartCookie = clearCartCookie()

  const response = new NextResponse(JSON.stringify({ ok: true, orderId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
  response.headers.append("Set-Cookie", orderCookie)
  response.headers.append("Set-Cookie", cartCookie)
  return response
}
