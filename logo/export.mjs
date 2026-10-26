// Exports every PNG/ICO in the How Was Your Day logo system from logo/svg/*.svg and
// copies them to where the website and Android app use them. Run from the repo root:
//   node logo/export.mjs        (needs Playwright's Chromium and ImageMagick `convert`)
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { execFileSync } from 'child_process'

const SVG = 'logo/svg', PNG = 'logo/png'
mkdirSync(PNG, { recursive: true })
const svg = f => readFileSync(`${SVG}/${f}`, 'utf8')
const ratio = f => { const [, , w, h] = svg(f).match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number); return w / h }

// CHROME_PATH lets you point at any installed Chromium if Playwright's own isn't downloaded.
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
const page = await browser.newPage()
// Render an SVG to a transparent PNG of exactly w×h (contain), optionally on a background.
async function render(file, out, w, h = Math.round(w / ratio(file)), { bg = 'transparent', pad = 0, round = false } = {}) {
  await page.setViewportSize({ width: w, height: h })
  const inner = svg(file).replace('<svg ', `<svg width="${w - 2 * pad}" height="${h - 2 * pad}" preserveAspectRatio="xMidYMid meet" `)
  await page.setContent(`<html><body style="margin:0;background:transparent"><div id="x" style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;background:${bg};${round ? 'border-radius:50%;overflow:hidden;' : ''}">${inner}</div></body></html>`)
  await (await page.$('#x')).screenshot({ path: out, omitBackground: true })
}

// 1. Master PNGs (transparent) at high resolution
for (const f of ['logo-horizontal', 'logo-horizontal-white', 'logo-stacked', 'logo-stacked-white', 'wordmark'])
  for (const w of [600, 1200, 2400]) await render(`${f}.svg`, `${PNG}/${f}-${w}w.png`, w)
for (const f of ['mark', 'mark-white', 'mark-ink'])
  for (const s of [64, 128, 256, 512, 1024, 2048]) await render(`${f}.svg`, `${PNG}/${f}-${s}.png`, s, s)
for (const s of [16, 32, 48, 180, 192, 512, 1024]) await render('app-icon.svg', `${PNG}/app-icon-${s}.png`, s, s)
await render('app-icon-rounded.svg', `${PNG}/app-icon-rounded-1024.png`, 1024, 1024)
await render('app-icon-foreground.svg', `${PNG}/app-icon-foreground-1024.png`, 1024, 1024)
execFileSync('convert', [`${PNG}/app-icon-16.png`, `${PNG}/app-icon-32.png`, `${PNG}/app-icon-48.png`, `${PNG}/favicon.ico`])

// 2. Website (public/)
mkdirSync('public/brand', { recursive: true })
for (const f of ['mark.svg', 'mark-white.svg', 'app-icon.svg', 'logo-horizontal.svg', 'logo-stacked.svg', 'logo-horizontal-white.svg'])
  copyFileSync(`${SVG}/${f}`, `public/brand/${f}`)
await render('logo-stacked.svg', 'public/brand/logo.png', 960)       // nav/header logo used by every page
copyFileSync('public/brand/logo.png', 'public/logo.png')            // old URL, kept for emails/old links
await render('logo-horizontal.svg', 'public/logo-horizontal.png', 1200)
copyFileSync(`${PNG}/app-icon-192.png`, 'public/icon-192.png')
copyFileSync(`${PNG}/app-icon-512.png`, 'public/icon-512.png')
copyFileSync(`${PNG}/app-icon-180.png`, 'public/apple-touch-icon.png')
copyFileSync(`${PNG}/favicon.ico`, 'public/favicon.ico')

// 3. Android app (mobile/ = Capacitor app; android/ = old TWA kept for history)
const DENS = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 }
for (const [d, k] of Object.entries(DENS)) {
  for (const root of ['mobile/android/app/src/main/res', 'android/app/src/main/res']) {
    await render('app-icon-rounded.svg', `${root}/mipmap-${d}/ic_launcher.png`, 48 * k, 48 * k)
  }
  const r = 'mobile/android/app/src/main/res'
  await render('app-icon.svg', `${r}/mipmap-${d}/ic_launcher_round.png`, 48 * k, 48 * k, { round: true })
  await render('app-icon-foreground.svg', `${r}/mipmap-${d}/ic_launcher_foreground.png`, 108 * k, 108 * k)
}
// Splash screens: stacked logo centred on white
const splash = [['drawable', 480, 320], ['drawable-port-mdpi', 320, 480], ['drawable-port-hdpi', 480, 800],
  ['drawable-port-xhdpi', 720, 1280], ['drawable-port-xxhdpi', 960, 1600], ['drawable-port-xxxhdpi', 1280, 1920],
  ['drawable-land-mdpi', 480, 320], ['drawable-land-hdpi', 800, 480], ['drawable-land-xhdpi', 1280, 720],
  ['drawable-land-xxhdpi', 1600, 960], ['drawable-land-xxxhdpi', 1920, 1280]]
for (const [dir, w, h] of splash) {
  const lw = Math.round(Math.min(w * 0.62, h * 0.9 * ratio('logo-stacked.svg')))
  const lh = Math.round(lw / ratio('logo-stacked.svg'))
  await render('logo-stacked.svg', '/tmp/hwyd-splash-logo.png', lw, lh)
  const b64 = readFileSync('/tmp/hwyd-splash-logo.png').toString('base64')
  await page.setViewportSize({ width: w, height: h })
  await page.setContent(`<body style="margin:0"><div id="x" style="width:${w}px;height:${h}px;background:#fff;display:flex;align-items:center;justify-content:center"><img src="data:image/png;base64,${b64}" width="${lw}" height="${lh}"></div></body>`)
  await (await page.$('#x')).screenshot({ path: `mobile/android/app/src/main/res/${dir}/splash.png` })
}
writeFileSync('mobile/android/app/src/main/res/values/ic_launcher_background.xml',
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#E8743B</color>\n</resources>\n')

await browser.close()
console.log('logo exported')
