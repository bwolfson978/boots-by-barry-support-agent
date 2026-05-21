"use client"

import Link from "next/link"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      {/* Image container — aspect ratio enforced, full-bleed */}
      <div className="relative aspect-[3/4] bg-grey-100 overflow-hidden">
        {/* Using <img> directly for SVG compatibility */}
        <img
          src={product.images[0] ?? "/images/placeholder.svg"}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {!product.inStock && (
          <div className="absolute top-3 left-3">
            <span className="label-caps bg-paper text-grey-600 px-2 py-1">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="pt-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-caps text-grey-400 mb-1">{product.category.replace(/-/g, " ")}</p>
            <h3 className="text-base font-light text-ink tracking-tight group-hover:opacity-70 transition-opacity">
              {product.name}
            </h3>
          </div>
          <p className="text-sm font-light text-grey-600 shrink-0">${product.price}</p>
        </div>
        <p className="mt-2 text-sm text-grey-400 leading-relaxed line-clamp-2">
          {product.shortDescription}
        </p>
      </div>
    </Link>
  )
}
