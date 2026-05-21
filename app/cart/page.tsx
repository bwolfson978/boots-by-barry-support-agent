import { cookies } from "next/headers"
import { parseCart, cartTotal } from "@/lib/cart"
import { getProduct } from "@/lib/catalog"
import { CartView } from "@/components/cart-view"

export default async function CartPage() {
  const cookieStore = await cookies()
  const cookieStr = cookieStore.toString()
  const cartItems = parseCart(cookieStr)

  const enriched = cartItems.map((item) => ({
    ...item,
    product: getProduct(item.productId) ?? null,
  }))

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="label-caps text-grey-400 mb-2">Your Bag</p>
      <h1 className="text-3xl font-light text-ink tracking-tight mb-12">
        {cartItems.length === 0 ? "Empty" : `${cartItems.length} item${cartItems.length > 1 ? "s" : ""}`}
      </h1>
      <CartView items={enriched} total={cartTotal(cartItems)} />
    </div>
  )
}
