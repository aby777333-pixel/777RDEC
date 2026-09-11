import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Brain,
  CalendarDays,
  Cpu,
  GraduationCap,
  Grid3x3,
  LayoutGrid,
  LifeBuoy,
  LineChart,
  ListOrdered,
  MessagesSquare,
  Network,
  Newspaper,
  NotebookPen,
  PieChart,
  Radio,
  TrendingUp,
  Tv,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import {
  WORKSPACE_GROUPS,
  WORKSPACE_SECTION,
  type WorkspaceIconKey,
} from '@/lib/copy/modules'
import { cn } from '@/lib/utils'

/**
 * Icon per capability. Keyed by the closed union in `copy/modules.ts`, so a
 * new item without an icon fails `tsc` rather than rendering an empty slot.
 */
const ICONS: Record<WorkspaceIconKey, LucideIcon> = {
  terminal: LineChart,
  network: Network,
  tv: Tv,
  chat: MessagesSquare,
  emil: Bot,
  markets: BarChart3,
  orders: ListOrdered,
  positions: TrendingUp,
  builder: Cpu,
  lab: Brain,
  signals: Radio,
  dashboard: PieChart,
  performance: BarChart3,
  history: Activity,
  wallet: Wallet,
  journal: NotebookPen,
  alerts: Bell,
  calendar: CalendarDays,
  news: Newspaper,
  widgets: LayoutGrid,
  heatmap: Grid3x3,
  education: GraduationCap,
  support: LifeBuoy,
}

/** Literal class names, for the same content-scan reason as <Panel>. */
const HUES = ['hue-1', 'hue-2', 'hue-3', 'hue-4', 'hue-5', 'hue-6'] as const

/**
 * The three areas of the terminal workspace, listed as capabilities.
 *
 * This describes the surface rather than reimplementing it — the terminal is a
 * separate application (PLAN.md § Scope). No live state, no simulated prices.
 */
export function WorkspaceMap() {
  return (
    <Section grid className="border-b border-line-1">
      <SectionHeader
        eyebrow={WORKSPACE_SECTION.eyebrow}
        title={WORKSPACE_SECTION.heading}
        lead={WORKSPACE_SECTION.lead}
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:items-start">
        {WORKSPACE_GROUPS.map((group) => (
          <Panel
            key={group.label}
            className={cn('flex flex-col gap-5 p-6', HUES[group.hue - 1])}
          >
            <div className="tint-rule flex flex-col gap-1.5 border-b pb-4">
              <h3 className="tint-ink text-eyebrow font-medium uppercase">{group.label}</h3>
              <p className="text-[0.875rem] leading-relaxed text-steel-300">{group.blurb}</p>
            </div>

            <ul className="flex flex-col gap-4">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon]
                return (
                  <li key={item.label} className="flex items-start gap-3">
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      className="tint-ink mt-[0.15rem] shrink-0"
                      aria-hidden
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[0.9375rem] font-medium leading-snug text-steel-100">
                        {item.label}
                      </span>
                      <span className="text-[0.8125rem] leading-relaxed text-steel-500">
                        {item.blurb}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Panel>
        ))}
      </div>

      <p className="mt-6 text-[0.8125rem] leading-relaxed text-steel-500">
        {WORKSPACE_SECTION.note}
      </p>
    </Section>
  )
}
