import type { Metadata } from "next"
import { DM_Sans, Barlow_Condensed } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/nav"
import { FloatingChat } from "@/components/floating-chat"
import { cookies } from "next/headers"
import { getSessionFromCookieString } from "@/lib/auth"
import { parseCart } from "@/lib/cart"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow-condensed",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Boots by Barry",
  description: "Precision ski boots for demanding terrain.",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const cookieStr = cookieStore.toString()
  const session = getSessionFromCookieString(cookieStr)
  const cart = parseCart(cookieStr)

  return (
    <html lang="en" className={`${dmSans.variable} ${barlowCondensed.variable}`}>
      <body>
        <Nav session={session} cartCount={cart.length} />
        <main className="min-h-screen">{children}</main>
        <FloatingChat isSignedIn={!!session} />
        <footer className="border-t border-grey-200 mt-24">
          <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
            <span className="label-caps text-grey-400">© {new Date().getFullYear()} Boots by Barry</span>
            <span className="label-caps text-grey-400">Precision. Performance. Terrain.</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
