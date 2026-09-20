// The page builds itself from dist/tokens.json — the generated artifact — while
// PAINTING every swatch with the CSS variable it names. That split is the point
// and not an accident: the label comes from the generator's reading of
// tokens.css, the colour comes from the browser's reading of tokens.css, and if
// those two ever disagree the swatch and its caption disagree ON THE PAGE. The
// guidelines cannot quietly drift from the palette; the drift is the render.
//
// The role swatches go one step further and report getComputedStyle, so what is
// printed is what the cascade actually resolved in the theme you are in — not
// what any file claims it should be.

import tokens from "../../dist/tokens.json";

// THE PATH, not a copy of it. emblem.path.txt is one of the nine files
// brand.lock hashes and every consumer vendors, so the wordmark specimen on
// /wordmark/ is drawn by the same bytes a consuming site draws its own mark
// with. Pasting the `d` here would make that page a PICTURE of the wordmark;
// importing it makes the page wrong the moment the mark is.
//
// (vite.config.ts names the package root in server.fs.allow, which is what
// makes reaching above site/ legal in dev.)
import emblemPath from "../../emblem/emblem.path.txt?raw";

const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
};

// ---------------------------------------------------------- one script, six pages ---
//
// This file was written for ONE document and now serves six. Every block below
// builds into an element it looks up by id, and five of those ids are absent on
// any given page.
//
// A section that is not on THIS page resolves to a DETACHED stand-in: the block
// runs, writes into a node nothing will ever insert, and is collected. That
// keeps the blocks exactly as they were — no guard at every append, no
// re-indentation of code whose comments are load-bearing.
//
// ⚠️⚠️ THE STAND-IN MUST NOT ABSORB A TYPO, and that is the whole reason for the
// whitelist. A mistyped id and a section that lives on another page are the SAME
// SHAPE — both return null — so a bare `?? createElement` would render an empty
// section with no error anywhere, which is the failure mode this estate is worst
// at seeing. SECTIONS is the one list of ids this site has; an id outside it
// throws at load, in dev, on the page that is missing it.
const SECTIONS = [
    "gems", "auras", "tld-marks", "tlds", "sites", "roles", "type",
    "aura", "aura-now", "spec-wordmark", "spec-slogan", "page-cards"
];

const node = (id) => {
    if (!SECTIONS.includes(id))
        throw new Error(`page.js: "${id}" is not a section of this site`);
    return document.getElementById(id) ?? document.createElement("div");
};

/* -------------------------------------------------------------------- gems --- */

const gemGrid = node("gems");

for (const gem of tokens.gems) {
    const card = el("div", "swatch");
    const chip = el("span", "chip");
    // Painted by the TOKEN via a class, labelled by the GENERATOR. The class
    // rather than an inline style is load-bearing — see the gem-classes block
    // in page.css for the tree-shaking trap it avoids.
    chip.classList.add(`gem-${gem.name}`);
    card.append(chip);

    const body = el("div", "swatch-body");
    body.append(el("span", "swatch-name", gem.name.replace(/-/g, " ")));
    body.append(el("span", "swatch-meta", `${gem.token} · ${gem.hex}`));
    body.append(el("span", "swatch-media", gem.media));
    card.append(body);
    gemGrid.append(card);
}

// The reserved slot is rendered as an ABSENCE with a reason. Nothing goes here,
// and drawing it as a colour-to-be-chosen would invite exactly that.
{
    const card = el("div", "swatch reserved");
    card.append(el("span", "chip"));
    const body = el("div", "swatch-body");
    body.append(el("span", "swatch-name", "pink"));
    body.append(el("span", "swatch-meta", "reserved"));
    body.append(
        el(
            "span",
            "swatch-media",
            "Absent by construction — held for B-Dating. Not an oversight."
        )
    );
    card.append(body);
    gemGrid.append(card);
}

// Site values are not gems and are shown apart from them, labelled as such.
for (const sv of tokens.siteValues) {
    const card = el("div", "swatch");
    const chip = el("span", "chip");
    chip.classList.add(`gem-${sv.name}`);
    card.append(chip);
    const body = el("div", "swatch-body");
    body.append(el("span", "swatch-name", sv.name.replace(/-/g, " ")));
    body.append(el("span", "swatch-meta", `${sv.token} · ${sv.hex}`));
    body.append(
        el("span", "swatch-media", `Site value for ${sv.site} — not an eighth gem.`)
    );
    card.append(body);
    gemGrid.append(card);
}

