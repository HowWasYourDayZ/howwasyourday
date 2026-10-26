import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const alt = 'How Was Your Day — talk it through with a real person. 8 minutes is enough.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand palette: PROJECT.md §2 (orange #E8743B, ink #3B2F2A, peach #FFF6EF).
const MARK = 'M20 4H44A16 16 0 0 1 60 20V34A16 16 0 0 1 44 50H25L14 60L17 50H20A16 16 0 0 1 4 34V20A16 16 0 0 1 20 4Z'

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 90px', background: 'linear-gradient(160deg, #FFF6EF 0%, #FFFFFF 60%)', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 64 64">
            <path fill="#E8743B" d={MARK} />
            <path fill="#FFFFFF" d="M22 37A10 10 0 0 1 42 37Z" />
            <path d="M14 37H50M32 22.5V18.5M42.6 26.4L45.4 23.6M21.4 26.4L18.6 23.6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 28, fontSize: 58, fontWeight: 800, lineHeight: 1.05 }}>
            <span style={{ color: '#3B2F2A' }}>How Was</span>
            <span style={{ color: '#E8743B' }}>Your Day</span>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#3B2F2A', marginTop: 56, letterSpacing: '-1px' }}>
          Talk it through. 8 minutes is enough.
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#6E5B50', marginTop: 20 }}>
          A real person who listens · text or voice · UK · howwasyourday.live
        </div>
      </div>
    ),
    { ...size }
  )
}
