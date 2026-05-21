import { cookies } from "next/headers"
import { parseCart, cartTotal } from "@/lib/cart"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"

export default async function CheckoutPage() {
  const cookieStore = await cookies()
  const cookieStr = cookieStore.toString()
  const cart = parseCart(cookieStr)

  if (cart.length === 0) redirect("/cart")

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="label-caps text-grey-400 mb-2">Checkout</p>
      <h1 className="text-3xl font-light text-ink tracking-tight mb-12">Shipping Details</h1>
      <CheckoutForm total={cartTotal(cart)} />
    </div>
  )
}
