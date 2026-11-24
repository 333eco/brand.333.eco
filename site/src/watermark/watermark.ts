// /watermark/ — B-Watermark℠, drawn by the recipe it documents: ../../../qr/bqr.ts and ../../../qr/fingerprint.ts, the bytes brand.lock hashes.
// ⛔ Nothing here leaves the device: the pictures are drawn on this page, the autograph is not kept, and the dots are read by this page's own code.
// ⛔ Every code opens a page of ours: a visitor can check any of them with a phone.
import QRCode from "qrcode";
import { bqrOwnerInk, bqrPlacement, drawBqr, paintBqr, BQR_AUTOGRAPH_PEN, BQR_AUTOGRAPH_POINTS, BQR_PAD_H, BQR_PAD_W, isAutograph, type BqrAutograph, type BqrOptions } from "../../../qr/bqr";
import { codedOf, drawnFor, fingerprint, GRID, gray, heartBox, readCoded, register, sampleCoded, type Box, type Print } from "../../../qr/fingerprint";

const LINK = "https://b.333.eco/", PAGE = "https://brand.333.eco/watermark/", OWNER = "MA" as const;
const byId = <T extends HTMLElement>(id: string): T => { const n = document.getElementById(id); if (!n) throw new Error(`watermark.ts: #${id} is not on this page`); return n as T; };
const canvas = (w: number, h: number) => Object.assign(document.createElement("canvas"), { width: w, height: h });
const ctx = (c: HTMLCanvasElement) => { const g = c.getContext("2d", { willReadFrequently: true })!; g.imageSmoothingQuality = "high"; return g; };
const el = (tag: string, cls = "", text = "") => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
const label = (c: HTMLCanvasElement, text: string) => { c.setAttribute("role", "img"); c.setAttribute("aria-label", text); return c; };

