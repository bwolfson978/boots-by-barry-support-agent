"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types"

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  async function handleAddToCart() {
    if (!selectedSize) return
    setAdding(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, size: selectedSize }),
      })
      if (res.ok) {
        setAdded(true)
        router.refresh()
        setTimeout(() => setAdded(false), 2000)
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[4/5] bg-grey-100">
            <img
              src={product.images[0] ?? "/images/placeholder.svg"}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {product.images[1] && (
            <div className="relative aspect-[4/5] bg-grey-100">
              <img
                src={product.images[1]}
                alt={`${product.name} — alternate view`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:pt-8 lg:sticky lg:top-24 lg:self-start">
          <p className="label-caps text-grey-400 mb-3">{product.category.replace(/-/g, " ")}</p>
          <h1 className="text-3xl sm:text-4xl font-light text-ink tracking-tight leading-tight">
            {product.name}
          </h1>
          <p className="mt-3 text-xl font-light text-grey-600">${product.price} USD</p>

          <div className="rule my-8" />

          {/* Description */}
          <p className="text-sm leading-7 text-grey-600">{product.description}</p>

          <div className="rule my-8" />

          {/* Specs */}
          <div>
            <p className="label-caps text-ink mb-4">Specifications</p>
            <dl className="space-y-2.5">
              {[
                ["Flex Index", product.specs.flex],
                ["Last Width", `${product.specs.lastWidthMm}mm`],
                ["Weight", `${product.specs.weightGrams}g per boot`],
                ["Ability", product.specs.abilityLevel],
                ["Terrain", product.specs.terrain],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between">
                  <dt className="label-caps text-grey-400">{label}</dt>
                  <dd className="text-sm text-ink capitalize">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rule my-8" />

          {/* Materials */}
          <div>
            <p className="label-caps text-ink mb-4">Materials</p>
            <ul className="space-y-1.5">
              {product.materials.map((m) => (
                <li key={m} className="text-sm text-grey-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-grey-400 rounded-full" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="rule my-8" />

          {/* Size selector */}
          {product.inStock ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="label-caps text-ink">Select Size (Mondo)</p>
                  {selectedSize && (
                    <span className="label-caps text-grey-400">{selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 text-xs border transition-colors ${
                        selectedSize === size
                          ? "border-ink bg-ink text-paper"
                          : "border-grey-200 text-grey-600 hover:border-grey-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || adding}
                className="mt-6 w-full py-4 label-caps bg-ink text-paper hover:bg-grey-800 disabled:bg-grey-200 disabled:text-grey-400 transition-colors"
              >
                {added ? "Added to Cart" : adding ? "Adding..." : selectedSize ? "Add to Cart" : "Select a Size"}
              </button>
            </>
          ) : (
            <p className="label-caps text-grey-400 py-4 border border-grey-200 text-center">
              Currently Out of Stock
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
