// Offset of UK local time (Europe/London: GMT in winter, BST in summer) from
// UTC at `at`, in ms. Used for admin "today"/"this month" boundaries.
export function ukOffsetMs(at: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at)
  const n = (t: string) => Number(parts.find(p => p.type === t)?.value)
  const local = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'))
  return local - Math.floor(at.getTime() / 1000) * 1000
}
