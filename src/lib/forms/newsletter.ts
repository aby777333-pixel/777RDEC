'use server'

import { z } from 'zod'
import { insertRow } from '@/lib/supabase/server'
import { verifyTurnstile } from './turnstile'

export type NewsletterState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(200),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you would like to receive these updates.' }),
  }),
  /** Honeypot: must stay empty. */
  companyWebsite: z.literal('').optional(),
  turnstileToken: z.string().max(4000).optional().or(z.literal('')),
})

const SUCCESS = 'You are subscribed. We send notes when there is something worth reading, not on a schedule.'

/**
 * Newsletter subscription.
 *
 * Deliberately narrower than the lead forms: an address and an explicit
 * consent, nothing else, written to `newsletter_subscribers`. Re-subscribing
 * an address already on the list is a no-op that reports success — the
 * subscriber should not be told about our unique index.
 *
 * Unlike the demo and contact forms there is no email fallback: a newsletter
 * signup that does not reach the list is not a lead we can chase by hand, so
 * a persistence failure is reported honestly rather than papered over.
 */
export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    companyWebsite: String(formData.get('companyWebsite') ?? ''),
    turnstileToken: String(formData.get('cf-turnstile-response') ?? ''),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Please check the address you entered.',
    }
  }

  const data = parsed.data

  // Honeypot. A filled hidden field is a bot; answer as if it succeeded.
  if (data.companyWebsite !== undefined && data.companyWebsite !== '') {
    return { status: 'success', message: SUCCESS }
  }

  if (!(await verifyTurnstile(data.turnstileToken || undefined))) {
    return {
      status: 'error',
      message: 'We could not verify that request came from a browser. Please try again.',
    }
  }

  const result = await insertRow(
    'newsletter_subscribers',
    { email: data.email, consent: data.consent },
    { ignoreDuplicates: true },
  )

  if (!result.ok) {
    console.error(`[forms:newsletter] not persisted (${result.reason})`)
    return {
      status: 'error',
      message: 'Something went wrong on our side and we could not add you. Please try again shortly.',
    }
  }

  return { status: 'success', message: SUCCESS }
}
