// /qr/ — the B-QR, drawn by the recipe it documents.
//
// Every code on this page comes from ../../../qr/bqr.ts and ../../../qr/bqr-card.ts — the bytes brand.lock hashes and every
// consumer vendors — exactly as /wordmark/ draws its specimens from emblem.path.txt. A committed PNG would be a PICTURE of a
// B-QR; drawing it makes this page wrong the moment the recipe is. Every number printed here is read off the constants the
// recipe exports, never re-typed, for the same reason.
//
// Every code opens THIS page, so a visitor can check any specimen with a phone.
//
// ⭐ v1.6.0 — THE B-QRs FOLLOW THE MARK'S COLOR (founder 2026-10-06): each is drawn in the hue of the visitor's `--emblem`, at
// the green's darkness, by the recipe's own `bqrInkFor` — so a ruby or a diamond B-QR here prints and scans like the green
// (`bqr.test.mjs` §emblem-hue). The apps pass no hue and keep the one green; this page is the only caller that passes one.
//
// ⚠️ Loaded on /qr/ only, beside page.js (which every page loads). It owns no id page.js knows about, so page.js's SECTIONS
// whitelist does not list these — and these lookups throw on a missing id instead of falling back, for the reason that list
// exists: a mistyped id must fail loudly, not render an empty section.

import {
    bqrInkFor, bqrLayout, bqrPlacement, drawBqr, BQR_ECC, BQR_GEOMETRY, BQR_INK, BQR_QUIET, BQR_STYLES, EMBLEM_BOX, EMBLEM_D,
    type BqrGround, type BqrStyle
} from "../../../qr/bqr";
import { paintQrCard } from "../../../qr/bqr-card";

const HERE = "https://brand.333.eco/qr/";
const SIZE = 640;

// The two public names (ruled 2026-10-06, replacing Green / White — a color name stops being true once the color follows the
// mark). ⛔ The internal ones (`pixels`, `outline`) are code identifiers and never captions.
const NAME: Record<BqrStyle, string> = { pixels: "Full B-QR", outline: "Open B-QR" };
const ABOUT: Record<BqrStyle, string> = {
    pixels: "the lobes full of modules on the code's own grid",
    outline: "the lobes left open inside a thick outline"
};

const byId = <T extends HTMLElement>(id: string): T => {
    const n = document.getElementById(id);
    if (!n) throw new Error(`qr.ts: #${id} is not on this page`);
    return n as T;
};

const el = (tag: string, cls?: string, text?: string) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
};

// ------------------------------------------------------------------------------------------------ the color, live ---
//
// The mark's color can change sixty times a second (the rotation), so the B-QRs are NOT redrawn when it does. Each is drawn
// ONCE, in the default ink, and split into two layers: the PAPER (white, with the drawing's own coverage) and the INK (an alpha
// mask). CSS paints the mask with `--bqr-ink`, and only that one property moves. Stacking the two is the same arithmetic as
// drawing the ink over the paper in one pass, so the picture is the recipe's drawing with that hue — checked to within 1/255
// against `paintBqr({ hue })` across both versions, both grounds, both backgrounds and four hues before this shipped.
//
// The split is exact because every dark pixel is one ink over white or over nothing: with `a` the alpha and `R` the red channel
// (unpremultiplied, as getImageData returns it), the ink's coverage is c = (255a − Ra) / (255 − R_ink) and the paper's is
// p = (a − c) / (1 − c). Red is used because it is the channel `BQR_INK` is furthest from white in.
const INK_R = parseInt(BQR_INK.slice(1, 3), 16);
const layerCache = new Map<string, Promise<{ paper: string; ink: string }>>();

const layersOf = (style: BqrStyle, ground: BqrGround) => {
    const key = `${style}/${ground}`;
    let p = layerCache.get(key);
    if (!p) {
        p = (async () => {
            const src = document.createElement("canvas");
            src.width = src.height = SIZE;
            await drawBqr(src.getContext("2d")!, HERE, { size: SIZE, style, ground });
            const d = src.getContext("2d")!.getImageData(0, 0, SIZE, SIZE).data;
            const paper = new ImageData(SIZE, SIZE), ink = new ImageData(SIZE, SIZE);
            for (let i = 0; i < d.length; i += 4) {
                const a = d[i + 3] / 255;
                const c = Math.max(0, Math.min(1, (255 * a - d[i] * a) / (255 - INK_R)));
                const pp = c < 1 ? Math.max(0, Math.min(1, (a - c) / (1 - c))) : 0;
                paper.data[i] = paper.data[i + 1] = paper.data[i + 2] = 255;
                paper.data[i + 3] = Math.round(pp * 255);
                ink.data[i + 3] = Math.round(c * 255);
            }
            const url = (img: ImageData) => {
                const c = document.createElement("canvas");
                c.width = c.height = SIZE;
                c.getContext("2d")!.putImageData(img, 0, 0);
                return c.toDataURL("image/png");
            };
            return { paper: url(paper), ink: url(ink) };
        })();
        layerCache.set(key, p);
    }
    return p;
};

