import { cookies } from "next/headers"
import { getSessionFromCookieString } from "@/lib/auth"
import { getOrders } from "@/lib/orders"
import { getProduct } from "@/lib/catalog"
import { redirect } from "next/navigation"

export default async function AccountPage() {
  const cookieStore = await cookies()
  const cookieStr = cookieStore.toString()
  const session = getSessionFromCookieString(cookieStr)

  if (!session) redirect("/")

  const orders = getOrders(session.userId, cookieStr)

  const statusStyles: Record<string, string> = {
    processing: "bg-grey-100 text-grey-600",
    shipped: "bg-ink text-paper",
    delivered: "bg-alpine text-paper",
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="label-caps text-grey-400 mb-2">Account</p>
        <h1 className="text-3xl font-light text-ink tracking-tight">Welcome back, {session.name}.</h1>
      </div>

      {/* Orders */}
      <section className="mb-16">
        <p className="label-caps text-ink mb-6">Order History</p>
        <div className="divide-y divide-grey-200 border-t border-grey-200">
          {orders.map((order) => {
            const mainItem = order.items[0]
            const product = mainItem ? getProduct(mainItem.productId) : null
            const itemCount = order.items.reduce((s, i) => s + i.qty, 0)

            return (
              <div key={order.id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-ink font-light">{order.id}</p>
                      <span
                        className={`label-caps px-2 py-0.5 text-[10px] ${statusStyles[order.status] ?? "bg-grey-100 text-grey-600"}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-grey-400">
                      {itemCount} item{itemCount > 1 ? "s" : ""}{product ? ` · ${product.name}${order.items.length > 1 ? " + more" : ""}` : ""}
                    </p>
                    <p className="text-sm text-grey-400 mt-1">
                      {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-ink font-light">
                      ${order.items.reduce((s, i) => s + i.price * i.qty, 0)}
                    </p>
                    <p className="label-caps text-grey-400 mt-1">
                      {new Date(order.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
