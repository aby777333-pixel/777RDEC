'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export type BrandConfig = { name: string; accent: string; logoDataUrl: string | null }

type Section = 'dashboard' | 'funds' | 'accounts' | 'verification'
type FundsTab = 'deposit' | 'withdraw' | 'statements'

const SECTIONS: readonly { id: Section; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'funds', label: 'Funds' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'verification', label: 'Verification' },
]

const FUNDS_TABS: readonly { id: FundsTab; label: string }[] = [
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'statements', label: 'Statements' },
]

/**
 * Simulated client portal, recreated as live components so the white-label
 * demo can re-skin it in the browser. Never a screenshot (§3).
 *
 * The sections and the funding tabs switch what the portal shows, so a visitor
 * can walk through it the way a client would. Every figure is illustrative, and
 * nothing here moves money or submits anything.
 */
export function PortalFrame({ brand, className }: { brand: BrandConfig; className?: string }) {
  const accentStyle = { '--brand': brand.accent } as React.CSSProperties
  const [section, setSection] = useState<Section>('dashboard')
  const [fundsTab, setFundsTab] = useState<FundsTab>('deposit')

  const openFunds = (tab: FundsTab) => {
    setFundsTab(tab)
    setSection('funds')
  }

  return (
    <div
      style={accentStyle}
      className={cn('overflow-hidden rounded-card border border-line-2 bg-bg-1 shadow-soft', className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line-1 px-4 py-3">
        <div className="flex items-center gap-2.5">
          {brand.logoDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- client-side object URL, never uploaded */
            <img src={brand.logoDataUrl} alt="" className="h-6 w-auto max-w-[6rem] object-contain" />
          ) : (
            <span
              className="grid h-6 w-6 place-items-center rounded-[4px] text-[0.625rem] font-bold text-white"
              style={{ backgroundColor: 'var(--brand)' }}
              aria-hidden
            >
              {brand.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="font-display text-[0.9375rem] tracking-tight text-steel-100">
            {brand.name}
          </span>
        </div>
        <nav aria-label="Portal sections" className="flex flex-wrap gap-1 text-[0.75rem]">
          {SECTIONS.map((item) => {
            const active = item.id === section
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-[4px] px-2 py-1 transition-colors duration-200',
                  active ? 'bg-bg-2' : 'text-steel-500 hover:bg-bg-2 hover:text-steel-300',
                )}
                style={active ? { color: 'var(--brand)' } : undefined}
              >
                {item.label}
              </button>
            )
          })}
        </nav>
      </header>

      {section === 'dashboard' ? <Dashboard onFunds={openFunds} /> : null}
      {section === 'funds' ? <Funds tab={fundsTab} onTab={setFundsTab} /> : null}
      {section === 'accounts' ? <Accounts /> : null}
      {section === 'verification' ? <Verification /> : null}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.5625rem] uppercase tracking-[0.16em] text-steel-500">{children}</p>
}

function Dashboard({ onFunds }: { onFunds: (tab: FundsTab) => void }) {
  return (
    <>
      <div className="grid gap-px bg-line-1 sm:grid-cols-3">
        {[
          { label: 'Balance', value: '12,840.50' },
          { label: 'Equity', value: '12,927.30' },
          { label: 'Floating P&L', value: '+86.80' },
        ].map((stat, index) => (
          <div key={stat.label} className="bg-bg-1 px-4 py-3.5">
            <Eyebrow>{stat.label}</Eyebrow>
            <p
              className="mt-1 font-mono text-[1rem]"
              style={{ color: index === 2 ? 'var(--brand)' : 'var(--steel-100)' }}
              data-numeric
            >
              {stat.value} <span className="text-[0.625rem] text-steel-500">USD</span>
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-line-1 px-4 py-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Verification</Eyebrow>
          <p className="text-[0.6875rem]" style={{ color: 'var(--brand)' }}>
            2 of 3 complete
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-3">
          <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FUNDS_TABS.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFunds(tab.id)}
              className={cn(
                'rounded-ui px-3 py-1.5 text-[0.75rem] transition-[filter,background-color] duration-200',
                index === 0 ? 'text-white hover:brightness-110' : 'border border-line-2 text-steel-300 hover:bg-bg-2',
              )}
              style={index === 0 ? { backgroundColor: 'var(--brand)' } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function Funds({ tab, onTab }: { tab: FundsTab; onTab: (tab: FundsTab) => void }) {
  return (
    <div className="px-4 py-4">
      <div role="tablist" aria-label="Funds" className="flex flex-wrap gap-2">
        {FUNDS_TABS.map((item) => {
          const active = item.id === tab
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTab(item.id)}
              className={cn(
                'rounded-ui px-3 py-1.5 text-[0.75rem] transition-colors duration-200',
                active ? 'text-white' : 'border border-line-2 text-steel-300 hover:bg-bg-2',
              )}
              style={active ? { backgroundColor: 'var(--brand)' } : undefined}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="mt-4">
        {tab === 'deposit' ? (
          <ul className="grid gap-2 sm:grid-cols-3">
            {[
              { method: 'Card', note: 'Instant' },
              { method: 'Bank transfer', note: '1–2 business days' },
              { method: 'Crypto', note: 'On confirmation' },
            ].map((row) => (
              <li key={row.method} className="rounded-ui border border-line-2 bg-bg-0 px-3 py-2.5">
                <p className="text-[0.8125rem] text-steel-100">{row.method}</p>
                <p className="text-[0.6875rem] text-steel-500">{row.note}</p>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'withdraw' ? (
          <div className="grid gap-px overflow-hidden rounded-ui border border-line-2 bg-line-1 sm:grid-cols-2">
            <div className="bg-bg-0 px-3 py-2.5">
              <Eyebrow>Available to withdraw</Eyebrow>
              <p className="mt-1 font-mono text-[0.9375rem] text-steel-100" data-numeric>
                12,840.50 <span className="text-[0.625rem] text-steel-500">USD</span>
              </p>
            </div>
            <div className="bg-bg-0 px-3 py-2.5">
              <Eyebrow>Pending requests</Eyebrow>
              <p className="mt-1 font-mono text-[0.9375rem] text-steel-100" data-numeric>
                0
              </p>
            </div>
          </div>
        ) : null}

        {tab === 'statements' ? (
          <ul className="divide-y divide-line-1 rounded-ui border border-line-2 bg-bg-0">
            {['August', 'July', 'June'].map((month) => (
              <li key={month} className="flex items-center justify-between px-3 py-2 text-[0.8125rem]">
                <span className="text-steel-300">{month} statement</span>
                <span className="text-[0.6875rem]" style={{ color: 'var(--brand)' }}>
                  PDF
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

function Accounts() {
  return (
    <ul className="divide-y divide-line-1">
      {[
        { name: 'Standard', id: '·· 4821', currency: 'USD', balance: '12,840.50' },
        { name: 'Pro', id: '·· 7310', currency: 'EUR', balance: '3,215.00' },
      ].map((account) => (
        <li key={account.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
          <div>
            <p className="text-[0.8125rem] text-steel-100">
              {account.name} <span className="text-steel-500">{account.id}</span>
            </p>
            <Eyebrow>{account.currency} account</Eyebrow>
          </div>
          <p className="font-mono text-[0.9375rem] text-steel-100" data-numeric>
            {account.balance} <span className="text-[0.625rem] text-steel-500">{account.currency}</span>
          </p>
        </li>
      ))}
    </ul>
  )
}

function Verification() {
  return (
    <ol className="flex flex-col gap-2 px-4 py-4">
      {[
        { step: 'Identity document', done: true },
        { step: 'Proof of address', done: true },
        { step: 'Source of funds', done: false },
      ].map((item, index) => (
        <li
          key={item.step}
          className="flex items-center justify-between rounded-ui border border-line-2 bg-bg-0 px-3 py-2.5"
        >
          <span className="text-[0.8125rem] text-steel-300">
            <span className="mr-2 font-mono text-steel-500" data-numeric>
              {index + 1}
            </span>
            {item.step}
          </span>
          <span
            className="text-[0.6875rem]"
            style={{ color: item.done ? 'var(--brand)' : 'var(--steel-500)' }}
          >
            {item.done ? 'Complete' : 'Awaiting upload'}
          </span>
        </li>
      ))}
    </ol>
  )
}