/** A B-QR in the live ink: the paper as an <img>, the ink as a mask painted by `--bqr-ink`. */
const liveBqr = async (style: BqrStyle, ground: BqrGround) => {
    const { paper, ink } = await layersOf(style, ground);
    const box = el("div", "bqr-live");
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", `${NAME[style]}, opens brand.333.eco/qr/`);
    const img = el("img") as HTMLImageElement;
    img.alt = "";
    img.width = img.height = 320;
    img.src = paper;
    const mask = el("span", "bqr-ink");
    mask.style.setProperty("-webkit-mask-image", `url(${ink})`);
    mask.style.setProperty("mask-image", `url(${ink})`);
    box.append(img, mask);
    return box;
};

const figure = async (style: BqrStyle, ground: BqrGround, caption?: string) => {
    const fig = el("figure", "bqr-fig");
    fig.append(await liveBqr(style, ground));
    const cap = el("figcaption");
    cap.append(el("b", undefined, NAME[style]));
    cap.append(document.createTextNode(caption ?? ABOUT[style]));
    fig.append(cap);
    return fig;
};

// ------------------------------------------------------------------------------------------ the theme you are reading ---
//
// Read off the CASCADE, never re-derived here: theme-3block.css sets `color-scheme` on :root in every one of its three
// states, so the computed value is the theme's own answer. A copy of its logic in this file (class, else media query) would
// be a second definition of the theme, and the two would drift.
const root = document.documentElement;
const isDark = () => getComputedStyle(root).colorScheme.includes("dark");
const groundForTheme = (): BqrGround => (isDark() ? "heart" : "paper");

// ------------------------------------------------------------------------------------------------------- versions ---

const versions = byId("bqr-versions");
const now = byId("bqr-now");
const inkReadout = byId("bqr-ink");
let drawn: BqrGround | null = null;
let currentInk = BQR_INK;
/** The mark's color as the cascade resolved it — the HUE the card is painted with (the recipe darkens it, not this file). */
let currentHue = BQR_INK;

const readout = () => {
    now.textContent = `ground: "${drawn ?? groundForTheme()}" · ink ${currentInk} — the mark's hue at ${BQR_INK}'s darkness`;
    inkReadout.textContent = currentInk;
};

const drawVersions = async () => {
    const ground = groundForTheme();
    if (ground === drawn) return;
    drawn = ground;
    const figs = await Promise.all(BQR_STYLES.map(async (s) => {
        const stage = el("div", "bqr-stage");
        stage.append(await figure(s, ground));
        return stage;
    }));
    versions.replaceChildren(...figs);
    readout();
};

// ------------------------------------------------------------------------------------------------------ the ink ---
//
// page.js owns `--emblem` (the picker and the rotation write it on <html>). This reads what the CASCADE resolved — a probe
// painted `color: var(--emblem)` — so a fixed gem (`var(--color-ruby)`) and a rotation frame (`rgb(…)`) arrive the same way,
// and hands it to the recipe's `bqrInkFor`. Written on <main>, never on <html>: the observer watches <html>'s style, and a
// write there would wake it again.
const main = document.querySelector("main")!;
const probe = el("span");
probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;color:var(--emblem)";
probe.setAttribute("aria-hidden", "true");
main.append(probe);

let cardTimer: number | null = null;
const followMark = () => {
    currentHue = getComputedStyle(probe).color;
    const ink = bqrInkFor(currentHue);
    if (ink === currentInk && main.style.getPropertyValue("--bqr-ink")) return;
    currentInk = ink;
    main.style.setProperty("--bqr-ink", ink);
    readout();
    // The card is painted, not layered (its words are in other colors), so it follows at most every 0.6 s.
    if (cardTimer === null) cardTimer = window.setTimeout(() => { cardTimer = null; void drawCard(); }, 600);
};

new MutationObserver(() => { void drawVersions(); followMark(); }).observe(root, { attributes: true, attributeFilter: ["class", "style"] });
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => void drawVersions());

// -------------------------------------------------------------------------------------------------------- grounds ---
//
// Three panels, each pinned to one theme's -l-/-d- pair by its class (page.css), so all three show whatever theme the page
// itself is in. The third is the tile — what every consumer drew on a dark page before v1.5.0, and still correct.
//
// ⚠️ Each async block is a FUNCTION, called at the foot: the build targets es2021, which has no top-level await.
const drawGrounds = async () => {
    const PANELS: { theme: "light" | "dark"; ground: BqrGround; label: string; note: string }[] = [
        { theme: "light", ground: "paper", label: "light page · paper", note: "on the light ground the square all but disappears" },
        { theme: "dark", ground: "heart", label: "dark page · heart", note: "only the silhouette is paper (v1.5.0)" },
        { theme: "dark", ground: "paper", label: "dark page · paper", note: "the white tile, which still scans" }
    ];
    const box = byId("bqr-grounds");
    for (const p of PANELS) {
        const panel = el("div", `ground on-${p.theme}`);
        panel.append(el("p", "ground-label", p.label));
        const row = el("div", "ground-row");
        for (const s of BQR_STYLES) row.append(await figure(s, p.ground, ""));
        panel.append(row);
        panel.append(el("p", "ground-note", p.note));
        box.append(panel);
    }
};

