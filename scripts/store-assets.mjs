// Google Play store assets from the LIVE site (run in GitHub Actions — it can
// reach www.leanon.app). Real app screens + a caption; feature graphic 1024x500.
//   node scripts/store-assets.mjs   (needs playwright + chromium)
import { chromium } from 'playwright-core'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'

const OUT = 'store-assets'
mkdirSync(`${OUT}/raw`, { recursive: true })
const BASE = 'https://www.leanon.app'
const SHOTS = [
  { path: '/', file: '01-home', caption: 'Talk to a real person,\nnot AI' },
  { path: '/talk', file: '02-talk', caption: 'Say what’s on your mind,\nby text or voice' },
  { path: '/for-women', file: '03-women', caption: 'A private space to\nbe heard' },
  { path: '/pricing', file: '04-pricing', caption: 'First 5 minutes free.\nPrice shown upfront' },
  { path: '/safeguarding', file: '05-safety', caption: 'Screened listeners.\nYour number stays private' },
  { path: '/peer-support', file: '06-peer', caption: 'Peer support from people\nwho’ve been there' },
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
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@800;900&display=swap" rel="stylesheet">
  <style>*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:Nunito,sans-serif;
  background:linear-gradient(160deg,#0F4867 0%,#1A8FA0 100%);display:flex;flex-direction:column;align-items:center}
  h1{color:#fff;font-size:68px;line-height:1.12;font-weight:900;text-align:center;margin:96px 60px 64px;white-space:pre-line}
  .phone{width:780px;height:1387px;border-radius:56px;overflow:hidden;border:14px solid #0B2F44;box-shadow:0 40px 90px rgba(0,0,0,.35);background:#fff}
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
const icon = readFileSync('public/icon-512.png').toString('base64')
const fg = await browser.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 })
const page = await fg.newPage()
await page.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1024px;height:500px;overflow:hidden;font-family:Nunito,sans-serif;
background:linear-gradient(135deg,#0F4867 0%,#1A8FA0 100%);display:flex;align-items:center;padding:0 70px;gap:56px}
.icon{width:260px;height:260px;border-radius:56px;background:#F0F7FB url(data:image/png;base64,${icon}) center/cover;box-shadow:0 24px 60px rgba(0,0,0,.3);flex-shrink:0}
h1{color:#fff;font-size:72px;font-weight:900;line-height:1}
h2{color:#FFB366;font-size:40px;font-weight:900;margin:14px 0 18px;line-height:1.15}
p{color:rgba(255,255,255,.88);font-size:26px;font-weight:700;line-height:1.4}</style></head>
<body><div class="icon"></div><div><h1>LeanOn</h1><h2>Talk to a real person,<br>not AI</h2>
<p>Screened peer listeners in India · Text or voice<br>First 5 minutes free</p></div></body></html>`, { waitUntil: 'networkidle' }).catch(() => {})
await page.waitForTimeout(800)
await page.screenshot({ path: `${OUT}/feature-graphic-1024x500.png` })
writeFileSync(`${OUT}/app-icon-512.png`, readFileSync('public/icon-512.png'))
await browser.close()
console.log('done')
