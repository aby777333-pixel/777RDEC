import 'server-only'

/**
 * Email behind a swappable adapter. Resend when configured, otherwise a
 * console adapter so local development works without credentials.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const NOTIFICATION_TO = process.env.DEMO_NOTIFICATION_TO ?? ''

export type EmailMessage = { subject: string; body: string }

export type EmailProvider = {
  name: string
  send: (message: EmailMessage) => Promise<boolean>
}

const consoleProvider: EmailProvider = {
  name: 'console',
  async send(message) {
    console.info('[email:console]', message.subject, '\n', message.body)
    return true
  },
}

const resendProvider: EmailProvider = {
  name: 'resend',
  async send(message) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '777 Raptor <notifications@777raptor.com>',
          to: [NOTIFICATION_TO],
          subject: message.subject,
          text: message.body,
        }),
      })
      if (!response.ok) {
        console.error('[email:resend] failed', response.status, await response.text())
        return false
      }
      return true
    } catch (error) {
      console.error('[email:resend] threw', error)
      return false
    }
  },
}

export function getEmailProvider(): EmailProvider {
  return RESEND_API_KEY.length > 0 && NOTIFICATION_TO.length > 0 ? resendProvider : consoleProvider
}

export async function sendNotification(message: EmailMessage): Promise<boolean> {
  return getEmailProvider().send(message)
}
