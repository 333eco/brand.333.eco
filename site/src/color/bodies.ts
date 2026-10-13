// /color/ — the FOURTH palette, the body palette, drawn by the recipe it documents (A383, founder 2026-10-12).
//
// Every code below comes from ../../../qr/bqr.ts — the bytes brand.lock hashes and every consumer vendors — with the `owner`
// a product passes, and every ink printed under it is read from `bqrOwnerInk`, never re-typed: a committed picture or a
// typed hex would be a PICTURE of the palette, and this page must be wrong the moment the palette is. The words come from
// data/bodies.json (which holds no hex at all) and, for HeartBank®'s six domains, from the rainbow's own tlds.json.
//
// These are the FINAL PRINTED colors: every one is drawn at the green's darkness (`bqrInkFor`), so all of them print and
// scan alike (`bqr.test.mjs` §body-palette, pre-registered and passed before v1.7.0 shipped). Every code opens this section.
//
// ⚠️ Loaded on /color/ only, beside page.js. Its ids are not in page.js's SECTIONS list, so a missing id throws here
// instead of falling back — a mistyped id must fail loudly, not render an empty section.

import { drawBqr, bqrOwnerInk, BQR_OWNERS, type BqrOwner } from "../../../qr/bqr";
import data from "../../../data/bodies.json";
import tokens from "../../../dist/tokens.json";

const must = (id: string) => {
    const n = document.getElementById(id);
    if (!n) throw new Error(`/color/: #${id} is missing`);
    return n;
};
const el = (tag: string, cls?: string, text?: string) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
};

type Body = { body: string; name: string; color: string; owners: string[]; prints?: string; motion?: string; why: string };
const bodies = (data as { bodies: Body[] }).bodies;
const hueOf = (tld: string) => (tokens as any).tlds.tlds.find((t: any) => t.tld === tld)?.hue ?? "";
const bodyOf = (o: string) => bodies.find((b) => b.owners.includes(o))!;
const label = (o: BqrOwner) => (o.startsWith("heartbank.") ? `H3 · .${o.slice("heartbank.".length)} ${hueOf(o)}` : `${o} · ${bodyOf(o).color}`);

const URL = "https://brand.333.eco/color/#bodies";
const grid = must("body-codes");
const CSS_PX = 168;
for (const owner of BQR_OWNERS) {
    const card = el("figure", "body-code");
    const canvas = document.createElement("canvas");
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = canvas.height = Math.round(CSS_PX * dpr);
    canvas.style.width = canvas.style.height = `${CSS_PX}px`;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", `${label(owner)} — a B-QR in ${bqrOwnerInk(owner)}`);
    card.append(canvas);
    const cap = el("figcaption");
    cap.append(el("strong", undefined, label(owner)), el("code", undefined, bqrOwnerInk(owner)));
    card.append(cap);
    grid.append(card);
    void drawBqr(canvas.getContext("2d")!, URL, { size: canvas.width, owner });
}

const tbody = must("body-rows");
for (const b of bodies) {
    const tr = el("tr");
    const inks = b.owners.map((o) => bqrOwnerInk(o as BqrOwner));
    tr.append(
        el("td", undefined, b.body),
        el("td", undefined, b.name),
        el("td", undefined, b.color),
        el("td", undefined, b.body === "H3" ? "one per domain (above)" : inks.join(" ")),
        el("td", undefined, b.why + (b.motion ? ` — ${b.motion}` : "")),
    );
    tbody.append(tr);
}
