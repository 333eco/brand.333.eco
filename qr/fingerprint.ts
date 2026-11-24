/**
 * B-Fingerprint℠ (founder 2026-11-24): what the dots in a marked heart's TOP lobe say — a short fingerprint of the PICTURE the heart was drawn for
 * (⛔ never of a person), so a heart copied onto another picture is told apart by anyone, with no network. Open on purpose: this file writes it and
 * reads it, and needs nothing but `bqr.ts`.
 * ⛔ It says nothing about a person, carries no serial, no claim and no key, and none of it is secret: someone can redraw a heart for another
 *   picture. It catches a COPIED heart; the page the code opens shows the signed picture, and that decides.
 * ⛔ An edited copy of the same picture looks the same to 36 coarse cells: this never says a picture is unchanged.
 * Measured 2026-11-24 on 97 pictures, 194 posted corners at 70% white: the dots read whenever the code did (194 of 194 at 1,080 px q80, 182 of
 * 182 at 720 q70) and never called the right picture different; a heart copied onto another varied photo was told apart 144 times of 152.
 */
import { BQR_CODED_BITS, BQR_GEOMETRY, BQR_QUIET, BQR_TURNS, bqrLobeCells, bqrPlacement, bqrTurned, type BqrMatrix, type BqrPosition } from "./bqr";
export const GRID = 6, CELLS = GRID * GRID;
export type Kind = "corner" | "strip";
const KIND: Record<Kind, number> = { corner: 1, strip: 2 };   // the first four bits; any other number is not ours
export interface Box { x: number; y: number; s: number }
export interface Print { bits: number[]; seen: boolean[] }
/** 36 cells of a picture, each brighter or not than the picture's own middle; the cells the heart stands on are not seen. */
export function fingerprint(rgba: ArrayLike<number>, w: number, h: number, heart: Box | null): Print {
    const sum = new Float64Array(CELLS), n = new Float64Array(CELLS);
    for (let y = 0; y < h; y++) { const r = Math.min(GRID - 1, Math.floor(y * GRID / h)) * GRID; for (let x = 0, i = y * w * 4; x < w; x++, i += 4) { const c = r + Math.min(GRID - 1, Math.floor(x * GRID / w)); sum[c] += 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]; n[c]++; } }
    const mean = Array.from(sum, (v, i) => v / Math.max(1, n[i])), seen = mean.map(() => true);
    if (heart) {
        const p = heart.s * 0.04, x0 = (heart.x - p) * GRID / w, x1 = (heart.x + heart.s + p) * GRID / w, y0 = (heart.y - p) * GRID / h, y1 = (heart.y + heart.s + p) * GRID / h;
        for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) if (c + 1 > x0 && c < x1 && r + 1 > y0 && r < y1) seen[r * GRID + c] = false;
    }
    const used = mean.filter((_, i) => seen[i]).sort((a, b) => a - b), mid = used.length ? (used[(used.length - 1) >> 1] + used[used.length >> 1]) / 2 : 0;
    return { bits: mean.map((v, i) => (seen[i] && v > mid ? 1 : 0)), seen };
}
// ---- the error correction: BCH over GF(2^7), 40 data bits + 56, up to 8 wrong bits put right. Written here so a reader needs nothing else;
//      the same code TrustMark's BCH_SUPER is (polynomial 137), held to it by three recorded words in scripts/fingerprint.test.mjs ----
const M = 7, N = 127, T = 8, DATA = 40, ECC = 56;
const EXP = new Uint8Array(N * 2), LOG = new Uint8Array(N + 1);
for (let i = 0, x = 1; i < N; i++) { EXP[i] = EXP[i + N] = x; LOG[x] = i; x <<= 1; if (x & (1 << M)) x ^= 137; }
const mul = (a: number, b: number) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
/** The generator: the least polynomial with α¹ … α¹⁶ among its roots, highest power first. */
const GEN = (() => {
    const roots = new Set<number>();
    for (let j = 1; j <= 2 * T; j++) for (let k = 0, r = j; k < M; k++, r = (r * 2) % N) roots.add(r);
    let g = [1];
    for (const r of roots) { const n = new Array<number>(g.length + 1).fill(0); g.forEach((c, i) => { n[i] ^= c; n[i + 1] ^= mul(c, EXP[r]); }); g = n; }
    return g;
})();
export function bchEncode(data: readonly number[]): number[] {
    const r = [...data, ...new Array<number>(ECC).fill(0)];
    for (let i = 0; i < DATA; i++) if (r[i]) for (let k = 0; k <= ECC; k++) r[i + k] ^= GEN[k];
    return r.slice(DATA);
}
/** The 40 data bits, up to 8 wrong of the 96 put right; null when there are more. */
export function bchDecode(word: readonly number[]): number[] | null {
    const n = DATA + ECC, s: number[] = [];
    for (let j = 1; j <= 2 * T; j++) { let v = 0; for (let i = 0; i < n; i++) if (word[i]) v ^= EXP[(j * (n - 1 - i)) % N]; s.push(v); }
    if (s.every((v) => v === 0)) return word.slice(0, DATA);
    let c = [1], b = [1], L = 0, m = 1, bb = 1;
    for (let k = 0; k < 2 * T; k++) {
        let d = s[k]; for (let i = 1; i <= L; i++) d ^= mul(c[i] ?? 0, s[k - i]);
        if (!d) { m++; continue; }
        const t = [...c], f = EXP[(LOG[d] + N - LOG[bb]) % N];
        for (let i = 0; i < b.length; i++) c[i + m] = (c[i + m] ?? 0) ^ mul(f, b[i]);
        for (let i = 0; i < c.length; i++) c[i] ??= 0;
        if (2 * L <= k) { L = k + 1 - L; b = t; bb = d; m = 1; } else m++;
    }
    if (L > T) return null;
    const out = [...word]; let found = 0;
    for (let i = 0; i < n; i++) { const x = (N - ((n - 1 - i) % N)) % N; let v = 0; for (let k = 0; k <= L; k++) v ^= mul(c[k] ?? 0, EXP[(k * x) % N]); if (!v) { out[i] ^= 1; found++; } }
    return found === L ? out.slice(0, DATA) : null;
}
/** The 96 dots: the kind (4 bits), the 36 cells, and 56 bits that put up to 8 wrong ones right. */
export function codedOf(kind: Kind, p: Print): number[] {
    const d = [...Array.from({ length: 4 }, (_, i) => (KIND[kind] >> (3 - i)) & 1), ...p.bits];
    return [...d, ...bchEncode(d)];
}
/** The kind and cells these 96 read values carry, or null: not ours, or too damaged to put right. */
export function readCoded(bits: readonly boolean[]): { kind: Kind; bits: number[] } | null {
    const d = bits.length === BQR_CODED_BITS ? bchDecode(bits.map(Number)) : null;
    if (!d) return null;
    const k = parseInt(d.slice(0, 4).join(""), 2), kind = (Object.keys(KIND) as Kind[]).find((x) => KIND[x] === k);
    return kind ? { kind, bits: d.slice(4) } : null;
}
export type Pt = { x: number; y: number };
type Gray = (x: number, y: number) => number;
/** Light between pixels: at a small size a dot is two or three of them. */
export function gray(rgba: ArrayLike<number>, w: number, h: number): Gray {
    const g = (a: number, b: number) => { const i = (b * w + a) * 4; return 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]; };
    return (x, y) => { const X = Math.max(0, Math.min(w - 1.001, x - 0.5)), Y = Math.max(0, Math.min(h - 1.001, y - 0.5)), a = Math.floor(X), b = Math.floor(Y), fx = X - a, fy = Y - b; return (g(a, b) * (1 - fx) + g(a + 1, b) * fx) * (1 - fy) + (g(a, b + 1) * (1 - fx) + g(a + 1, b + 1) * fx) * fy; };
}
/** Where the DRAWN (turned) grid lies: its left, its top and one module, in pixels. A posted picture is upright, so nothing else is needed. */
export interface Grid { x: number; y: number; m: number; position?: BqrPosition }
/**
 * The grid, found again from the code itself: the reader's corners are about a pixel out, and the dots stand a whole code's width away, so
 * the 625 modules, whose values are known, are laid over the photo and moved until they fit best. Null when they don't (a tilted photo).
 */
