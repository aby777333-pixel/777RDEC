/**
 * Integration directory.
 *
 * `status` is the honest bit. Nothing is listed as `live` unless it is running
 * in production for a client today.
 *
 *   live      — in production now
 *   available — adapter written and tested, not necessarily deployed
 *   request   — no adapter yet; would be development work
 *
 * TODO_CONFIRM: every row currently ships as `request` because I have no way
 * to verify which adapters actually exist. Flip the ones that are real — that
 * is the only edit needed, and the page renders the counts from these values.
 */

export type IntegrationStatus = 'live' | 'available' | 'request'

export type Integration = { name: string; status: IntegrationStatus; note?: string }

export type IntegrationCategory = {
  id: string
  label: string
  tint: number
  blurb: string
  /** Protocol-level facts, true regardless of vendor. */
  standards: readonly string[]
  vendors: readonly Integration[]
}

const R: IntegrationStatus = 'request'

export const INTEGRATION_CATEGORIES: readonly IntegrationCategory[] = [
  {
    id: 'liquidity',
    label: 'Liquidity & execution',
    tint: 0,
    blurb:
      'Raptor connects to the venues and providers you have contracted with. It does not provide liquidity.',
    standards: ['FIX 4.2', 'FIX 4.4', 'FIX 5.0 SP2', 'Binary/native APIs on request'],
    vendors: [
      { name: 'Prime-of-prime aggregators', status: R, note: 'Via FIX session' },
      { name: 'Tier-1 bank feeds', status: R, note: 'Via FIX session' },
      { name: 'Crypto venues', status: R, note: 'REST + WebSocket' },
      { name: 'MT4 / MT5 bridges', status: R },
    ],
  },
  {
    id: 'payments',
    label: 'Payments & funding',
    tint: 1,
    blurb: 'Deposit and withdrawal rails, with reconciliation into the client record.',
    standards: ['Hosted checkout redirect', 'Server-to-server API', 'Signed webhooks', 'Manual bank reconciliation'],
    vendors: [
      { name: 'Card acquirers', status: R },
      { name: 'Bank transfer / SEPA / Faster Payments', status: R },
      { name: 'Regional alternative payment methods', status: R },
      { name: 'Stablecoin and crypto rails', status: R },
    ],
  },
  {
    id: 'verification',
    label: 'Identity & verification',
    tint: 3,
    blurb: 'KYC, document checks and screening behind one common interface.',
    standards: ['REST + webhook callback', 'Document upload passthrough', 'Ongoing monitoring hooks'],
    vendors: [
      { name: 'Document and biometric verification', status: R },
      { name: 'Sanctions and PEP screening', status: R },
      { name: 'Address and proof-of-residence checks', status: R },
    ],
  },
  {
    id: 'data',
    label: 'Market data',
    tint: 5,
    blurb: 'Feed handlers are pluggable. Raptor does not mandate a single vendor.',
    standards: ['WebSocket streaming', 'FIX market data', 'REST snapshot', 'Custom feed handler interface'],
    vendors: [
      { name: 'Consolidated multi-asset feeds', status: R },
      { name: 'Exchange direct feeds', status: R },
      { name: 'Reference and instrument data', status: R },
      { name: 'Economic calendar', status: R },
    ],
  },
  {
    id: 'comms',
    label: 'Communications',
    tint: 4,
    blurb: 'Transactional email, SMS and messaging for client and staff notifications.',
    standards: ['SMTP', 'Provider REST API', 'Delivery + bounce webhooks', 'Template passthrough'],
    vendors: [
      { name: 'Transactional email', status: R },
      { name: 'SMS and voice OTP', status: R },
      { name: 'Push and in-app messaging', status: R },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & BI',
    tint: 2,
    blurb: 'Export into your own reporting stack rather than being confined to ours.',
    standards: ['Scheduled CSV / Parquet export', 'Warehouse sync', 'Read-only replica', 'Event webhooks'],
    vendors: [
      { name: 'Data warehouses', status: R },
      { name: 'BI and dashboarding tools', status: R },
      { name: 'Product and web analytics', status: R },
    ],
  },
]

export const STATUS_LABEL: Record<IntegrationStatus, string> = {
  live: 'In production',
  available: 'Adapter available',
  request: 'On request',
}
