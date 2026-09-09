/**
 * Realistic but fictional API examples. Hostnames, keys and identifiers are
 * illustrative — nothing here is a live endpoint or a real credential.
 */

export const API_EXAMPLES = [
  {
    id: 'rest',
    label: 'REST',
    code: `# Place an order
curl -X POST https://api.777raptor.example/v1/orders \\
  -H "Authorization: Bearer rk_live_EXAMPLE_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: 9f2c1a7e-4b10-4d3a-8e21-77a0c5d1b402" \\
  -d '{
    "account_id": "acc_8HQ2XV",
    "symbol": "EURUSD",
    "side": "buy",
    "type": "limit",
    "quantity": 0.40,
    "price": 1.08420,
    "time_in_force": "gtc"
  }'

# 201 Created
{
  "id": "ord_4KD7NP",
  "status": "working",
  "symbol": "EURUSD",
  "side": "buy",
  "quantity": 0.40,
  "filled_quantity": 0.00,
  "price": 1.08420,
  "risk_checks": ["exposure", "concentration", "margin"],
  "created_at": "2026-05-28T09:14:02.118Z"
}`,
  },
  {
    id: 'websocket',
    label: 'WebSocket',
    code: `// Subscribe to prices and position updates
const socket = new WebSocket('wss://stream.777raptor.example/v1')

socket.onopen = () => {
  socket.send(JSON.stringify({
    op: 'auth',
    token: 'rk_live_EXAMPLE_KEY',
  }))
  socket.send(JSON.stringify({
    op: 'subscribe',
    channels: ['prices', 'positions'],
    symbols: ['EURUSD', 'XAUUSD', 'NAS100'],
  }))
}

socket.onmessage = (event) => {
  const message = JSON.parse(event.data)
  // { channel: 'prices', symbol: 'EURUSD', bid: 1.08646,
  //   ask: 1.08654, ts: 1780000442118 }
  if (message.channel === 'prices') {
    render(message.symbol, message.bid, message.ask)
  }
}

// Heartbeats every 15s; reconnect with the last sequence number.`,
  },
  {
    id: 'fix',
    label: 'FIX',
    code: `# New Order Single (35=D) — FIX 4.4
8=FIX.4.4|9=178|35=D|34=812|49=CLIENTDESK|52=20260528-09:14:02.118|
56=RAPTOR|11=ord-4KD7NP|55=EURUSD|54=1|38=40000|40=2|44=1.08420|
59=1|60=20260528-09:14:02.118|10=094|

# Execution Report (35=8) — partial fill
8=FIX.4.4|9=241|35=8|34=1904|49=RAPTOR|52=20260528-09:14:02.442|
56=CLIENTDESK|6=1.08420|11=ord-4KD7NP|14=20000|17=exec-9QF2TT|
31=1.08420|32=20000|37=ord-4KD7NP|38=40000|39=1|54=1|55=EURUSD|
150=F|151=20000|10=017|

# Session: TLS, logon 35=A with HeartBtInt 30, sequence reset on request.`,
  },
  {
    id: 'webhook',
    label: 'Webhook',
    code: `POST /your-endpoint HTTP/1.1
Host: ops.yourbroker.example
Content-Type: application/json
X-Raptor-Event: position.closed
X-Raptor-Delivery: dlv_2NX8QK
X-Raptor-Signature: t=1780000442,v1=8b41c0e9d7a2f6...

{
  "event": "position.closed",
  "created_at": "2026-05-28T09:41:02.118Z",
  "data": {
    "position_id": "pos_7RT2WY",
    "account_id": "acc_8HQ2XV",
    "symbol": "EURUSD",
    "side": "buy",
    "quantity": 0.40,
    "entry_price": 1.08420,
    "exit_price": 1.08661,
    "reason": "client_close"
  }
}

// Verify v1 as HMAC-SHA256 of "{t}.{body}" with your signing secret.
// Retries: 5 attempts with exponential backoff. Deliveries are replayable.`,
  },
] as const
