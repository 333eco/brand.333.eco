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
  reduce-global.css   the estate-wide reduced-motion sweep (OPT-IN)
emblem/
  emblem.svg          reference copy + the home of the rotation warning
  emblem.ts           Lit template function
  emblem.path.txt     the path `d` string, alone, for generators
data/
  gems.json           gem semantics. NO hex — those live in tokens.css
  brand.json          version, wordmark, mark rules, the accent rule, site map
dist/                 GENERATED, committed: tokens.json · Brand.swift · Brand.kt
scripts/
  generate.mjs        css/ + data/ -> dist/
  check-brand.mjs     the drift guard; copied verbatim into every consumer
site/                 the guidelines page -> brand.333.eco
brand.lock            every package file -> sha256, plus a version
```

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
- **The gem map is a MEDIA-TYPE map, not a site palette**, and it is not the
  six-TLD rainbow either. Three different things.
- **Pink is absent by construction.** Reserved for B-Dating. Not an oversight.
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
grep -o -- '--color-ruby' site/dist/assets/*.css      # must be > 0
grep -o -- '--beat-duration' site/dist/assets/*.css   # must be > 0

# The custom domain unmaps if this is missing, with a green build.
test -f site/dist/CNAME
```

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
