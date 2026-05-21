"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ShippingAddress } from "@/lib/types"

interface CheckoutFormProps {
  total: number
}

export function CheckoutForm({ total }: CheckoutFormProps) {
  const router = useRouter()
  const [placing, setPlacing] = useState(false)
  const [form, setForm] = useState<ShippingAddress>({
    name: "",
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  })

  function update(field: keyof ShippingAddress, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPlacing(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress: form }),
      })
      if (res.ok) {
        router.push("/account")
        router.refresh()
      }
    } finally {
      setPlacing(false)
    }
  }

  const fields: Array<{ key: keyof ShippingAddress; label: string; placeholder: string; col?: string }> = [
    { key: "name", label: "Full Name", placeholder: "Barry Wolfson" },
    { key: "line1", label: "Street Address", placeholder: "123 Summit Ridge Rd" },
    { key: "city", label: "City", placeholder: "Aspen", col: "col-span-2 sm:col-span-1" },
    { key: "state", label: "State", placeholder: "CO", col: "col-span-1" },
    { key: "zip", label: "ZIP Code", placeholder: "81611", col: "col-span-1" },
    { key: "country", label: "Country", placeholder: "US", col: "col-span-2 sm:col-span-1" },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-10">
        {fields.map(({ key, label, placeholder, col }) => (
          <div key={key} className={col ?? "col-span-2"}>
            <label className="label-caps text-grey-600 block mb-2">{label}</label>
            <input
              required
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className="w-full border border-grey-200 bg-paper px-4 py-3 text-sm text-ink placeholder:text-grey-300 focus:outline-none focus:border-ink transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="border-t border-grey-200 py-6 mb-8">
        <div className="flex justify-between">
          <span className="label-caps text-grey-400">Total</span>
          <span className="text-ink font-light">${total}</span>
        </div>
        <p className="mt-3 text-xs text-grey-400 leading-relaxed">
          This is a demo checkout. No payment will be charged. Your order will be created with status "processing."
        </p>
      </div>

      <button
        type="submit"
        disabled={placing}
        className="w-full py-4 label-caps bg-ink text-paper hover:bg-grey-800 disabled:bg-grey-200 disabled:text-grey-400 transition-colors"
      >
        {placing ? "Placing Order..." : "Place Order"}
      </button>
    </form>
  )
}
