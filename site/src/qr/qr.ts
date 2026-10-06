// /qr/ — the B-QR, drawn by the recipe it documents.
//
// Every code on this page comes from ../../../qr/bqr.ts and ../../../qr/bqr-card.ts — the bytes brand.lock hashes and every
// consumer vendors — exactly as /wordmark/ draws its specimens from emblem.path.txt. A committed PNG would be a PICTURE of a
// B-QR; drawing it makes this page wrong the moment the recipe is. Every number printed here is read off the constants the
// recipe exports, never re-typed, for the same reason.
//
// Every code opens THIS page, so a visitor can check any specimen with a phone.
//
// ⚠️ Loaded on /qr/ only, beside page.js (which every page loads). It owns no id page.js knows about, so page.js's SECTIONS
// whitelist does not list these — and these lookups throw on a missing id instead of falling back, for the reason that list
// exists: a mistyped id must fail loudly, not render an empty section.

import {
    bqrDataUrl, bqrLayout, bqrPlacement, BQR_ECC, BQR_GEOMETRY, BQR_INK, BQR_QUIET, BQR_STYLES, EMBLEM_BOX, EMBLEM_D,
    type BqrGround, type BqrStyle
} from "../../../qr/bqr";
import { paintQrCard } from "../../../qr/bqr-card";

const HERE = "https://brand.333.eco/qr/";

// The two public names. ⛔ The internal ones (`pixels`, `outline`) are code identifiers and never captions.
const NAME: Record<BqrStyle, string> = { pixels: "Green B-QR", outline: "White B-QR" };
const ABOUT: Record<BqrStyle, string> = {
    pixels: "the lobes filled with green modules on the code's own grid",
    outline: "a white heart inside a thick green outline"
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

const figure = async (style: BqrStyle, ground: BqrGround, caption?: string) => {
    const fig = el("figure", "bqr-fig");
    const img = el("img") as HTMLImageElement;
    img.alt = `${NAME[style]}, opens brand.333.eco/qr/`;
    img.width = img.height = 320;
    img.src = await bqrDataUrl(HERE, { style, ground });
    fig.append(img);
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
let drawn: BqrGround | null = null;

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
    now.textContent = ground === "heart"
        ? `ground: "heart" — you are reading in the dark theme, so only the heart is paper`
        : `ground: "paper" — you are reading in the light theme, so the whole square is paper`;
};

new MutationObserver(() => void drawVersions()).observe(root, { attributes: true, attributeFilter: ["class"] });
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => void drawVersions());
void drawVersions();

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
// The geometry, drawn in the emblem's own viewBox units from the exported constants, with the real B-QR faintly under it.
// The code box needs the module matrix, so `qrcode` is loaded here the same way the recipe loads it.
const drawAnatomy = async () => {
    const QRCode = (await import("qrcode")).default;
    const q = QRCode.create(HERE, { errorCorrectionLevel: BQR_ECC });
    const f = (v: number) => String(Number(v.toFixed(4)));
    const SIZE = 640;
    const box = byId("bqr-anatomy");

    for (const style of BQR_STYLES) {
        const G = BQR_GEOMETRY[style];
        const L = bqrLayout(q.modules, HERE, { style });
        const { k, tx, ty } = bqrPlacement(SIZE);
        const under = await bqrDataUrl(HERE, { style, size: SIZE, ground: "heart" });
        const E = EMBLEM_BOX;
        const code = L.n * L.m;

        const fig = el("figure", "bqr-anatomy");
        fig.innerHTML =
            `<svg viewBox="-0.5 -0.5 25 25" role="img" aria-label="${NAME[style]} geometry">` +
            `<image href="${under}" x="${-tx / k}" y="${-ty / k}" width="${SIZE / k}" height="${SIZE / k}" opacity="0.28" />` +
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

// --------------------------------------------------------------------------------------------------- one green ---

byId("bqr-ink").textContent = BQR_INK;

// ----------------------------------------------------------------------------------------------------------- card ---
//
// Painted at full print size and shown smaller by CSS, so what is on screen is the pixels a consumer saves. The words are
// set in the page's own typeface, loaded first: a card painted before the face arrives is painted in the fallback forever.
const drawCard = async () => {
    const canvas = byId<HTMLCanvasElement>("bqr-card");
    const face = `"Public Sans", system-ui, sans-serif`;
    try {
        await Promise.all([document.fonts.load(`600 72px "Public Sans"`), document.fonts.load(`400 30px "Public Sans"`)]);
    } catch {
        /* offline without the font — the fallback face is still a correct card */
    }
    await paintQrCard(canvas.getContext("2d")!, {
        url: HERE,
        title: "brand.333.eco",
        caption: "Scan to see how it is drawn",
        foot: "brand.333.eco/qr"
    }, face);
};

void drawGrounds();
void drawAnatomy();
void drawCard();