/* ------------------------------------------------------------------- metta --- */

// THE HARNESS WRITES ONE PROPERTY AND NOTHING ELSE, which is the whole contract
// this section documents. There is no colour maths here and there must not be:
// the moment this file computes a stop, the page stops demonstrating the CSS and
// starts duplicating it, and the two can then disagree.
//
// The readout prints --t and the resolved --metta so a reader can check the ramp
// against the swatches above. That is a DOCUMENTATION affordance and is exactly
// what the no-numerals guard forbids on a product surface — the guard is about
// what a sitter is shown, not about what a spec page may print.

const mettaStage = document.getElementById("metta-stage");
const mettaT = document.getElementById("metta-t");
const mettaRead = document.getElementById("metta-read");

if (mettaStage && mettaT && mettaRead) {
    const paint = () => {
        // 6000 steps, not 1000: the gem stops sit at i/6, and on a 1000-step
        // slider the nearest integer to 4/6 is 667, which lands sapphire a bit
        // off its own swatch further up the page. The ramp was exact; the
        // harness was not, and a demo that misreports the thing it demonstrates
        // is worse than no demo.
        const t = Number(mettaT.value) / 6000;
        mettaStage.style.setProperty("--t", String(t));
        // Read what the CASCADE resolved, never what this file thinks it should
        // be — same rule as the role swatches further down.
        const resolved = getComputedStyle(
            mettaStage.querySelector(".metta-light")
        ).backgroundColor;
        mettaRead.textContent = `--t: ${t.toFixed(3)}`;
        mettaRead.title = resolved;
    };
    mettaT.addEventListener("input", paint);
    paint();
}

/* ------------------------------------------------------------------- auras --- */

// Same construction as the gems, for the same reason: painted by the TOKEN via
// a class, captioned by the GENERATOR. If css/tokens.css and dist/tokens.json
// ever disagree, the swatch contradicts its own caption on the page.

const auraGrid = node("auras");

for (const bucket of tokens.auras.buckets) {
    const card = el("div", "swatch");
    const chip = el("span", "chip");
    chip.classList.add(`ramp-${bucket.name}`);
    card.append(chip);

    const body = el("div", "swatch-body");
    body.append(el("span", "swatch-name", bucket.name));
    body.append(el("span", "swatch-meta", `${bucket.token} · ${bucket.hex}`));
    body.append(
        el(
            "span",
            "swatch-media",
            bucket.unbounded
                ? "24+ crossings a month"
                : `under ${bucket.under} crossings a month`
        )
    );
    card.append(body);
    auraGrid.append(card);
}

/* -------------------------------------------------------------------- tlds --- */

// THE CARRIER IS THE MARK, NOT A CHIP, and that is the load-bearing part of this
// block rather than a flourish. These six hues are one-for-one with the six
// saturated gems; two chip grids of the same six hues on one page fuse into one
// palette in the reader's eye whatever the caption underneath says. Changing the
// OBJECT is what keeps them apart — and it is what the doctrine already claims,
// since an aura is a property of the emblem.
//
// The path comes from the generator rather than being re-typed, so these marks
// cannot drift from emblem/emblem.svg. The four static marks elsewhere in this
// page predate that and are still hand-copied.
//
// ⚠️ PAINTED WITH A CSS KEYWORD, NOT A TOKEN, and that is deliberate: no hex is
// pinned for this palette anywhere in the estate. The keyword spells the
// doctrine's WORD. Should anyone ever pin real values, this is the block that
// changes — and `pinned` in dist/tokens.json is the flag that says whether they
// have. Never let these marks BEAT: a rainbow of a body's domains is not a
// liveness claim, and the placement rule in motion.css governs here too.

const tldMarks = node("tld-marks");
const tldBody = node("tlds");

for (const t of tokens.tlds.tlds) {
    const fig = el("figure", "tld-mark");
    fig.innerHTML =
        `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ` +
        `style="color:${t.cssNamed}">` +
        `<path fill="currentColor" d="${tokens.emblemPath}" /></svg>` +
        `<figcaption><b>${t.tld.replace("heartbank", "")}</b>${t.hue}</figcaption>`;
    tldMarks.append(fig);

    const tr = el("tr");
    tr.append(el("td", "tok", t.tld));

    const hueCell = el("td", "tok");
    const dot = el("span", "dot");
    dot.style.background = t.cssNamed;
    hueCell.append(dot);
    hueCell.append(document.createTextNode(t.hue));
    tr.append(hueCell);

    tr.append(el("td", null, t.productClass));
    tr.append(el("td", "why", t.idiom));
    tldBody.append(tr);
}

