/**
 * ⭐ B-QR — one of OUR codes drawn INSIDE the B-Emblem™. A public shorthand since 2026-10-04 (it was internal for a day); born in the
 *   HeartBank® Shops app on 2026-10-03 and promoted here on 2026-10-04 so that every surface that prints a code of ours draws the SAME
 *   one — a copy in each app would drift, and this drawing is measured, not eyeballed.
 *
 * WHAT IS A B-QR, AND WHAT IS NOT.
 *   · ⭐ A B-QR is a DRAWING STYLE for a code that opens one of OUR pages: a shop's *Order here*, a check-in, a referral, and every
 *     H3QR that is shown or downloaded (the public H3QR names WHOM YOU THANK; a B-QR is how that code is drawn).
 *   · ⛔ A BANK'S CODE IS NEVER A B-QR — KHQR and every EMVCo code stay plain. They are the bank's rail under the bank's own design
 *     standard, and a bank app's scan-from-gallery IS the payment.
 *
 * THE DRAWING. The emblem is a heart rotated 45° clockwise, the rotation BAKED into the coordinates (⛔ never a transform): its point
 * bottom-left, a square body, one lobe on top and one on the right. The real code — finder patterns, data and its own clear quiet zone —
 * fills the square body; in the `pixels` version the two lobes are filled with DECORATIVE modules on the same module grid, clipped to the
 * silhouette; an outline draws the silhouette, because the body's own edge is the white quiet zone and would otherwise vanish.
 *
 * ⭐ THE GEOMETRY IS MEASURED, NEVER EYEBALLED (`scripts/bqr.test.mjs` re-measures it on every run, and fails if it moves):
 *   · painted bbox 18.0828 × 18.0851 at (3.6824, 2.2349) — `data/brand.json` `mark.geometry`; it fills 75.34% of the viewBox and sits
 *     high and right, so ⭐ the PAINTED bbox is centred, never the viewBox;
 *   · the body = the largest axis-aligned square inside the silhouette ERODED by the outline's inner half, rasterised at 400 px/unit,
 *     shrunk by 0.0125 and centred in it — `pixels` (outline 0.16): 11.35 at (4.0588, 8.5913); `outline` (measured for a 0.48 stroke):
 *     11.085 at (4.2112, 8.7062), now stroked at 0.96 around that SAME body, so the stroke's inner half reaches ≤ 0.24 units into the
 *     body's white margin (the test holds a 2-module clear ring around the code).
 * ⭐ SCANNING OUTRANKS BEAUTY: the code is sized for the standard 4-module quiet zone; `pixels` lets its decoration in to ONE clear
 *   module (measured: one decodes on par with four; zero — decoration touching the finders — halves one decoder), and no decorative
 *   row or column ever holds three dark modules in a run, so the decoration cannot contain a finder's 1:1:3:1:1 at module scale.
 *
 * TWO VERSIONS, the person chooses (a fact about their phone, kept by the app): `pixels` — the *Full B-QR*, the lobes full of
 * modules · `outline` — the *Open B-QR*, the lobes left open inside a thick outline, no decoration. (Public names RULED 2026-10-06,
 * replacing *Green B-QR* / *White B-QR*: a color name stops being true once the color can change — see `hue` below.)
 *
 * ⭐ ONE GREEN, `BQR_INK` = #14532d, for the code, its decoration and its outline — ⛔ never a theme's colour (a light theme must not
 *   reach the code). Chosen by a rule written into the test BEFORE its sweep ran: the LIGHTEST candidate that prints at ISO/IEC 15415
 *   symbol-contrast grade A (Rpaper 0.85 − Rink ≥ 0.70) and decodes no worse than the old near-black by more than 2 of 90 cases on two
 *   independent decoders. The prediction (#106430) was wrong and the rule's pick was kept — ⛔ never move the rule to a preferred shade.
 * ⭐ DETERMINISTIC: the decoration is seeded from a hash of the text, so the same address always draws the same picture and the preview
 *   a person sees is the card they download.
 *
 * DEPENDENCIES: `drawBqr` / `bqrDataUrl` load `qrcode` (npm) on demand — the consumer provides it; `paintBqr` needs only a 2D context
 * with `Path2D`; the layout functions are pure. `bqr-card.ts` beside this file lays a B-QR out as a printable card.
 * ⛔ VENDORED, NEVER EDITED IN A CONSUMER: `brand.lock` hashes this file. Change it here, bump `data/brand.json`, re-sync each consumer.
 */
