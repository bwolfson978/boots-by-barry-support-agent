import { NextResponse } from "next/server"
import { createSessionCookie, clearSessionCookie, DEMO_USER } from "@/lib/auth"

export async function POST(req: Request) {
  const body = await req.json()

  if (body.action === "sign-in") {
    const cookie = createSessionCookie(DEMO_USER.id, DEMO_USER.name)
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie,
      },
    })
  }

  if (body.action === "sign-out") {
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearSessionCookie(),
      },
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
