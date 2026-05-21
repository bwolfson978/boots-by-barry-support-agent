import catalogData from "@/data/catalog.json"
import type { Product } from "@/lib/types"

export function loadCatalog(): Product[] {
  return catalogData as Product[]
}

export function getProduct(id: string): Product | undefined {
  return loadCatalog().find((p) => p.id === id)
}

export function searchCatalog(query: string): Product[] {
  if (!query.trim()) return loadCatalog()

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  const catalog = loadCatalog()

  const scored = catalog.map((product) => {
    const searchable = [
      product.name,
      product.shortDescription,
      product.description,
      product.category,
      product.specs.terrain,
      product.specs.abilityLevel,
      String(product.specs.flex),
      String(product.price),
      ...product.tags,
      ...product.materials,
    ]
      .join(" ")
      .toLowerCase()

    let score = 0
    for (const token of tokens) {
      if (searchable.includes(token)) {
        // Boost tags and name matches
        if (product.tags.some((t) => t.includes(token))) score += 3
        if (product.name.toLowerCase().includes(token)) score += 2
        score += 1
      }
    }
    return { product, score }
  })

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product)
}
