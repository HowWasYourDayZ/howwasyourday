import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const alt = 'How Was Your Day — talk it through with a real person. 8 minutes is enough.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand palette: PROJECT.md §2 (orange #E8743B, ink #3B2F2A, peach #FFF6EF).
const MARK = 'M168 40H344A128 128 0 0 1 472 168V280A128 128 0 0 1 344 408H236C196 450 140 474 80 476C114 450 128 418 130 392A128 128 0 0 1 40 280V168A128 128 0 0 1 168 40Z'

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 90px', background: 'linear-gradient(160deg, #FFF6EF 0%, #FFFFFF 60%)', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="120" height="120" viewBox="32 32 448 452">
            <path fill="#E8743B" d={MARK} />
            <path fill="#FFFFFF" d="M256 158A66 66 0 1 1 255.99 158Z" />
            <path d="M356.0 224.0L382.0 224.0M326.7 294.7L345.1 313.1M256.0 324.0L256.0 350.0M185.3 294.7L166.9 313.1M156.0 224.0L130.0 224.0M185.3 153.3L166.9 134.9M256.0 124.0L256.0 98.0M326.7 153.3L345.1 134.9" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" fill="none" />
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
