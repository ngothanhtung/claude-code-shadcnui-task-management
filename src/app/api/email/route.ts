import { NextRequest, NextResponse } from "next/server"
import { sendEmail, verifyEmailConfig } from "@/lib/email/email-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text, cc, bcc, replyTo } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: "Thiếu trường bắt buộc: to, subject, html" },
        { status: 400 }
      )
    }

    const result = await sendEmail({ to, subject, html, text, cc, bcc, replyTo })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  const result = await verifyEmailConfig()
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  }
  return NextResponse.json({ success: true, message: "Kết nối SMTP OK" })
}
