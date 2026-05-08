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
import { model } from "@/lib/firebase/client"
import { cn } from "@/lib/utils"

type ChatRole = "user" | "model"

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
}

type ChatSession = ReturnType<typeof model.startChat>

const initialMessages: ChatMessage[] = [
  {
    id: "seed-user",
    role: "user",
    text: "Hello, I have 2 dogs in my house.",
  },
  {
    id: "seed-model",
    role: "model",
    text: "Great to meet you. What would you like to know?",
  },
]

const suggestedPrompts = [
  "Tóm tắt cách hoạt động của startChat trong Firebase AI.",
  "Viết giúp tôi một prompt để tạo chatbot hỗ trợ sản phẩm.",
  "Giải thích sự khác nhau giữa model và chat session.",
]

function createChatSession(): ChatSession {
  return model.startChat({
    history: initialMessages.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }],
    })),
    generationConfig: {
      maxOutputTokens: 500,
    },
  })
}

function getGeminiErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error)
  const normalizedMessage = rawMessage.toLowerCase()

  if (
    normalizedMessage.includes("429") ||
    normalizedMessage.includes("prepayment credits are depleted") ||
    normalizedMessage.includes("billing")
  ) {
    return "Gemini hiện không phản hồi vì project Firebase AI đã hết credits/billing. Hãy nạp credit hoặc bật billing trong AI Studio rồi thử lại."
  }

  return rawMessage || "Không thể gửi tin nhắn lúc này."
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

export default function GeminiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const chatRef = useRef<ChatSession | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    chatRef.current = createChatSession()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isSending])

  const handleReset = () => {
    chatRef.current = createChatSession()
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

    const chat = chatRef.current ?? createChatSession()
    chatRef.current = chat

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
      const result = await chat.sendMessage(trimmedInput)
      const text = result.response.text().trim()

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `model-${Date.now()}`,
          role: "model",
          text: text || "Mình chưa nhận được nội dung trả lời từ Gemini.",
        },
      ])
    } catch (sendError) {
      setError(getGeminiErrorMessage(sendError))
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
                Firebase AI
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Gemini Chat
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                Giao diện chat dùng trực tiếp Firebase AI, khởi tạo theo đúng
                mẫu `startChat` của Google và giữ lịch sử hội thoại ngay trên
                client.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-background/80 border text-muted-foreground rounded-full px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
              Model: gemini-3-flash-preview
            </div>
            <div className="bg-background/80 border text-muted-foreground rounded-full px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
              Backend: GoogleAIBackend
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
                Dùng các prompt mẫu bên dưới để thử luồng chat hoặc nhập câu hỏi
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
                <p className="font-medium text-foreground">Lưu ý triển khai</p>
                <p className="mt-2">
                  File [src/lib/firebase/client.ts](src/lib/firebase/client.ts)
                  đã có cấu hình Firebase và model Gemini. Trang này chỉ cần
                  chạy trên client để gọi `chat.sendMessage()`.
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
                        Gemini đang suy nghĩ...
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
                    placeholder="Nhập câu hỏi cho Gemini..."
                    className="min-h-28 resize-none border-0 bg-transparent px-1 py-2 shadow-none focus-visible:ring-0"
                  />

                  <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                    <p className="text-muted-foreground text-xs">
                      Dựa trên `gemini-3-flash-preview` từ Firebase AI.
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
