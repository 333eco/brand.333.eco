# brand.333.eco

The canonical brand layer for the institution: design tokens, the B-Emblem™, and
the heartbeat. Vendored into every site that renders them, behind a hash guard.

Published as guidelines at **<https://brand.333.eco>** — a page that is *drawn by
the tokens it documents*, so it cannot drift from them.

## Why this exists

This layer lived in four repositories at once — `seysays`, `sayyourname`,
`playsey` and `333.eco` — as copies, and had already begun to fork. Two of the
copies were improved on the same day in opposite directions: one refined the
placement rule's comment, the other rewrote the rule itself and documented why.
Neither was broken. The next edit that landed in one repo only was the one that
would bite.

It was deliberately **not** extracted earlier, and that was correct: *a design
system published before it has been used once is a guess.* It has now been used
four times.

## Why it is on 333.eco

The brand serves four GitHub orgs and a dozen domains. Hosting it under any one
body's TLD would make that body the landlord of the others' identity. `333.eco`
is the domain that **names no single body** — the same argument that placed
B-Registry℠ there.

## Layout

```
css/
  tokens.css          Tier A @theme + Tier B -d-/-l- palette pairs + derived accents
  theme-3block.css    dark-default cascade with the :not() guard   ─┐ pick
  theme-2state.css    light-default + .dark stamp                  ─┘ exactly one
  motion.css          @keyframes heartbeat + .beating + the scoped reduce guard
  metta.css           the Metta Light session descent (OPT-IN)
  reduce-global.css   the estate-wide reduced-motion sweep (OPT-IN)
emblem/
  emblem.svg          reference copy + the home of the rotation warning
  emblem.ts           Lit template function
  emblem.path.txt     the path `d` string, alone, for generators
data/
  gems.json           gem semantics (MEDIUM). NO hex — those live in tokens.css
  auras.json          aura-ramp semantics (RATE). NO hex — same rule
  tlds.json           the six-TLD rainbow (DOMAIN). No hex ANYWHERE — see below
  brand.json          version, wordmark, mark rules, the accent rule, site map
dist/                 GENERATED, committed: tokens.json · Brand.swift · Brand.kt
scripts/
  generate.mjs        css/ + data/ -> dist/
  check-brand.mjs     the drift guard; copied verbatim into every consumer
site/                 the guidelines page -> brand.333.eco (an installable PWA)
brand.lock            every package file -> sha256, plus a version
```

The page is also **the mark's colour playground**: every mark on it reads
`--emblem`, and a visitor can point that at any gem or leave it rotating.
Diamond is in the picker but **not** in the rotation: a cool near-white blinks
out on the light ground, and a rotation that disappears for a sixth of its cycle
in one theme is a bug that only shows up in one theme.

⚠️ **The rotation is driven from JS, and this paragraph used to say otherwise.**
It was built first as pure CSS — an `@property`-registered custom property
interpolated by `@keyframes` — and that version was wrong on screen in a way
`getComputedStyle` could not see: the hero mark tracked it while the header mark
painted its pre-animation colour. Chrome does not re-rasterise an element for an
animated custom property it *inherits*. The code changed and this file did not,
so it claimed a property the page does not have — the rotation does **not**
survive with scripting off. Recorded here because the same technique is the
obvious way to build the Metta Light, and it will fail the same way.

⚠️ **Rendering the MARK in gem colours is not the thing the gem rule forbids.**
The rule is that a gem must not become a SITE ACCENT. Hearts in gem colours is
ratified doctrine — Tonsay's stream is *"7 rainbow hearts: the 6 GEM colours +
DIAMOND"*. This page's own accent stays a site value and does not move.

**No value is typed twice.** `css/tokens.css` is canonical; the JSON holds only
what a stylesheet cannot say; `dist/` is generated from both.

## Consuming it

There is nothing to install and nothing to fetch at build time.

```bash
# take the current layer (deliberate, reviewable, never CI)
npm run brand:sync -- --from ../../333.eco/brand.333.eco

# verify — no network, no credentials, no sibling checkout
npm run check:brand
```

A consumer holds three files from this repo:

| File | Differs per repo? |
|---|---|
| the vendored `css/` and `emblem/` files | no — byte-identical |
| `brand.lock` | **no** — byte-identical, so a lagging repo shows an older version in a diff |
| `check-brand.mjs` | no — byte-identical |
| `brand.uses` | **yes** — the one file that must differ |

`brand.uses` declares what this repo took and where it lives:

```json
{ "dir": "partials", "files": ["tokens.css", "theme-3block.css", "motion.css", "reduce-global.css"] }
```

### Concatenation order

Not arbitrary. Custom-property substitution is lazy, so a value declared early
may reference one a later file sets — that is how `--accent`, set per site,
reaches the derived family.

```
tokens.css
  + theme-3block.css   or   theme-2state.css
  + motion.css
  + reduce-global.css  (opt-in)
  + brand.css          (per site — the accent and the two values that cannot derive)
  + site.css           (per site)
```

### ⚠️ Never `@import` a sibling of these files

The partial-based sites inject their stylesheets as **raw text** and concatenate
them. A relative `@import` resolves against `src/`, where `partials/` is
unreachable, and ships a dead render-blocking at-rule — quietly destroying the
one-request-renders-complete property the inlining exists to buy.

`@import "tailwindcss"` at the top of `tokens.css` is a different thing and is
fine: a bare specifier the Tailwind plugin resolves. Verified to reach `dist`.