/* ------------------------------------------------------------------- sites --- */

const sitesBody = node("sites");

for (const site of tokens.sites) {
    const tr = el("tr");
    tr.append(el("td", "tok", site.host));

    const accentCell = el("td");
    const dot = el("span", "dot");
    dot.style.background = site.accent;
    accentCell.append(dot);
    accentCell.append(
        document.createTextNode(`${site.accentToken.replace("--color-", "")} ${site.accent}`)
    );
    accentCell.className = "tok";
    tr.append(accentCell);

    tr.append(el("td", "why", site.because));
    sitesBody.append(tr);
}

/* ------------------------------------------------------------------- roles --- */

const ROLES = [
    "bg", "bg-tint", "surface", "surface-2",
    "line", "line-strong",
    "ink", "ink-dim", "ink-faint",
    "accent", "accent-soft", "emblem"
];

const roleGrid = node("roles");
const roleReadouts = [];

for (const role of ROLES) {
    const card = el("div", "swatch role");
    const chip = el("span", "chip");
    chip.style.background = `var(--${role})`;
    card.append(chip);

    const body = el("div", "swatch-body");
    body.append(el("span", "swatch-name", role.replace(/-/g, " ")));
    const meta = el("span", "swatch-meta", `--${role}`);
    body.append(meta);
    card.append(body);
    roleGrid.append(card);

    roleReadouts.push({ role, meta, chip });
}

// Report what the browser actually PAINTED, not what a file says.
//
// ⚠️ NOT getComputedStyle(root).getPropertyValue("--accent-soft"). A custom
// property computes to its substituted TOKEN, not to a colour — so that call
// hands back the literal string "color-mix(in oklab, #78849b 55%, #fff)" and
// prints an unevaluated formula where a value should be. Reading a real
// property off an element the token was applied to is what forces the engine to
// resolve it, and it is also the more honest readout: the swatch and its label
// then come from the same paint.
const readRoles = () => {
    for (const { role, meta, chip } of roleReadouts) {
        const v = getComputedStyle(chip).backgroundColor;
        meta.textContent = v ? `--${role} · ${v}` : `--${role}`;
    }
};

/* -------------------------------------------------------------------- type --- */

const RUNGS = [
    ["--text-hero", "Circulation"],
    ["--text-title", "Not accumulation"],
    ["--text-lede", "The record accumulates; the value circulates"],
    ["--text-sub", "A gift moves forward, never back"],
    ["--text-body", "Body copy at one rem, the measure held to 36rem"],
    ["--text-small", "Small — captions, table cells, secondary rows"],
    ["--text-micro", "Micro — eyebrows, token names, metadata"]
];

const typeBox = node("type");

for (const [token, sample] of RUNGS) {
    const row = el("div", "spec-row");
    row.append(el("span", "spec-label", token));
    const demo = el("span", "spec-demo", sample);
    demo.style.fontSize = `var(${token})`;
    if (token === "--text-hero" || token === "--text-title") {
        demo.style.fontFamily = "var(--font-display)";
        demo.style.fontWeight = "700";
        demo.style.letterSpacing =
            token === "--text-hero" ? "var(--track-hero)" : "var(--track-title)";
    }
    row.append(demo);
    typeBox.append(row);
}

/* --------------------------------------------------------------- wordmark --- */

// The B-Wordmark® and the B-Slogan®, composed the way a consumer composes them:
// two text literals with the mark between them. There is no wordmark ASSET and
// there must not be one — the moment this ships as an SVG, a consumer takes the
// SVG, and the colour stops inheriting.
//
// ⚠️ The ® rides on HeartBank, never on B-Wordmark or B-Slogan themselves:
// those are internal short-names carrying no mark of their own.
//
// ⚠️ THE ® IS WRAPPED, and only here. A registration symbol is drawn at full
// cap height by every typeface, which is correct at body size and far too heavy
// at display size — so the SPECIMEN scales it optically and a real call site
// does not. That is why the markup shown on this page is `ank&reg;` while the
// specimen above it carries one extra span: the difference is the guidance, not
// a discrepancy, and the page says so.
const wordmark = (classes) =>
    `Heart<svg class="${classes}" viewBox="0 0 24 24" aria-hidden="true" ` +
    `focusable="false"><path fill="currentColor" d="${emblemPath.trim()}" />` +
    `</svg>ank<span class="reg">\u00AE</span>`;

