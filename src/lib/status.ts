export type ComponentState = 'operational' | 'degraded' | 'outage' | 'maintenance'

export type StatusComponent = {
  id: string
  name: string
  description: string
  state: ComponentState
}

/**
 * Single source for the status page and the /api/status JSON endpoint.
 * Point this at a real monitoring feed by replacing `getStatus`.
 */
export const STATUS_COMPONENTS: readonly StatusComponent[] = [
  { id: 'terminal', name: 'Raptor Terminal', description: 'Trading surface and workspaces.', state: 'operational' },
  { id: 'market-data', name: 'Market Data', description: 'Snapshot and streaming price feeds.', state: 'operational' },
  { id: 'execution', name: 'Execution', description: 'Order management and the risk engine.', state: 'operational' },
  { id: 'portal', name: 'Client Portal', description: 'Onboarding, verification and funding.', state: 'operational' },
  { id: 'crm', name: 'CRM & Back Office', description: 'Client records and operations.', state: 'operational' },
  { id: 'api-rest', name: 'API — REST', description: 'Versioned JSON endpoints.', state: 'operational' },
  { id: 'api-ws', name: 'API — WebSocket', description: 'Streaming channels.', state: 'operational' },
  { id: 'api-fix', name: 'API — FIX', description: 'Institutional session connectivity.', state: 'operational' },
  { id: 'webhooks', name: 'Webhooks', description: 'Event delivery and replay.', state: 'operational' },
]

export type StatusPayload = {
  updatedAt: string
  overall: ComponentState
  components: readonly StatusComponent[]
}

export function getStatus(): StatusPayload {
  const states = STATUS_COMPONENTS.map((c) => c.state)
  const overall: ComponentState = states.includes('outage')
    ? 'outage'
    : states.includes('degraded')
      ? 'degraded'
      : states.includes('maintenance')
        ? 'maintenance'
        : 'operational'

  return { updatedAt: new Date().toISOString(), overall, components: STATUS_COMPONENTS }
}

export const STATE_LABELS: Record<ComponentState, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
  maintenance: 'Maintenance',
}
