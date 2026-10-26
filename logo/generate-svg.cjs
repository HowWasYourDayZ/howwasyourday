// Generates the How Was Your Day logo system as pure-vector SVGs (text outlined to paths,
// so no font is needed to display them). Run from the repo root:
//   npm i --no-save opentype.js@1.3.4 && node logo/generate-svg.cjs   (then node logo/export.mjs)
const fs = require('fs'), path = require('path'), opentype = require('opentype.js')
const OUT = path.join(__dirname, 'svg')
const font = opentype.loadSync(path.join(__dirname, '../node_modules/@fontsource/nunito/files/nunito-latin-900-normal.woff'))
const C = { sun: '#E8743B', ink: '#3B2F2A', white: '#FFFFFF' }

// ── Mark, 512 grid: a speech bubble (talk) holding a sun (your day) — circle + 8 rays. ──
const BUBBLE = 'M168 40H344A128 128 0 0 1 472 168V280A128 128 0 0 1 344 408H236C196 450 140 474 80 476C114 450 128 418 130 392A128 128 0 0 1 40 280V168A128 128 0 0 1 168 40Z'
const SUN = 'M256 158A66 66 0 1 1 255.99 158Z'
const LINES = 'M356.0 224.0L382.0 224.0M326.7 294.7L345.1 313.1M256.0 324.0L256.0 350.0M185.3 294.7L166.9 313.1M156.0 224.0L130.0 224.0M185.3 153.3L166.9 134.9M256.0 124.0L256.0 98.0M326.7 153.3L345.1 134.9'
const mark = (bubble, inner) =>
  `<path fill="${bubble}" d="${BUBBLE}"/><path fill="${inner}" d="${SUN}"/>` +
  `<path fill="none" stroke="${inner}" stroke-width="24" stroke-linecap="round" d="${LINES}"/>`
const MB = { x: 40, y: 40, w: 432, h: 436 } // drawn bounds of the mark

const svg = (vb, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`
const write = (name, s) => fs.writeFileSync(path.join(OUT, name), s)

// text → outlined path; returns {d, w}
function text(str, x, baseline, size) {
  const p = font.getPath(str, x, baseline, size)
  return { d: p.toPathData(2), w: font.getAdvanceWidth(str, size), bb: p.getBoundingBox() }
}

// Marks
const vbMark = `${MB.x - 8} ${MB.y - 8} ${MB.w + 16} ${MB.h + 16}`
write('mark.svg', svg(vbMark, mark(C.sun, C.white), 'How Was Your Day'))
write('mark-white.svg', svg(vbMark, mark(C.white, C.sun), 'How Was Your Day'))
write('mark-ink.svg', svg(vbMark, mark(C.ink, C.white), 'How Was Your Day'))

// App icon (square, full bleed — iOS/Play/web; platforms round the corners themselves)
const iconMark = `<g transform="translate(512 528) scale(1.32) translate(-256 -258)">${mark(C.white, C.sun)}</g>`
write('app-icon.svg', svg('0 0 1024 1024', `<rect width="1024" height="1024" fill="${C.sun}"/>${iconMark}`, 'How Was Your Day'))
// Rounded app icon (for places that show the icon as-is, e.g. docs, store graphics)
write('app-icon-rounded.svg', svg('0 0 1024 1024', `<rect width="1024" height="1024" rx="228" fill="${C.sun}"/>${iconMark}`, 'How Was Your Day'))
// Android adaptive-icon foreground: transparent, mark inside the 66% safe zone
write('app-icon-foreground.svg', svg('0 0 1024 1024', `<g transform="translate(512 528) scale(1.06) translate(-256 -258)">${mark(C.white, C.sun)}</g>`, 'How Was Your Day'))

// Lockups
function horizontal(textColA, textColB, bubble, inner) {
  const size = 236, gap = 72, x0 = MB.x + MB.w + gap
  const cap = 0.705 * size, baseline = 258 + cap / 2
  const a = text('How Was ', x0, baseline, size)
  const b = text('Your Day', x0 + a.w, baseline, size)
  const right = b.bb.x2 + 8
  return svg(`${MB.x - 8} ${MB.y - 8} ${right - MB.x + 16} ${MB.h + 16}`,
    mark(bubble, inner) + `<path fill="${textColA}" d="${a.d}"/><path fill="${textColB}" d="${b.d}"/>`, 'How Was Your Day')
}
function stacked(textColA, textColB, bubble, inner) {
  const size = 200, gap = 64, x0 = MB.x + MB.w + gap
  const l1 = text('How Was', x0, 236, size), l2 = text('Your Day', x0, 236 + size * 1.02, size)
  const right = Math.max(l1.bb.x2, l2.bb.x2) + 8
  return svg(`${MB.x - 8} ${MB.y - 8} ${right - MB.x + 16} ${MB.h + 16}`,
    mark(bubble, inner) + `<path fill="${textColA}" d="${l1.d}"/><path fill="${textColB}" d="${l2.d}"/>`, 'How Was Your Day')
}
write('logo-horizontal.svg', horizontal(C.ink, C.sun, C.sun, C.white))
write('logo-horizontal-white.svg', horizontal(C.white, C.white, C.white, C.sun))
write('logo-stacked.svg', stacked(C.ink, C.sun, C.sun, C.white))
write('logo-stacked-white.svg', stacked(C.white, C.white, C.white, C.sun))
// Wordmark only
{
  const size = 236, a = text('How Was ', 0, 200, size), b = text('Your Day', a.w, 200, size)
  write('wordmark.svg', svg(`-8 ${a.bb.y1 - 12} ${b.bb.x2 + 16} ${Math.max(a.bb.y2, b.bb.y2) - a.bb.y1 + 24}`,
    `<path fill="${C.ink}" d="${a.d}"/><path fill="${C.sun}" d="${b.d}"/>`, 'How Was Your Day'))
}
console.log(fs.readdirSync(OUT).join('\n'))
