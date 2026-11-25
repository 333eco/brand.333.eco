/**
 * The two B-Watermark℠ looks with no code (v1.12.0; founder 2026-11-25: *"change it; AI-made pictures cannot have a B-Autograph; yes to
 * faint"* · *"how about B-Symbol ?"*):
 *
 *   SILHOUETTE — the B-Emblem, FAINT: a see-through white heart with a soft edge, a person's B-Autograph℠ on it when they may add one.
 *   B-SYMBOL℠  — a tiny B-Emblem beside a person's B-Autograph, as a ™ stands beside a name, for artists who already sign their work.
 *
 * ⛔ NEVER WITHOUT THE INVISIBLE MARK IN THE SAME FILE. Neither look carries an address, so the caller (origin.333.eco) forces the invisible
 *   mark on and reads it back before the press, and refuses the look if it doesn't hold. This file only draws; it cannot see the file.
 *   (The 11/23 rule *"the B-Emblem never stands alone in a file's pixels"* was amended to exactly this on 2026-11-25.)
 * ⛔ NO B-AUTOGRAPH ON A PICTURE DECLARED AI-MADE, so a B-Symbol is never on one: the caller decides; `paintSymbol` needs an autograph.
 * ⛔ No word in the pixels, ever: no *signed*, *verified* or *real*. A static emblem asserts no humanness (the two proof-states, 7/01).
 * ⛔ VENDORED, NEVER EDITED IN A CONSUMER: `brand.lock` hashes this file.
 */
import { EMBLEM_BOX, EMBLEM_D, BQR_OUTLINE, bqrOwnerInk, isAutograph, paintAutograph, type BqrAutograph } from "./bqr";

/** How faint: the white let through inside the heart, and the edge's ink. ⭐ "yes to faint" (founder 2026-11-25). */
export const SILHOUETTE = { white: 0.4, edge: 0.35, line: BQR_OUTLINE * 2 } as const;
/**
 * ⭐ v1.13.0 (founder 2026-11-25: *"vertically and horizontally center the B-Autograph within the B-Emblem"*) — the emblem's CENTER, solved from
 *   the silhouette as the lobe's was (v1.10.0): the point midway between the edges on its own row AND midway between the edges on its own
 *   column, found by iterating from the painted box's center (12.72, 11.28) until it stands still: (12.41, 11.59). `scripts/bqr.test.mjs`
 *   §looks2 solves it again and holds these.
 */
export const SILHOUETTE_CENTER = { x: 12.41, y: 11.59 } as const;
/**
 * The autograph's box on the silhouette, 5 : 3, in viewBox units, CENTERED on the emblem (the fitted hand stands at the box's center). The
 * largest 5 : 3 box there at least 0.6 units inside the edge is 8.17 wide; this one is 8. ⚠️ Smaller than v1.12's 12 (which stood low and to
 * the left, where the body is widest): centered is the ruling, and the size is what the center allows.
 */
export const SILHOUETTE_AUTOGRAPH = { x: SILHOUETTE_CENTER.x - 4, y: SILHOUETTE_CENTER.y - 2.4, w: 8, h: 4.8 } as const;
/** The B-Symbol's emblem beside the ink: its height as a part of the ink's height, and the gap before it, as a part of that height. */
export const SYMBOL = { size: 0.3, gap: 0.2 } as const;
/** ⭐ v1.13.0 (founder 2026-11-25: *"let the user choose B-Symbol as subscript or superscript?"*): raised, at the ink's top (as a ™), or lowered,
 *  at its bottom. Raised is the default. */
export type SymbolPosition = "super" | "sub";
/** The ink a person's own hand is drawn in when the caller names none: Space's, as every mark of 333.eco (the body palette, `MA`). */
export const LOOK_INK = bqrOwnerInk("MA");