## The rules that are easy to break

- **A site's accent is DERIVED**, never picked: take the gem whose media type
  *is* that product's medium. Two values cannot derive — `--accent-ink`, and
  `--accent-soft` on a light ground. Measure and pin them per site.
- **THERE ARE THREE PALETTES AND THEY ARE NOT ONE SYSTEM.** A gem means a
  **medium** (7, `gems.json`); an aura stop means a **rate** (7, `auras.json`);
  a rainbow hue means a **domain** (6, `tlds.json`). The hues rhyme because a
  colour wheel is small. The two sevens are *different sets* — the aura ramp
  carries indigo and ends at violet, the gems carry no indigo and end at
  diamond.
- **The six-TLD rainbow has NO pinned values, anywhere.** The corpus fixes six
  colour *words*; no file fixes a hex. Do not add six tokens to tidy that up —
  none of the four consumers is a `heartbank.{TLD}`, so they would ship dead
  into all four behind the lock. Pin them when the first one needs them, and
  measure contrast then.
- **The Metta Light chain lives on `.metta`, never on `:root`.** Custom
  properties inherit their *computed* value, so a chain on `:root` resolves once
  against root's `--t` and every descendant inherits the finished colour — the
  ramp dies silently. The element that sets `--t` must carry the class.
- **Never register `--metta` with `@property`.** It buys a type and the ability
  to transition it, and transitioning it puts the file straight back inside the
  Chrome inherited-animated-custom-property bug it was written to route around.
  Move `--t` on the app's clock instead.
- **Pink is absent by construction.** Reserved for B-Dating. Not an oversight —
  and the aura ramp is where the reservation was actually being broken: four
  shipped Phase-1 surfaces were rendering the `indigo` bucket in pink.
- **Two aura hexes collide with other tokens** — `--color-aura-red` with
  `--danger`, `--color-aura-violet` with `--color-violet-sey`. Coincidence, not
  kinship. Never alias them into each other.
- **`.beating` goes on CHROME**, never beside a person's name.
- **The 45° rotation is baked into the path coordinates.** Never a `transform`.
- **The two theme files are peers.** Converting a site between them is a
  regression, not a tidy-up. So is dropping `reduce-global.css` into seysays.

## Tripwires

These fail **silently** — no error at any layer. Check them after touching the
CSS or the build:

```bash
# @theme tokens are tree-shaken unless the AUTHOR'S own CSS references them.
# A token referenced only from runtime JS vanishes and the element renders bare.
grep -o -- '--color-ruby' site/dist/assets/*.css       # must be > 0
grep -o -- '--color-aura-indigo' site/dist/assets/*.css   # must be > 0
grep -o -- '--beat-duration' site/dist/assets/*.css   # must be > 0

# The six-TLD marks are painted with CSS KEYWORDS, not tokens, because nothing
# is pinned. If this ever returns > 0, someone invented six values — check that
# it was a decision and not a tidy-up.
grep -o -- '--color-tld' css/tokens.css               # must be 0

# The Metta ramp dies silently if the chain is hoisted to :root — it resolves
# once and descendants inherit a frozen colour. The chain must be class-scoped.
grep -c '^\.metta {' css/metta.css                     # must be 1
grep -c '^@property' css/metta.css                     # must be 0 (prose mentions it)

# The custom domain unmaps if this is missing, with a green build.
test -f site/dist/CNAME

# A service worker that ships an unstamped placeholder caches under the literal
# string "__BUILD_ID__" forever. The build throws instead — but check anyway.
grep -c '__BUILD_ID__\|__ASSET_LIST__' site/dist/sw.js   # must be 0
```

### Two that bit this page already

**Transforms do not apply to non-replaced inline elements.** `.beating` on a
bare `<span>` wrapper animates nothing, silently. The header mark and the motion
demo were both built that way and both sat still. The class goes on the `<svg>`.

**XML comments cannot contain a double hyphen.** Writing a CSS custom property
name the ordinary way inside `icon.svg` makes the file unparseable and the whole
icon set fails to build. Name tokens in prose there, never in their real syntax.

## Maintaining

```bash
node scripts/generate.mjs            # rewrite dist/
node scripts/generate.mjs --check    # prove dist/ is current (CI)
node scripts/check-brand.mjs         # prove brand.lock matches css/ + emblem/
node scripts/check-brand.mjs --write # rewrite brand.lock after a change
cd site && npm run dev               # the guidelines page, localhost:57890
```

**Bump `version` in `data/brand.json`** with any change to `css/` or `emblem/`,
then run both `--write` steps and commit `brand.lock` and `dist/` in the same
commit as the change. The version is how "which sites are on which brand" is
answerable by grep.

## Honest limits

- **The fluid type scale does not port to native.** `clamp(min, Nvw, max)` has
  no equivalent; `dist/` emits `min`/`max` and says so. Do not hard-code the max
  and call it done — use the platform's own accessibility scale.
- **`color-mix(in oklab, …)` is reproduced in `generate.mjs`**, not delegated.
  The values were checked against four independently hand-measured pins in the
  estate and land within a few percent — the differences are exactly the
  contrast corrections those pins exist to make.
- **`dist/Brand.swift` and `dist/Brand.kt` have no consumer yet.** They were
  written ahead of the first native app, against the rule this package was
  extracted under. They are therefore the least-proven thing here.