{
    // .beating is CORRECT here and is the canonical placement — a wordmark is
    // chrome, and chrome may claim "humans run this". It is NOT correct beside
    // a person's name, which is the distinction /mark/ draws.
    const spec = node("spec-wordmark");
    spec.innerHTML = `<span class="wordmark-xl">${wordmark("beating")}</span>`;

    // The accessible name has to be the WORD, not "Heart, image, ank". The
    // glyph is aria-hidden inside wordmark(), so the text nodes alone would
    // read as "Heart ank" — correct only once the label is supplied here.
    spec.firstElementChild?.setAttribute("aria-label", "HeartBank");
    spec.firstElementChild?.setAttribute("role", "img");

    const slogan = node("spec-slogan");
    slogan.innerHTML =
        `<span class="slogan-xl">Thank with ` +
        `<span class="nowrap">${wordmark("beating")}</span></span>`;
    slogan.firstElementChild?.setAttribute("aria-label", "Thank with HeartBank");
    slogan.firstElementChild?.setAttribute("role", "img");
}

// The home page's cards are hand-written, so their hrefs are the one part of
// the menu that is NOT derived from the NAV array. Assert they resolve against
// the real <nav>, which IS derived — a renamed page then fails here, loudly, on
// the page that links to it, instead of shipping a card that 404s.
{
    const cards = node("page-cards");
    const real = new Set(
        [...document.querySelectorAll(".nav-inner a")].map((a) => a.getAttribute("href"))
    );
    for (const a of cards.querySelectorAll("a")) {
        const href = a.getAttribute("href");
        if (!real.has(href))
            throw new Error(`page.js: card "${href}" is not a page in NAV`);
    }
}

/* ------------------------------------------------------------------- theme --- */

// Three states, cycled explicitly: system -> dark -> light -> system. "System"
// is the ABSENCE of a class, which is what theme-3block.css's :not() guard
// exists to serve — so this control exercises the real cascade rather than a
// simplified two-state version of it.
const btn = document.getElementById("theme");
const root = document.documentElement;

const current = () =>
    root.classList.contains("dark")
        ? "dark"
        : root.classList.contains("light")
          ? "light"
          : "system";

const apply = (next) => {
    root.classList.remove("dark", "light");
    if (next !== "system") root.classList.add(next);
    try {
        if (next === "system") localStorage.removeItem("brand.theme");
        else localStorage.setItem("brand.theme", next);
    } catch (e) {
        /* private mode — the class still applies for this page view */
    }
    btn.textContent = next === "system" ? "theme: system" : `theme: ${next}`;
    readRoles();
};

btn.addEventListener("click", () => {
    const order = { system: "dark", dark: "light", light: "system" };
    apply(order[current()]);
});

const mq = window.matchMedia("(prefers-color-scheme: dark)");
mq.addEventListener("change", () => {
    if (current() === "system") readRoles();
});

apply(current());

/* ----------------------------------------------------------------- version --- */

for (const id of ["ver", "foot-ver"]) {
    const n = document.getElementById(id);
    if (n) n.textContent = `brand v${tokens.version}`;
}

// The npm install line, pinned to the version this page was built from. Same
// rule as the two above and for a sharper reason: a stale number in prose is
// wrong, a stale number in a command someone pastes into a terminal installs
// the wrong thing. Exact-pinned rather than caret-ranged deliberately — the
// package is a mirror, and a range would invite the drift the whole layer
// exists to prevent.
const npmCmd = document.getElementById("npm-cmd");
if (npmCmd) npmCmd.textContent = `npm i @333eco/brand@${tokens.version}`;

/* -------------------------------------------------------------------- aura --- */

// The mark's colour, for the visitor to move. Every emblem on the page reads
// --emblem, so one property drives the header, the hero and both demo marks.
//
// ⚠️ THE ROTATION IS DRIVEN FROM HERE RATHER THAN FROM CSS, AND THAT IS A BUG
// WORKAROUND RATHER THAN A PREFERENCE. The CSS version — an @property-registered
// custom property interpolated by @keyframes — was wrong on screen in a way
// computed style could not see: the hero mark tracked it, the small mark in the
// header painted its pre-animation colour while getComputedStyle reported the
// animated one. Sticky positioning, backdrop-filter, and the compositing layer
// the heartbeat creates were each ruled out separately, and animating --emblem
// directly instead of substituting var(--aura) did not help. Chrome does not
// re-rasterise that element for an animated custom property it inherits.
// Setting the property from script is an ordinary style mutation, so everything
// that reads it invalidates. See the aura block in page.css.
//
// A FIXED choice sets --emblem and stops the loop; AUTO restarts it. The two
// are mutually exclusive by construction — one writer, one property.

