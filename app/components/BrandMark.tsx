// The How Was Your Day mark (logo/svg/mark.svg) as a small home link for app-screen top bars.
export default function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <a href="/" aria-label="How Was Your Day — home" style={{ display: 'inline-flex', flexShrink: 0, lineHeight: 0 }}>
      <img src="/brand/mark.svg" alt="" width={size} height={size} style={{ display: 'block' }} />
    </a>
  )
}
