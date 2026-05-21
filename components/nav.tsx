"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Session } from "@/lib/types"

interface NavProps {
  session: Session | null
  cartCount: number
}

export function Nav({ session, cartCount }: NavProps) {
  const router = useRouter()

  async function handleAuth() {
    if (session) {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign-out" }),
      })
    } else {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign-in" }),
      })
    }
    router.refresh()
  }

  return (
    <header className="border-b border-grey-200 bg-paper sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="label-caps text-ink tracking-[0.22em] hover:opacity-70 transition-opacity">
          Boots by Barry
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-8">
          <Link href="/" className="label-caps text-grey-600 hover:text-ink transition-colors">
            Shop
          </Link>
          {session && (
            <Link href="/account" className="label-caps text-grey-600 hover:text-ink transition-colors">
              Account
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          <Link href="/cart" className="label-caps text-grey-600 hover:text-ink transition-colors flex items-center gap-1.5">
            Cart
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-ink text-paper text-[10px] font-medium">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={handleAuth}
            className="label-caps text-grey-600 hover:text-ink transition-colors"
          >
            {session ? `Sign Out` : "Sign In as Barry"}
          </button>
        </div>
      </div>
    </header>
  )
}