export function register(upright: BqrMatrix, light: Gray, corners: readonly Pt[]): Grid | null {
    let best: { grid: Grid; score: number } | null = null;
    for (const position of ["point", "notch"] as const) { const r = fitted(bqrTurned(upright, BQR_TURNS[position]), light, corners); if (r && (!best || r.score > best.score)) best = { grid: { ...r.grid, position }, score: r.score }; }
    return best?.grid ?? null;
}
function fitted(mat: BqrMatrix, light: Gray, corners: readonly Pt[]): { grid: Grid; score: number } | null {
    const n = mat.size, xs = corners.map((p) => p.x).sort((a, b) => a - b), ys = corners.map((p) => p.y).sort((a, b) => a - b);
    const start: Grid = { x: (xs[0] + xs[1]) / 2, y: (ys[0] + ys[1]) / 2, m: ((xs[2] + xs[3] - xs[0] - xs[1]) / 2 + (ys[2] + ys[3] - ys[0] - ys[1]) / 2) / 2 / n };
    if (!(start.m > 0.5)) return null;
    const cells: [number, number, number][] = [];   // drawn column, drawn row, +1 light / −1 dark
    let dark = 0;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const d = mat.data[r * n + c] ? 1 : 0; dark += d; cells.push([c, r, d ? -1 : 1]); }
    // near two corners of each module: its middle alone says nothing of where a large one ends
    const fit = (g: Grid) => { let a = 0, b = 0; for (const [c, r, v] of cells) { const l = (light(g.x + (c + 0.22) * g.m, g.y + (r + 0.22) * g.m) + light(g.x + (c + 0.78) * g.m, g.y + (r + 0.78) * g.m)) / 2; if (v > 0) a += l; else b += l; } return a / (n * n - dark) - b / dark; };
    let best = start, score = fit(start);
    for (const step of [0.6, 0.3, 0.15, 0.07]) for (let turn = 0; turn < 6; turn++) {
        let moved = false;
        for (const g of [{ ...best, x: best.x + step }, { ...best, x: best.x - step }, { ...best, y: best.y + step }, { ...best, y: best.y - step },
            { x: best.x - step * 0.5, y: best.y - step * 0.5, m: best.m + step / n }, { x: best.x + step * 0.5, y: best.y + step * 0.5, m: best.m - step / n }]) { const q = fit(g); if (q > score) { best = g; score = q; moved = true; } }
        if (!moved) break;
    }
    return score > 25 ? { grid: best, score } : null;
}
/** The 96 values in a photo of the drawing: each dot's light, both places added, judged against the lobe's own light and dark. */
export function sampleCoded(mat: BqrMatrix, light: Gray, g: Grid): boolean[] {
    const v = bqrLobeCells(mat).map(([c, r]) => { let s = 0; for (const [dx, dy] of [[0, 0], [-0.2, 0], [0.2, 0], [0, -0.2], [0, 0.2]]) s += light(g.x + (c + 0.5 + dx) * g.m, g.y + (r + 0.5 + dy) * g.m); return s / 5; });
    const sorted = [...v].sort((a, b) => a - b), mid = (sorted[Math.floor(v.length * 0.15)] + sorted[Math.floor(v.length * 0.85)]) / 2;
    return Array.from({ length: BQR_CODED_BITS }, (_, i) => (mid - v[i]) + (mid - v[i + BQR_CODED_BITS]) > 0);
}
/** Where the whole heart's square stands in the photo. */
export function heartBox(mat: BqrMatrix, g: Grid): Box {
    const G = BQR_GEOMETRY.outline, m = G.body.s / (mat.size + 2 * BQR_QUIET), one = bqrPlacement(1), s = g.m / m / one.k;
    return { s, x: g.x - (one.tx + (G.body.x + BQR_QUIET * m) * one.k) * s, y: g.y - (one.ty + (G.body.y + BQR_QUIET * m) * one.k) * s };
}
/** How the dots stand to the picture around them. ⛔ Never "unchanged": "same" means it looks like the picture the heart was drawn for. */
export const NEAR = 0.2;
export function drawnFor(read: { kind: Kind; bits: number[] }, rgba: ArrayLike<number>, w: number, h: number, box: Box): { answer: "same" | "different"; off: number; of: number } {
    let H = h, heart: Box | null = box;
    if (read.kind === "strip") { H = Math.max(GRID, Math.min(h, Math.round(box.y - (box.s / 0.9) * 0.05))); heart = null; }
    const p = fingerprint(rgba, w, H, heart);
    let off = 0, of = 0;
    for (let i = 0; i < CELLS; i++) if (p.seen[i]) { of++; if (p.bits[i] !== read.bits[i]) off++; }
    return { answer: off <= NEAR * of ? "same" : "different", off, of };
}

