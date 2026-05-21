import { NextResponse } from "next/server"
import { parseCart, serializeCart, clearCartCookie, addItem } from "@/lib/cart"
import { getProduct } from "@/lib/catalog"
import type { CartItem } from "@/lib/types"

export async function GET(req: Request) {
  const cookieStr = req.headers.get("cookie") ?? ""
  const cart = parseCart(cookieStr)
  return NextResponse.json(cart)
}

export async function POST(req: Request) {
  const cookieStr = req.headers.get("cookie") ?? ""
  const body = await req.json()
  const { productId, size } = body as { productId: string; size: number }

  const product = getProduct(productId)
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
  if (!product.inStock) return NextResponse.json({ error: "Out of stock" }, { status: 400 })
  if (!product.sizes.includes(size)) return NextResponse.json({ error: "Size unavailable" }, { status: 400 })

  const item: CartItem = { productId, size, qty: 1, price: product.price }
  const cart = parseCart(cookieStr)
  const updated = addItem(cart, item)

  return new NextResponse(JSON.stringify({ ok: true, count: updated.length }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": serializeCart(updated),
    },
  })
}

export async function DELETE(req: Request) {
  return new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearCartCookie(),
    },
  })
}
