import type { Order } from "@/lib/types"

const TWO_DAYS_AGO = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
const TWO_WEEKS_AGO = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

export const SEED_ORDERS: Order[] = [
  {
    id: "ORD-2024-001",
    userId: "user-barry",
    items: [{ productId: "alpine-carbon-130", size: 27, qty: 1, price: 899 }],
    status: "processing",
    shippingAddress: {
      name: "Barry Wolfson",
      line1: "123 Summit Ridge Rd",
      city: "Aspen",
      state: "CO",
      zip: "81611",
      country: "US",
    },
    placedAt: TWO_DAYS_AGO,
  },
  {
    id: "ORD-2024-002",
    userId: "user-barry",
    items: [
      { productId: "freeride-pro-100", size: 27.5, qty: 1, price: 749 },
      { productId: "piste-master-90", size: 27, qty: 1, price: 549 },
    ],
    status: "shipped",
    shippingAddress: {
      name: "Barry Wolfson",
      line1: "123 Summit Ridge Rd",
      city: "Aspen",
      state: "CO",
      zip: "81611",
      country: "US",
    },
    placedAt: TWO_WEEKS_AGO,
  },
]
