// Generates the How Was Your Day logo system as pure-vector SVGs (text outlined to paths,
// so no font is needed to display them). Run from the repo root:
//   npm i --no-save opentype.js@1.3.4 && node logo/generate-svg.cjs   (then node logo/export.mjs)
const fs = require('fs'), path = require('path'), opentype = require('opentype.js')
const OUT = path.join(__dirname, 'svg')
const font = opentype.loadSync(path.join(__dirname, '../node_modules/@fontsource/lora/files/lora-latin-700-normal.woff'))
// Brand board 2026-11-15 (PROJECT.md §1a): cream, orange, navy.
const C = { sun: '#E65A22', ink: '#172B4D', white: '#FFFFFF', cream: '#FFF6E8' }

// ── Mark, 512 grid: a line-drawn ear (we listen) whose inner fold is a question mark
//    ("How was your day?"). Three round-capped strokes, no fill. ──
const EAR = [
  'M158 200C158 120 212 70 280 70C350 70 400 124 400 202C400 272 358 300 338 340C320 378 322 440 268 446C226 450 206 420 214 392',
  'M222 204C222 154 250 126 284 126C322 126 346 156 346 198C346 224 336 242 324 256',
  'M240 250C238 222 256 206 278 208C298 210 308 228 300 246C292 264 268 270 264 300',
]
const mark = (color, sw = 28) =>
  `<g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${EAR.map(d => `<path d="${d}"/>`).join('')}</g>`
const MB = { x: 140, y: 52, w: 278, h: 412 } // drawn bounds of the mark (incl. stroke)
const MC = { x: 279, y: 258 }                // its centre

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
write('mark.svg', svg(vbMark, mark(C.sun), 'How Was Your Day'))
write('mark-white.svg', svg(vbMark, mark(C.white), 'How Was Your Day'))
write('mark-ink.svg', svg(vbMark, mark(C.ink), 'How Was Your Day'))

// App icon (square, full bleed — iOS/Play/web; platforms round the corners themselves):
// orange ear on cream, as on the brand board. Slightly heavier stroke so it holds at 16px.
const iconMark = (s) => `<g transform="translate(512 512) scale(${s}) translate(${-MC.x} ${-MC.y})">${mark(C.sun, 34)}</g>`
write('app-icon.svg', svg('0 0 1024 1024', `<rect width="1024" height="1024" fill="${C.cream}"/>${iconMark(1.55)}`, 'How Was Your Day'))
// Rounded app icon (for places that show the icon as-is, e.g. docs, store graphics)
write('app-icon-rounded.svg', svg('0 0 1024 1024', `<rect width="1024" height="1024" rx="228" fill="${C.cream}"/>${iconMark(1.55)}`, 'How Was Your Day'))
// Android adaptive-icon foreground: transparent, mark inside the 66% safe zone (background = cream)
write('app-icon-foreground.svg', svg('0 0 1024 1024', iconMark(1.28), 'How Was Your Day'))

// Lockups
function horizontal(textColA, textColB, ear) {
  const size = 236, gap = 72, x0 = MB.x + MB.w + gap
  const cap = 0.705 * size, baseline = 258 + cap / 2
  const a = text('How Was ', x0, baseline, size)
  const b = text('Your Day?', x0 + a.w, baseline, size)
  const right = b.bb.x2 + 8
  return svg(`${MB.x - 8} ${MB.y - 8} ${right - MB.x + 16} ${MB.h + 16}`,
    mark(ear) + `<path fill="${textColA}" d="${a.d}"/><path fill="${textColB}" d="${b.d}"/>`, 'How Was Your Day')
}
function stacked(textColA, textColB, ear) {
  const size = 200, gap = 64, x0 = MB.x + MB.w + gap
  const l1 = text('How Was', x0, 236, size), l2 = text('Your Day?', x0, 236 + size * 1.02, size)
  const right = Math.max(l1.bb.x2, l2.bb.x2) + 8
  return svg(`${MB.x - 8} ${MB.y - 8} ${right - MB.x + 16} ${MB.h + 16}`,
    mark(ear) + `<path fill="${textColA}" d="${l1.d}"/><path fill="${textColB}" d="${l2.d}"/>`, 'How Was Your Day')
}
write('logo-horizontal.svg', horizontal(C.ink, C.ink, C.sun))
write('logo-horizontal-white.svg', horizontal(C.white, C.white, C.sun))
write('logo-stacked.svg', stacked(C.ink, C.ink, C.sun))
write('logo-stacked-white.svg', stacked(C.white, C.white, C.sun))
// Wordmark only
{
  const size = 236, a = text('How Was ', 0, 200, size), b = text('Your Day?', a.w, 200, size)
  write('wordmark.svg', svg(`-8 ${a.bb.y1 - 12} ${b.bb.x2 + 16} ${Math.max(a.bb.y2, b.bb.y2) - a.bb.y1 + 24}`,
    `<path fill="${C.ink}" d="${a.d}"/><path fill="${C.ink}" d="${b.d}"/>`, 'How Was Your Day'))
}
console.log(fs.readdirSync(OUT).join('\n'))