/** Where the silhouette stands in the square `size` at (x, y): its scale and offset, from the emblem's painted box (as `bqrPlacement`, unpadded). */
export function silhouettePlacement(size: number, x = 0, y = 0): { k: number; tx: number; ty: number } {
    const k = size / Math.max(EMBLEM_BOX.w, EMBLEM_BOX.h);
    return { k, tx: x + (size - EMBLEM_BOX.w * k) / 2 - EMBLEM_BOX.x * k, ty: y + (size - EMBLEM_BOX.h * k) / 2 - EMBLEM_BOX.y * k };
}
/** ⭐ v1.12.1 — the autograph's box on a silhouette in the square `size` at (x, y), in the context's own units, so a caller can read the
 *  picture under it and choose the ink before painting (origin does). */
export function silhouetteAutographBox(size: number, x = 0, y = 0) {
    const { k, tx, ty } = silhouettePlacement(size, x, y), A = SILHOUETTE_AUTOGRAPH;
    return { x: tx + A.x * k, y: ty + A.y * k, w: A.w * k, h: A.h * k };
}
/** Paint the SILHOUETTE into the square `size` at (x, y), its autograph on it when one is given. Clears nothing: it is drawn ON a picture. */
export function paintSilhouette(g: CanvasRenderingContext2D, o: { size: number; x?: number; y?: number; white?: number; edgeInk?: string; autograph?: BqrAutograph; ink?: string }): void {
    if (o.autograph !== undefined && !isAutograph(o.autograph)) throw new Error("silhouette: an autograph is a person's own strokes.");
    const { k, tx, ty } = silhouettePlacement(o.size, o.x, o.y), path = new Path2D(EMBLEM_D);
    g.save(); g.translate(tx, ty); g.scale(k, k);
    g.fillStyle = `rgba(255,255,255,${o.white ?? SILHOUETTE.white})`; g.fill(path);
    g.globalAlpha = SILHOUETTE.edge; g.strokeStyle = o.edgeInk ?? LOOK_INK; g.lineWidth = SILHOUETTE.line; g.lineJoin = "round"; g.stroke(path);
    g.restore();
    if (o.autograph) paintAutograph(g, o.autograph, silhouetteAutographBox(o.size, o.x, o.y), o.ink ?? LOOK_INK);
}

/** Where a B-Symbol lands for an autograph fitted to `box`: the ink, the emblem beside it, and the whole. Pure: nothing is drawn. */
export function symbolLayout(a: BqrAutograph, box: { x: number; y: number; w: number; h: number }, position: SymbolPosition = "super") {
    if (!isAutograph(a)) throw new Error("B-Symbol: it stands beside a person's own B-Autograph, never alone.");
    const ink = paintAutograph(nullContext(), a, box, "#000");
    const s = ink.h * SYMBOL.size, em = { x: ink.x + ink.w + s * SYMBOL.gap, y: position === "sub" ? ink.y + ink.h - s : ink.y, w: s, h: s };
    const x1 = Math.max(ink.x + ink.w, em.x + em.w), y1 = Math.max(ink.y + ink.h, em.y + em.h);
    return { ink, emblem: em, all: { x: ink.x, y: ink.y, w: x1 - ink.x, h: y1 - ink.y } };
}
/** Paint the B-SYMBOL: the person's autograph fitted to `box`, and the B-Emblem at its upper right, in the same ink, as a ™. */
export function paintSymbol(g: CanvasRenderingContext2D, o: { autograph: BqrAutograph; box: { x: number; y: number; w: number; h: number }; ink?: string; position?: SymbolPosition }) {
    const L = symbolLayout(o.autograph, o.box, o.position), ink = o.ink ?? LOOK_INK;
    paintAutograph(g, o.autograph, o.box, ink);
    const k = L.emblem.w / Math.max(EMBLEM_BOX.w, EMBLEM_BOX.h);
    g.save(); g.translate(L.emblem.x - EMBLEM_BOX.x * k, L.emblem.y - EMBLEM_BOX.y * k); g.scale(k, k);
    g.fillStyle = ink; g.fill(new Path2D(EMBLEM_D));
    g.restore();
    return L;
}

/** A context that draws nothing, so the layout is measured by the very code that paints (never a second copy of the arithmetic). */
function nullContext(): CanvasRenderingContext2D {
    const no = () => undefined;
    return new Proxy({} as CanvasRenderingContext2D, { get: () => no, set: () => true });
}
