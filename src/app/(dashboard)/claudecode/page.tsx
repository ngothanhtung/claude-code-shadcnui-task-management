"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Loader2, RefreshCcw, Send, Sparkles, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

interface ClaudeMessage {
  role: "user" | "assistant"
  content: string
}

interface ClaudeResponse {
  id: string
  type: string
  role: string
  model: string
  content: Array<{
    type: string
    text?: string
    thinking?: string
  }>
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

const initialMessages: ChatMessage[] = [
  {
    id: "seed-user",
    role: "user",
    text: "Xin chào! Bạn là ai?",
  },
  {
    id: "seed-assistant",
    role: "assistant",
    text: "Xin chào! Tôi là Claude Code, một trợ lý AI được cung cấp qua proxy API. Tôi có thể giúp bạn với nhiều tác vụ như viết code, debug, tạo tài liệu, và trả lời câu hỏi.",
  },
]

const suggestedPrompts = [
  "Viết tiêu đề và mô tả cho BUG: Đăng nhập không thành công, mặc dù USERNAME / PASSWORD đúng",
  "Viết một hàm JavaScript để validate email",
  "Giải thích khác biệt giữa REST API và GraphQL",
]

function getErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error)
  const normalizedMessage = rawMessage.toLowerCase()

  if (
    normalizedMessage.includes("401") ||
    normalizedMessage.includes("unauthorized")
  ) {
    return "API key không hợp lệ hoặc không được cấu hình. Vui lòng kiểm tra biến môi trường."
  }

  if (normalizedMessage.includes("429")) {
    return "Quá nhiều yêu cầu. Vui lòng chờ một chút rồi thử lại."
  }

  if (
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("fetch")
  ) {
    return "Lỗi kết nối. Vui lòng kiểm tra kết nối internet."
  }

  return rawMessage || "Không thể gửi tin nhắn lúc này."
}

function extractTextFromResponse(response: ClaudeResponse): string {
  const textContent = response.content.find((c) => c.type === "text")
  return textContent?.text?.trim() || "Không nhận được phản hồi từ Claude Code."
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <Bot className="size-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[75%]",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
      </div>

      {isUser ? (
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <User className="size-4" />
        </div>
      ) : null}
    </div>
  )
}

export default function ClaudeCodePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isSending])

  const handleReset = () => {
    setMessages(initialMessages)
    setInput("")
    setError(null)
    setIsSending(false)
  }

  const handleSend = async () => {
    const trimmedInput = input.trim()

    if (!trimmedInput || isSending) {
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmedInput,
    }

    setError(null)
    setMessages((currentMessages) => [...currentMessages, userMessage])
    setInput("")
    setIsSending(true)

    try {
      const claudeMessages: ClaudeMessage[] = [
        ...messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: (m.role === "assistant" ? "assistant" : "user") as
              | "user"
              | "assistant",
            content: m.text,
          })),
        {
          role: "user" as "user",
          content: trimmedInput,
        },
      ]

      const apiKey =
        process.env.NEXT_PUBLIC_CLAUDE_API_KEY || process.env.CLAUDE_API_KEY
      if (!apiKey) {
        throw new Error(
          "API key không được cấu hình. Vui lòng thêm NEXT_PUBLIC_CLAUDE_API_KEY hoặc CLAUDE_API_KEY vào .env.local"
        )
      }

      const response = await fetch("https://api.nkq.vn/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          messages: claudeMessages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = (await response.json()) as ClaudeResponse
      const responseText = extractTextFromResponse(data)

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: responseText,
        },
      ])
    } catch (sendError) {
      setError(getErrorMessage(sendError))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-6 md:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%),linear-gradient(to_bottom,rgba(2,6,23,0.02),transparent_35%)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary size-5" />
              <span className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
                Claude Code Proxy
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Claude Code Chat
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                Chat với Claude Code thông qua proxy API. Gửi các yêu cầu và
                nhận phản hồi từ Claude Sonnet 4.6.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-background/80 border text-muted-foreground rounded-full px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
              Model: claude-sonnet-4-6
            </div>
            <div className="bg-background/80 border text-muted-foreground rounded-full px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
              Proxy: api.nkq.vn
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RefreshCcw className="size-4" />
              Reset chat
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="border-border/60 bg-background/85 h-fit shadow-lg backdrop-blur">
            <CardHeader>
              <CardTitle>Hướng dẫn nhanh</CardTitle>
              <CardDescription>
                Dùng các prompt mẫu bên dưới để thử luồng chat hoặc nhập yêu cầu
                riêng của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="secondary"
                    className="h-auto w-full justify-start whitespace-normal p-3 text-left"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>

              <div className="bg-muted/60 text-muted-foreground rounded-2xl border p-4 text-sm leading-6">
                <p className="font-medium text-foreground">
                  Cấu hình cần thiết
                </p>
                <p className="mt-2">
                  Thêm biến môi trường `NEXT_PUBLIC_CLAUDE_API_KEY` hoặc
                  `CLAUDE_API_KEY` vào `.env.local` để kết nối với proxy API.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85 flex min-h-[72vh] flex-col shadow-lg backdrop-blur">
            <CardHeader className="space-y-3 border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Conversation</CardTitle>
                  <CardDescription>
                    Nhập tin nhắn mới bên dưới. Enter để gửi, Shift + Enter để
                    xuống dòng.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      isSending ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                  {isSending ? "Đang trả lời" : "Sẵn sàng"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
              <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}

                  {isSending ? (
                    <div className="flex justify-start gap-3">
                      <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                        <Bot className="size-4" />
                      </div>
                      <div className="bg-muted text-muted-foreground flex items-center gap-2 rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                        <Loader2 className="size-4 animate-spin" />
                        Claude Code đang suy nghĩ...
                      </div>
                    </div>
                  ) : null}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              <Separator />

              <div className="space-y-3 px-4 pb-4 md:px-6 md:pb-6">
                {error ? (
                  <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
                    {error}
                  </div>
                ) : null}

                <div className="rounded-3xl border bg-background p-3 shadow-sm">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        void handleSend()
                      }
                    }}
                    placeholder="Nhập yêu cầu cho Claude Code..."
                    className="min-h-28 resize-none border-0 bg-transparent px-1 py-2 shadow-none focus-visible:ring-0"
                  />

                  <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                    <p className="text-muted-foreground text-xs">
                      Dựa trên Claude Sonnet 4.6 từ proxy API.
                    </p>
                    <Button
                      onClick={() => void handleSend()}
                      disabled={!input.trim() || isSending}
                      className="gap-2"
                    >
                      {isSending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      Gửi
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
