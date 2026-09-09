import { z } from 'zod'

export const AUDIENCE_OPTIONS = [
  { value: 'trader', label: 'Trader' },
  { value: 'broker', label: 'Broker' },
  { value: 'institution', label: 'Financial institution' },
  { value: 'prop', label: 'Prop or professional desk' },
  { value: 'developer', label: 'Developer' },
  { value: 'other', label: 'Other' },
] as const

export const REGION_OPTIONS = [
  'Africa',
  'Asia',
  'Australia & Oceania',
  'Europe',
  'Middle East',
  'North America',
  'South America',
] as const

export const INTEREST_OPTIONS = [
  'Raptor Terminal',
  'EMIL',
  'Raptor CRM',
  'Client Portal',
  'Risk Engine',
  'Broker Platform',
  'White Label',
  'Liquidity & Connectivity',
  'IB & Affiliates',
  'API & Developer Tools',
] as const

/** Free-mail domains produce a soft warning, never a hard block (§8). */
export const FREEMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'ymail.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'mail.com',
  'yandex.com',
  'zoho.com',
] as const

export function isFreemail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain !== undefined && FREEMAIL_DOMAINS.includes(domain as (typeof FREEMAIL_DOMAINS)[number])
}

export const leadSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(200),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  role: z.string().trim().max(120).optional().or(z.literal('')),
  audience: z.enum(['trader', 'broker', 'institution', 'prop', 'developer', 'other'], {
    errorMap: () => ({ message: 'Please choose the option that best describes you.' }),
  }),
  region: z.string().trim().max(80).optional().or(z.literal('')),
  interests: z.array(z.string().max(80)).max(INTEREST_OPTIONS.length).default([]),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'We need your consent before we can contact you.' }),
  }),
  sourcePath: z.string().max(300).optional().or(z.literal('')),
  /** Honeypot: must stay empty. Bots fill it, humans never see it. */
  companyWebsite: z.literal('').optional(),
  turnstileToken: z.string().max(4000).optional().or(z.literal('')),
})

export type LeadInput = z.input<typeof leadSchema>
export type LeadData = z.output<typeof leadSchema>

export type FormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Partial<Record<keyof LeadInput, string>> }
