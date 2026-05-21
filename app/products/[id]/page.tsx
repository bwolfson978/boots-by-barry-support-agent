import { notFound } from "next/navigation"
import { getProduct, loadCatalog } from "@/lib/catalog"
import { ProductDetailClient } from "@/components/product-detail"

export function generateStaticParams() {
  return loadCatalog().map((p) => ({ id: p.id }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  return <ProductDetailClient product={product} />
}
