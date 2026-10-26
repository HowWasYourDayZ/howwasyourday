// Google Play store assets from the LIVE site (run in GitHub Actions — it can
// reach www.howwasyourday.live). Real app screens + a caption; feature graphic 1024x500.
//   node scripts/store-assets.mjs   (needs playwright + chromium)
import { chromium } from 'playwright-core'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'

const OUT = process.env.OUT || 'store-assets'
mkdirSync(`${OUT}/raw`, { recursive: true })
const BASE = process.env.BASE || 'https://www.howwasyourday.live'
// Brand font, embedded (no Google Fonts request).
const NUNITO = readFileSync('node_modules/@fontsource/nunito/files/nunito-latin-900-normal.woff2').toString('base64')
const FONT = `@font-face{font-family:Nunito;font-weight:700 900;src:url(data:font/woff2;base64,${NUNITO}) format('woff2')}`
const SHOTS = [
  { path: '/', file: '01-home', caption: 'How was your day?\n8 minutes is enough' },
  { path: '/talk', file: '02-talk', caption: 'Say what’s on your mind,\nby text or voice' },
  { path: '/how-it-works', file: '03-how', caption: 'Talk now or\nbook a time' },
  { path: '/pricing', file: '04-pricing', caption: 'Simple prices in pounds.\nShown before you start' },
  { path: '/safeguarding', file: '05-safety', caption: 'Screened listeners.\nYour details stay private' },
  { path: '/peer-support', file: '06-peer', caption: 'Real people who’ve\nbeen there too' },
]
// Floating widgets that would cover content in a still screenshot.
const HIDE = `[class*="whatsapp" i],[class*="WhatsApp"],a[href*="wa.me"],[class*="floating" i],[class*="float-cta" i]{display:none!important}`

// The runner's own Chrome (Playwright's bundled browsers don't support every runner OS).
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const phone = await browser.newContext({
  viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
})
for (const s of SHOTS) {
  const page = await phone.newPage()
  await page.goto(BASE + s.path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await page.addStyleTag({ content: HIDE }).catch(() => {})
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${OUT}/raw/${s.file}.png` }) // 1080 x 1920
  await page.close()
  console.log('raw', s.file)
}

// Captioned 1080x1920 (9:16) store screenshots.
const frame = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
for (const s of SHOTS) {
  const img = readFileSync(`${OUT}/raw/${s.file}.png`).toString('base64')
  const html = `<!doctype html><html><head><meta charset="utf-8">
  <style>${FONT}*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:Nunito,sans-serif;
  background:linear-gradient(170deg,#FFE9DA 0%,#FFF6EF 45%,#FFFFFF 100%);display:flex;flex-direction:column;align-items:center}
  h1{color:#3B2F2A;font-size:68px;line-height:1.12;font-weight:900;text-align:center;margin:96px 60px 64px;white-space:pre-line}
  .phone{width:780px;height:1387px;border-radius:56px;overflow:hidden;border:14px solid #3B2F2A;box-shadow:0 40px 90px rgba(59,47,42,.25);background:#fff}
  .phone img{width:100%;display:block}</style></head>
  <body><h1>${s.caption}</h1><div class="phone"><img src="data:image/png;base64,${img}"></div></body></html>`
  const page = await frame.newPage()
  await page.setContent(html, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/${s.file}.png` })
  await page.close()
  console.log('framed', s.file)
}

// Feature graphic 1024x500.
const logo = readFileSync('logo/svg/logo-horizontal.svg').toString('base64')
const fg = await browser.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 })
const page = await fg.newPage()
await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<style>${FONT}*{margin:0;box-sizing:border-box}body{width:1024px;height:500px;overflow:hidden;font-family:Nunito,sans-serif;
background:radial-gradient(ellipse 80% 90% at 90% 0%,#FFE1CC 0%,#FFF6EF 45%,#FFFFFF 80%);display:flex;flex-direction:column;justify-content:center;padding:0 80px}
img{height:120px;width:auto;margin-bottom:40px}
h2{color:#3B2F2A;font-size:44px;font-weight:900;line-height:1.1;letter-spacing:-1px}
h2 span{color:#E8743B}
p{color:#6E5B50;font-size:26px;font-weight:700;margin-top:16px}</style></head>
<body><img src="data:image/svg+xml;base64,${logo}"><h2>Talk it through. <span>8 minutes is enough.</span></h2>
<p>A real person who listens · text or voice · UK</p></body></html>`, { waitUntil: 'networkidle' }).catch(() => {})
await page.waitForTimeout(800)
await page.screenshot({ path: `${OUT}/feature-graphic-1024x500.png` })
writeFileSync(`${OUT}/app-icon-512.png`, readFileSync('logo/png/app-icon-512.png'))
await browser.close()
console.log('done')
