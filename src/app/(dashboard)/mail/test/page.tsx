"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Settings2,
  AlertCircle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const emailFormSchema = z.object({
  to: z.string().min(1, "Người nhận là bắt buộc"),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, "Tiêu đề là bắt buộc"),
  html: z.string().min(1, "Nội dung HTML là bắt buộc"),
})

type EmailFormValues = z.infer<typeof emailFormSchema>

const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { background: white; border-radius: 8px; padding: 32px; max-width: 600px; margin: 0 auto; }
    h2 { color: #333; margin-top: 0; }
    .badge { display: inline-block; background: #e2e8f0; color: #475569; padding: 4px 12px; border-radius: 9999px; font-size: 12px; margin-bottom: 16px; }
    .footer { margin-top: 24px; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">Test Email</span>
    <h2>Xin chào!</h2>
    <p>Đây là email test được gửi từ <strong>Claude Code Dashboard</strong>.</p>
    <p>Nếu bạn nhận được email này, nghĩa là thư viện gửi email đã hoạt động thành công!</p>
    <div class="footer">
      <p>Trân trọng,<br/>Admin Dashboard</p>
    </div>
  </div>
</body>
</html>`

export default function MailTestPage() {
  const [smtpStatus, setSmtpStatus] = useState<"idle" | "checking" | "ok" | "error">("idle")
  const [smtpError, setSmtpError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      to: "",
      cc: "",
      bcc: "",
      subject: "Test Email - Claude Code Dashboard",
      html: sampleHtml,
    },
  })

  useEffect(() => {
    checkSmtpStatus()
  }, [])

  async function checkSmtpStatus() {
    setSmtpStatus("checking")
    try {
      const res = await fetch("/api/email")
      const data = await res.json()
      if (data.success) {
        setSmtpStatus("ok")
      } else {
        setSmtpStatus("error")
        setSmtpError(data.error ?? "Lỗi không xác định")
      }
    } catch {
      setSmtpStatus("error")
      setSmtpError("Không thể kết nối server")
    }
  }

  async function onSubmit(values: EmailFormValues) {
    setIsSending(true)
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Gửi email thành công!", {
          description: `Message ID: ${data.messageId}`,
        })
      } else {
        toast.error("Gửi email thất bại", {
          description: data.error,
        })
      }
    } catch {
      toast.error("Gửi email thất bại", {
        description: "Lỗi kết nối server",
      })
    } finally {
      setIsSending(false)
    }
  }

  const watchedHtml = form.watch("html")

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Email</h1>
          <p className="text-muted-foreground">
            Gửi email thử nghiệm qua Gmail SMTP App Password
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkSmtpStatus}
          disabled={smtpStatus === "checking"}
          className="cursor-pointer"
        >
          {smtpStatus === "checking" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Settings2 className="size-4" />
          )}
          <span className="ml-2">Kiểm tra SMTP</span>
        </Button>
      </div>

      {/* SMTP Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-muted-foreground" />
            <CardTitle className="text-base">SMTP Connection Status</CardTitle>
          </div>
          <CardDescription>Trạng thái kết nối Gmail SMTP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {smtpStatus === "idle" || smtpStatus === "checking" ? (
              <>
                <Loader2 className="size-5 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">Đang kiểm tra...</span>
              </>
            ) : smtpStatus === "ok" ? (
              <>
                <CheckCircle className="size-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">
                  Kết nối SMTP thành công
                </span>
              </>
            ) : (
              <>
                <XCircle className="size-5 text-red-500" />
                <span className="text-sm text-red-600 font-medium">
                  Kết nối SMTP thất bại: {smtpError}
                </span>
              </>
            )}
          </div>
          {smtpStatus === "error" && (
            <div className="mt-3 flex gap-2 items-start rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <div>
                <strong>Cách khắc phục:</strong>
                <ol className="mt-1 list-inside list-decimal space-y-0.5">
                  <li>Kiểm tra biến môi trường EMAIL_* trong .env</li>
                  <li>Đảm bảo Gmail App Password đã được tạo đúng</li>
                  <li>Bật 2-Step Verification trên tài khoản Google trước khi tạo App Password</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Soạn Email</CardTitle>
              <CardDescription>
                Điền thông tin và nhấn Gửi để test thư viện email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người nhận (To) *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CC</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="cc@example.com (tùy chọn)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bcc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BCC</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="bcc@example.com (tùy chọn)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề (Subject) *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tiêu đề email..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nội dung HTML</CardTitle>
                  <CardDescription>
                    Viết nội dung email bằng HTML
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="cursor-pointer"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="size-4" />
                      <span className="ml-2">Ẩn Preview</span>
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" />
                      <span className="ml-2">Xem Preview</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="html"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {showPreview ? (
                        <div className="rounded-md border min-h-[300px] p-4 overflow-auto bg-muted/30">
                          <div
                            dangerouslySetInnerHTML={{ __html: watchedHtml }}
                            className="[&_table]:border-collapse [&_td]:border [&_td]:p-2"
                          />
                        </div>
                      ) : (
                        <Textarea
                          className="min-h-[300px] font-mono text-sm"
                          placeholder="Nhập nội dung HTML..."
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSending || smtpStatus === "error"}
              className="cursor-pointer"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span className="ml-2">{isSending ? "Đang gửi..." : "Gửi Email"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              className="cursor-pointer"
            >
              Reset
            </Button>
            {smtpStatus === "error" && (
              <span className="text-sm text-muted-foreground">
                (SMTP chưa kết nối — vui lòng kiểm tra cấu hình)
              </span>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