/** The B-Emblem™ path (viewBox `0 0 24 24`), verbatim from `emblem/emblem.path.txt` (the test asserts it). */
export const EMBLEM_D = "M3.9743 20.0257L3.8824 18.0670C3.5430 11.1232 3.3167 6.5411 5.9896 3.8683C8.1675 1.6904 11.5899 1.6904 13.7678 3.8683C14.9981 5.0986 15.6062 6.8523 15.4719 8.5281C17.1477 8.3938 18.9014 9.0019 20.1317 10.2322C22.3096 12.4101 22.3096 15.8325 20.1317 18.0104C17.4589 20.6833 12.8768 20.4570 5.9260 20.1247L3.9743 20.0257Z";
/** The painted bounding box, in viewBox units (brand.json `mark.geometry`). */
export const EMBLEM_BOX = { x: 3.6824, y: 2.2349, w: 18.0828, h: 18.0851 } as const;
/** The accent outline's width, in viewBox units. */
export const BQR_OUTLINE = 0.16;
/** The square body that holds the code AND its quiet zone, in viewBox units — inside the silhouette less half the outline. */
export const BQR_BODY = { x: 4.0588, y: 8.5913, s: 11.35 } as const;
/** Clear modules the CODE IS SIZED FOR inside its body — the standard 4. ⭐ `outline` keeps all four white; `pixels` keeps the code
 *  the same size and lets the decoration in to `BQR_FILL_RING` (§4Z, measured — see the header). */
export const BQR_QUIET = 4;
/** ⭐ §4Z — `pixels`: clear modules left between the code and the decoration. ⛔ Never 0 (the measured failure). */
export const BQR_FILL_RING = 1;

/** ⭐ §4Z — the two versions, by internal name. ⛔ Neither name is ever shown: a person sees two pictures and two plain words. */
export type BqrStyle = "pixels" | "outline";
export const BQR_STYLES: readonly BqrStyle[] = ["pixels", "outline"];
/** Version 1 first, as the founder listed them. */
export const BQR_STYLE_DEFAULT: BqrStyle = "pixels";
/** Each version's outline, body and decoration, in viewBox units — measured (header), re-measured by `scripts/bqr.test.mjs`. */
export const BQR_GEOMETRY: Record<BqrStyle, { outline: number; body: { x: number; y: number; s: number }; ring: number; decorate: boolean }> = {
    pixels: { outline: BQR_OUTLINE, body: BQR_BODY, ring: BQR_FILL_RING, decorate: true },
    // ⭐ §4AA — the outline doubled (§4Z's 3 × → 6 ×), the body §4Z measured for the 3 × stroke KEPT (the founder's *same size*).
    outline: { outline: BQR_OUTLINE * 6, body: { x: 4.2112, y: 8.7062, s: 11.085 }, ring: BQR_QUIET, decorate: false }
};
export const bqrStyleOf = (s: unknown): BqrStyle => (BQR_STYLES as readonly unknown[]).includes(s) ? s as BqrStyle : BQR_STYLE_DEFAULT;
/** Error correction. ⭐ 'M': the decoration never touches the code (the quiet zone keeps it out), so ECC has only print and
 *  camera noise to absorb, and a higher level costs a version — SMALLER modules in the same body. Measured 2026-10-03
 *  (`bqr.test.mjs` ECC sweep, bare card at 300/200/150 px × 6 distortions × 5 payloads, decoded of 90, jsQR/ZXing/OpenCV):
 *  L 68/82/42 · M 76/83/48 · Q 76/81/49 · H 66/76/44 — M best or tied on every decoder but OpenCV, where Q is one ahead. */
export const BQR_ECC = "M" as const;

/** ⭐ §4AA — the code's modules: the green the pre-registered rule in `scripts/bqr.test.mjs` picked (header above). ⛔ Never a theme's. */
export const BQR_INK = "#14532d";
const PAPER = "#ffffff";

