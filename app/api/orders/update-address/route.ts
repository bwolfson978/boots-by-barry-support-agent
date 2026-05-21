import { getSession } from "@/lib/auth"
import { buildAddressUpdate, parseMutations, serializeMutations, MUTATIONS_COOKIE } from "@/lib/orders"
import { setAddressMutation } from "@/lib/session-store"
import type { ShippingAddress } from "@/lib/types"

export async function POST(req: Request) {
  const session = getSession(req)
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const cookieStr = req.headers.get("cookie") ?? ""
  const { orderId, newAddress }: { orderId: string; newAddress: ShippingAddress } = await req.json()

  const result = buildAddressUpdate(orderId, session.userId, newAddress, cookieStr)
  if ("error" in result) {
    return Response.json({ ok: false, error: result.error }, { status: 400 })
  }

  // Also keep the in-memory store current for same-process reads
  setAddressMutation(session.userId, orderId, newAddress)

  // Build the updated mutations object and serialize to a signed cookie
  const existing = parseMutations(cookieStr)
  const updated = {
    ...existing,
    [orderId]: { ...(existing[orderId] ?? {}), shippingAddress: newAddress },
  }
  const cookieHeader = serializeMutations(updated)

  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookieHeader } })
}
