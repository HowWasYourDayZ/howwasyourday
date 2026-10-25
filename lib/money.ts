// Money is GBP everywhere, and every amount in code and in the DB is an
// INTEGER number of PENCE (wallet_balance, amount_held, rate_per_min, fees,
// earnings, payouts). Only the display layer turns pence into "£7.50".
// Never store or compute in pounds.

export const CURRENCY = 'GBP'

// 700 → "£7", 750 → "£7.50", 123456 → "£1,234.56"
export function formatGBP(pence: number | string | null | undefined): string {
  const p = Math.round(Number(pence) || 0)
  const abs = Math.abs(p)
  const pounds = abs / 100
  const body = abs % 100 === 0
    ? pounds.toLocaleString('en-GB')
    : pounds.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${p < 0 ? '-' : ''}£${body}`
}

// Per-minute rate: 40 → "40p/min", 120 → "£1.20/min"
export function formatRate(pencePerMin: number | string | null | undefined): string {
  const p = Math.round(Number(pencePerMin) || 0)
  return p < 100 ? `${p}p/min` : `${formatGBP(p)}/min`
}

// Form input in pounds ("7.50") → pence (750). NaN for anything unparseable.
export function poundsToPence(input: string | number): number {
  const n = typeof input === 'number' ? input : Number(String(input).replace(/[£,\s]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) : NaN
}

// Pence → pounds for a form field value: 750 → "7.50", 700 → "7"
export function penceToPoundsInput(pence: number): string {
  return pence % 100 === 0 ? String(pence / 100) : (pence / 100).toFixed(2)
}
