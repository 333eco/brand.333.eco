import { html } from "lit";

// The B-Emblem — a heart rotated 45 degrees clockwise, bistable as both a heart
// and a capital B. HeartBank's institutional mark.
//
// A BARE TEMPLATE FUNCTION, NOT A CUSTOM ELEMENT, and deliberately so: the
// caller passes its own class list, which is what lets one call site beat and
// another not. See css/motion.css — `.beating` goes on CHROME and never beside
// a person's name.
//
// ⚠️ THE ROTATION IS BAKED INTO THE PATH COORDINATES, and it has to stay that
// way. It used to live in transform="rotate(45 12 12) translate(0,2)", which is
// a trap: a CSS animation on `transform` overrides a non-animated one, so the
// first time a heartbeat touches this node the mark silently un-rotates and
// stops reading as a B.
//
// ⚠️ INLINE, never <img src>: CSS cannot reach inside an <img>, which is what
// forces the colour to be duplicated wherever the mark appears.
// fill="currentColor" means it takes whatever sets `color` on it; call sites
// set that to var(--emblem).
//
// aria-hidden because a text label sits beside it everywhere it is used. The
// accessible name comes from that text and never from the glyph. (emblem.svg,
// which is a standalone document rather than a fragment, carries role="img" and
// an aria-label instead — the two are correct in their own contexts and are not
// a discrepancy to reconcile.)
//
// ⚠️ Tailwind's preflight sets svg { display: block }, which drops the mark onto
// its own line inside a <p>. A call site inside flowing text needs
// `display: inline-block; vertical-align: -0.12em` — 333.eco's hb-footer
// carries that rule and the reason.
export const emblem = (classes = "") => html`
    <svg
        class=${classes}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false">
        <path
            fill="currentColor"
            d="M3.9743 20.0257L3.8824 18.0670C3.5430 11.1232 3.3167 6.5411 5.9896 3.8683C8.1675 1.6904 11.5899 1.6904 13.7678 3.8683C14.9981 5.0986 15.6062 6.8523 15.4719 8.5281C17.1477 8.3938 18.9014 9.0019 20.1317 10.2322C22.3096 12.4101 22.3096 15.8325 20.1317 18.0104C17.4589 20.6833 12.8768 20.4570 5.9260 20.1247L3.9743 20.0257Z" />
    </svg>
`;