/**
 * ⭐ v1.5.0 (2026-10-06) — WHERE THE PAPER IS. `paper` (the default): the whole square is white, as every B-QR was drawn before.
 *   `heart`: only the silhouette is white and the square around it is left transparent, so on a dark ground the B-QR reads as a
 *   white heart instead of a white tile.
 * ⭐ THE CODE DOES NOT CHANGE BETWEEN THE TWO: it stays dark-on-white inside the body, quiet zone included, which is all a camera
 *   reads. Only what lies outside the silhouette changes. `scripts/bqr.test.mjs` §dark-ground decodes `heart` on the dark ground.
 * ⛔ NEVER INVERTED (light modules on a dark ground). Many phone scanners never try an inverted code, and this matrix runs jsQR with
 *   inversion off for exactly that reason. A dark ground is why `heart` exists; it is never a reason to invert the code.
 * ⛔ ON SCREEN ONLY. A download, a print and the card (`bqr-card.ts`) stay `paper`: a transparent PNG handed to another app may be
 *   flattened onto black, and the picture a person saves must be the one they will see wherever they send it.
 */
export type BqrGround = "paper" | "heart";
export const BQR_GROUNDS: readonly BqrGround[] = ["paper", "heart"];
export const BQR_GROUND_DEFAULT: BqrGround = "paper";
export const bqrGroundOf = (s: unknown): BqrGround => (BQR_GROUNDS as readonly unknown[]).includes(s) ? s as BqrGround : BQR_GROUND_DEFAULT;

/**
 * ⭐ v1.6.0 (2026-10-06) — A HUE, NEVER A DARKNESS. `hue` lets a caller choose the drawing's color FAMILY; the recipe draws it at
 *   `BQR_INK`'s relative luminance (the darkness the pre-registered ink rule chose), keeping the hue and giving up only the chroma
 *   sRGB cannot hold that dark. So a caller can pick ruby, citrine or even diamond and still never draw a code that prints below
 *   grade A or scans worse than the green: ⭐ the darkness is a PROPERTY of the recipe, not a rule a caller must remember.
 *   Light hues come out deep — citrine as an olive-brown, diamond as a graphite — and that is the honest result, not a defect.
 * ⭐ No `hue` = `BQR_INK` itself, verbatim, so every drawing that passes none is byte-identical to v1.5.0 — the apps pass none and
 *   keep the one green (founder 2026-10-06: the brand page's B-QRs follow the selected `--emblem`; the apps were not ruled).
 *   `scripts/bqr.test.mjs` §emblem-hue decodes every gem's derivation before it shipped.
 */
