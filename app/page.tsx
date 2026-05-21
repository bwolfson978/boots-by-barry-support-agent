import { loadCatalog } from "@/lib/catalog"
import { ProductCard } from "@/components/product-card"

export default function CatalogPage() {
  const products = loadCatalog()

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero */}
      <div className="py-20 border-b border-grey-200">
        <p className="label-caps text-grey-400 mb-4">2024–25 Collection</p>
        <h1 className="text-5xl sm:text-6xl font-light text-ink tracking-tight leading-none max-w-xl">
          Engineered<br />for the mountain.
        </h1>
        <p className="mt-6 text-grey-600 max-w-sm leading-relaxed">
          Five categories. Six boots. Each one built around a single idea: no compromises on terrain that demands your best.
        </p>
      </div>

      {/* Grid */}
      <div className="py-16">
        <div className="flex items-center justify-between mb-10">
          <p className="label-caps text-grey-400">{products.length} models</p>
          <p className="label-caps text-grey-400">All terrain</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
