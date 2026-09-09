/// <reference lib="webworker" />
import { PriceEngine, type Tick } from './priceEngine'
import { INSTRUMENTS } from './instruments'

export type WorkerRequest =
  | { type: 'start'; seed: number; symbols?: readonly string[] }
  | { type: 'stop' }

export type WorkerResponse = { type: 'ticks'; ticks: Tick[] }

let timer: ReturnType<typeof setInterval> | null = null

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const message = event.data

  if (message.type === 'stop') {
    if (timer !== null) clearInterval(timer)
    timer = null
    return
  }

  if (message.type === 'start') {
    if (timer !== null) clearInterval(timer)
    const wanted = message.symbols
    const instruments = wanted
      ? INSTRUMENTS.filter((i) => wanted.includes(i.symbol))
      : INSTRUMENTS
    const engine = new PriceEngine(message.seed, instruments)

    timer = setInterval(() => {
      const response: WorkerResponse = { type: 'ticks', ticks: engine.step() }
      self.postMessage(response)
    }, PriceEngine.tickMs)
  }
})