const lin8 = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
/** Relative luminance of an 8-bit sRGB triple (WCAG). */
const luminance = ([r, g, b]: readonly number[]) => 0.2126 * lin8(r) + 0.7152 * lin8(g) + 0.0722 * lin8(b);
/** `#rrggbb` or `rgb(…)` / `rgba(…)` (what `getComputedStyle` returns) → an 8-bit triple, or null. */
function rgbOf(color: string): [number, number, number] | null {
    const h = /^#([0-9a-f]{6})$/i.exec(color.trim());
    if (h) { const n = parseInt(h[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
    const f = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(color.trim());
    return f ? [Number(f[1]), Number(f[2]), Number(f[3])].map((v) => Math.max(0, Math.min(255, Math.round(v)))) as [number, number, number] : null;
}
/** OKLab ⇄ linear sRGB (Björn Ottosson's published matrices). */
function oklab([r, g, b]: readonly number[]): [number, number, number] {
    const [R, G, B2] = [r, g, b].map(lin8);
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B2);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B2);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B2);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function linearOf(L: number, a: number, b: number): [number, number, number] {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const inGamut = (v: readonly number[]) => v.every((c) => c >= -1e-6 && c <= 1 + 1e-6);
const hex8 = (v: readonly number[]) => "#" + v.map((c) => Math.round(Math.max(0, Math.min(1, gam(c))) * 255).toString(16).padStart(2, "0")).join("");
const INK_LUM = luminance(rgbOf(BQR_INK)!);

/** ⭐ v1.6.0 — the color a B-QR is drawn in for `hue`: the same OKLCH hue, at the most chroma sRGB holds, at the largest OKLab
 *  lightness whose 8-bit result is NO LIGHTER than `BQR_INK` (so it never prints lighter than the green). Unparseable → `BQR_INK`. */
export function bqrInkFor(hue: string): string {
    if (hue.trim().toLowerCase() === BQR_INK) return BQR_INK;
    const rgb = rgbOf(hue);
    if (!rgb) return BQR_INK;
    const [, a0, b0] = oklab(rgb), C0 = Math.hypot(a0, b0), H = Math.atan2(b0, a0);
    const at = (L: number) => {
        let lo = 0, hi = C0;                                           // the most chroma, up to the hue's own, that sRGB holds at L
        if (!inGamut(linearOf(L, hi * Math.cos(H), hi * Math.sin(H))))
            for (let i = 0; i < 24; i++) { const c = (lo + hi) / 2; if (inGamut(linearOf(L, c * Math.cos(H), c * Math.sin(H)))) lo = c; else hi = c; }
        else lo = hi;
        return hex8(linearOf(L, lo * Math.cos(H), lo * Math.sin(H)));
    };
    let lo = 0, hi = 1;                                                // ⭐ invariant: at(lo) is never lighter than BQR_INK (black, at 0)
    for (let i = 0; i < 32; i++) { const L = (lo + hi) / 2; if (luminance(rgbOf(at(L))!) > INK_LUM) hi = L; else lo = L; }
    return at(lo);
}
/** The decorative module's side, as a fraction of a module — a visible gap between neighbours, so no two ever merge. */
const DOT = 0.84;
/** Share of decorative cells drawn dark (before the run limit thins them). */
const DENSITY = 0.6;
/** Margin around the painted bbox, as a fraction of the drawing's side (the outline is never cut by the edge). */
export const BQR_PAD = 0.03;

/** The module matrix, row-major — `QRCode.create(...).modules` is one. */
export interface BqrMatrix { size: number; data: ArrayLike<number | boolean> }
export interface BqrOptions {
    /** Top-left of the square the drawing occupies, in canvas pixels. */
    x?: number;
    y?: number;
    /** The square's side, in canvas pixels. */
    size: number;
    /** The decoration and outline colour. Default (§4AA): `BQR_INK`, so the whole drawing is one green. ⚠️ No caller passes one. */
    accent?: string;
    /** Error correction level. Default `BQR_ECC`. */
    ecc?: "L" | "M" | "Q" | "H";
    /** ⭐ §4Z — which of the two versions. Default `BQR_STYLE_DEFAULT`. */
    style?: BqrStyle;
    /** ⭐ v1.5.0 — where the paper is (`BqrGround`, above). Default `paper`. ⛔ `heart` is for the screen, never a download or print. */
    ground?: BqrGround;
    /** ⛔ TEST ONLY — clear modules between code and decoration (`pixels`). 0 is the broken control `scripts/bqr.test.mjs` must catch. */
    quiet?: number;
    /** ⛔ TEST ONLY — the code's colour, for the ink sweep that chose `BQR_INK`. ⛔ Never a theme's colour. */
    ink?: string;
    /** ⭐ v1.6.0 — the drawing's color family, drawn at `BQR_INK`'s darkness (`bqrInkFor`). Default: `BQR_INK` itself. */
    hue?: string;
}
export interface BqrLayout {
    /** Modules across the code. */
    n: number;
    /** One module, in viewBox units. */
    m: number;
    /** The code's top-left module, in viewBox units. */
    ox: number;
    oy: number;
    /** Dark decorative cells, as [column, row] on the code's grid (negative = left of / above the code). Empty for `outline`. */
    deco: [number, number][];
    /** ⭐ §4Z — the version this layout is for, and its outline width (viewBox units). */
    style: BqrStyle;
    outline: number;
}

// ---- the silhouette as a polygon (pure — no canvas, so the test can check it) ---------------------------------------------------

type Pt = [number, number];
let POLY: Pt[] | null = null;
/** Flatten the path (absolute M / L / C / Z only — all this path uses) into a closed polygon. */
function silhouette(): Pt[] {
    if (POLY) return POLY;
    const tok = EMBLEM_D.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
    const out: Pt[] = [];
    let i = 0, cmd = "", cur: Pt = [0, 0];
    const num = () => Number(tok[i++]);
    while (i < tok.length) {
        if (/[MLCZ]/.test(tok[i])) cmd = tok[i++];
        if (cmd === "M" || cmd === "L") { cur = [num(), num()]; out.push(cur); }
        else if (cmd === "C") {
            const p1: Pt = [num(), num()], p2: Pt = [num(), num()], p3: Pt = [num(), num()], p0 = cur;
            for (let k = 1; k <= 32; k++) {
                const t = k / 32, u = 1 - t;
                out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
                          u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
            }
            cur = p3;
        } else if (cmd === "Z") break;
    }
    return (POLY = out);
}
/** Even-odd point-in-polygon. */
export function insideEmblem(x: number, y: number): boolean {
    const P = silhouette();
    let hit = false;
    for (let a = 0, b = P.length - 1; a < P.length; b = a++) {
        const [xa, ya] = P[a], [xb, yb] = P[b];
        if ((ya > y) !== (yb > y) && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) hit = !hit;
    }
    return hit;
}
/** Distance from a point to the silhouette's edge. */
function edgeDistance(x: number, y: number): number {
    const P = silhouette();
    let best = Infinity;
    for (let a = 0, b = P.length - 1; a < P.length; b = a++) {
        const [xa, ya] = P[b], [xb, yb] = P[a];
        const dx = xb - xa, dy = yb - ya, L = dx * dx + dy * dy;
        const t = L ? Math.max(0, Math.min(1, ((x - xa) * dx + (y - ya) * dy) / L)) : 0;
        best = Math.min(best, Math.hypot(x - (xa + t * dx), y - (ya + t * dy)));
    }
    return best;
}

// ---- the layout (pure) ------------------------------------------------------------------------------------------------------------

/** FNV-1a, then mulberry32: a fixed stream of numbers from the text — ⛔ never `Math.random` at draw time. */
function stream(seed: string): () => number {
    let h = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    let s = h >>> 0;
    return () => {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Where everything goes, in viewBox units. The module grid is the code's own, extended over the whole emblem; a decorative cell
 * is a candidate when it lies outside the code's quiet box AND its dot clears the outline; it is dark by the seeded stream unless
 * that would make a third dark cell in a row or a column.
 */
export function bqrLayout(mat: BqrMatrix, seed: string, o: { style?: BqrStyle; quiet?: number } = {}): BqrLayout {
    const style = bqrStyleOf(o.style), G = BQR_GEOMETRY[style];
    const quiet = o.quiet ?? G.ring;
    const n = mat.size;
    const m = G.body.s / (n + 2 * BQR_QUIET);
    // ⭐ The code is centred in the body; the ring only says how close the decoration may come (§4Z: 1 for `pixels`; the
    //   broken control's 0 lets it touch), never moves the code.
    const ox = G.body.x + BQR_QUIET * m, oy = G.body.y + BQR_QUIET * m;
    if (!G.decorate) return { n, m, ox, oy, deco: [], style, outline: G.outline };
    const c0 = Math.floor((EMBLEM_BOX.x - ox) / m) - 1, c1 = Math.ceil((EMBLEM_BOX.x + EMBLEM_BOX.w - ox) / m) + 1;
    const r0 = Math.floor((EMBLEM_BOX.y - oy) / m) - 1, r1 = Math.ceil((EMBLEM_BOX.y + EMBLEM_BOX.h - oy) / m) + 1;
    const clear = (DOT / 2) * m * Math.SQRT2 + G.outline / 2 + 0.15 * m;
    const rand = stream(seed);
    const dark = new Set<string>();
    const deco: [number, number][] = [];
    const on = (c: number, r: number) => dark.has(`${c},${r}`);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
        const p = rand();                                              // ⭐ drawn for EVERY cell, so the stream never depends on the outline
        if (c >= -quiet && c < n + quiet && r >= -quiet && r < n + quiet) continue;
        const cx = ox + (c + 0.5) * m, cy = oy + (r + 0.5) * m;
        if (!insideEmblem(cx, cy) || edgeDistance(cx, cy) < clear) continue;
        if (p >= DENSITY) continue;
        if ((on(c - 1, r) && on(c - 2, r)) || (on(c, r - 1) && on(c, r - 2))) continue;   // ⛔ never three in a run
        dark.add(`${c},${r}`); deco.push([c, r]);
    }
    return { n, m, ox, oy, deco, style, outline: G.outline };
}

// ---- drawing ------------------------------------------------------------------------------------------------------------------------

/** Where the emblem lands in a `size` square at (x, y): canvas px = t + k · viewBox units. ⭐ Centres the PAINTED bbox, never the viewBox. */
export function bqrPlacement(size: number, x = 0, y = 0): { k: number; tx: number; ty: number } {
    const k = (size * (1 - 2 * BQR_PAD)) / Math.max(EMBLEM_BOX.w, EMBLEM_BOX.h);
    return { k, tx: x + (size - EMBLEM_BOX.w * k) / 2 - EMBLEM_BOX.x * k, ty: y + (size - EMBLEM_BOX.h * k) / 2 - EMBLEM_BOX.y * k };
}

/** Paint a B-QR from a module matrix into a 2D context. Synchronous; `drawBqr` makes the matrix. */
export function paintBqr(g: CanvasRenderingContext2D, mat: BqrMatrix, seed: string, o: BqrOptions): void {
    // ⭐ §4AA — one green for the whole drawing: the decoration and the outline default to the code's own ink.
    // ⭐ v1.6.0 — `hue` sets the code, the decoration and the outline at once, darkened by `bqrInkFor`; none = `BQR_INK`, verbatim.
    const inkOfHue = o.hue ? bqrInkFor(o.hue) : BQR_INK;
    const X = o.x ?? 0, Y = o.y ?? 0, size = o.size, accent = o.accent || inkOfHue;
    const L = bqrLayout(mat, seed, { style: o.style, quiet: o.quiet });
    const { k, tx, ty } = bqrPlacement(size, X, Y);
    const path = new Path2D(EMBLEM_D);
    const ground = bqrGroundOf(o.ground);

    g.save();
    // ⭐ v1.5.0 — the drawing owns its square either way: `heart` CLEARS it (a reused canvas keeps nothing from the last drawing),
    //   then lays the paper down inside the silhouette only. The decoration, the outline and the code are drawn the same on both.
    if (ground === "heart") g.clearRect(X, Y, size, size);
    else { g.fillStyle = PAPER; g.fillRect(X, Y, size, size); }
    g.translate(tx, ty); g.scale(k, k);
    if (ground === "heart") { g.fillStyle = PAPER; g.fill(path); }
    // The decoration, clipped to the silhouette.
    g.save(); g.clip(path); g.fillStyle = accent;
    const d = DOT * L.m, inset = (L.m - d) / 2;
    for (const [c, r] of L.deco) g.fillRect(L.ox + c * L.m + inset, L.oy + r * L.m + inset, d, d);
    g.restore();
    // The outline.
    // ⭐ §4Z — `outline` (Version 2) draws this wider, over a heart left white (§4AA: six times as wide).
    g.strokeStyle = accent; g.lineWidth = L.outline; g.lineJoin = "round"; g.stroke(path);
    g.restore();

    // ⭐ The code, in DEVICE pixels with every edge rounded, one rect per run — scaled sub-pixel rects leave hairline seams
    //   between modules, and a seam inside a finder is the last thing a camera should see.
    g.save(); g.fillStyle = o.ink || inkOfHue;
    const px = (u: number) => Math.round(tx + u * k), py = (v: number) => Math.round(ty + v * k);
    for (let r = 0; r < L.n; r++) {
        const top = py(L.oy + r * L.m), bottom = py(L.oy + (r + 1) * L.m);
        for (let c = 0; c < L.n; c++) {
            if (!mat.data[r * L.n + c]) continue;
            let e = c; while (e + 1 < L.n && mat.data[r * L.n + e + 1]) e++;
            const left = px(L.ox + c * L.m);
            g.fillRect(left, top, px(L.ox + (e + 1) * L.m) - left, bottom - top);
            c = e;
        }
    }
    g.restore();
}

/** Make the code for `text` and paint it as a B-QR. ⭐ The renderer is loaded when needed, as everywhere else. */
export async function drawBqr(g: CanvasRenderingContext2D, text: string, o: BqrOptions): Promise<void> {
    const QRCode = (await import("qrcode")).default;
    const q = QRCode.create(text, { errorCorrectionLevel: o.ecc ?? BQR_ECC });
    paintBqr(g, q.modules, text, o);
}

/** A B-QR as a PNG data URL — the on-screen preview of a code a person may also download, so what they see is what they print. */
export async function bqrDataUrl(text: string, o: { size?: number; accent?: string; ecc?: "L" | "M" | "Q" | "H"; style?: BqrStyle; ground?: BqrGround; hue?: string } = {}): Promise<string> {
    const size = o.size ?? 640;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    // ⛔ v1.5.0 — `ground: "heart"` only for a picture that stays on screen; a URL handed to a download takes the default `paper`.
    await drawBqr(canvas.getContext("2d")!, text, { size, accent: o.accent, ecc: o.ecc, style: o.style, ground: o.ground, hue: o.hue });
    return canvas.toDataURL("image/png");
}
