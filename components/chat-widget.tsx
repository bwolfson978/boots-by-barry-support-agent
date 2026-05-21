"use client"

import { useRef, useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"

const TOOL_LABELS: Record<string, string> = {
  getMyOrders: "Looking up your orders",
  getOrderDetails: "Retrieving order details",
  updateShippingAddress: "Updating shipping address",
  searchCatalog: "Searching catalog",
}

export function ChatWidget({ onClose, height = 480 }: { onClose?: () => void; height?: number } = {}) {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || status !== "ready") return
    sendMessage({ text })
    setInput("")
  }

  return (
    <div className="border border-grey-200 bg-paper flex flex-col" style={{ height }}>
      {/* Header */}
      <div className="border-b border-grey-200 px-5 py-3 flex items-center justify-between">
        <span className="label-caps text-ink">Customer Support</span>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${status === "streaming" ? "bg-alpine animate-pulse" : "bg-grey-300"}`} />
          {onClose && (
            <button onClick={onClose} className="text-grey-400 hover:text-ink transition-colors" aria-label="Close">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-grey-400 text-center pt-8 leading-relaxed">
            Ask about your orders, change a shipping address, or find the right boot.
          </p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] ${
                message.role === "user"
                  ? "bg-ink text-paper"
                  : "bg-grey-100 text-ink"
              }`}
            >
              {/* Render parts */}
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <p key={i} className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {part.text}
                    </p>
                  )
                }

                // Tool parts — generic handling for all tool types
                if (part.type.startsWith("tool-")) {
                  const toolName = part.type.replace("tool-", "")
                  const label = TOOL_LABELS[toolName] ?? toolName

                  return (
                    <div key={i} className="px-4 py-2.5 border-t border-grey-200 first:border-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            (part as { state?: string }).state === "output-available"
                              ? "bg-alpine"
                              : "bg-grey-300 animate-pulse"
                          }`}
                        />
                        <span className="label-caps text-grey-400 text-[10px]">{label}</span>
                      </div>

                      {(part as { state?: string; output?: unknown }).state === "output-available" &&
                        (part as { output?: unknown }).output != null && (
                          <ToolOutput
                            toolName={toolName}
                            output={(part as { output: unknown }).output}
                          />
                        )}
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        ))}

        {(status === "submitted" || status === "streaming") && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-grey-100 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-grey-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-grey-300 rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
                <span className="w-1.5 h-1.5 bg-grey-300 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-grey-200 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Barry..."
          disabled={status !== "ready"}
          className="flex-1 px-5 py-3.5 text-sm bg-paper text-ink placeholder:text-grey-300 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || status !== "ready"}
          className="px-5 label-caps text-ink hover:text-grey-600 disabled:text-grey-300 transition-colors border-l border-grey-200"
        >
          Send
        </button>
      </form>
    </div>
  )
}

function ToolOutput({ toolName, output }: { toolName: string; output: unknown }) {
  if (toolName === "getMyOrders" && Array.isArray(output)) {
    return (
      <div className="mt-2 space-y-1">
        {(output as Array<{ id: string; status: string; placedAt: string }>).map((order) => (
          <div key={order.id} className="flex items-center justify-between text-xs">
            <span className="text-ink font-light">{order.id}</span>
            <span className="label-caps text-grey-400 text-[10px]">{order.status}</span>
          </div>
        ))}
      </div>
    )
  }

  if (toolName === "searchCatalog" && Array.isArray(output)) {
    return (
      <div className="mt-2 space-y-1">
        {(output as Array<{ name: string; price: number; flex: number }>).map((p) => (
          <div key={p.name} className="flex items-center justify-between text-xs">
            <span className="text-ink font-light">{p.name}</span>
            <span className="label-caps text-grey-400 text-[10px]">${p.price} · Flex {p.flex}</span>
          </div>
        ))}
      </div>
    )
  }

  if (toolName === "updateShippingAddress" && typeof output === "object" && output !== null) {
    const result = output as { ok?: boolean; error?: string }
    return (
      <p className="mt-1 text-xs text-grey-600">
        {result.ok ? "Address updated successfully." : result.error ?? "Unknown result."}
      </p>
    )
  }

  return null
}
