import { createHmac, timingSafeEqual } from "crypto"
import type { Session, User } from "@/lib/types"

const COOKIE_NAME = "barry-session"
const SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-in-production"

export const DEMO_USER: User = {
  id: "user-barry",
  name: "Barry",
  email: "barry@example.com",
}

function sign(payload: string): string {
  const mac = createHmac("sha256", SECRET).update(payload).digest("hex")
  return `${Buffer.from(payload).toString("base64url")}.${mac}`
}

function verify(token: string): string | null {
  const dot = token.lastIndexOf(".")
  if (dot === -1) return null
  const payload = token.slice(0, dot)
  const mac = token.slice(dot + 1)
  const expected = createHmac("sha256", SECRET).update(Buffer.from(payload, "base64url").toString()).digest("hex")
  try {
    if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null
  } catch {
    return null
  }
  return Buffer.from(payload, "base64url").toString()
}

export function createSessionCookie(userId: string, name: string): string {
  const payload = JSON.stringify({ userId, name })
  const token = sign(payload)
  const maxAge = 60 * 60 * 24 * 7 // 7 days
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
}

export function getSession(req: Request): Session | null {
  const cookieHeader = req.headers.get("cookie") ?? ""
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  const raw = verify(decodeURIComponent(match[1]))
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function getSessionFromCookieString(cookieStr: string): Session | null {
  const match = cookieStr.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  const raw = verify(decodeURIComponent(match[1]))
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}