// -------------------------------------------------------------------------------------------------------- anatomy ---
//
// The geometry, drawn in the emblem's own viewBox units from the exported constants, with the real B-QR faintly under it —
// the same two layers, the ink as an SVG alpha mask filled with `--bqr-ink`.
// The code box needs the module matrix, so `qrcode` is loaded here the same way the recipe loads it.
const drawAnatomy = async () => {
    const QRCode = (await import("qrcode")).default;
    const q = QRCode.create(HERE, { errorCorrectionLevel: BQR_ECC });
    const f = (v: number) => String(Number(v.toFixed(4)));
    const box = byId("bqr-anatomy");

    for (const style of BQR_STYLES) {
        const G = BQR_GEOMETRY[style];
        const L = bqrLayout(q.modules, HERE, { style });
        const { k, tx, ty } = bqrPlacement(SIZE);
        const { paper, ink } = await layersOf(style, "heart");
        const E = EMBLEM_BOX;
        const code = L.n * L.m;
        const at = `x="${-tx / k}" y="${-ty / k}" width="${SIZE / k}" height="${SIZE / k}"`;

        const fig = el("figure", "bqr-anatomy");
        fig.innerHTML =
            `<svg viewBox="-0.5 -0.5 25 25" role="img" aria-label="${NAME[style]} geometry">` +
            `<defs><mask id="bqr-ink-${style}" maskUnits="userSpaceOnUse" style="mask-type:alpha">` +
            `<image href="${ink}" ${at} /></mask></defs>` +
            `<g opacity="0.28"><image href="${paper}" ${at} />` +
            `<rect class="a-ink" ${at} mask="url(#bqr-ink-${style})" /></g>` +
            `<rect class="a-viewbox" x="0" y="0" width="24" height="24" />` +
            `<rect class="a-bbox" x="${E.x}" y="${E.y}" width="${E.w}" height="${E.h}" />` +
            `<path class="a-outline" d="${EMBLEM_D}" stroke-width="${G.outline}" />` +
            `<rect class="a-body" x="${G.body.x}" y="${G.body.y}" width="${G.body.s}" height="${G.body.s}" />` +
            `<rect class="a-code" x="${L.ox}" y="${L.oy}" width="${code}" height="${code}" />` +
            `</svg>`;

        const cap = el("figcaption");
        cap.append(el("b", undefined, NAME[style]));
        const ul = el("ul", "legend mono");
        const row = (cls: string, text: string) => {
            const li = el("li");
            li.append(el("span", `key ${cls}`));
            li.append(document.createTextNode(text));
            ul.append(li);
        };
        row("k-viewbox", "viewBox 24 × 24");
        row("k-bbox", `painted box ${f(E.w)} × ${f(E.h)} at (${f(E.x)}, ${f(E.y)}), centered`);
        row("k-outline", `outline ${f(G.outline)}`);
        row("k-body", `body ${f(G.body.s)} at (${f(G.body.x)}, ${f(G.body.y)})`);
        row("k-code", `code ${L.n} × ${L.n} modules, ${BQR_QUIET} clear on each side`);
        if (G.decorate) row("k-none", `decoration up to ${G.ring} clear module from the code, never 0`);
        cap.append(ul);
        fig.append(cap);
        box.append(fig);
    }
};

// ----------------------------------------------------------------------------------------------------------- card ---
//
// Painted at full print size and shown smaller by CSS, so what is on screen is the pixels a consumer saves — in the live hue,
// through the same `hue` option a consumer would pass. The words are set in the page's own typeface, loaded first: a card
// painted before the face arrives is painted in the fallback forever.
const card = byId<HTMLCanvasElement>("bqr-card");
const face = `"Public Sans", system-ui, sans-serif`;
const fontsReady = Promise.all([document.fonts.load(`600 72px "Public Sans"`), document.fonts.load(`400 30px "Public Sans"`)])
    .catch(() => { /* offline without the font — the fallback face is still a correct card */ });

async function drawCard() {
    await fontsReady;
    await paintQrCard(card.getContext("2d")!, {
        url: HERE,
        title: "brand.333.eco",
        caption: "Scan to see how it is drawn",
        foot: "brand.333.eco/qr",
        hue: currentHue
    }, face);
}

followMark();
void drawVersions();
void drawGrounds();
void drawAnatomy();
void drawCard();
