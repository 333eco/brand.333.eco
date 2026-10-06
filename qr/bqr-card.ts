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
    /** ⭐ v1.6.0 — the drawing's colour family, at the green's darkness (`bqrInkFor`). Absent = `BQR_INK`. ⭐ Pass the SAME as the preview. */
    hue?: string;
}

/**
 * The card's layout, in pixels. ⭐ The emblem's square is wider than a plain code would be (900) because the code fills only the
 * emblem's body; the painted bbox is centred inside `code` by `drawBqr`.
 */
export const CARD = { W: 1200, H: 1560, title: 140, code: { x: 80, y: 205, size: 1040 }, caption: 1318, foot: 1416 } as const;

/** Paint the card into any 2D context. `face` is the font family the words are set in (the page's own, Khmer included). */
export async function paintQrCard(g: CanvasRenderingContext2D, c: BqrCard, face: string): Promise<void> {
    const { W, H } = CARD;
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    await drawBqr(g, c.url, { ...CARD.code, accent: c.accent, style: c.style, hue: c.hue });
    g.fillStyle = "#16141c"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `600 72px ${face}`;
    g.fillText(c.title, W / 2, CARD.title, W - 120);
    g.font = `500 54px ${face}`;
    g.fillText(c.caption, W / 2, CARD.caption, W - 120);
    g.fillStyle = "#6b6878"; g.font = `400 30px ${face}`;
    g.fillText(c.foot, W / 2, CARD.foot, W - 120);
}
