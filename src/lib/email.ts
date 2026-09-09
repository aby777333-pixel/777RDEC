import 'server-only'

/**
 * Email behind a swappable adapter. Resend when configured, otherwise a
 * console adapter so local development works without credentials.
 */

import { SITE_DOMAIN, SITE_NAME } from './brand'

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const NOTIFICATION_TO = process.env.DEMO_NOTIFICATION_TO ?? ''
const FROM = `${SITE_NAME} <notifications@${SITE_DOMAIN}>`

export type EmailMessage = { subject: string; body: string }

export type EmailProvider = {
  name: string
  send: (message: EmailMessage) => Promise<boolean>
}

const consoleProvider: EmailProvider = {
  name: 'console',
  async send(message) {
    console.info('[email:console]', message.subject, '\n', message.body)
    /*
      In development, logging counts as delivery so forms are usable without
      credentials. In production it must NOT: reporting success for a message
      that only reached a log file is how enquiries get lost silently.
    */
    return process.env.NODE_ENV !== 'production'
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
          from: FROM,
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
