"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CartItem, Product } from "@/lib/types"

interface EnrichedCartItem extends CartItem {
  product: Product | null
}

interface CartViewProps {
  items: EnrichedCartItem[]
  total: number
}

export function CartView({ items, total }: CartViewProps) {
  const router = useRouter()

  async function handleRemoveAll() {
    await fetch("/api/cart", { method: "DELETE" })
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-grey-400 mb-6">Your bag is empty.</p>
        <Link href="/" className="label-caps text-ink border-b border-ink pb-0.5">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Line items */}
      <div className="space-y-0 divide-y divide-grey-200">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="py-6 flex items-start gap-6">
            <div className="flex-1">
              <p className="text-ink font-light">{item.product?.name ?? item.productId}</p>
              <p className="label-caps text-grey-400 mt-1">
                Size {item.size} &middot; Qty {item.qty}
              </p>
            </div>
            <p className="text-ink font-light">${item.price * item.qty}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-grey-200 pt-6 mt-4 space-y-3">
        <div className="flex justify-between">
          <span className="label-caps text-grey-400">Subtotal</span>
          <span className="text-ink font-light">${total}</span>
        </div>
        <div className="flex justify-between">
          <span className="label-caps text-grey-400">Shipping</span>
          <span className="label-caps text-grey-400">Calculated at checkout</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-3">
        <Link
          href="/checkout"
          className="block w-full py-4 label-caps bg-ink text-paper text-center hover:bg-grey-800 transition-colors"
        >
          Proceed to Checkout
        </Link>
        <button
          onClick={handleRemoveAll}
          className="block w-full py-3 label-caps text-grey-400 hover:text-ink transition-colors text-center"
        >
          Clear Bag
        </button>
      </div>
    </div>
  )
}
