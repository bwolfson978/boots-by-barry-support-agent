"use client"

import { useState, useRef, useCallback } from "react"
import { ChatWidget } from "./chat-widget"

const MIN_W = 300
const MAX_W = 700
const MIN_H = 360
const MAX_H = 800

export function FloatingChat({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const [size, setSize] = useState({ w: 340, h: 480 })
  const dragRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.w,
      startH: size.h,
    }
  }, [size])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const { startX, startY, startW, startH } = dragRef.current
    // Dragging left → wider; dragging up → taller (panel is anchored bottom-right)
    const newW = Math.min(MAX_W, Math.max(MIN_W, startW - (e.clientX - startX)))
    const newH = Math.min(MAX_H, Math.max(MIN_H, startH - (e.clientY - startY)))
    setSize({ w: newW, h: newH })
  }, [])

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`absolute bottom-16 right-0 shadow-2xl ${open ? "block" : "hidden"}`}
        style={{ width: size.w, height: size.h }}
      >
        {/* Resize handle — top-left corner */}
        <div
          className="absolute top-0 left-0 w-5 h-5 z-10 cursor-nw-resize group"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            className="absolute top-1 left-1 text-grey-300 group-hover:text-grey-400 transition-colors"
            fill="currentColor"
          >
            <circle cx="2" cy="2" r="1.2" />
            <circle cx="6" cy="2" r="1.2" />
            <circle cx="2" cy="6" r="1.2" />
            <circle cx="6" cy="6" r="1.2" />
            <circle cx="2" cy="10" r="1.2" />
            <circle cx="6" cy="10" r="1.2" />
          </svg>
        </div>

        {isSignedIn ? (
          <ChatWidget onClose={() => setOpen(false)} height={size.h} />
        ) : (
          <div className="border border-grey-200 bg-paper flex flex-col h-full">
            <div className="border-b border-grey-200 px-5 py-3 flex items-center justify-between">
              <span className="label-caps text-ink">Customer Support</span>
              <button onClick={() => setOpen(false)} className="text-grey-400 hover:text-ink transition-colors" aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <p className="text-sm text-grey-600 leading-relaxed">
                Sign in to ask about your orders, update a shipping address, or find the right boot.
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-ink text-paper flex items-center justify-center hover:bg-grey-800 transition-colors shadow-lg"
        aria-label={open ? "Close support" : "Get support"}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  )
}
