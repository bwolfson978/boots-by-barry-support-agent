/**
 * In-memory mutation store. Persists for the lifetime of the server process —
 * i.e., within a session. Fine for a demo without a real database.
 *
 * Pinned to globalThis so it survives Next.js module re-evaluation across
 * different route contexts in the same process.
 */

import type { ShippingAddress } from "@/lib/types"

interface AddressMutation {
  orderId: string
  newAddress: ShippingAddress
}

declare global {
  // eslint-disable-next-line no-var
  var __addressMutations: Map<string, AddressMutation[]> | undefined
}

// Reuse the existing Map if it exists on globalThis (survives hot reloads)
const store: Map<string, AddressMutation[]> =
  globalThis.__addressMutations ?? (globalThis.__addressMutations = new Map())

export function getAddressMutations(userId: string): AddressMutation[] {
  return store.get(userId) ?? []
}

export function setAddressMutation(
  userId: string,
  orderId: string,
  newAddress: ShippingAddress
): void {
  const existing = store.get(userId) ?? []
  const filtered = existing.filter((m) => m.orderId !== orderId)
  store.set(userId, [...filtered, { orderId, newAddress }])
}