const auraBox = node("aura");
const auraNow = node("aura-now");

// Diamond is offered but is NOT in the rotation — near-white is luminous on the
// dark ground and invisible on the light one, and a rotation that blinks out
// for a sixth of its cycle in one theme is a bug that only shows up in one
// theme. The stops come from the generated palette, so they cannot drift.
const ROTATION = tokens.gems.filter((g) => g.name !== "diamond").map((g) => g.hex);

const AURA_CHOICES = [
    { id: "auto", label: "Auto — the six saturated gems, rotating", cls: "auto" },
    ...tokens.gems.map((g) => ({
        id: g.name,
        label: `${g.name.replace(/-/g, " ")} — ${g.media}`,
        token: g.token,
        hex: g.hex
    })),
    {
        id: "site",
        label: "This site's accent — a site value, not a gem",
        token: "--accent"
    }
];

const root2 = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const CYCLE_MS = 42000;
let rafId = null;

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// A plain sRGB lerp between adjacent stops. Not oklab: the generator does the
// perceptual mixing where the RESULT IS A TOKEN somebody will read off and use,
// and this is an ambient sweep between six saturated hues where the difference
// is not visible and the cost would be sixty lines shipped to every visitor.
const rotate = (now) => {
    const t = ((now % CYCLE_MS) / CYCLE_MS) * ROTATION.length;
    const i = Math.floor(t);
    const f = t - i;
    const a = hexToRgb(ROTATION[i % ROTATION.length]);
    const b = hexToRgb(ROTATION[(i + 1) % ROTATION.length]);
    const mix = a.map((v, n) => Math.round(v + (b[n] - v) * f));
    root2.style.setProperty("--emblem", `rgb(${mix.join(", ")})`);
    rafId = requestAnimationFrame(rotate);
};

const stopRotation = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
};

const applyAura = (id) => {
    const choice = AURA_CHOICES.find((c) => c.id === id) || AURA_CHOICES[0];
    stopRotation();

    if (choice.id === "auto") {
        if (reduceMotion.matches) {
            // Stop, and substitute nothing moving. The mark takes the first
            // stop and stays there — the same posture the heartbeat takes.
            root2.style.setProperty("--emblem", ROTATION[0]);
        } else {
            rafId = requestAnimationFrame(rotate);
        }
    } else {
        root2.style.setProperty("--emblem", `var(${choice.token})`);
    }

    for (const b of auraBox.children) {
        b.setAttribute("aria-pressed", String(b.dataset.id === choice.id));
    }

    auraNow.textContent =
        choice.id === "auto"
            ? reduceMotion.matches
                ? "--emblem: the six gems, held still for reduced motion"
                : "--emblem: rotating through the six saturated gems"
            : `--emblem: var(${choice.token})`;

    try {
        if (choice.id === "auto") localStorage.removeItem("brand.aura");
        else localStorage.setItem("brand.aura", choice.id);
    } catch (e) {
        /* private mode — the choice still holds for this page view */
    }
};

for (const choice of AURA_CHOICES) {
    const b = el("button");
    b.type = "button";
    b.dataset.id = choice.id;
    b.title = choice.label;
    b.setAttribute("aria-label", choice.label);
    if (choice.cls) b.className = choice.cls;
    // Painted by the token, like every other swatch on this page.
    if (choice.token) b.style.setProperty("--swatch", `var(${choice.token})`);
    b.addEventListener("click", () => applyAura(choice.id));
    auraBox.append(b);
}

// A visitor who turns Reduce Motion on mid-visit should not have to reload.
reduceMotion.addEventListener("change", () => {
    const current = [...auraBox.children].find(
        (b) => b.getAttribute("aria-pressed") === "true"
    );
    applyAura(current ? current.dataset.id : "auto");
});

let storedAura = null;
try {
    storedAura = localStorage.getItem("brand.aura");
} catch (e) {
    /* ignore */
}
applyAura(storedAura || "auto");
