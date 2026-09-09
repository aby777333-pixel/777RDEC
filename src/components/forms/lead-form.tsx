'use client'

import { useState } from 'react'
// React 18 / Next 14: the form-state hook lives in react-dom.
// (It becomes React's useActionState under React 19.)
import { useFormState, useFormStatus } from 'react-dom'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import {
  AUDIENCE_OPTIONS,
  INTEREST_OPTIONS,
  REGION_OPTIONS,
  isFreemail,
  type FormState,
} from '@/lib/forms/schema'
import { cn } from '@/lib/utils'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

export function LeadForm({
  action,
  defaultAudience,
  submitLabel,
  messageLabel,
  messagePlaceholder,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  defaultAudience?: string
  submitLabel: string
  messageLabel: string
  messagePlaceholder: string
}) {
  const [state, formAction] = useFormState(action, { status: 'idle' } as FormState)
  const pathname = usePathname()
  const [email, setEmail] = useState('')

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined
  const freemailWarning = email.includes('@') && isFreemail(email)

  if (state.status === 'success') {
    return (
      <Panel tone="raised" size="panel" className="flex items-start gap-4 p-8">
        <CheckCircle2 size={22} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-up" />
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-[1.375rem] uppercase tracking-tight text-steel-100">
            Received
          </h2>
          <p className="text-body text-steel-300" role="status">
            {state.message}
          </p>
          <Link href="/platform" className="text-[0.9375rem] text-signal underline underline-offset-4">
            While you wait, read about the platform
          </Link>
        </div>
      </Panel>
    )
  }

  return (
    <>
      {TURNSTILE_SITE_KEY.length > 0 ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      ) : null}

      <form action={formAction} className="flex flex-col gap-6" noValidate>
        <input type="hidden" name="sourcePath" value={pathname} />
        {/* Honeypot. Positioned off-screen rather than hidden so bots still fill it. */}
        <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label htmlFor="companyWebsite">Company website</label>
          <input id="companyWebsite" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {state.status === 'error' ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-card border border-down/40 bg-down/[0.06] px-4 py-3 text-[0.9375rem] text-steel-100"
          >
            <AlertCircle size={17} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-down" />
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="fullName" required error={fieldErrors?.fullName}>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className={inputClass(fieldErrors?.fullName)}
            />
          </Field>

          <Field
            label="Work email"
            name="email"
            required
            error={fieldErrors?.email}
            hint={
              freemailWarning
                ? 'That looks like a personal address. A work address helps us route your enquiry, but it is not required.'
                : undefined
            }
          >
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass(fieldErrors?.email)}
            />
          </Field>

          <Field label="Company" name="company" error={fieldErrors?.company}>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              className={inputClass()}
            />
          </Field>

          <Field label="Role" name="role" error={fieldErrors?.role}>
            <input id="role" name="role" type="text" className={inputClass()} />
          </Field>

          <Field label="I am a…" name="audience" required error={fieldErrors?.audience}>
            <select
              id="audience"
              name="audience"
              required
              defaultValue={defaultAudience ?? ''}
              className={inputClass(fieldErrors?.audience)}
            >
              <option value="" disabled>
                Choose one
              </option>
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Region" name="region" error={fieldErrors?.region}>
            <select id="region" name="region" defaultValue="" className={inputClass()}>
              <option value="">Prefer not to say</option>
              {REGION_OPTIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-eyebrow uppercase text-steel-500">
            Products of interest
          </legend>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <label
                key={interest}
                className="inline-flex cursor-pointer items-center gap-2 rounded-ui border border-line-2 px-3 py-1.5 text-[0.8125rem] text-steel-300 transition-colors duration-200 hover:bg-bg-2 has-[:checked]:border-signal/50 has-[:checked]:bg-signal/[0.08] has-[:checked]:text-steel-100"
              >
                <input
                  type="checkbox"
                  name="interests"
                  value={interest}
                  className="h-3.5 w-3.5 accent-[var(--signal)]"
                />
                {interest}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label={messageLabel} name="message" error={fieldErrors?.message}>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder={messagePlaceholder}
            className={cn(inputClass(), 'resize-y')}
          />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 text-[0.875rem] leading-relaxed text-steel-300">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--signal)]"
          />
          <span>
            I agree that 777 Raptor may contact me about this enquiry, and I have read the{' '}
            <Link href="/legal/privacy" className="text-signal underline underline-offset-2">
              privacy notice
            </Link>
            .
            {fieldErrors?.consent ? (
              <span className="mt-1 block text-down">{fieldErrors.consent}</span>
            ) : null}
          </span>
        </label>

        {TURNSTILE_SITE_KEY.length > 0 ? (
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" />
        ) : null}

        <SubmitButton label={submitLabel} />
      </form>
    </>
  )
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="primary" size="lg" disabled={pending} className="self-start">
      {pending ? 'Sending…' : label}
    </Button>
  )
}

function inputClass(error?: string): string {
  return cn(
    'w-full rounded-ui border bg-bg-0 px-3 py-2.5 text-[0.9375rem] text-steel-100 transition-colors duration-200',
    'placeholder:text-steel-700',
    error ? 'border-down/60' : 'border-line-2 hover:border-steel-700',
  )
}

function Field({
  label,
  name,
  required = false,
  error,
  hint,
  children,
}: {
  label: string
  name: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-eyebrow uppercase text-steel-500">
        {label}
        {required ? <span className="ml-1 text-signal">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-[0.8125rem] text-down">{error}</p>
      ) : hint ? (
        <p className="text-[0.8125rem] text-warn">{hint}</p>
      ) : null}
    </div>
  )
}
