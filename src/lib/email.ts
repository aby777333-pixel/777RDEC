import 'server-only'

/**
 * Email behind a swappable adapter. Resend when configured, otherwise a
 * console adapter so local development works without credentials.
 */

import { SITE_DOMAIN, SITE_NAME } from './brand'

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const NOTIFICATION_TO = process.env.DEMO_NOTIFICATION_TO ?? ''
/**
 * The sender. Resend only sends from a domain verified in its dashboard, so
 * set EMAIL_FROM (e.g. `777 Raptor <hello@yourdomain.com>`) to an address on a
 * verified domain. The fallback is the site's own domain.
 */
const FROM = (process.env.EMAIL_FROM ?? '').trim() || `${SITE_NAME} <notifications@${SITE_DOMAIN}>`
/** Where a visitor's reply to an acknowledgement goes, when set. */
const REPLY_TO = (process.env.EMAIL_REPLY_TO ?? '').trim()

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

/**
 * A confirmation to the person who submitted a form — "we have it, a person
 * will reply". Sent only when Resend is configured; without it this does
 * nothing and says so in the log. Never throws, and its result never decides
 * whether a submission succeeded: the enquiry is already saved by then.
 */
export async function sendAcknowledgement(to: string, message: EmailMessage): Promise<boolean> {
  if (RESEND_API_KEY.length === 0) {
    console.info('[email:acknowledgement] Resend not configured; no confirmation sent')
    return false
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: message.subject,
        text: message.body,
        ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
      }),
    })
    if (!response.ok) {
      console.error('[email:acknowledgement] failed', response.status, await response.text())
      return false
    }
    return true
  } catch (error) {
    console.error('[email:acknowledgement] threw', error)
    return false
  }
}
