import nodemailer, { Transporter } from "nodemailer"

/**
 * Cấu hình email từ biến môi trường.
 * Dùng Gmail App Password (không phải mật khẩu thường).
 *
 * Biến môi trường cần thiết (server-side, không có NEXT_PUBLIC_):
 *   EMAIL_HOST=smtp.gmail.com
 *   EMAIL_PORT=587
 *   EMAIL_SECURE=false
 *   EMAIL_USER=<your-gmail-address>
 *   EMAIL_PASS=<your-gmail-app-password>
 *   EMAIL_FROM="Admin <noreply@example.com>"
 */

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  from?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

function createTransporter(): Transporter {
  const host = process.env.EMAIL_HOST
  const port = parseInt(process.env.EMAIL_PORT ?? "587", 10)
  const secure = process.env.EMAIL_SECURE === "true"
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!host || !user || !pass) {
    throw new Error(
      "Thiếu biến môi trường email. Vui lòng kiểm tra EMAIL_HOST, EMAIL_USER, EMAIL_PASS."
    )
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

function normalizeRecipients(recipients: string | string[] | undefined): string {
  if (!recipients) return ""
  return Array.isArray(recipients) ? recipients.join(", ") : recipients
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const transporter = createTransporter()

  const from =
    options.from ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    "noreply@example.com"

  const mailOptions = {
    from,
    to: normalizeRecipients(options.to),
    cc: normalizeRecipients(options.cc),
    bcc: normalizeRecipients(options.bcc),
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text ?? "",
    html: options.html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gửi email thất bại."
    return {
      success: false,
      error: message,
    }
  }
}

export async function verifyEmailConfig(): Promise<{ ok: boolean; error?: string }> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    return { ok: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Xác thực kết nối SMTP thất bại."
    return { ok: false, error: message }
  }
}