// ── two drawn pictures (no photo: nobody's face is an example) ──
const W = 960, H = 720, HEART = Math.round(H * 0.22), AT: Box = { s: HEART, x: W - HEART - Math.round(HEART * 0.12), y: H - HEART - Math.round(HEART * 0.12) };
function field(): HTMLCanvasElement {
    const c = canvas(W, H), g = ctx(c), sky = g.createLinearGradient(0, 0, 0, 420); sky.addColorStop(0, "#f6d9a6"); sky.addColorStop(1, "#e08f55");
    g.fillStyle = sky; g.fillRect(0, 0, W, H); g.fillStyle = "#fdf0c8"; g.beginPath(); g.arc(690, 250, 78, 0, 7); g.fill();
    g.fillStyle = "#4f7a3a"; g.fillRect(0, 400, W, 320); g.fillStyle = "#3c622d"; g.beginPath(); g.moveTo(0, 470); g.bezierCurveTo(200, 410, 380, 520, 560, 460); g.bezierCurveTo(720, 420, 840, 480, W, 450); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    for (const [x, y, s] of [[120, 520, 1.5], [260, 600, 1.1], [400, 540, 1.3], [540, 640, 1.6], [690, 560, 1], [60, 660, 1], [330, 690, 0.9], [610, 520, 0.8]] as const) {
        g.strokeStyle = "#28491c"; g.lineWidth = 9 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 110 * s); g.stroke();
        g.fillStyle = "#f2b21b"; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(x + Math.cos(i * 0.449) * 34 * s, y + Math.sin(i * 0.449) * 34 * s, 17 * s, 9 * s, i * 0.449, 0, 7); g.fill(); }
        g.fillStyle = "#573214"; g.beginPath(); g.arc(x, y, 25 * s, 0, 7); g.fill();
    }
    return c;
}
function lake(): HTMLCanvasElement {
    const c = canvas(W, H), g = ctx(c), sky = g.createLinearGradient(0, 0, 0, 380); sky.addColorStop(0, "#1c3558"); sky.addColorStop(1, "#8fb4c9"); g.fillStyle = sky; g.fillRect(0, 0, W, 380);
    for (const [col, pts] of [["#5f7f96", [0, 360, 180, 170, 330, 320, 470, 120, 640, 330, 800, 210, 960, 360]], ["#33505f", [0, 380, 120, 300, 260, 370, 420, 260, 560, 380, 740, 290, 960, 380]]] as [string, number[]][]) { g.fillStyle = col; g.beginPath(); g.moveTo(0, 380); for (let i = 0; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.lineTo(W, 380); g.fill(); }
    const water = g.createLinearGradient(0, 380, 0, H); water.addColorStop(0, "#a9cbd6"); water.addColorStop(1, "#dfe9e6"); g.fillStyle = water; g.fillRect(0, 380, W, H - 380);
    g.fillStyle = "#24323a"; g.beginPath(); g.moveTo(180, 560); g.quadraticCurveTo(300, 610, 430, 560); g.quadraticCurveTo(300, 640, 180, 560); g.fill();
    return c;
}
// ── a made-up autograph, until the visitor draws one ──
const MADE_UP: BqrAutograph = { strokes: [[[6, 50], [12, 30], [20, 10], [26, 8], [24, 24], [16, 44], [12, 52], [22, 52], [34, 44]], [[38, 36], [36, 48], [42, 52], [48, 46]], [[40, 24], [41, 25]], [[52, 50], [54, 38], [60, 34], [62, 42], [62, 50], [68, 38], [74, 36], [74, 46], [76, 52], [82, 46], [88, 38], [84, 48], [94, 44]]] };
let hand: BqrAutograph = MADE_UP;
const modules = QRCode.create(LINK, { errorCorrectionLevel: "M" }).modules;
function heart(size: number, o: Partial<BqrOptions> & { white?: number } = {}): HTMLCanvasElement {
    const big = canvas(size * 2, size * 2), c = canvas(size, size), g = ctx(c), { white, ...rest } = o;
    paintBqr(ctx(big), modules, LINK, { size: size * 2, owner: OWNER, style: "outline", ground: "heart", lobe: "none", autograph: hand, ...rest });
    g.drawImage(big, 0, 0, size, size);
    if (white !== undefined) {   // the white inside the heart let through, its ink whole: how much ink a pixel holds is read from the ink's darkest channel
        const ink = [1, 3, 5].map((i) => parseInt(bqrOwnerInk(OWNER).slice(i, i + 2), 16)), k = ink.indexOf(Math.min(...ink)), im = g.getImageData(0, 0, size, size), d = im.data;
        for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const t = Math.max(0, Math.min(1, (255 - d[i + k]) / (255 - ink[k]))), a = white * (1 - t) + t; for (let j = 0; j < 3; j++) d[i + j] = Math.round((255 * white * (1 - t) + ink[j] * t) / a); d[i + 3] = Math.round(d[i + 3] * a); }
        g.putImageData(im, 0, 0);
    }
    return c;
}
const printOf = (c: HTMLCanvasElement): Print => fingerprint(ctx(c).getImageData(0, 0, W, H).data, W, H, AT);
const copyOf = (c: HTMLCanvasElement) => { const o = canvas(W, H); ctx(o).drawImage(c, 0, 0); return o; };
function marked(pic: HTMLCanvasElement, of: Print): HTMLCanvasElement { const c = copyOf(pic); ctx(c).drawImage(heart(AT.s, { coded: codedOf("corner", of), white: 0.7 }), AT.x, AT.y); return c; }
/** What this page reads from the pixels alone: the code's grid, the dots, and how they stand to the picture around them. */
function readBack(c: HTMLCanvasElement): string {
    const { data } = ctx(c).getImageData(0, 0, W, H), P = bqrPlacement(AT.s, AT.x, AT.y), G = { x: 4.2112, y: 8.7062, s: 11.085 }, m = (G.s / (modules.size + 8)) * P.k, x = P.tx + G.x * P.k + 4 * m, y = P.ty + G.y * P.k + 4 * m, e = modules.size * m;
    const light = gray(data, W, H), grid = register(modules, light, [{ x, y: y + e }, { x, y }, { x: x + e, y }, { x: x + e, y: y + e }]), dots = grid && readCoded(sampleCoded(modules, light, grid));
    if (!grid || !dots) return "The dots couldn't be read.";
    const r = drawnFor(dots, data, W, H, heartBox(modules, grid));
    return r.answer === "same" ? `Drawn for a picture that looks like this one (${r.of - r.off} of ${r.of} cells agree).` : `Drawn for a picture that looks different (only ${r.of - r.off} of ${r.of} cells agree): it was drawn for another picture.`;
}
const A = field(), B = lake(), aPrint = printOf(A);
function paintAll() {
    byId("wm-hero").replaceChildren(label(marked(A, aPrint), "A drawn field of sunflowers with a heart in the corner: a code, an autograph and dots"));
    const big = heart(720, { coded: codedOf("corner", aPrint), ground: "paper" });
    byId("wm-heart").replaceChildren(label(big, "The same heart, large"));
    const own = marked(A, aPrint), pasted = copyOf(B); ctx(pasted).drawImage(heart(AT.s, { coded: codedOf("corner", aPrint), white: 0.7 }), AT.x, AT.y);
    const fig = (c: HTMLCanvasElement, words: string, alt: string) => { const f = el("figure", "wm-fig"); f.append(label(c, alt), el("figcaption", "note", words)); return f; };
    byId("wm-compare").replaceChildren(fig(own, readBack(own), "The picture the heart was drawn for"), fig(pasted, readBack(pasted), "Another picture, with the same heart copied onto it"));
    // the 36 cells, seen: what the dots say, over the picture
    const seen = copyOf(A), g = ctx(seen), w = W / GRID, h = H / GRID; aPrint.bits.forEach((b, i) => { const x = (i % GRID) * w, y = Math.floor(i / GRID) * h; g.fillStyle = !aPrint.seen[i] ? "rgba(255,255,255,.75)" : b ? "rgba(255,255,255,.34)" : "rgba(10,10,15,.52)"; g.fillRect(x + 1, y + 1, w - 2, h - 2); });
    byId("wm-cells").replaceChildren(label(seen, "The picture in 36 cells, each lighter or darker than the picture's middle; the cells the heart stands on are left out"));
}
// ── the four positions ──
async function positions() {
    const box = byId("wm-positions");
    for (const [name, says, text, by] of [["Point", "A B-Link, drawn by us", LINK, "us"], ["Notch", "A B-Link, drawn by an outsider through our API", LINK, "outside"], ["Standard", "Another page of ours, drawn by us", PAGE, "us"], ["Non-standard", "Another page of ours, drawn by an outsider through our API", PAGE, "outside"]] as const) {
        const c = canvas(520, 520), f = el("figure", "wm-fig"); await drawBqr(ctx(c), text, { size: 520, owner: OWNER, by });
        const cap = el("figcaption", "note"); cap.append(el("strong", "", name + ". "), says + "."); f.append(label(c, `${name}: ${says}`), cap); box.append(f);
    }
}
// ── the pad: strokes on 100 × 60, as the app keeps them. No timing, no pressure, nothing kept. ──
function pad() {
    const box = byId("wm-pad"), NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", `0 0 ${BQR_PAD_W} ${BQR_PAD_H}`); svg.setAttribute("aria-hidden", "true"); box.append(svg);
    let strokes: [number, number][][] = [], now: [number, number][] | null = null;
    const paint = () => svg.replaceChildren(...[...strokes, ...(now?.length ? [now] : [])].map((s) => { const p = document.createElementNS(NS, "path"); p.setAttribute("d", s.length === 1 ? `M${s[0]}h0.01` : `M${s.map((q) => q.join(" ")).join("L")}`); p.setAttribute("stroke-width", String(BQR_AUTOGRAPH_PEN)); return p; }));
    const add = (e: PointerEvent) => { if (!now || strokes.flat().length + now.length >= BQR_AUTOGRAPH_POINTS) return; const r = svg.getBoundingClientRect(), x = Math.max(0, Math.min(BQR_PAD_W, ((e.clientX - r.left) * BQR_PAD_W) / r.width)), y = Math.max(0, Math.min(BQR_PAD_H, ((e.clientY - r.top) * BQR_PAD_H) / r.height)), l = now[now.length - 1]; if (!l || Math.hypot(x - l[0], y - l[1]) >= 0.8) now.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]); paint(); };
    box.addEventListener("pointerdown", (e) => { e.preventDefault(); try { box.setPointerCapture(e.pointerId); } catch { /* a pointer this browser can't capture */ } now = []; add(e); });
    box.addEventListener("pointermove", (e) => { if (now) { e.preventDefault(); add(e); } });
    const end = () => { if (now?.length && strokes.length < 200) strokes.push(now); now = null; paint(); const a = { strokes }; hand = isAutograph(a) ? { strokes: strokes.map((s) => s.map(([x, y]) => [x, y] as [number, number])) } : MADE_UP; paintAll(); };
    box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
    byId("wm-clear").addEventListener("click", () => { strokes = []; now = null; hand = MADE_UP; paint(); paintAll(); });
}
paintAll(); pad(); void positions();
