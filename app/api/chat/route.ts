import { convertToModelMessages, streamText, UIMessage } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { getOrders, getOrder, buildAddressUpdate } from "@/lib/orders"
import { setAddressMutation } from "@/lib/session-store"
import { searchCatalog } from "@/lib/catalog"

export const maxDuration = 30

export async function POST(req: Request) {
  const session = getSession(req)
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const cookieStr = req.headers.get("cookie") ?? ""
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are the customer support agent for Boots by Barry, a luxury ski boot retailer.
You are assisting ${session.name}. You have access to their order history and can help with:
- Looking up order status and details
- Updating shipping addresses on orders that haven't shipped yet (status: processing)
- Answering product questions by searching the catalog

Important rules:
- Always confirm with the customer before making any changes to their order
- Address changes are ONLY allowed on orders with status "processing" — decline politely if already shipped
- Never act on orders that don't belong to the authenticated customer
- Decline requests outside your scope (refunds, exchanges, technical fit questions beyond catalog data)
- Be concise and professional. This is a premium brand — match the tone.
Current date: ${new Date().toISOString().split("T")[0]}`,
    messages: await convertToModelMessages(messages),
    tools: {
      getMyOrders: {
        description: "Retrieve all orders for the current customer",
        inputSchema: z.object({}),
        execute: async () => {
          return getOrders(session.userId, cookieStr)
        },
      },
      getOrderDetails: {
        description: "Get full details for a specific order by ID",
        inputSchema: z.object({
          orderId: z.string().describe("The order ID, e.g. ORD-2024-001"),
        }),
        execute: async ({ orderId }) => {
          return getOrder(orderId, session.userId, cookieStr)
        },
      },
      updateShippingAddress: {
        description:
          "Update the shipping address on a processing order. Will fail if the order has already shipped.",
        inputSchema: z.object({
          orderId: z.string().describe("The order ID to update"),
          newAddress: z.object({
            name: z.string().describe("Full name for the delivery"),
            line1: z.string().describe("Street address line 1"),
            city: z.string(),
            state: z.string().describe("State or province code, e.g. CO"),
            zip: z.string().describe("Postal/ZIP code"),
            country: z.string().describe("Country code, e.g. US"),
          }),
        }),
        execute: async ({ orderId, newAddress }) => {
          const result = buildAddressUpdate(orderId, session.userId, newAddress, cookieStr)
          if ("error" in result) return { ok: false, error: result.error }
          setAddressMutation(session.userId, orderId, newAddress)
          return { ok: true, orderId, newAddress }
        },
      },
      searchCatalog: {
        description:
          "Search the product catalog by keyword, terrain type, flex rating, ability level, or tags (e.g. 'stiff touring boot under $900', 'beginner warm', 'carbon lightweight')",
        inputSchema: z.object({
          query: z.string().describe("Natural language search query"),
        }),
        execute: async ({ query }) => {
          const results = searchCatalog(query)
          return results.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            flex: p.specs.flex,
            abilityLevel: p.specs.abilityLevel,
            terrain: p.specs.terrain,
            shortDescription: p.shortDescription,
            inStock: p.inStock,
          }))
        },
      },
    },
  })

  return result.toUIMessageStreamResponse()
}
