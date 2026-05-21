export interface ProductSpecs {
  flex: number
  lastWidthMm: number
  weightGrams: number
  abilityLevel: "beginner" | "intermediate" | "advanced" | "expert"
  terrain: string
}

export interface Product {
  id: string
  name: string
  price: number
  currency: string
  category: string
  shortDescription: string
  description: string
  specs: ProductSpecs
  materials: string[]
  sizes: number[]
  tags: string[]
  images: string[]
  inStock: boolean
}

export interface CartItem {
  productId: string
  size: number
  qty: number
  price: number
}

export interface ShippingAddress {
  name: string
  line1: string
  city: string
  state: string
  zip: string
  country: string
}

export interface OrderItem {
  productId: string
  size: number
  qty: number
  price: number
}

export type OrderStatus = "processing" | "shipped" | "delivered"

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  shippingAddress: ShippingAddress
  placedAt: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface Session {
  userId: string
  name: string
}
