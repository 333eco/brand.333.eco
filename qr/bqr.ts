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
 * ⭐ ONE INK for the code, its decoration and its outline — `BQR_INK` = #14532d by default; ⚠️ SUPERSEDED 2026-10-12 as a rule for
 *   every app: a product's code takes its OWNER's ink (v1.7.0, `BqrOwner` below), and the green stays the default and
 *   `heartbank.ceo`'s — ⛔ never a theme's colour (a light theme must not reach the code). The green itself was
 *   chosen by a rule written into the test BEFORE its sweep ran: the LIGHTEST candidate that prints at ISO/IEC 15415
 *   symbol-contrast grade A (Rpaper 0.85 − Rink ≥ 0.70) and decodes no worse than the old near-black by more than 2 of 90 cases on two
 *   independent decoders. The prediction (#106430) was wrong and the rule's pick was kept — ⛔ never move the rule to a preferred shade.
 * ⭐ FOUR POSITIONS (v1.11.0, founder 2026-11-24): the middle position marker stands where the ADDRESS puts it (`bqrPosition`): at the heart's point
 *   for a B-Link, standard for any other address of the estate; the notch and non-standard are the same two from outside. At the point and
 *   the notch the code's mirror line is the heart's (v1.9.0, §turn). Nothing printed before is reprinted (a code reads at any angle).
 * ⭐ DETERMINISTIC: the decoration is seeded from a hash of the text, so the same address always draws the same picture and the preview
 *   a person sees is the card they download.
 *
 * DEPENDENCIES: `drawBqr` / `bqrDataUrl` load `qrcode` (npm) on demand — the consumer provides it; `paintBqr` needs a 2D context with
 * `Path2D` and, since v2.0.0, the encoder already loaded (`await bqrReady()` once; `drawBqr` does it), because it checks every matrix it is
 * given against its own encoding of the text; the layout functions are pure. `bqr-card.ts` beside this file lays a B-QR out as a printable card.
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
/**
 * ⭐ v1.9.0 (founder 2026-11-24) — the BOTTOM LOBE. Every B-QR of ours carries a small ™ there: it names the B-Emblem™, this drawing (⛔ never
 *   "B-QR", which stays unmarked), and shows which way is up. `none` leaves the lobe as it was; `autograph` (below) draws a person's own
 *   hand instead. Both are for a person's OWN picture, where a ™ would read as a claim on their work. The TOP lobe keeps its dots.
 */
export type BqrLobe = "tm" | "none";
export const BQR_LOBE_DEFAULT: BqrLobe = "tm";
/**
 * ⭐ v1.10.0 (founder 2026-11-24: *"horizontally and vertically center the ™ and the [autograph] within the bottom lobe"*) — the lobe's CENTER,
 *   each version's own: midway between the code's last column and the outline's inner edge on its row, and midway between the outline's
 *   inner edges on its column. Solved from the silhouette; `scripts/bqr.test.mjs` §center solves it again and holds these.
 */
export const BQR_LOBE_CENTER = { pixels: { x: 17.86, y: 14.15 }, outline: { x: 17.62, y: 14.16 } } as const;
/** The ™: its cap height and the quiet space around it, in viewBox units. Drawn as bars, so it needs no font. */
export const BQR_TM = { h: 1.05, pad: 0.5 } as const;
const TM = { t: 0.2, w: 0.84, gap: 0.13, m: 1.06 } as const;   // stroke · T's width · the gap · M's width, as parts of the cap height
export const bqrTmBox = (style: keyof typeof BQR_LOBE_CENTER = "pixels") => { const w = BQR_TM.h * (TM.w + TM.gap + TM.m), c = BQR_LOBE_CENTER[style]; return { x: c.x - w / 2, y: c.y - BQR_TM.h / 2, w, h: BQR_TM.h }; };
/** The autograph's box, 5 : 3, centered in the Open version's bottom lobe. Its width is the largest that loses no reading (§center C3). */
const AUTOGRAPH_W = 4.27;
export const BQR_AUTOGRAPH = { x: BQR_LOBE_CENTER.outline.x - AUTOGRAPH_W / 2, y: BQR_LOBE_CENTER.outline.y - AUTOGRAPH_W * 0.3, w: AUTOGRAPH_W, h: AUTOGRAPH_W * 0.6 } as const;
/** A person's B-Autograph℠, as points on a 100 × 60 pad: numbers only, ⛔ never a path's text (nothing here is ever parsed or injected). */
export interface BqrAutograph { strokes: readonly (readonly (readonly [number, number])[])[] }
export const BQR_PAD_W = 100, BQR_PAD_H = 60, BQR_AUTOGRAPH_PEN = 3, BQR_AUTOGRAPH_POINTS = 4000;
/** True for something that can be drawn as an autograph. */
export function isAutograph(a: unknown): a is BqrAutograph {
    const s = (a as BqrAutograph | null)?.strokes;
    if (!Array.isArray(s) || !s.length || s.length > 200) return false;
    let n = 0;
    for (const k of s) {
        if (!Array.isArray(k) || !k.length) return false;
        for (const p of k) { if (!Array.isArray(p) || p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || ++n > BQR_AUTOGRAPH_POINTS) return false; }
    }
    return true;
}

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
 * ⭐ No `hue` = `BQR_INK` itself, verbatim, so every drawing that passes none is byte-identical to v1.5.0 (founder 2026-10-06: the
 *   brand page's B-QRs follow the selected `--emblem`). ⚠️ SUPERSEDED 2026-10-12: *"the apps pass none and keep the one green"* —
 *   products now pass an `owner` (the body palette), never a `hue`.
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

/**
 * ⭐ v1.7.0 — THE BODY PALETTE (founder 2026-10-12; MA memory `project_brand_identity` §body-palette; roadmap A383). A code's OWNER
 *   picks its color family, one per body, on codes and seals only: H3 names a DOMAIN (its body color is its domain's, the six-TLD
 *   rainbow), and every other body names itself — SW orange robe · TH sky blue · F333 crimson moon · MA clear sparkle. The ink is
 *   `bqrInkFor(source)`, so an owner inherits every property `hue` has: never lighter than the green, the hue kept.
 * ⛔ `"H3"` alone is not an owner, and an owner never travels with a `hue`: `paintBqr` throws on either — a product inherits its
 *   body's color and cannot pick one (rule 1 as a property). The palette says BELONGING, never authenticity: anyone can print any
 *   color; the scan authenticates.
 * ⭐ `heartbank.ceo` IS `BQR_INK`, byte for byte (Shops unchanged). The other domain sources are `data/tlds.json`'s candidate LIGHT
 *   values; `scripts/bqr.test.mjs` §body-palette B3 fails if either file moves without the other.
 */
export type BqrOwner =
    | "heartbank.us" | "heartbank.me" | "heartbank.org" | "heartbank.ceo" | "heartbank.net" | "heartbank.com"
    | "SW" | "TH" | "F333" | "MA";
export const BQR_OWNER_HUES: Readonly<Record<BqrOwner, string>> = {
    "heartbank.us": "#c8102e",   // red — HeartBank® Storage
    "heartbank.me": "#c95103",   // orange — Thank Your Future Kindness℠
    "heartbank.org": "#9a6f0b",  // gold — Treasury (prints olive-brown: gold cannot print light)
    "heartbank.ceo": BQR_INK,    // green — Shops, the live green, unchanged
    "heartbank.net": "#0f52ba",  // blue — the institutional site, /b/
    "heartbank.com": "#935dc9",  // purple — Chronicle, the B-Store
    SW: "#f28500",               // orange robe — prints deep ochre, the robe's kāsāya
    TH: "#38bdf8",               // sky blue
    F333: "#c1121f",             // crimson moon
    MA: "#f4f7ff",               // clear sparkle — prints graphite; on screen the glint moves only with the viewer, never by itself
};
export const BQR_OWNERS = Object.keys(BQR_OWNER_HUES) as readonly BqrOwner[];
/** The ink a code owned by `owner` is drawn in. ⛔ Throws on anything that is not a `BqrOwner` — `"H3"` included. */
export function bqrOwnerInk(owner: BqrOwner): string {
    if (!Object.prototype.hasOwnProperty.call(BQR_OWNER_HUES, owner))
        throw new Error(`B-QR: "${String(owner)}" is not an owner. H3 codes name their domain (heartbank.org, heartbank.ceo, …); the other bodies are SW, TH, F333, MA.`);
    return bqrInkFor(BQR_OWNER_HUES[owner]);
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
    /** ⭐ v1.9.0 — the bottom lobe: the ™ (default), or nothing in a person's own picture. */
    lobe?: BqrLobe;
    /** ⭐ v1.9.0 — a person's autograph in the bottom lobe, in the `outline` version only (⛔ throws in `pixels`); it replaces the ™. */
    autograph?: BqrAutograph;
    /** ⭐ v1.10.0 — 96 bits in the TOP lobe, for a mark in a person's picture, in the `outline` version only (⛔ throws in `pixels`). */
    coded?: readonly number[];
    /** ⭐ v1.11.0 — who draws it. ⛔ Only our API passes "outside"; an app never says where the middle marker stands (the address does).
     *  ⛔ v2.0.0: there is no `position`, `quiet`, `ink` or `fitAutograph` option, the test's own levers; one passed anyway changes nothing
     *  (§refusal RF4, §refusal2 RF7). They live in `BqrTestOnly`, reached only through the unexported `paintBqrAt`. */
    by?: BqrBy;
    /** ⭐ v1.6.0 — the drawing's color family, drawn at `BQR_INK`'s darkness (`bqrInkFor`). Default: `BQR_INK` itself.
     *  ⛔ Products pass `owner`, never `hue`; `hue` is for the brand page following a visitor's `--emblem`. */
    hue?: string;
    /** ⭐ v1.7.0 — the body (for H3, the domain) that owns this code; its color comes from the body palette (`bqrOwnerInk`).
     *  ⛔ Never together with `hue`. */
    owner?: BqrOwner;
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

/** Does a cell (its top left, its side) touch the sign's rounded quiet space? */
function touchesSign(x: number, y: number, m: number, style: BqrStyle): boolean {
    const b = bqrTmBox(style), c = BQR_LOBE_CENTER[style], rx = b.w / 2 + BQR_TM.pad, ry = b.h / 2 + BQR_TM.pad;
    const nx = Math.max(x, Math.min(c.x, x + m)) - c.x, ny = Math.max(y, Math.min(c.y, y + m)) - c.y;
    return (nx / rx) ** 2 + (ny / ry) ** 2 < 1;
}
/** The ™ as bars, in viewBox units. */
function drawTm(g: CanvasRenderingContext2D, style: BqrStyle): void {
    const b = bqrTmBox(style), h = b.h, t = TM.t * h, w = TM.w * h, x1 = b.x + w + TM.gap * h, mw = TM.m * h, y = b.y;
    g.fillRect(b.x, y, w, t); g.fillRect(b.x + w / 2 - t / 2, y, t, h);
    g.beginPath(); g.moveTo(x1, y + h); g.lineTo(x1, y); g.lineTo(x1 + t * 1.05, y); g.lineTo(x1 + mw / 2, y + h * 0.56); g.lineTo(x1 + mw - t * 1.05, y); g.lineTo(x1 + mw, y);
    g.lineTo(x1 + mw, y + h); g.lineTo(x1 + mw - t, y + h); g.lineTo(x1 + mw - t, y + h * 0.42); g.lineTo(x1 + mw / 2, y + h * 0.86); g.lineTo(x1 + t, y + h * 0.42); g.lineTo(x1 + t, y + h);
    g.closePath(); g.fill();
}
/** A person's autograph in its box: each stroke through the middles of its points, so a finger's corners come out round. */
/** ⭐ v1.10.0 — FITTED: the drawing keeps its own shape, grows to fill its box (at most twice the pad's own scale) and stands at the lobe's center,
 *   wherever on the pad it was drawn. It cannot leave its box, so it can never reach the code. */
function drawAutograph(g: CanvasRenderingContext2D, a: BqrAutograph, ink: string, fit: boolean): void {
    paintAutograph(g, a, BQR_AUTOGRAPH, ink, fit);
}
/**
 * ⭐ v1.12.0 — the same drawing into ANY box (the B-QR's lobe above; the silhouette and the B-Symbol℠ in `looks.ts`), in the context's current
 *   units. The pen is 3% of the box's width, as in the lobe. Returns where the ink landed, pen included, so a caller can stand something
 *   beside it (the B-Symbol's emblem).
 */
export function paintAutograph(g: CanvasRenderingContext2D, a: BqrAutograph, B: { x: number; y: number; w: number; h: number }, ink: string, fit = true): { x: number; y: number; w: number; h: number } {
    const pad = B.w / BQR_PAD_W, pen = BQR_AUTOGRAPH_PEN * pad;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const s of a.strokes) for (const [x, y] of s) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const k = fit ? Math.min(2 * pad, (B.w - pen) / Math.max(x1 - x0, 1e-6), (B.h - pen) / Math.max(y1 - y0, 1e-6)) : pad;
    g.save();
    if (fit) { g.translate(B.x + B.w / 2, B.y + B.h / 2); g.scale(k, k); g.translate(-(x0 + x1) / 2, -(y0 + y1) / 2); }
    else { g.translate(B.x, B.y); g.scale(k, k); }
    g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = pen / k; g.lineCap = "round"; g.lineJoin = "round";
    for (const s of a.strokes) {
        if (s.length === 1) { g.beginPath(); g.arc(s[0][0], s[0][1], pen / k / 2, 0, Math.PI * 2); g.fill(); continue; }
        g.beginPath(); g.moveTo(s[0][0], s[0][1]);
        for (let i = 1; i < s.length - 1; i++) g.quadraticCurveTo(s[i][0], s[i][1], (s[i][0] + s[i + 1][0]) / 2, (s[i][1] + s[i + 1][1]) / 2);
        g.lineTo(s[s.length - 1][0], s[s.length - 1][1]); g.stroke();
    }
    g.restore();
    const w = (x1 - x0) * k, h = (y1 - y0) * k;
    return fit ? { x: B.x + B.w / 2 - w / 2 - pen / 2, y: B.y + B.h / 2 - h / 2 - pen / 2, w: w + pen, h: h + pen }
        : { x: B.x + x0 * k - pen / 2, y: B.y + y0 * k - pen / 2, w: w + pen, h: h + pen };
}

/**
 * ⭐ v1.11.0 (founder 2026-11-24: *"keep all four positions"*) — WHERE THE MIDDLE MARKER STANDS SAYS WHAT KIND OF ADDRESS IT IS, read from the address
 *   itself: at the heart's POINT for a B-Link, STANDARD (top left) for any other address of the estate; the NOTCH and NON-STANDARD (bottom
 *   right) are the same two, drawn by an outsider through our API (`by: "outside"`; nothing passes it until that API exists). The point and
 *   the notch are the two where the code's own mirror line is the heart's (§turn), so a B-Link is the symmetric one. A camera reads any angle.
 * ⛔ A declaration, never a proof: anyone can draw any position, so nothing public may say that one shows who drew it.
 */
export type BqrPosition = "point" | "notch" | "standard" | "non-standard";
export type BqrBy = "us" | "outside";
/** Every domain a B-QR may open a page of: the estate's (b.333.eco's own list; §position K4 holds the two equal). */
export const BQR_HOSTS: readonly string[] = [
    "333.eco", "heartbank.org", "heartbank.net", "heartbank.com", "heartbank.ceo", "heartbank.me", "heartbank.us",
    "thonly.org", "thonly.com", "thonly.net", "siliconwat.com", "siliconwat.org", "siliconwat.dev",
    "missaquarius.org", "missaquarius.com", "playsey.app", "sayyourname.app", "seysays.org",
];
/**
 * ⭐ v2.0.0 (founder 2026-11-26: *"3: reconcile"*) — A WEB ADDRESS WITH NO SCHEME, the shape a phone opens as a link: the WHOLE text, an optional
 *   `//` and `user@`, a host of two or more dot-separated labels (letters, digits, hyphens) whose LAST label is letters only, two or more (or a
 *   punycode `xn--` name), then optionally a port, a path, a query, a fragment. NARROW on purpose: every code the estate prints is a full address,
 *   a developer's http host or a bare code with no dot (`H3QR @name`, `7K2M-9QX4-B8T3`, a gift code), and none of them may become an address by
 *   accident; a numeric last label (`3.14`, an IP) is not one. Such a text is read as `https://` + itself (§refusal2 RF6).
 */
const SCHEMELESS = /^(?:\/\/)?(?:[^\s@/?#]+@)?(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+(?:\p{L}{2,}|xn--[a-z0-9-]+)\.?(?::\d+)?(?:[/?#]\S*)?$/iu;
/** What a code's text is: a B-Link, another estate address, or no address at all (a bare gift code). ⛔ Throws for an address anywhere else: our
 *  heart never frames an address someone chose. `localhost` and the estate's Firebase preview hosts are a developer's phone.
 *  ⭐ v2.0.0 — an address with no scheme (`SCHEMELESS`) is an address: refused outside the estate, an estate one classed as its https address;
 *  ⛔ a bare email is refused whatever its domain (a user part, as `https://me@b.333.eco/x` is: an email is not a page of ours). */
export function bqrKind(text: string, hosts: readonly string[] = BQR_HOSTS): "b-link" | "estate" | "text" {
    const t = text.trim();
    if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) return SCHEMELESS.test(t) ? bqrKind("https://" + t.replace(/^\/\//, ""), hosts) : "text";
    let u: URL;
    try { u = new URL(text.trim()); } catch { throw new Error("B-QR: that isn't an address."); }
    if (/^(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(u.hostname) || /^(thank3-heartbank-com|heartbank-bc44f)(--[a-z0-9-]+)?\.(web\.app|firebaseapp\.com)$/.test(u.hostname)) return "estate";
    if (u.protocol !== "https:" || u.port || u.username || u.password || !hosts.some((d) => u.hostname === d || u.hostname.endsWith("." + d))) throw new Error("B-QR: only an https address of the estate (" + u.hostname + ").");
    return u.hostname === "b.333.eco" ? "b-link" : "estate";
}
/**
 * ⭐ v2.1.0 — PRINTED IN CAPITALS where the address ignores case (founder 2026-11-27 10:24, *"approve both"*; MA roadmap A740; canon MA memory
 * project_brand_identity §bqr-caps). QR's compact (alphanumeric) mode holds only `0–9 A–Z space $ % * + - . / :`, so a whole address in capitals
 * is one compact segment, one size smaller where it matters (measured: a B:address 29→25 modules, a 26-character B-Link 33→29).
 * A host joins ONLY after a LIVE check that its address in capitals opens the same page, and only for the paths that check covered:
 *   b.333.eco — a link code (7, 12 or 26 Crockford characters, a mark's hyphens allowed) and its /qr page: the same answer either case (measured
 *               2026-11-27). ⛔ NEVER an alpha stamp `/<letter>/<id>`: case-sensitive (/a/test → 301, /A/TEST → 404, measured the same day).
 *   333.eco   — a free address `/B:…`: one page either case (the Worker reads it case-insensitively; measured the same day).
 * ⛔ It decides how a NEW code is drawn and nothing else: a code already printed is never reprinted. KHQR is not a B-QR and never changes.
 */
export const BQR_CAPS: readonly { host: string; path: RegExp }[] = [
    { host: "b.333.eco", path: /^\/[0-9a-hjkmnp-tv-z-]{7,30}(\/qr)?$/i },
    { host: "333.eco", path: /^\/b:[0-9a-hjkmnp-tv-z-]{12,14}$/i },
];
/** The text a B-QR ENCODES: `text` in capitals when it is an https address on a listed host and path (and nothing after the path), else
 *  exactly `text`. The layout's seed and every check stay on `text` itself. */
export function bqrText(text: string, list: readonly { host: string; path: RegExp }[] = BQR_CAPS): string {
    const t = text.trim();
    if (!/^https:\/\//i.test(t)) return text;
    let u: URL;
    try { u = new URL(t); } catch { return text; }
    if (u.search || u.hash || u.username || u.password || u.port) return text;
    let path = u.pathname;
    try { path = decodeURIComponent(path); } catch { return text; }
    return list.some((c) => u.hostname === c.host && c.path.test(path)) ? t.toUpperCase() : text;
}
export function bqrPosition(text: string, by: BqrBy = "us"): BqrPosition {
    return bqrKind(text) === "b-link" ? (by === "outside" ? "notch" : "point") : by === "outside" ? "non-standard" : "standard";
}
/** Quarter turns counterclockwise from upright. */
export const BQR_TURNS: Readonly<Record<BqrPosition, 0 | 1 | 2 | 3>> = { standard: 0, point: 1, "non-standard": 2, notch: 3 };
/** The matrix turned that many quarters counterclockwise. Decoders read a code at any angle, so nothing printed before stops working. */
export function bqrTurned(mat: BqrMatrix, quarters = 1): BqrMatrix {
    let m: BqrMatrix = mat;
    for (let q = 0; q < quarters; q++) {
        const n = m.size, data = new Uint8Array(n * n), from = m.data;
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) data[r * n + c] = from[c * n + (n - 1 - r)] ? 1 : 0;
        m = { size: n, data };
    }
    return m;
}

/**
 * Where everything goes, in viewBox units. The module grid is the code's own, extended over the whole emblem; a decorative cell
 * is a candidate when it lies outside the code's quiet box AND its dot clears the outline; it is dark by the seeded stream unless
 * that would make a third dark cell in a row or a column.
 */
export function bqrLayout(mat: BqrMatrix, seed: string, o: { style?: BqrStyle; quiet?: number; lobe?: BqrLobe } = {}): BqrLayout {
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
    const rand = stream(seed), sign = (o.lobe ?? BQR_LOBE_DEFAULT) === "tm";
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
        dark.add(`${c},${r}`);
        // ⭐ A whole dot or none: the sign never cuts one. It is dropped AFTER it counted for the run rule, so no other dot moves (§tm S3).
        if (sign && touchesSign(ox + c * m, oy + r * m, m, style)) continue;
        deco.push([c, r]);
    }
    return { n, m, ox, oy, deco, style, outline: G.outline };
}

/** ⭐ v1.10.0 — the top lobe's coded cells, as [column, row] on the DRAWN (turned) code's grid, nearest the code first; bit i is in cells i and
 *   i + 96. A checkerboard, so no two stand side by side. ⛔ Throws when a code is too coarse for them (a mark's 12 characters never is). */
export const BQR_CODED_BITS = 96;
export function bqrLobeCells(mat: BqrMatrix, o: { style?: BqrStyle } = {}): [number, number][] {
    const L = bqrLayout(mat, "", { style: o.style ?? "outline", lobe: "none" }), clear = (DOT / 2) * L.m * Math.SQRT2 + L.outline / 2 + 0.15 * L.m, out: [number, number][] = [];
    const r0 = Math.floor((EMBLEM_BOX.y - L.oy) / L.m) - 1, c0 = Math.floor((EMBLEM_BOX.x - L.ox) / L.m) - 1, c1 = Math.ceil((EMBLEM_BOX.x + EMBLEM_BOX.w - L.ox) / L.m) + 1;
    for (let r = -BQR_QUIET - 1; r >= r0; r--) for (let c = c0; c <= c1; c++) {
        if ((c + r) & 1) continue;
        const cx = L.ox + (c + 0.5) * L.m, cy = L.oy + (r + 0.5) * L.m;
        if (insideEmblem(cx, cy) && edgeDistance(cx, cy) >= clear) out.push([c, r]);
    }
    if (out.length < 2 * BQR_CODED_BITS) throw new Error("B-QR: this code is too coarse for coded modules.");
    return out.slice(0, 2 * BQR_CODED_BITS);
}

// ---- drawing ------------------------------------------------------------------------------------------------------------------------

/** Where the emblem lands in a `size` square at (x, y): canvas px = t + k · viewBox units. ⭐ Centres the PAINTED bbox, never the viewBox. */
export function bqrPlacement(size: number, x = 0, y = 0): { k: number; tx: number; ty: number } {
    const k = (size * (1 - 2 * BQR_PAD)) / Math.max(EMBLEM_BOX.w, EMBLEM_BOX.h);
    return { k, tx: x + (size - EMBLEM_BOX.w * k) / 2 - EMBLEM_BOX.x * k, ty: y + (size - EMBLEM_BOX.h * k) / 2 - EMBLEM_BOX.y * k };
}

/**
 * ⭐ v2.0.0 (founder 2026-11-26, *"1–6 approve"*, item 6) — THE REFUSAL IS A PROPERTY OF EVERY DRAWING, not of `drawBqr` alone. `paintBqr` takes
 *   the matrix and the text apart, so until now a matrix of ANY address under an estate text drew our heart around a foreign code. Now it
 *   encodes the text itself, with the package's own `qrcode` at the drawing's ECC (`ecc`, default `BQR_ECC`), and draws ITS OWN matrix, only
 *   when the one it was given is the same module for module; anything else throws. ⛔ It never draws a matrix it could not check: before
 *   `bqrReady()` has loaded the encoder, it throws. The encoder is held here, never taken from a caller (a caller's encoder could return
 *   any matrix). `scripts/bqr.test.mjs` §refusal RF1–RF3.
 */
interface BqrEncoder { create(text: string, o: { errorCorrectionLevel: "L" | "M" | "Q" | "H" }): { modules: BqrMatrix } }
let ENCODER: BqrEncoder | null = null;
/** Load the encoder `paintBqr` checks with. Once is enough; `drawBqr` and `bqrDataUrl` do it themselves. */
export async function bqrReady(): Promise<void> {
    if (!ENCODER) ENCODER = (await import("qrcode")).default as unknown as BqrEncoder;
}
/** The text's own matrix, when `given` is exactly it; otherwise it throws. */
function ownMatrix(given: BqrMatrix, seed: string, ecc: "L" | "M" | "Q" | "H"): BqrMatrix {
    if (!ENCODER) throw new Error("B-QR: await bqrReady() before paintBqr — it checks every code against its own encoding of the address.");
    const own = ENCODER.create(seed, { errorCorrectionLevel: ecc }).modules, n = own.size;
    let same = !!given && given.size === n && !!given.data && given.data.length === own.data.length;
    for (let i = 0; same && i < n * n; i++) if (!given.data[i] !== !own.data[i]) same = false;
    if (!same) throw new Error("B-QR: that code is not this address's own (" + ecc + "): our heart frames only the code it makes from the address.");
    return own;
}

/** Paint a B-QR from a module matrix into a 2D context. Synchronous once `bqrReady()` has run; `drawBqr` makes the matrix.
 *  ⛔ v2.0.0 — the matrix must be the address's own, at the drawing's ECC: anything else throws (`ownMatrix`, above). */
export function paintBqr(g: CanvasRenderingContext2D, upright: BqrMatrix, seed: string, o: BqrOptions): void {
    paintBqrAt(g, upright, seed, o);
}
/** ⛔ TEST ONLY, never exported (v2.0.0, §refusal2 RF7): the levers the decode matrix needs and no product may pull. `at` — a position whatever the
 *  address says · `quiet` — clear modules between code and decoration (`pixels`; 0 is the broken control the matrix must catch) · `ink` — the
 *  code's colour, for the ink sweep that chose `BQR_INK` (⛔ never a theme's) · `fitAutograph: false` — an autograph where it was drawn on the pad. */
interface BqrTestOnly { at?: BqrPosition; quiet?: number; ink?: string; fitAutograph?: boolean }
/** ⛔ NOT EXPORTED, on purpose (v2.0.0): `scripts/bqr.test.mjs` exports it in its own transpiled copy, so nothing
 *  that imports this file can reach it. */
function paintBqrAt(g: CanvasRenderingContext2D, upright: BqrMatrix, seed: string, o: BqrOptions, t: BqrTestOnly = {}): void {
    // ⭐ v1.11.0 — turned by what the address IS (`bqrPosition`; it throws for an address outside the estate). The layout is the grid's, so the
    //   decoration and the outline do not move.
    // ⭐ v2.0.0 — and drawn from the address's OWN matrix, the one given only checked against it.
    const where = bqrPosition(seed, o.by), mat = bqrTurned(ownMatrix(upright, seed, o.ecc ?? BQR_ECC), BQR_TURNS[t.at ?? where]);
    // ⭐ §4AA — one green for the whole drawing: the decoration and the outline default to the code's own ink.
    // ⭐ v1.6.0 — `hue` sets the code, the decoration and the outline at once, darkened by `bqrInkFor`; none = `BQR_INK`, verbatim.
    // ⭐ v1.7.0 — `owner` sets it from the body palette instead; ⛔ both at once throws (a product cannot pick its own color).
    if (o.owner !== undefined && o.hue !== undefined) throw new Error("B-QR: pass `owner` or `hue`, never both — a product's code takes its body's color.");
    const inkOfHue = o.owner !== undefined ? bqrOwnerInk(o.owner) : o.hue ? bqrInkFor(o.hue) : BQR_INK;
    const X = o.x ?? 0, Y = o.y ?? 0, size = o.size, accent = o.accent || inkOfHue;
    if (o.autograph !== undefined && (bqrStyleOf(o.style) !== "outline" || !isAutograph(o.autograph))) throw new Error("B-QR: an autograph is drawn in the `outline` version (the Open B-QR) only, from a person's own strokes.");
    if (o.coded !== undefined && (bqrStyleOf(o.style) !== "outline" || o.coded.length !== BQR_CODED_BITS || !o.coded.every((b) => b === 0 || b === 1))) throw new Error("B-QR: coded modules are 96 bits in the `outline` version (the Open B-QR) only.");
    const lobe: BqrLobe = o.autograph ? "none" : o.lobe ?? BQR_LOBE_DEFAULT;
    const L = bqrLayout(mat, seed, { style: o.style, quiet: t.quiet, lobe });
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
    // ⭐ v1.10.0 — the top lobe's coded modules, each bit twice, dots as the decoration's own.
    if (o.coded) { g.fillStyle = accent; bqrLobeCells(mat, { style: "outline" }).forEach(([c, r], i) => { if (o.coded![i % BQR_CODED_BITS]) g.fillRect(L.ox + c * L.m + inset, L.oy + r * L.m + inset, d, d); }); }
    // ⭐ v1.9.0 — the bottom lobe, in the code's own ink.
    if (o.autograph) drawAutograph(g, o.autograph, accent, t.fitAutograph !== false);
    else if (lobe === "tm") { g.fillStyle = accent; drawTm(g, bqrStyleOf(o.style)); }
    g.restore();

    // ⭐ The code, in DEVICE pixels with every edge rounded, one rect per run — scaled sub-pixel rects leave hairline seams
    //   between modules, and a seam inside a finder is the last thing a camera should see.
    g.save(); g.fillStyle = t.ink || inkOfHue;
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
    await bqrReady();
    // ⭐ v2.1.0: the ENCODED text is in capitals where its host reads either case (BQR_CAPS); `text` stays the layout's seed.
    paintBqr(g, ENCODER!.create(bqrText(text), { errorCorrectionLevel: o.ecc ?? BQR_ECC }).modules, text, o);
}

/** A B-QR as a PNG data URL — the on-screen preview of a code a person may also download, so what they see is what they print. */
export async function bqrDataUrl(text: string, o: { size?: number; accent?: string; ecc?: "L" | "M" | "Q" | "H"; style?: BqrStyle; ground?: BqrGround; hue?: string; owner?: BqrOwner; lobe?: BqrLobe; autograph?: BqrAutograph; by?: BqrBy } = {}): Promise<string> {
    const size = o.size ?? 640;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    // ⛔ v1.5.0 — `ground: "heart"` only for a picture that stays on screen; a URL handed to a download takes the default `paper`.
    await drawBqr(canvas.getContext("2d")!, text, { size, accent: o.accent, ecc: o.ecc, style: o.style, ground: o.ground, hue: o.hue, owner: o.owner, lobe: o.lobe, autograph: o.autograph, by: o.by });
    return canvas.toDataURL("image/png");
}
