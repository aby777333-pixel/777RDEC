'use server'

import { CONTACT_EMAIL } from '@/lib/brand'
import { insertRow } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/email'
import { verifyTurnstile } from './turnstile'
import { leadSchema, type FormState, type LeadInput } from './schema'

type Target = 'demo_requests' | 'contact_messages'

const SUCCESS: Record<Target, string> = {
  demo_requests:
    'Thank you — your demo request is with us. We will reply from a person, usually within one business day.',
  contact_messages: 'Thank you — your message is with us. We will reply within one business day.',
}

/**
 * Shared handler for the demo, contact and sandbox forms.
 *
 * Returns typed success or failure. Supabase and provider errors are logged
 * server-side and never surfaced to the browser (§8).
 */
async function submit(target: Target, formData: FormData): Promise<FormState> {
  // Not typed as LeadInput: consent arrives as an unchecked boolean and the
  // schema is what narrows it to literal true.
  const raw = {
    fullName: String(formData.get('fullName') ?? ''),
    email: String(formData.get('email') ?? ''),
    company: String(formData.get('company') ?? ''),
    role: String(formData.get('role') ?? ''),
    audience: String(formData.get('audience') ?? ''),
    region: String(formData.get('region') ?? ''),
    interests: formData.getAll('interests').map(String),
    message: String(formData.get('message') ?? ''),
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
    sourcePath: String(formData.get('sourcePath') ?? ''),
    companyWebsite: String(formData.get('companyWebsite') ?? ''),
    turnstileToken: String(formData.get('cf-turnstile-response') ?? ''),
  }

  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof LeadInput, string>> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !(key in fieldErrors)) {
        fieldErrors[key as keyof LeadInput] = issue.message
      }
    }
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors,
    }
  }

  const data = parsed.data

  // Honeypot. A filled hidden field is a bot; answer as if it succeeded.
  if (data.companyWebsite !== undefined && data.companyWebsite !== '') {
    return { status: 'success', message: SUCCESS[target] }
  }

  if (!(await verifyTurnstile(data.turnstileToken || undefined))) {
    return {
      status: 'error',
      message: 'We could not verify that request came from a browser. Please try again.',
    }
  }

  const result = await insertRow(target, {
    full_name: data.fullName,
    email: data.email,
    company: data.company || null,
    role: data.role || null,
    audience: data.audience,
    region: data.region || null,
    interests: data.interests,
    message: data.message || null,
    source_path: data.sourcePath || null,
    consent: data.consent,
  })

  /*
    An enquiry is too valuable to drop because one dependency is down, so the
    notification is attempted regardless of whether the row persisted. The
    submission counts as successful if EITHER path worked: persisted for the
    record, or delivered to a human who can act on it.
  */
  const notified = await sendNotification({
    subject: `${target === 'demo_requests' ? 'Demo request' : 'Contact message'} — ${data.fullName}`,
    body: [
      `Name:      ${data.fullName}`,
      `Email:     ${data.email}`,
      `Company:   ${data.company || '—'}`,
      `Role:      ${data.role || '—'}`,
      `Audience:  ${data.audience}`,
      `Region:    ${data.region || '—'}`,
      `Interests: ${data.interests.length > 0 ? data.interests.join(', ') : '—'}`,
      `Source:    ${data.sourcePath || '—'}`,
      '',
      data.message || '(no message)',
    ].join('\n'),
  })

  if (!result.ok) {
    // Loud, because a submission that reached nobody is a lost customer and a
    // silent "not configured" in production is worse than an outage.
    console.error(
      `[forms:${target}] not persisted (${result.reason}); notification ${notified ? 'delivered' : 'FAILED'}`,
    )
  }

  if (!result.ok && !notified) {
    return {
      status: 'error',
      message: `Something went wrong on our side and your message did not reach us. Please try again, or email ${CONTACT_EMAIL} directly.`,
    }
  }

  return { status: 'success', message: SUCCESS[target] }
}

export async function submitDemoRequest(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return submit('demo_requests', formData)
}

export async function submitContactMessage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return submit('contact_messages', formData)
}
