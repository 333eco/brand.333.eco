import { drawBqr, type BqrStyle } from "./bqr";

/**
 * ⭐ A PRINTABLE B-QR CARD — one layout for every code of ours a person may want on paper or in a chat: the title on top (a shop's
 *   name, a family's), the code large (drawn fresh at print size, never a screen image stretched), one line saying what it is for,
 *   and the address in words underneath, small.
 * ⭐ The code is a B-QR (`./bqr.ts`) — the same drawing as the on-screen preview, so what a person sees is what they print.
 *   ⛔ Never a bank's code (KHQR): that stays plain, and is never laid out on this card.
 * ⛔ PURE DRAWING: no DOM, no network. The consumer supplies the canvas, the face and the save; nothing here uploads or counts.
 *
 * Born as `paintQrCard` in the HeartBank® Shops app (2026-10-03); moved here with the recipe on 2026-10-04, so `scripts/bqr.test.mjs`
 * decodes the card exactly as every consumer lays it out.
 * ⛔ VENDORED, NEVER EDITED IN A CONSUMER: `brand.lock` hashes this file.
 */
export interface BqrCard {
    /** What the code opens. */
    url: string;
    /** Large, at the top. */
    title: string;
    /** One line under the code — what it is for. */
    caption: string;
    /** Small, at the foot — the address in words (and a code a person could type). */
    foot: string;
    /** The decoration and outline colour; absent = `BQR_INK`, one green for the whole drawing. ⭐ Pass the SAME as the preview. */
    accent?: string;
    /** Which of the two versions. ⭐ Pass the SAME as the preview. */
    style?: BqrStyle;
    /** ⭐ v1.6.0 — the drawing's color family, at the green's darkness (`bqrInkFor`). Absent = `BQR_INK`. ⭐ Pass the SAME as the preview. */
    hue?: string;
}

/**
 * The card's layout, in pixels. ⭐ The emblem's square is wider than a plain code would be (900) because the code fills only the
 * emblem's body; the painted bbox is centred inside `code` by `drawBqr`.
 */
export const CARD = { W: 1200, H: 1560, title: 140, code: { x: 80, y: 205, size: 1040 }, caption: 1318, foot: 1416 } as const;

/**
 * ⭐ v1.6.1 (2026-10-11) — ONE LINE OF WORDS, PLACED, NEVER ALIGNED: measured, its size reduced until it fits `maxW`, and drawn from
 *   its left edge at the center minus half its width.
 * ⛔⛔ Never `textAlign = "center"`, never the `maxWidth` argument of `fillText`: Safari on iOS 26 ignores BOTH for a line it shapes
 *   as a complex script. A Khmer caption started AT the center line (a shop owner's print, 2026-10-11) — measured on the Simulator,
 *   the same call drew its ink at 602–902 on a 1200 card in iOS 26.5 and at 447–748 in iOS 17.0, 18.0 and 18.2, while `measureText`
 *   gave 309 in every one; a Latin line was centered in all of them, and a Khmer line wider than `maxWidth` ran off the card in 26.5.
 *   So the placement is computed from `measureText`, which was right everywhere, and the fit is the font size, which every engine honors.
 */
function placeLine(g: CanvasRenderingContext2D, text: string, y: number, weight: number, size: number, face: string, maxW: number): void {
    g.font = `${weight} ${size}px ${face}`;
    let w = g.measureText(text).width;
    if (w > maxW) {
        g.font = `${weight} ${Math.max(1, Math.floor((size * maxW) / w))}px ${face}`;
        w = g.measureText(text).width;
    }
    g.fillText(text, (CARD.W - w) / 2, y);
}

/** Paint the card into any 2D context. `face` is the font family the words are set in (the page's own, Khmer included). */
export async function paintQrCard(g: CanvasRenderingContext2D, c: BqrCard, face: string): Promise<void> {
    const { W, H } = CARD;
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    await drawBqr(g, c.url, { ...CARD.code, accent: c.accent, style: c.style, hue: c.hue });
    g.fillStyle = "#16141c"; g.textAlign = "left"; g.textBaseline = "middle";
    placeLine(g, c.title, CARD.title, 600, 72, face, W - 120);
    placeLine(g, c.caption, CARD.caption, 500, 54, face, W - 120);
    g.fillStyle = "#6b6878";
    placeLine(g, c.foot, CARD.foot, 400, 30, face, W - 120);
}
