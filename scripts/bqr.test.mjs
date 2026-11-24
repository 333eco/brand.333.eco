/**
 * ⭐ MOVED HERE 2026-10-04 (A295) from `thank.heartbank.ceo/scripts/bqr.test.mjs`, with the recipe it tests (`qr/bqr.ts`, `qr/bqr-card.ts`)
 *   — so every consumer that vendors the recipe vendors bytes this file has decoded. ⛔ The pre-registrations below are VERBATIM and
 *   dated; a path they name (`src/bqr.ts`, `src/qr-card.ts`) is where the recipe lived WHEN they were written. Never edit them; add.
 *   Added on the move, before it ran here: P0 — `EMBLEM_D` is byte-for-byte `emblem/emblem.path.txt` (CONTROL: one digit off is caught).
 *
 * ⭐ B-QR — THE DECODE MATRIX (`npm run bqr:test`). `src/bqr.ts` draws every code that is OURS inside the B-Emblem™; this file
 *   proves the code still scans, with three decoders that share no code, and proves it can SEE a failure (a checker that has only
 *   ever passed is an untested claim).
 *
 * Tools (deliberately NOT in package.json — a native canvas and a wasm decoder are test-only weight):
 *   BQR_TOOLS=<dir>  holding node_modules/@napi-rs/canvas + node_modules/zxing-wasm, and optionally venv/ with OpenCV:
 *     npm i --prefix "$BQR_TOOLS" @napi-rs/canvas zxing-wasm
 *     python3 -m venv "$BQR_TOOLS/venv" && "$BQR_TOOLS/venv/bin/pip" install opencv-python-headless numpy
 *   BQR_PYTHON=<python with cv2>  overrides the venv. Without one, the OpenCV column reads NOT RUN — never "pass".
 *   BQR_OUT=<dir>  where the sample PNGs land (default: a temp dir, printed).
 *
 * ⛔ PRE-REGISTERED, written before the first matrix ran (2026-10-03). The run FAILS (exit 1) on any of:
 *   P1 geometry — the painted bbox re-measures to brand.json's within 0.02; the body square lies wholly inside the silhouette
 *      eroded by the outline's inner half; and it is within 0.05 of the largest such square. Each check has a CONTROL that must fail.
 *   P2 layout — for every payload × ECC: no decorative cell inside the 4-module ring, none outside the silhouette, no three in a
 *      row or column. Controls: quiet 0 must break the ring check; a planted run of three must break the run check.
 *   P3 pixels — read back from a 1200 px render, every code module is the matrix's colour and every quiet-ring cell is white.
 *      Control: the quiet-0 render must fail the ring read.
 *   P4 determinism — the same text draws the same bytes twice; another text draws different bytes.
 *   P5 decode — every CLEAN B-QR at card 1200, card 300 and preview 300 decodes in jsQR AND ZXing, all payloads × both accents.
 *   P6 the broken control (decoration let into the quiet zone, up to the finder patterns) FAILS at least once somewhere —
 *      if it never fails, the matrix is too easy to mean anything.
 *   Everything else is REPORTED, beside the old plain card as the baseline, and gates nothing — including the ECC sweep
 *   (L/M/Q/H on the bare card), which was added AFTER the first run to justify `BQR_ECC`, and so is evidence, never a gate.
 *   BQR_JSON=<file>  also writes every case (family · size · distortion · payload · accent · one boolean per decoder).
 *
 * ⛔ §4Z — PRE-REGISTERED 2026-10-03, written before the §4Z matrix ran. The person now chooses between TWO versions (`style`):
 *   `pixels` (Version 1 — the decoration fills the padding up to ONE clear module) and `outline` (Version 2 — a white heart, the
 *   outline 3 × 0.16). The §4Y single drawing is gone, so P1–P6 now read, per version:
 *   P1 + `outline`'s body lies wholly inside the silhouette eroded by ITS outline's inner half (0.24) and is within 0.05 of the
 *      largest such square; CONTROL: a body 0.1 larger is caught.
 *   P2 `pixels`: no decorative cell inside the 1-module ring (the ring width is written HERE, not read from `src/bqr.ts`), none
 *      outside the silhouette, no three in a run; CONTROL: ring 0 is caught inside the 1-ring. `outline`: ZERO decorative cells.
 *   P3 every code module reads back as the matrix's colour in both; every cell of `pixels`' 1-ring and of `outline`'s 4-ring is
 *      white; and in `outline` the two lobes' centres are white (no decoration drew). CONTROL: the ring-0 render is caught dirty.
 *   P4 unchanged, per version; and the two versions of one text draw different bytes.
 *   P5 every CLEAN card at 1200 and 300 and preview at 300, in BOTH versions, both accents, all payloads, decodes in jsQR AND ZXing.
 *   P6 unchanged: the broken control (`pixels` with ring 0 — decoration touching the finders) fails at least once somewhere.
 *   Reported, gating nothing: each version's matrix beside the old plain card, the naked code, and the ECC sweep (on `pixels`).
 *
 * ⛔ §4AA — PRE-REGISTERED 2026-10-04, written before the §4AA matrix ran (founder: *"White heart version: keep square QR size the
 *   same but double the heart outline"* · *"make the square QR code green too; choose the shade of green that makes the B-QR both
 *   printable and scannable"*).
 *   INK — the code's modules are ONE fixed green, `BQR_INK`, chosen by THIS rule, written before the sweep: among the candidates
 *     #15803d (the accent) · #106430 (the accent-soft) · #14532d · #052e16, the LIGHTEST (highest relative luminance) that
 *     (a) PRINTS — symbol contrast SC = Rpaper − Rink, Rpaper 0.85 (uncoated office paper), Rink ≈ the ink's relative luminance,
 *         reaches ISO/IEC 15415 grade A (SC ≥ 0.70) — a margin for an office printer that lays the green down lighter than the screen;
 *     (b) SCANS — the `pixels` card in that ink at 300/200/150 px × the six distortions × the five payloads (90 cases) decodes no
 *         worse than the same card in the old near-black #16141c by more than 2 cases, in jsQR AND in ZXing.
 *     Predicted: #106430 (SC 0.756); #15803d fails (a) at SC 0.695. The ink gate: `BQR_INK` IS the rule's pick; CONTROL: #15803d is
 *     caught by (a). The sweep's numbers are printed, per ink, beside the near-black baseline.
 *     ⚠️ RESULT (first run, 2026-10-04): the prediction was WRONG — #106430 printed at A but decoded jsQR 76/90 against the old ink's
 *     79 (one past the margin); the rule picked #14532d (jsQR 77 · ZXing 83, old 79 · 83). `BQR_INK` was set to the pick AFTER the
 *     run, never the rule to the prediction. Every green sat within 3 cases of near-black (#052e16 also 76): the margin decided.
 *   ⛔ §4AA AMENDMENT — PRE-REGISTERED 2026-10-04, after the first run and BEFORE the second (founder, the same hour: *"The same
 *     green color should apply to the entire B-QR"*). The decoration and the outline now default to `BQR_INK`, so the drawing is ONE
 *     colour. The ink sweep is RE-DRAWN with the decoration in the candidate ink too (one colour per card); the baseline stays the old
 *     drawing (near-black code, #15803d decoration); the RULE IS UNCHANGED. Predicted: the pick holds at #14532d. If it moves,
 *     `BQR_INK` follows the rule. The matrix's first accent is now `BQR_INK` (the default drawing), the second the control purple;
 *     P5 must still read 60/60. Added check: a render with NO accent is byte-identical to one with accent `BQR_INK`.
 *     ✅ RESULT (second run): the pick HELD — #14532d (jsQR 77 · ZXing 83, SC 0.785); #052e16 also passed in one colour (78 · 83) but
 *     is darker, and the rule takes the lightest. P5 60/60; 85 checks. The version totals moved by at most one case (pixels card
 *     jsQR 212/240 · ZXing 226/240 in both runs). P6's broken control failed MORE (jsQR 69 of 120, was 63): a darker green touching
 *     the finders is worse — the 1-module ring is what keeps it out.
 *   P1′ `outline` strokes 6 × 0.16 = 0.96, and its body is §4Z's UNCHANGED (11.085 at (4.2112, 8.7062) — the founder's *same size*),
 *     lying inside the silhouette eroded by §4Z's half-stroke (0.24). Written here, so a body that shrank would be caught.
 *   P3′ `outline`: every cell of a 2-module ring around the code reads white (the doubled stroke reaches ≤ 0.24 units into the body's
 *     margin — about one module on the longest payload); CONTROL: the old 4-ring is caught non-white for at least one payload (the
 *     read SEES the doubled stroke). Every code module reads dark (< 128) in the green ink, in both versions.
 *   P5 unchanged — 60 clean cases, both versions, both accents, all payloads, jsQR AND ZXing — now in the green ink.
 *
 * ⛔ §dark-ground — PRE-REGISTERED 2026-10-06, written before the §dark-ground arm ran (founder, asked whether the B-QR should get a
 *   real dark-mode variant or only be shown on both grounds: *"Add a dark-ground B-QR (Recommended)"*). `paintBqr` takes `ground`:
 *   `paper` (the default — the whole square white, as before) or `heart` (only the silhouette white, the square around it transparent).
 *   The code, the decoration and the outline are drawn the same on both. The run FAILS on any of:
 *   G1 identity — `ground: "paper"` draws the same bytes as no ground, both versions, all payloads (the default did not move);
 *      CONTROL: `heart` draws different bytes. (One-time, outside the gate: the default previews and cards are compared by SHA-256
 *      with the samples this file wrote BEFORE `ground` existed — recorded in the RESULT line below, never re-run as a gate.)
 *   G2 transparency — in a `heart` render at 1200, no pixel clearly OUTSIDE the silhouette (more than half the outline + 2 px away)
 *      has any alpha, in both versions, including on a canvas the `paper` drawing was painted on first (the square is cleared);
 *      and P3's read passes unchanged on `heart` (every code module right, the quiet ring and the lobes opaque white).
 *      CONTROL: the `paper` render has opaque pixels in the same region.
 *   G3 light ground — `heart` flattened onto white matches `paper` within 4/255 on every channel of every pixel at 640, both
 *      versions, all payloads (on a light page the two are one picture). Predicted: within 2.
 *   G4 decode on dark — the `heart` preview flattened onto the dark ground #0a0a0f (`--d-bg`), at 300/200/150 × the six distortions
 *      × the five payloads (90 per version), in the default ink:
 *      (a) every CLEAN case at 300 decodes in jsQR AND ZXing (5/5 per version), and
 *      (b) it decodes no worse than the `paper` preview (on white, the existing matrix, default ink) by more than 2 of 90, in jsQR AND
 *          in ZXing, per version — the same margin the ink rule used.
 *      Predicted: within 1 case of `paper` on both decoders, both versions. (jsQR runs with inversion OFF, as everywhere here: a
 *      code that scanned only when inverted would fail, which is the point.)
 *   G5 the broken control — the same dark-ground preview with the ground pressed up to the code (every pixel outside the code's own
 *      module box painted #0a0a0f, so the quiet zone is gone — the failure `heart` would have if the silhouette ever cut into the
 *      body) FAILS at least 45 of 90 per version in jsQR AND in ZXing. If it does not, the dark arm cannot see a failure and G4
 *      means nothing. Predicted: ≥ 85 of 90 fail on both.
 *   Reported, gating nothing: the `paper` preview flattened onto the same dark ground (the white tile the apps show in dark mode
 *   today), so the two dark renderings sit side by side.
 *   ⚠️ Honest bound, written before the run: the distortions pad with WHITE, as everywhere in this file, so a rotated dark preview
 *   sits on white corners — nearer to a phone photographing a screen on a desk than to an endless dark ground.
 *   ✅ RESULT (2026-10-06, the run after the pre-registration commit e1fbdb4): every gate passed; 117 checks (87 before).
 *     G1 5/5 per version, and the one-time comparison: all 14 samples this file wrote BEFORE `ground` existed (previews, cards,
 *     the broken and naked controls) are byte-identical after it — the default did not move. G2 0 lit px of 436,488 (pixels) and
 *     338,719 (outline) clearly outside; the reused canvas 0. G3 0/255 on both — better than the predicted ≤ 2: on white the two
 *     grounds are one picture. G4 heart on dark: pixels jsQR 82 · ZXing 86 against paper on white 81 · 85; outline 86 · 87 against
 *     86 · 87; the clean 300s 5/5 in both. The prediction (within 1) held; the dark ground cost nothing and was one case AHEAD on
 *     pixels — within noise, not a finding. Reported: paper on dark (the white tile) 81 · 85 and 86 · 87, the same as on white.
 *     G5 the ground pressed to the code failed 90 of 90 on both decoders, both versions (predicted ≥ 85).
 *     ⚠️ Caught in that first run, by reading its output and not its verdict: the control's family began `BROKEN`, and P6 selects
 *     its cases by that prefix — so P6 read "failures of 300" with the new controls inside it, a P6 that could no longer fail on its
 *     own. Renamed `CONTROL …` before the run recorded here; P6 is back to its 120 (jsQR 69 · ZXing 50, as before). OpenCV NOT RUN.
 *
 * ⛔ §emblem-hue — PRE-REGISTERED 2026-10-06, written before the §emblem-hue arm ran (founder: *"The B-QR color should dynamically
 *   change to match the selected --emblem"*; of three options he chose *"Gem hue, darkened (Recommended)"*). `paintBqr` takes `hue`:
 *   the drawing's colour family, drawn by `bqrInkFor` at `BQR_INK`'s relative luminance (same OKLCH hue, the most chroma sRGB holds
 *   there, never lighter than the green). No `hue` = `BQR_INK` verbatim. The gems are read from `dist/tokens.json` (all seven).
 *   The run FAILS on any of:
 *   H1 identity — no `hue`, `hue: BQR_INK` and `hue` in capitals draw the same bytes as v1.5.0's default, both versions, all
 *      payloads (the apps pass none and must not move); CONTROL: `hue` ruby draws different bytes.
 *   H2 darkness — for the seven gems, this site's accent #78849b, black, white and 2,000 seeded random sRGB colours, `bqrInkFor` is
 *      NEVER lighter than `BQR_INK` and within 0.004 of its luminance, so every one prints at ISO/IEC 15415 grade A by the §4AA
 *      formula. CONTROL: raw citrine as an ink is caught below grade A.
 *   H3 hue kept — for every gem whose derived ink keeps OKLCH chroma ≥ 0.03, its hue is within 6° of the gem's. Predicted ≤ 3°.
 *      (Diamond is near-neutral, its hue undefined; it is reported, not gated.)
 *   H4 decode — for each gem, the `pixels` bare card drawn with that `hue`, at 300/200/150 × the six distortions × the five payloads
 *      (90), decodes no worse than the same card with no `hue` by more than 2 of 90, in jsQR AND in ZXing — the ink rule's margin;
 *      and every gem's `outline` preview at 300, clean, decodes 5/5 in both. Predicted: all seven within 2 on both decoders.
 *   H5 the broken control — raw diamond #f4f7ff as the ink (the TEST-ONLY `ink`, which skips `bqrInkFor` — the failure `hue`
 *      exists to make impossible) FAILS at least 80 of 90 on both decoders. Predicted: 90 of 90.
 *   Reported, gating nothing: raw citrine as an ink (90 cases), beside its derived ink.
 *   ✅ RESULT (2026-10-06, the run after the pre-registration commit 6ba6573): every gate passed; 134 checks. H1 5/5 per version.
 *     H2 0 of 2,010 lighter, worst 0.0015 darker. H3 hue moved ≤ 1.0° (citrine; the rest ≤ 0.3°) — better than the predicted ≤ 3°.
 *     H4 every gem within ONE case of no hue (jsQR 76–78 vs 77, ZXing 83 vs 83); every outline preview 5/5. H5 raw diamond failed
 *     90 of 90 on both. ⚠️ Reported, and worth keeping: raw CITRINE read 77 · 82 — on a screen it scans almost as well as the green.
 *     What rules a raw light gem out is PRINT contrast (SC 0.337, far below grade A), which this digital matrix does not measure;
 *     never cite H4 as the reason the darkening exists. OpenCV NOT RUN.
 *
 * ⛔ §body-palette — PRE-REGISTERED 2026-10-12, written and pushed before the §body-palette arm existed (founder, the same night:
 *   one color per BODY, on codes and seals only — *"H3: rainbow colors / SW: orange robe / TH: sky blue / F333: red moon / MA: diamond
 *   sparkle"*, amended *"The H3 codes should inherit the color of its domain"* and *"crimson moon"*; canon MA memory
 *   `project_brand_identity` §body-palette; roadmap A383). v1.7.0 adds `owner` (`BqrOwner`): the six `heartbank.{TLD}` domains for
 *   H3, and `SW` · `TH` · `F333` · `MA` for the other bodies. ⛔ `H3` alone is NOT an owner (its color is its domain's). Each owner
 *   maps to a SOURCE hue in `BQR_OWNER_HUES`; the ink is `bqrInkFor(source)`, so `owner` inherits every property `hue` has. The run
 *   FAILS on any of:
 *   B1 identity — `owner: "heartbank.ceo"` draws the same bytes as no `hue`, both versions, all payloads (Shops may adopt it without
 *      moving a pixel); CONTROL: `owner: "SW"` draws different bytes.
 *   B2 the guard is a property — `owner` with `hue` throws; an unknown owner throws; `"H3"` throws. CONTROL: each of the ten owners
 *      alone does not throw.
 *   B3 one source per value — each `heartbank.{TLD}` source hue equals `data/tlds.json`'s candidate LIGHT value for that domain's
 *      hue word, except `heartbank.ceo` = `BQR_INK` (founder: Shops unchanged); `data/bodies.json` names exactly the five bodies
 *      (H3 · SW · TH · F333 · MA), its H3 entry names the six domains, and no hex appears in it (semantics only, like gems.json).
 *   B4 darkness — every owner's ink is never lighter than `BQR_INK` and within 0.004 of its luminance (H2's rule, per owner).
 *   B5 decode — for each of the ten owners, the `pixels` bare card at 300/200/150 × the six distortions × the five payloads (90)
 *      decodes no worse than the no-hue card by more than 2 of 90 in jsQR AND ZXing, and its `outline` preview at 300, clean,
 *      decodes 5/5 in both. Predicted: all ten within 2 on both decoders (every gem was within 1 on 2026-10-06).
 *   Reported, gating nothing: each owner's ink, and the OKLab distance of the pairs the founder accepted as near-identical
 *   (`heartbank.us` ↔ F333 · `heartbank.me` ↔ SW · `heartbank.org` ↔ SW) and of the pair to print-test (TH ↔ MA).
 *   ✅ RESULT (2026-10-12, the run after the pre-registration commit aeb8f15): every gate passed. B1 5/5 per version; B2 all three
 *     refusals thrown, 10/10 owners alone clean; B3 no mismatch, bodies.json hex-free; B4 all ten at the green's darkness
 *     (us #95001d · me #7e2f00 · org #604300 · ceo #14532d · net #0042a2 · com #632b94 · SW #703a00 · TH #004e6b · F333 #960011 ·
 *     MA #46484f). B5 every owner within ONE case of no hue (jsQR 76–78 vs 77, ZXing 83 vs 83); every outline preview 5/5 — the
 *     prediction (within 2) held. Reported ΔEok: us ↔ F333 0.011 · me ↔ SW 0.036 · org ↔ SW 0.038 (accepted) · TH ↔ MA 0.073.
 *     ⭐ Seen to FAIL: heartbank.us's source one digit off (#c8102f) → B3 "mismatched: heartbank.us"; restored. OpenCV NOT RUN.
 *     ⚠️ Digital decode only — PRINT contrast is guaranteed by the darkness rule (B4), and the TH ↔ MA print test is still owed.
 *
 * ⛔ §turn — PRE-REGISTERED 2026-11-23, written and pushed before the §turn arm or the change it tests existed (founder: *"I want to
 *   rotate the QR such that the center position marker is on the bottom left corner (90 degrees counterclockwise); if you agree that
 *   this symmetry makes the B-QR look better overall, update and ratify B-QR"*). The substrate agrees, for a reason a test can hold: the
 *   emblem is a heart mirrored about ONE line, from its point (bottom left) to its notch (top right). A code has three position markers,
 *   mirrored about one line too, through the middle marker. Upright, the middle marker is top left and the two lines CROSS; turned a
 *   quarter counterclockwise it is bottom left and the two lines are THE SAME LINE. v1.9.0: `paintBqr` draws the turned matrix, always
 *   (⛔ no option a product can pass: one drawing, Sig-9; `turn: false` is TEST ONLY, the baseline below). Decoders read a code at any
 *   angle, so every code already printed or saved still works and none is reprinted. The run FAILS on any of:
 *   T1 one mirror line — the silhouette, rasterised at 100 px/unit, is its own mirror image about x + y = 24 (overlap ≥ 99.5%); in the
 *      turned drawing the middle marker's centre is on that line within 0.01 and the other two are mirror images within 0.01, in both
 *      versions, for every payload. CONTROL: the upright drawing's middle marker is off the line and its three markers are NOT their own
 *      mirror image; the silhouette mirrored about x + y = 23 overlaps less than 99.5%.
 *   T2 the turn — read back from the pixels at 1200 in both versions, every module equals the matrix turned a quarter counterclockwise
 *      (module (r, c) of the drawing is (c, n − 1 − r) of the matrix), a 7×7 position marker stands top left, bottom left and bottom
 *      right and none top right. CONTROL: the same read against the upright matrix counts wrong modules.
 *   T3 nothing else moves — outside the code's own box the turned and the upright drawing are the same pixels, both versions, both
 *      grounds, all payloads (decoration, outline, quiet ring). CONTROL: inside the box they differ.
 *   T4 decode — for each version, the bare card and the preview, and the `heart` preview on the dark ground, at 300/200/150 × the six
 *      distortions × the five payloads (90 each): turned decodes no worse than upright by more than 2 of 90, in jsQR AND in ZXing — the
 *      margin every arm here has used. Predicted: within 1 everywhere.
 *   T5 P5 is unchanged and still 60/60, now on the turned drawing; P6's broken control still fails at least once.
 *   T6 any angle — the turned card, clean at 300, turned 90°, 180° and 270° decodes 5/5 in jsQR AND ZXing, both versions.
 *   ⚠️ Honest bound, written before the run: symmetry is why the change is made and no test can say it looks better; that is his eye.
 *      Digital decode only, as everywhere in this file.
 *   ✗ RESULT (first run, 2026-11-23): T1, T2, T3, T5 and T6 pass. **T4 FAILS on one of twelve readings:** the `pixels` preview, jsQR
 *     turned 77 vs upright 81 of 90 (4 worse, the margin is 2); ZXing 87 vs 85 there. The six families together: jsQR 493 vs 490, ZXing
 *     519 vs 510 of 540, the turned drawing AHEAD on both. The prediction (within 1 everywhere) was wrong. And the ink rule, re-run on
 *     the turned drawing, now picks #106430: its verdict had always hung on one case (above), so it flips on any change of drawing.
 * ⛔ §turn AMENDMENT — PRE-REGISTERED 2026-11-23, after that run and BEFORE the next, pushed before it ran. T4 is neither moved nor
 *   dropped: it stays a recorded failure at 90 cases, where four cases is one payload in one distortion. The decision goes to a sample
 *   twelve times as large (`BQR_TURN_WIDE=1`): 60 payloads (20 B-Link addresses, 20 of 30–60 characters, 20 of 61–120, seeded) × 300/200/150 ×
 *   the six distortions = 1,080 paired readings per family, the six families of T4, jsQR and ZXing. THE TURN SHIPS only if
 *   T4W (a) in each of the twelve readings turned is not worse than upright by more than 11 of 1,080 (1%), AND
 *       (b) over the six families together turned is not worse than upright on either decoder.
 *   CONTROL: the same 1,080 for the broken drawing (`pixels`, quiet 0) against upright are worse by more than 11 on both decoders (else
 *   the wide sample can't see a failure). Predicted: turned ahead on both totals, every reading within 11.
 *   The ink: founder-ruled since (2026-10-12: Shops' green unchanged, every owner's ink at its darkness), so the sweep no longer picks it;
 *   it must still PASS (a) print and (b) scan on the turned drawing, and what the old rule would pick is REPORTED. ⚠️ Written AFTER seeing
 *   the pick move, which is why it is said here: the alternative is a new green on every code, a ruling nobody asked for.
 *   ✗ RESULT OF THE WIDE SAMPLE (2026-11-23, `bqr-turn`): **FAILS, so the turn did not ship.** (a) the `pixels` preview turned reads jsQR 956 ·
 *     ZXing 1,033 of 1,080 against upright 1,001 · 1,047 (45 and 14 worse; the margin is 11); the other five families are inside it, and the
 *     `pixels` card is 51 · 13 BETTER turned. (b) all six: jsQR 5,954 vs 5,945, ZXing 6,176 vs 6,190 of 6,480, so the total is behind on one
 *     decoder. The control failed as it should (714 · 603 worse). The prediction was wrong.  *   ⭐ SHIPPED ANYWAY, BY THE FOUNDER'S OVERRIDE (2026-11-24, asked to override the failed gate: *"1: yes; the small ™ is the best; make this
 *     updated B-QR the official default"*). The objection, kept: T4 and T4W failed and were not moved. What he was told with it: over four
 *     positions and 4,320 readings each the totals are level (upright 3,916 · 4,102, point 3,930 · 4,090; Apple's reader 691 · 688 of 720),
 *     so the position is noise at the pixel grid and the gate was tighter than that noise. T1, T2, T3, T5 and T6 still gate; T4 and T4W are
 *     REPORTED. Two of the four positions keep the symmetry (the point and the notch); ⛔ a position carries no meaning until the founder
 *     rules one, and nothing is printed in another (TBA).
 *
 * ⛔ §tm — PRE-REGISTERED 2026-11-24, written and pushed before the sign is in the recipe (founder, the same message; and 11/24: the sign
 *   *"has an added benefit of signaling how to orient the B-QR upright correctly"*). A small ™ stands in the BOTTOM lobe of every B-QR of ours, both
 *   versions: it names the B-Emblem™ (the drawing), ⛔ never "B-QR", which stays unmarked. `lobe: "none"` leaves the lobe as it was and
 *   `autograph` puts a person's own drawn name there instead, in the `outline` version only (founder: *"the artist's signature looks best
 *   when the B-QR is open; move the signature to the bottom lobe instead"*) — both for a person's own picture, where a ™ would read as a
 *   claim on their work. The top lobe keeps its dots (TBA). The run FAILS on any of:
 *   S1 place — the sign's box lies wholly inside the silhouette less HALF THE THICKER OUTLINE (0.48), in the bottom lobe, at least 4 modules
 *      of the COARSEST code (21 × 21) to the right of the code's own quiet zone's edge being left untouched: no part of the sign's box is
 *      inside the body square of either version. CONTROL: the same box 1.5 units to the left is caught inside the body.
 *   S2 quiet — in `pixels` no decorative dot touches the sign's rounded quiet space, for every payload × ECC, and P2 still holds (ring, runs,
 *      outside). CONTROL: the layout with no sign has at least 20 dots there.
 *   S3 the default — no `lobe` draws the same bytes as `lobe: "tm"`; `lobe: "none"` draws different bytes, equal to v1.8.0's turned drawing
 *      (§turn's baseline with `turn` on), both versions, both grounds; CONTROL: "tm" and "none" differ only inside the sign's space.
 *   S4 decode — with the sign against `lobe: "none"`, card and preview, both versions, at 300/200/150 × the six distortions × the five
 *      payloads (90): not worse by more than 2 of 90 in jsQR AND ZXing. Predicted: within 1 (measured beforehand on 4,320 drawings: equal).
 *   S5 autograph — with `autograph`: `pixels` throws (Open only, a property); no stroke pixel outside the lobe's box; the code's modules and
 *      quiet zone read back unchanged (P3); decode as S4 against `lobe: "none"` in `outline`. CONTROL: an autograph scaled ×3 leaves the box
 *      and is caught by the same read when the clip is off (TEST ONLY).
 *   ✗→✅ RESULT (2026-11-24). First run: S1, S2, S4 and the rest pass; S3's control FAILED (dropping the sign's dots let the run rule place other
 *     dots, 2,057 pixels elsewhere: a dot is now dropped after it counted for the rule, so nothing else moves) and S5 FAILED on one reading (the
 *     autograph on the card: ZXing 83 vs 86, the margin 2). On the wide sample (1,080 a family, as T4W) that box lost 10 in ZXing on the card and
 *     none elsewhere; the same autograph 14% further from the code lost NONE (994 · 1,007 vs 994 · 1,007 card, 1,019 · 1,046 vs 1,019 · 1,045
 *     preview; Apple's reader 171 of 180 and 175 of 180, unmoved). The box was moved there, the gate was not. Second run: every check passes.
 *
 * ⛔ §center — PRE-REGISTERED 2026-11-24, written and pushed before the recipe moves (founder: *"horizontally and vertically center the ™ and the
 *   B-Signature within the bottom lobe"*; the second is B-Autograph℠, its approved name). The lobe's CENTER, for each version, is the point midway
 *   between the code's last dark column and the outline's inner edge on its own row, and midway between the outline's inner edges on its own column
 *   (solved together, `lobeCenter` below, from the silhouette alone). The run FAILS on any of:
 *   C1 the ™ — its painted pixels' box is centered there within 0.06 units, both versions. CONTROL: v1.9.0's place fails (0.39 and 0.63 off).
 *   C2 the autograph — its painted pixels' box is centered there within 0.06 units, for a drawing that fills the pad, one in a corner of it and one
 *      tall and thin; every one lies inside the box. The drawing is FITTED (its own shape kept, at most twice the pad's scale), so where on the
 *      pad a person drew does not matter. CONTROL: with the fit off (TEST ONLY) the corner one fails.
 *   C3 S1–S5 hold at the new place; the autograph's box is the largest 5 : 3 one that stands centered, clear of the body, and loses nothing: S5's
 *      gate (within 2 of 90), tried from 4.47 wide down in steps of 0.2; the first that passes is taken, and the tries are recorded here.
 *   Predicted: the ™ passes at once; the autograph lands at or under 4.0 wide, because centered it stands nearer the code than S5's first box did.
 * ⛔ §coded — PRE-REGISTERED the same time (founder: *"embed our own coded modules in the top lobe"* → *"build it"*). `coded`, 96 bits, twice each, in
 *   the TOP lobe of the `outline` version, for a mark in a person's picture only. The run FAILS on any of:
 *   L1 place — 192 cells, each whole dot inside the silhouette less the outline's half, above the code's quiet zone, no two side by side (a
 *      checkerboard, so no run ever looks like a finder's). CONTROL: the cells moved down 5 rows breach the quiet zone.
 *   L2 throws in `pixels` and for anything but 96 zeros and ones; with none, the drawing is byte for byte what it was.
 *   L3 the code's modules and its 4-module ring read back unchanged with `coded`, with and without an autograph.
 *   L4 decode — within 2 of 90 of none, card and preview, jsQR AND ZXing.
 *   L5 read back — 20 random words read back whole from a 1,200 px drawing through `bqrLobeCells`; CONTROL: one flipped bit is seen.
 *   ✅ RESULT (2026-11-24). C1 at once, as predicted. C3: 4.47 wide stands 0.02 units inside the Full version's body (S1), 4.27 passes everything
 *     and is taken; the prediction (4.0 or under) was WRONG, centered it lost no reading at 90. L1–L5 pass. Wide sample (1,080 a family, jsQR ·
 *     ZXing · Apple of 180, reported, not a gate): the ™ 3,931 · 4,090 · 688 against an empty lobe's 3,930 · 4,090 · 688; the centered
 *     autograph 3,932 · 4,089 · 688; ⚠️ autograph AND coded 3,913 · 4,084 · 688 — the coded lobe costs jsQR 15 of 1,080 on the Open card and 3 on
 *     the preview (codes of every length; a mark's is always the shortest), so it is for a mark in a picture, never a printed card.
 *   ⛔ What the bits SAY is not the recipe's: a mark's caller writes a short fingerprint of the picture the heart is drawn for, and ⛔ never a
 *   person, a serial, a claim or a key. Our own codes keep their dots.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(join(ROOT, "package.json"));
// ⭐ §4Y — the two JS decoders are pinned devDependencies of this repo, so the test runs from a fresh clone (the scratch dir it was
//   built in dies with its session — a test that needs a vanished folder is a rule, not a property). `BQR_TOOLS` still overrides.
const TOOLS = process.env.BQR_TOOLS ?? ROOT;
if (!TOOLS || !existsSync(join(TOOLS, "node_modules/@napi-rs/canvas")) || !existsSync(join(TOOLS, "node_modules/zxing-wasm"))) {
    console.error(`bqr:test needs BQR_TOOLS — see the header of scripts/bqr.test.mjs:
  export BQR_TOOLS=<dir>; npm i --prefix "$BQR_TOOLS" @napi-rs/canvas zxing-wasm
  python3 -m venv "$BQR_TOOLS/venv" && "$BQR_TOOLS/venv/bin/pip" install opencv-python-headless numpy   (optional, the 3rd decoder)`);
    process.exit(2);
}
const treq = createRequire(join(TOOLS, "noop.js"));
const { createCanvas, loadImage, Path2D } = treq("@napi-rs/canvas");
const zx = treq("zxing-wasm/reader");
zx.prepareZXingModule({ overrides: { wasmBinary: readFileSync(join(TOOLS, "node_modules/zxing-wasm/dist/reader/zxing_reader.wasm")) } });
const jsQR = req("jsqr");
const QRCode = req("qrcode");
const ts = req("typescript");
globalThis.Path2D = Path2D;

const PY = process.env.BQR_PYTHON || (existsSync(join(TOOLS, "venv/bin/python")) ? join(TOOLS, "venv/bin/python") : "");
const HAVE_CV = !!PY && spawnSync(PY, ["-c", "import cv2"]).status === 0;

const OUT = process.env.BQR_OUT || mkdtempSync(join(tmpdir(), "bqr-out-"));
mkdirSync(OUT, { recursive: true });
const WORK = mkdtempSync(join(tmpdir(), "bqr-test-"));

// ---- the app's own code, transpiled — ⛔ never a copy of the drawing ------------------------------------------------------------
function transpile(file, fixes) {
    let js = ts.transpileModule(readFileSync(join(ROOT, "qr", file), "utf8"),
        { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
    for (const [from, to] of fixes) {
        if (!js.includes(from)) { console.error(`✗ transpile ${file}: expected "${from}" — the loader is stale`); process.exit(1); }
        js = js.split(from).join(to);
    }
    writeFileSync(join(WORK, file.replace(/\.ts$/, ".mjs")), js);
}
transpile("bqr.ts", [['import("qrcode")', `import(${JSON.stringify(pathToFileURL(req.resolve("qrcode")).href)})`]]);
transpile("bqr-card.ts", [['from "./bqr"', 'from "./bqr.mjs"']]);
const B = await import(pathToFileURL(join(WORK, "bqr.mjs")).href);
const C = await import(pathToFileURL(join(WORK, "bqr-card.mjs")).href);

let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? "✓" : "✗"} ${msg}`); if (!cond) failed++; };

// ---- P0 the path is the brand's (added 2026-10-04, on the move) ------------------------------------------------------------------
console.log("\n— P0 the emblem path");
{
    const brandPath = readFileSync(join(ROOT, "emblem", "emblem.path.txt"), "utf8").trim();
    ok(B.EMBLEM_D === brandPath, `EMBLEM_D is emblem/emblem.path.txt byte for byte (${brandPath.length} chars)`);
    ok(B.EMBLEM_D.replace("3.9743", "3.9744") !== brandPath, "control: a path one digit off is caught");
}

// ---- P1 geometry ---------------------------------------------------------------------------------------------------------------
console.log("\n— P1 geometry");
function raster(K, erode) {
    const N = 24 * K, c = createCanvas(N, N), g = c.getContext("2d");
    g.scale(K, K); g.fillStyle = "#000"; const p = new Path2D(B.EMBLEM_D); g.fill(p);
    if (erode) { g.strokeStyle = "#fff"; g.lineWidth = erode; g.lineJoin = "round"; g.stroke(p); }
    return { N, K, px: g.getImageData(0, 0, N, N).data };
}
{
    const { N, K, px } = raster(100, 0);
    let x0 = N, y0 = N, x1 = -1, y1 = -1;
    for (let i = 0; i < N * N; i++) if (px[i * 4 + 3] > 0) { const x = i % N, y = (i / N) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const m = { x: x0 / K, y: y0 / K, w: (x1 + 1 - x0) / K, h: (y1 + 1 - y0) / K }, E = B.EMBLEM_BOX;
    const near = (a, b) => Math.abs(a.x - b.x) < .02 && Math.abs(a.y - b.y) < .02 && Math.abs(a.w - b.w) < .02 && Math.abs(a.h - b.h) < .02;
    ok(near(m, E), `painted bbox re-measured ${m.w.toFixed(3)}×${m.h.toFixed(3)} at (${m.x.toFixed(3)}, ${m.y.toFixed(3)}) vs brand.json 18.0828×18.0851 at (3.6824, 2.2349)`);
    ok(!near({ ...m, x: m.x + .05 }, E), "control: a bbox 0.05 off is caught");
}
const ER = raster(200, B.BQR_OUTLINE);
function bodyBreaches(b, er = ER) {
    const { N, K, px } = er; let bad = 0;
    for (let y = Math.floor(b.y * K); y < Math.ceil((b.y + b.s) * K); y++) for (let x = Math.floor(b.x * K); x < Math.ceil((b.x + b.s) * K); x++) {
        const i = (y * N + x) * 4; if (!(px[i + 3] === 255 && px[i] === 0)) bad++;
    }
    return bad;
}
{
    const b = B.BQR_BODY;
    ok(bodyBreaches(b) === 0, `body square ${b.s} at (${b.x}, ${b.y}) lies inside the silhouette less half the outline (${bodyBreaches(b)} breaching px at 200 px/unit)`);
    ok(bodyBreaches({ x: b.x - .05, y: b.y, s: b.s + .1 }) > 0, "control: a body 0.1 larger is caught breaching");
    // the largest square in the eroded silhouette — the body must not waste the emblem
    const { N, K, px } = ER; const dp = new Uint16Array(N * N); let best = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x; if (!(px[i * 4 + 3] === 255 && px[i * 4] === 0)) continue;
        const v = x && y ? 1 + Math.min(dp[i - 1], dp[i - N], dp[i - N - 1]) : 1; dp[i] = v; if (v > best) best = v;
    }
    ok(best / K - b.s < .05 && best / K >= b.s, `largest inscribed square re-measured ${(best / K).toFixed(4)}; body ${b.s} uses it (slack ${(best / K - b.s).toFixed(4)})`);
}
{
    // ⭐ §4Z — Version 2's body, against §4Z's outline (3 × 0.16): the thicker stroke reaches further into the heart.
    // ⭐ §4AA — the stroke is now 6 × 0.16 and the body §4Z's, UNCHANGED (written here: a body that shrank would be caught).
    const G = B.BQR_GEOMETRY.outline, b = G.body, er = raster(200, 3 * B.BQR_OUTLINE);
    ok(Math.abs(G.outline - 6 * B.BQR_OUTLINE) < 1e-9, `outline version's stroke is ${G.outline} = 6 × ${B.BQR_OUTLINE} (§4AA: doubled)`);
    ok(b.x === 4.2112 && b.y === 8.7062 && b.s === 11.085, `outline body is §4Z's, unchanged: ${b.s} at (${b.x}, ${b.y})`);
    ok(bodyBreaches(b, er) === 0, `outline body ${b.s} at (${b.x}, ${b.y}) lies inside the silhouette less §4Z's half-stroke 0.24 (${bodyBreaches(b, er)} breaching px)`);
    ok(bodyBreaches({ x: b.x - .05, y: b.y, s: b.s + .1 }, er) > 0, "control: an outline body 0.1 larger is caught breaching");
    const { N, K, px } = er; const dp = new Uint16Array(N * N); let best = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x; if (!(px[i * 4 + 3] === 255 && px[i * 4] === 0)) continue;
        const v = x && y ? 1 + Math.min(dp[i - 1], dp[i - N], dp[i - N - 1]) : 1; dp[i] = v; if (v > best) best = v;
    }
    ok(best / K - b.s < .05 && best / K >= b.s, `outline: largest inscribed square re-measured ${(best / K).toFixed(4)}; body ${b.s} uses it`);
    ok(bodyBreaches(B.BQR_BODY, er) > 0, "control: Version 1's body would breach Version 2's thicker outline (the re-measure was needed)");
}

// ---- P2 layout -------------------------------------------------------------------------------------------------------------------
const P = [
    ["order-here", "https://homecoffee.heartbank.ceo/"],
    ["checkin-brief", "https://homecoffee.heartbank.ceo/?c=ABCD2345EFGH"],
    ["check-in", "https://homecoffee.heartbank.ceo/?here=k7m2x9pq4rtw3hjn"],
    ["referral", "https://homecoffee.heartbank.ceo/?r=K7QX2M9P"],
    ["long-120", "https://homecoffee.heartbank.ceo/?surface=storefront&tag=homecoffee&here=k7m2x9pq4rtw3hjn&lang=km&from=window-table-four"],
];
if (P[4][1].length !== 120) { console.error(`✗ the long payload is ${P[4][1].length} chars, not 120`); process.exit(1); }
console.log("\n— P2 layout");
/** ⛔ The standard's 4, written HERE — a ring check that read its width from `src/bqr.ts` would pass if that constant were lowered. */
const RING = 4;
/** ⛔ §4Z — Version 1's measured ring, written HERE for the same reason. */
const FILL_RING = 1;
/** ⛔ §4AA — the clear ring the doubled outline must leave around the code in Version 2, written HERE. */
const OUTLINE_CLEAR = 2;
ok(B.BQR_QUIET >= RING, `BQR_QUIET is ${B.BQR_QUIET} (the standard quiet zone is ${RING})`);
ok(B.BQR_GEOMETRY.pixels.ring >= FILL_RING && B.BQR_GEOMETRY.outline.ring >= RING, `rings: pixels ${B.BQR_GEOMETRY.pixels.ring} (≥ ${FILL_RING}) · outline ${B.BQR_GEOMETRY.outline.ring} (≥ ${RING})`);
function layoutBreaches(L, quietRing = FILL_RING) {
    const set = new Set(L.deco.map(([c, r]) => `${c},${r}`));
    let ring = 0, runs = 0, outside = 0;
    for (const [c, r] of L.deco) {
        if (c >= -quietRing && c < L.n + quietRing && r >= -quietRing && r < L.n + quietRing) ring++;
        if (set.has(`${c + 1},${r}`) && set.has(`${c + 2},${r}`)) runs++;
        if (set.has(`${c},${r + 1}`) && set.has(`${c},${r + 2}`)) runs++;
        if (!B.insideEmblem(L.ox + (c + .5) * L.m, L.oy + (r + .5) * L.m)) outside++;
    }
    return { ring, runs, outside };
}
for (const ecc of ["L", "M", "Q", "H"]) for (const [name, text] of P) {
    const q = QRCode.create(text, { errorCorrectionLevel: ecc }), L = B.bqrLayout(q.modules, text, { style: "pixels" });
    const v = layoutBreaches(L);
    ok(v.ring + v.runs + v.outside === 0 && L.deco.length > 100,
        `pixels ${ecc} ${name}: v${q.version} ${L.n}×${L.n}, module ${L.m.toFixed(4)} u, ${L.deco.length} decorative — ring ${v.ring} · runs ${v.runs} · outside ${v.outside}`);
    const O = B.bqrLayout(q.modules, text, { style: "outline" });
    ok(O.deco.length === 0 && O.outline === 6 * B.BQR_OUTLINE, `outline ${ecc} ${name}: ${O.deco.length} decorative · stroke ${O.outline}`);
}
{
    const q = QRCode.create(P[0][1], { errorCorrectionLevel: "M" });
    ok(layoutBreaches(B.bqrLayout(q.modules, P[0][1], { style: "pixels", quiet: 0 })).ring > 0, "control: ring 0 is caught inside the 1-ring");
    const L = B.bqrLayout(q.modules, P[0][1], { style: "pixels" }), [c, r] = L.deco[0];
    ok(layoutBreaches({ ...L, deco: [...L.deco, [c + 1, r], [c + 2, r]] }).runs > 0, "control: a planted run of three is caught");
    // ⭐ §4Z — the padding really is filled: decoration INSIDE the old 4-ring now (it was 0 in §4Y).
    ok(layoutBreaches(L, RING).ring > 0, `pixels fills the old padding: ${layoutBreaches(L, RING).ring} decorative cells inside the 4-ring`);
}

// ---- P3 pixels + P4 determinism ---------------------------------------------------------------------------------------------------
console.log("\n— P3 pixels · P4 determinism");
function renderBqr(text, size, o = {}) {
    const c = createCanvas(size, size), g = c.getContext("2d");
    const q = QRCode.create(text, { errorCorrectionLevel: o.ecc ?? B.BQR_ECC });
    B.paintBqr(g, q.modules, text, { size, ...o });
    return c;
}
/** The matrix as it is DRAWN, written HERE — a read that used `bqrTurned` would grade the recipe with its own code (§turn). */
const drawnAs = (m, turn = true) => { const n = m.size; return (r, c) => !!(turn ? m.data[c * n + (n - 1 - r)] : m.data[r * n + c]); };
function pixelRead(text, quiet, style = "pixels", ringOverride, ground, o = {}) {
    const S = 1200, c = renderBqr(text, S, { quiet, style, ground, turn: o.turn }), px = c.getContext("2d").getImageData(0, 0, S, S).data;
    const q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC }), L = B.bqrLayout(q.modules, text, { style, quiet }), { k, tx, ty } = B.bqrPlacement(S);
    const lum = (u, v) => { const i = (Math.round(ty + v * k) * S + Math.round(tx + u * k)) * 4; return (px[i] + px[i + 1] + px[i + 2]) / 3; };
    const ring = ringOverride ?? (style === "outline" ? OUTLINE_CLEAR : FILL_RING);
    let wrong = 0, dirty = 0; const want = drawnAs(q.modules, o.readAs ?? true);
    for (let r = -ring; r < L.n + ring; r++) for (let cc = -ring; cc < L.n + ring; cc++) {
        const inCode = r >= 0 && r < L.n && cc >= 0 && cc < L.n;
        for (const [du, dv] of [[.5, .5], [.2, .2], [.8, .2], [.2, .8], [.8, .8]]) {
            const y = lum(L.ox + (cc + du) * L.m, L.oy + (r + dv) * L.m);
            if (inCode) { if ((y < 128) !== want(r, cc)) wrong++; }
            else if (y < 250) dirty++;
        }
    }
    // ⭐ §4Z — Version 2's lobes stay white: the centre of each lobe (viewBox units, measured off the path) must be paper.
    const lobes = style === "outline" ? [[9.9, 4.9], [18.0, 16.9]].map(([u, v]) => lum(u, v)).filter((y) => y < 250).length : 0;
    return { wrong, dirty, lobes };
}
for (const style of ["pixels", "outline"]) for (const [name, text] of P) {
    const v = pixelRead(text, undefined, style);
    ok(v.wrong === 0 && v.dirty === 0 && v.lobes === 0, `${style} ${name}: code modules read back ${v.wrong} wrong · ring ${v.dirty} non-white samples · lobes ${v.lobes} non-white`);
}
ok(pixelRead(P[0][1], 0).dirty > 0, "control: the ring-0 render is caught with a dirty ring");
{
    // ⭐ §4AA P3′ CONTROL — the doubled stroke IS seen entering the old 4-module margin (else the 2-ring check proves nothing).
    const seen = P.map(([name, text]) => [name, pixelRead(text, undefined, "outline", RING).dirty]);
    ok(seen.some(([, d]) => d > 0), `control: the doubled outline is seen in the old 4-ring — ${seen.map(([n, d]) => `${n} ${d}`).join(" · ")} non-white samples`);
}
for (const style of ["pixels", "outline"]) {
    const a = renderBqr(P[3][1], 640, { style }).toBuffer("image/png"), b = renderBqr(P[3][1], 640, { style }).toBuffer("image/png"),
        d = renderBqr(P[1][1], 640, { style }).toBuffer("image/png");
    ok(a.equals(b), `${style}: the same text draws the same bytes twice`);
    ok(!a.equals(d), `${style} control: another text draws different bytes`);
}
ok(!renderBqr(P[3][1], 640, { style: "pixels" }).toBuffer("image/png").equals(renderBqr(P[3][1], 640, { style: "outline" }).toBuffer("image/png")),
    "the two versions of one text draw different bytes");
for (const style of ["pixels", "outline"]) {
    // ⭐ §4AA — ONE green: the default drawing IS the drawing in BQR_INK (and a control colour is not).
    const def = renderBqr(P[0][1], 640, { style }).toBuffer("image/png");
    ok(def.equals(renderBqr(P[0][1], 640, { style, accent: B.BQR_INK }).toBuffer("image/png")), `${style}: no accent draws the same bytes as accent ${B.BQR_INK} (one green)`);
    ok(!def.equals(renderBqr(P[0][1], 640, { style, accent: "#15803d" }).toBuffer("image/png")), `${style} control: accent #15803d draws different bytes`);
}

// ---- §dark-ground G1 · G2 · G3 (pre-registered in the header, 2026-10-06) --------------------------------------------------------
console.log("\n— §dark-ground G1 identity · G2 transparency · G3 light ground");
const DARK = "#0a0a0f";
/** Flatten a drawing onto a solid ground — what a page under it does. */
const onGround = (src, color) => { const c = createCanvas(src.width, src.height), g = c.getContext("2d"); g.fillStyle = color; g.fillRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0); return c; };
for (const style of ["pixels", "outline"]) {
    const same = P.filter(([, text]) => renderBqr(text, 640, { style }).toBuffer("image/png").equals(renderBqr(text, 640, { style, ground: "paper" }).toBuffer("image/png"))).length;
    ok(same === P.length, `G1 ${style}: ground "paper" draws the same bytes as no ground — ${same}/${P.length} payloads`);
    ok(!renderBqr(P[0][1], 640, { style }).toBuffer("image/png").equals(renderBqr(P[0][1], 640, { style, ground: "heart" }).toBuffer("image/png")), `G1 control ${style}: ground "heart" draws different bytes`);
}
{
    const S = 1200, { k, tx, ty } = B.bqrPlacement(S);
    // The region CLEARLY outside: not covered by the silhouette dilated by half the outline + 2 px (anti-aliasing never reaches it).
    const outside = (style) => {
        const c = createCanvas(S, S), g = c.getContext("2d"), p = new Path2D(B.EMBLEM_D);
        g.translate(tx, ty); g.scale(k, k); g.fillStyle = "#000"; g.fill(p);
        g.strokeStyle = "#000"; g.lineJoin = "round"; g.lineWidth = B.BQR_GEOMETRY[style].outline + 4 / k; g.stroke(p);
        const a = g.getImageData(0, 0, S, S).data, out = [];
        for (let i = 0; i < S * S; i++) if (a[i * 4 + 3] === 0) out.push(i);
        return out;
    };
    for (const style of ["pixels", "outline"]) {
        const out = outside(style);
        const alphaIn = (c) => { const d = c.getContext("2d").getImageData(0, 0, S, S).data; return out.filter((i) => d[i * 4 + 3] > 0).length; };
        const lit = P.map(([, text]) => alphaIn(renderBqr(text, S, { style, ground: "heart" })));
        ok(out.length > S * S * 0.2 && lit.every((n) => n === 0), `G2 ${style}: ${out.length} px clearly outside the silhouette — ${lit.join(" · ")} with any alpha in "heart"`);
        const reused = createCanvas(S, S), rg = reused.getContext("2d"), q = QRCode.create(P[0][1], { errorCorrectionLevel: B.BQR_ECC });
        B.paintBqr(rg, q.modules, P[0][1], { size: S, style }); B.paintBqr(rg, q.modules, P[0][1], { size: S, style, ground: "heart" });
        ok(alphaIn(reused) === 0, `G2 ${style}: "heart" drawn over a "paper" drawing leaves ${alphaIn(reused)} px outside (the square is cleared)`);
        ok(alphaIn(renderBqr(P[0][1], S, { style })) > out.length * 0.99, `G2 control ${style}: "paper" is opaque across that region (${alphaIn(renderBqr(P[0][1], S, { style }))} of ${out.length} px)`);
        for (const [name, text] of P) {
            const v = pixelRead(text, undefined, style, undefined, "heart");
            ok(v.wrong === 0 && v.dirty === 0 && v.lobes === 0, `G2 ${style} ${name} "heart": code modules ${v.wrong} wrong · ring ${v.dirty} non-white · lobes ${v.lobes} non-white`);
        }
    }
    for (const style of ["pixels", "outline"]) {
        let worst = 0;
        for (const [, text] of P) {
            const a = renderBqr(text, 640, { style }).getContext("2d").getImageData(0, 0, 640, 640).data;
            const b = onGround(renderBqr(text, 640, { style, ground: "heart" }), "#ffffff").getContext("2d").getImageData(0, 0, 640, 640).data;
            for (let i = 0; i < a.length; i++) if ((i & 3) !== 3) worst = Math.max(worst, Math.abs(a[i] - b[i]));
        }
        ok(worst <= 4, `G3 ${style}: "heart" flattened onto white differs from "paper" by at most ${worst}/255 on any channel (gate 4, predicted ≤ 2)`);
    }
}

// ---- §emblem-hue H1 · H2 · H3 (pre-registered in the header, 2026-10-06) ---------------------------------------------------------
console.log("\n— §emblem-hue H1 identity · H2 darkness · H3 hue");
const GEMS = JSON.parse(readFileSync(join(ROOT, "dist", "tokens.json"), "utf8")).gems.map((g) => [g.name, g.hex.toLowerCase()]);
const gemHex = Object.fromEntries(GEMS);
ok(GEMS.length === 7, `aperture: ${GEMS.length} gems read from dist/tokens.json (${GEMS.map(([n]) => n).join(" · ")})`);
for (const style of ["pixels", "outline"]) {
    const same = P.filter(([, text]) => {
        const d = renderBqr(text, 640, { style }).toBuffer("image/png");
        return [B.BQR_INK, B.BQR_INK.toUpperCase()].every((hue) => d.equals(renderBqr(text, 640, { style, hue }).toBuffer("image/png")));
    }).length;
    ok(same === P.length, `H1 ${style}: no hue, hue ${B.BQR_INK} and hue ${B.BQR_INK.toUpperCase()} draw the same bytes — ${same}/${P.length} payloads`);
    ok(!renderBqr(P[0][1], 640, { style }).toBuffer("image/png").equals(renderBqr(P[0][1], 640, { style, hue: gemHex.ruby }).toBuffer("image/png")), `H1 control ${style}: hue ruby draws different bytes`);
}
const linH = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lumH = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * linH(n >> 16) + 0.7152 * linH((n >> 8) & 255) + 0.0722 * linH(n & 255); };
const INK_L = lumH(B.BQR_INK);
{
    const rand = (() => { let x = 0x2026_1006; return () => ((x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) ^ (x + 0x6d2b79f5)) >>> 0) / 4294967296; })();
    const inputs = [...GEMS.map(([, h]) => h), "#78849b", "#000000", "#ffffff",
        ...Array.from({ length: 2000 }, () => "#" + [0, 0, 0].map(() => Math.floor(rand() * 256).toString(16).padStart(2, "0")).join(""))];
    let lighter = 0, far = 0, worst = 0;
    for (const h of inputs) { const d = lumH(B.bqrInkFor(h)); if (d > INK_L + 1e-12) lighter++; if (INK_L - d > 0.004) far++; worst = Math.max(worst, INK_L - d); }
    ok(lighter === 0 && far === 0, `H2: ${inputs.length} inputs — ${lighter} lighter than ${B.BQR_INK}, ${far} more than 0.004 darker (worst ${worst.toFixed(4)}; ink luminance ${INK_L.toFixed(4)}) → SC ≥ ${(0.85 - INK_L).toFixed(3)} for every one`);
    ok(0.85 - lumH(gemHex.citrine) < 0.70, `H2 control: raw citrine as an ink is below grade A (SC ${(0.85 - lumH(gemHex.citrine)).toFixed(3)})`);
}
{
    // OKLCH of an 8-bit hex — the same published matrices, written HERE so H3 does not grade the recipe with its own code.
    const oklch = (hex) => {
        const n = parseInt(hex.slice(1), 16), [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(linH);
        const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s2 = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
        const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s2, bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s2;
        return { C: Math.hypot(a, bb), H: Math.atan2(bb, a) * 180 / Math.PI };
    };
    const rows = GEMS.map(([name, h]) => { const d = B.bqrInkFor(h), o = oklch(h), q = oklch(d); const dh = Math.abs(((q.H - o.H + 540) % 360) - 180); return { name, h, d, C: q.C, dh }; });
    const gated = rows.filter((r) => r.C >= 0.03);
    ok(gated.every((r) => r.dh <= 6), `H3: hue kept within 6° — ${rows.map((r) => `${r.name} ${r.h}→${r.d} ${r.C >= 0.03 ? r.dh.toFixed(1) + "°" : "(C " + r.C.toFixed(3) + ", reported)"}`).join(" · ")}`);
}

// ---- §turn T1 · T2 · T3 (pre-registered in the header, 2026-11-23, commit 1b44ac5) ------------------------------------------------
console.log("\n— §turn T1 one mirror line · T2 the turn · T3 nothing else moves");
{
    const { N, K, px } = raster(100, 0), inside = (x, y) => x >= 0 && y >= 0 && x < N && y < N && px[(y * N + x) * 4 + 3] > 127;
    /** How much of the silhouette is its own mirror image about x + y = `sum`: shared area over joined area. */
    const overlap = (sum) => { let both = 0, either = 0; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const a = inside(x, y), b = inside(Math.round(sum * K - 1 - y), Math.round(sum * K - 1 - x)); if (a && b) both++; if (a || b) either++; } return both / either; };
    ok(overlap(24) >= 0.995, `T1: the silhouette is its own mirror image about x + y = 24 — ${(overlap(24) * 100).toFixed(2)}%`);
    ok(overlap(23) < 0.995, `T1 control: about x + y = 23 it is not — ${(overlap(23) * 100).toFixed(2)}%`);
    const off = ([x, y]) => Math.abs(x + y - 24), mirror = ([x, y]) => [24 - y, 24 - x], gap = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    for (const style of ["pixels", "outline"]) {
        const rows = P.map(([name, text]) => {
            const q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC }), L = B.bqrLayout(q.modules, text, { style });
            const at = (r, c) => [L.ox + (c + 3.5) * L.m, L.oy + (r + 3.5) * L.m], e = L.n - 7;
            const t = { middle: at(e, 0), a: at(0, 0), b: at(e, e) }, u = { middle: at(0, 0), a: at(0, e), b: at(e, 0) };
            return { name, t: Math.max(off(t.middle), gap(mirror(t.a), t.b)), uMiddle: off(u.middle), uSet: gap(mirror(u.middle), u.middle) };
        });
        ok(rows.every((r) => r.t < 0.01), `T1 ${style}: turned, the middle marker is on the line and the other two mirror — worst ${Math.max(...rows.map((r) => r.t)).toFixed(4)} units`);
        ok(rows.every((r) => r.uMiddle > 1 && r.uSet > 1), `T1 control ${style}: upright, the middle marker is ${Math.min(...rows.map((r) => r.uMiddle)).toFixed(2)}+ units off the line, so its mirror image has no marker`);
        for (const [name, text] of P) {
            const v = pixelRead(text, undefined, style), q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC }), n = q.modules.size, w = drawnAs(q.modules);
            const marker = (r0, c0) => { for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) { const edge = r === 0 || r === 6 || c === 0 || c === 6, core = r > 1 && r < 5 && c > 1 && c < 5; if (w(r0 + r, c0 + c) !== (edge || core)) return false; } return true; };
            ok(v.wrong === 0 && marker(0, 0) && marker(n - 7, 0) && marker(n - 7, n - 7) && !marker(0, n - 7), `T2 ${style} ${name}: ${v.wrong} wrong modules; markers top left, bottom left, bottom right, none top right`);
        }
        const wrongIfUpright = P.map(([, text]) => pixelRead(text, undefined, style, undefined, undefined, { readAs: false }).wrong);
        ok(wrongIfUpright.every((n) => n > 100), `T2 control ${style}: read as the upright matrix, ${Math.min(...wrongIfUpright)}+ samples are wrong`);
        for (const ground of ["paper", "heart"]) {
            let outside = 0, insideDiff = 0;
            for (const [, text] of P) {
                const S = 1200, q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC }), L = B.bqrLayout(q.modules, text, { style }), { k, tx, ty } = B.bqrPlacement(S);
                const x0 = Math.round(tx + L.ox * k), y0 = Math.round(ty + L.oy * k), x1 = Math.round(tx + (L.ox + L.n * L.m) * k), y1 = Math.round(ty + (L.oy + L.n * L.m) * k);
                const a = renderBqr(text, S, { style, ground }).getContext("2d").getImageData(0, 0, S, S).data, b = renderBqr(text, S, { style, ground, turn: false }).getContext("2d").getImageData(0, 0, S, S).data;
                for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4; if (a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2] && a[i + 3] === b[i + 3]) continue; if (x >= x0 && x < x1 && y >= y0 && y < y1) insideDiff++; else outside++; }
            }
            ok(outside === 0, `T3 ${style} ${ground}: ${outside} pixels differ outside the code's box`);
            ok(insideDiff > 10000, `T3 control ${style} ${ground}: ${insideDiff} pixels differ inside it`);
        }
    }
}

// ---- §tm S1 · S2 · S3 · S5 (pre-registered in the header, 2026-11-24, commit 0b6659a) ---------------------------------------------
console.log("\n— §tm S1 place · S2 quiet · S3 the default · S5 autograph");
const AUTO = { strokes: [[[8, 46], [16, 14], [24, 10], [22, 30], [14, 48], [26, 46], [34, 34]], [[36, 34], [38, 46], [46, 44]], [[40, 22]], [[52, 46], [54, 34], [62, 32], [62, 46], [72, 34], [78, 36], [74, 46], [82, 46], [96, 26]]] };
{
    const er = raster(200, 2 * B.BQR_GEOMETRY.outline.outline / 2), inside = (x, y) => { const i = (Math.round(y * er.K) * er.N + Math.round(x * er.K)) * 4; return er.px[i + 3] === 255 && er.px[i] === 0; };
    const bodies = [B.BQR_GEOMETRY.pixels.body, B.BQR_GEOMETRY.outline.body], right = Math.max(...bodies.map((b) => b.x + b.s));
    const breaches = (b) => { let out = 0, body = 0; for (let i = 0; i <= 60; i++) for (let j = 0; j <= 60; j++) { const x = b.x + b.w * i / 60, y = b.y + b.h * j / 60; if (!inside(x, y)) out++; if (x < right && y > 8) body++; } return { out, body }; };
    for (const [n, b] of [["the ™ (Full)", B.bqrTmBox("pixels")], ["the ™ (Open)", B.bqrTmBox("outline")], ["the autograph's box", B.BQR_AUTOGRAPH]]) { const v = breaches(b); ok(v.out === 0 && v.body === 0, `S1 ${n}: ${b.w.toFixed(2)} × ${b.h.toFixed(2)} at (${b.x.toFixed(2)}, ${b.y.toFixed(2)}) — ${v.out} points outside the silhouette less the thicker outline's half, ${v.body} in the code's body`); }
    ok(breaches({ ...B.BQR_AUTOGRAPH, x: B.BQR_AUTOGRAPH.x - 1.5 }).body > 0, "S1 control: the autograph's box 1.5 units to the left is caught inside the body");
    const t = B.bqrTmBox(), rx = t.w / 2 + B.BQR_TM.pad, ry = t.h / 2 + B.BQR_TM.pad;
    const near = (L) => L.deco.filter(([c, r]) => { const x = L.ox + c * L.m, y = L.oy + r * L.m, nx = Math.max(x, Math.min(B.BQR_LOBE_CENTER.pixels.x, x + L.m)) - B.BQR_LOBE_CENTER.pixels.x, ny = Math.max(y, Math.min(B.BQR_LOBE_CENTER.pixels.y, y + L.m)) - B.BQR_LOBE_CENTER.pixels.y; return (nx / rx) ** 2 + (ny / ry) ** 2 < 1; }).length;
    let touching = 0, without = 1e9, broken = 0;
    for (const ecc of ["L", "M", "Q", "H"]) for (const [, text] of P) { const m = QRCode.create(text, { errorCorrectionLevel: ecc }).modules, L = B.bqrLayout(m, text, { style: "pixels" }), v = layoutBreaches(L); touching += near(L); broken += v.ring + v.runs + v.outside; without = Math.min(without, near(B.bqrLayout(m, text, { style: "pixels", lobe: "none" }))); }
    ok(touching === 0 && broken === 0, `S2: ${touching} dots touch the sign's quiet space, ${broken} breach P2, over 5 payloads × 4 levels`);
    ok(without >= 8, `S2 control: with no sign at least ${without} dots stand there`);
    for (const style of ["pixels", "outline"]) for (const ground of ["paper", "heart"]) {
        const same = P.filter(([, x]) => renderBqr(x, 640, { style, ground }).toBuffer("image/png").equals(renderBqr(x, 640, { style, ground, lobe: "tm" }).toBuffer("image/png"))).length;
        ok(same === P.length, `S3 ${style} ${ground}: no lobe draws the ™ — ${same}/${P.length}`);
        const S = 1200, { k, tx, ty } = B.bqrPlacement(S); let inSign = 0, elsewhere = 0;
        const a = renderBqr(P[0][1], S, { style, ground }).getContext("2d").getImageData(0, 0, S, S).data, b = renderBqr(P[0][1], S, { style, ground, lobe: "none" }).getContext("2d").getImageData(0, 0, S, S).data;
        for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4; if (a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2] && a[i + 3] === b[i + 3]) continue; const u = (x - tx) / k, v = (y - ty) / k; if (Math.abs(u - B.BQR_LOBE_CENTER[style].x) < rx + 0.6 && Math.abs(v - B.BQR_LOBE_CENTER[style].y) < ry + 0.6) inSign++; else elsewhere++; }
        ok(inSign > 300 && elsewhere === 0, `S3 control ${style} ${ground}: the ™ changes ${inSign} pixels in its own space and ${elsewhere} elsewhere`);
    }
    const throws = (o) => { try { renderBqr(P[0][1], 64, o); return false; } catch { return true; } };
    ok(throws({ style: "pixels", autograph: AUTO }) && throws({ autograph: AUTO }) && !throws({ style: "outline", autograph: AUTO }), "S5: an autograph throws in `pixels` and with no style, and draws in `outline`");
    ok([{ strokes: [] }, { strokes: [[]] }, { strokes: [[["a", 1]]] }, { strokes: [[[1, NaN]]] }, { strokes: [Array(4001).fill([1, 1])] }, "M0 0", null].every((x) => !B.isAutograph(x)) && B.isAutograph(AUTO), "S5: only points on the pad are an autograph (an empty one, words, not-a-number, too many points are refused)");
    const stray = (o) => { const S = 1200, { k, tx, ty } = B.bqrPlacement(S), A = B.BQR_AUTOGRAPH; let n = 0; const a = renderBqr(P[0][1], S, { style: "outline", ...o }).getContext("2d").getImageData(0, 0, S, S).data, b = renderBqr(P[0][1], S, { style: "outline", lobe: "none" }).getContext("2d").getImageData(0, 0, S, S).data; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4; if (a[i] === b[i] && a[i + 1] === b[i + 1]) continue; const u = (x - tx) / k, v = (y - ty) / k; if (u < A.x - 0.02 || u > A.x + A.w + 0.02 || v < A.y - 0.02 || v > A.y + A.h + 0.02) n++; } return n; };
    const big = { strokes: AUTO.strokes.map((s) => s.map(([x, y]) => [x * 3, y * 3])) };
    ok(stray({ autograph: AUTO }) === 0 && stray({ autograph: big }) === 0, `S5: no stroke leaves its box, an autograph three times too large included`);
    ok(stray({ autograph: big, fitAutograph: false }) > 100, `S5 control: with the fit off the large one leaves it (${stray({ autograph: big, fitAutograph: false })} pixels)`);
    for (const [name, text] of P) { const S = 1200, c = renderBqr(text, S, { style: "outline", autograph: AUTO }), px = c.getContext("2d").getImageData(0, 0, S, S).data, q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC }), L = B.bqrLayout(q.modules, text, { style: "outline" }), { k, tx, ty } = B.bqrPlacement(S), w = drawnAs(q.modules); let wrong = 0, dirty = 0;
        for (let r = -OUTLINE_CLEAR; r < L.n + OUTLINE_CLEAR; r++) for (let cc = -OUTLINE_CLEAR; cc < L.n + OUTLINE_CLEAR; cc++) { const i = (Math.round(ty + (L.oy + (r + .5) * L.m) * k) * S + Math.round(tx + (L.ox + (cc + .5) * L.m) * k)) * 4, y = (px[i] + px[i + 1] + px[i + 2]) / 3; if (r >= 0 && r < L.n && cc >= 0 && cc < L.n) { if ((y < 128) !== w(r, cc)) wrong++; } else if (y < 250) dirty++; }
        ok(wrong === 0 && dirty === 0, `S5 ${name}: with an autograph the code reads back ${wrong} wrong, its ring ${dirty} non-white`); }
}

// ---- §center C1 · C2 · §coded L1 · L2 · L3 · L5 (pre-registered in the header, 2026-11-24, commit 8e2820e) ------------------------------
console.log("\n— §center C1 the ™ · C2 the autograph · §coded L1 place · L2 refused · L3 the code · L5 read back");
/** The lobe's center, solved from the silhouette alone: midway across the room on its row, midway down the room on its column. */
const lobeCenter = (style) => {
    const G = B.BQR_GEOMETRY[style], m = G.body.s / (25 + 2 * B.BQR_QUIET), codeR = G.body.x + (25 + B.BQR_QUIET) * m, o = G.outline / 2;
    const clear = (x, y) => { for (let a = 0; a < 48; a++) if (!B.insideEmblem(x + o * Math.cos(a * Math.PI / 24), y + o * Math.sin(a * Math.PI / 24))) return false; return true; };
    const right = (y) => { let x = codeR; while (x < 22 && clear(x + .01, y)) x += .01; return x; };
    const vert = (x, y0) => { let t = y0, b = y0; while (t > 2 && clear(x, t - .01)) t -= .01; while (b < 21 && clear(x, b + .01)) b += .01; return [t, b]; };
    let x = 17.8, y = 14; for (let i = 0; i < 6; i++) { x = (codeR + right(y)) / 2; const [t, b] = vert(x, y); y = (t + b) / 2; }
    return { x, y };
};
{
    const S = 2000, { k, tx, ty } = B.bqrPlacement(S), px = (o) => renderBqr(P[0][1], S, o).getContext("2d").getImageData(0, 0, S, S).data;
    /** The center of what `o` paints over `base`, in viewBox units. */
    const inkCenter = (o, base) => { const a = px(o), b = px(base); let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4; if (Math.abs(a[i] - b[i]) < 40) continue; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x: ((x0 + x1 + 1) / 2 - tx) / k, y: ((y0 + y1 + 1) / 2 - ty) / k, w: (x1 - x0 + 1) / k, h: (y1 - y0 + 1) / k }; };
    const off = (c, t) => Math.max(Math.abs(c.x - t.x), Math.abs(c.y - t.y));
    for (const style of ["pixels", "outline"]) {
        const want = lobeCenter(style), tmOnly = inkCenter({ style, lobe: "tm" }, { style, lobe: "none" });
        ok(off(B.BQR_LOBE_CENTER[style], want) <= 0.03, `C1 ${style}: the recipe's center (${B.BQR_LOBE_CENTER[style].x}, ${B.BQR_LOBE_CENTER[style].y}) is the silhouette's (${want.x.toFixed(2)}, ${want.y.toFixed(2)})`);
        // ⚠️ in `pixels` the sign's quiet space also DROPS dots, so there the ™'s own box is what is measured, not the drawing's difference
        const c = style === "outline" ? tmOnly : (() => { const b = B.bqrTmBox(style); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; })();
        ok(off(c, want) <= 0.06, `C1 ${style}: the ™ is centered, ${off(c, want).toFixed(3)} off`);
        ok(off({ x: 18.25, y: 14.12 }, want) > 0.06, `C1 control ${style}: v1.9.0's place is ${off({ x: 18.25, y: 14.12 }, want).toFixed(2)} off`);
    }
    const want = lobeCenter("outline"), A = B.BQR_AUTOGRAPH, moved = (f) => ({ strokes: AUTO.strokes.map((s) => s.map(([x, y]) => f(x, y))) });
    for (const [n, a] of [["filling the pad", AUTO], ["in a corner of it", moved((x, y) => [x * 0.3 + 2, y * 0.3 + 40])], ["tall and thin", moved((x, y) => [x * 0.15 + 60, y])]]) {
        const c = inkCenter({ style: "outline", autograph: a }, { style: "outline", lobe: "none" });
        ok(off(c, want) <= 0.06 && c.w <= A.w + 0.03 && c.h <= A.h + 0.03, `C2 an autograph ${n}: ${off(c, want).toFixed(3)} off, ${c.w.toFixed(2)} × ${c.h.toFixed(2)} of ${A.w} × ${A.h.toFixed(2)}`);
        if (n === "in a corner of it") ok(off(inkCenter({ style: "outline", autograph: a, fitAutograph: false }, { style: "outline", lobe: "none" }), want) > 0.5, "C2 control: with the fit off it stands where it was drawn");
    }
    // ── §coded
    const T = "HTTPS://B.333.ECO/7K2M9QX4B8T3", mk = QRCode.create(T, { errorCorrectionLevel: "M" }).modules, L = B.bqrLayout(mk, T, { style: "outline" }), cells = B.bqrLobeCells(mk), body = B.BQR_GEOMETRY.outline.body;
    const breach = (cs) => { let out = 0, quiet = 0; for (const [c, r] of cs) { const x = L.ox + c * L.m, y = L.oy + r * L.m; for (const [dx, dy] of [[0.08, 0.08], [0.92, 0.08], [0.08, 0.92], [0.92, 0.92]]) { const X = x + dx * L.m, Y = y + dy * L.m; if (!B.insideEmblem(X, Y)) out++; if (X > body.x - 1e-9 && X < body.x + body.s && Y > body.y + 1e-9) quiet++; } } return { out, quiet }; };
    const near = cells.filter(([c, r], i) => cells.some(([c2, r2], j) => i !== j && Math.abs(c - c2) + Math.abs(r - r2) === 1)).length, v = breach(cells);
    ok(cells.length === 192 && v.out === 0 && v.quiet === 0 && near === 0, `L1: ${cells.length} cells, ${v.out} corners outside the heart, ${v.quiet} in the quiet zone, ${near} side by side`);
    ok(breach(cells.map(([c, r]) => [c, r + 5])).quiet > 0, "L1 control: five rows down they breach the quiet zone");
    const rnd = (seed) => Array.from({ length: 96 }, (_, i) => (Math.imul(i + 1 + seed * 97, 2654435761) >>> 15) & 1);
    ok(throws2({ style: "pixels", coded: rnd(1) }) && throws2({ coded: rnd(1) }) && throws2({ style: "outline", coded: rnd(1).slice(1) }) && throws2({ style: "outline", coded: rnd(1).map((x) => x * 2) }) && !throws2({ style: "outline", coded: rnd(1) }), "L2: coded modules throw in `pixels`, with no style, short, or not bits");
    ok(renderBqr(T, 640, { style: "outline" }).toBuffer("image/png").equals(renderBqr(T, 640, { style: "outline", coded: undefined }).toBuffer("image/png")) && !renderBqr(T, 640, { style: "outline" }).toBuffer("image/png").equals(renderBqr(T, 640, { style: "outline", coded: rnd(1) }).toBuffer("image/png")), "L2: none draws what it drew; some draw something");
    for (const [n, extra] of [["", {}], [" and an autograph", { autograph: AUTO }]]) { const SZ = 1200, data = renderBqr(T, SZ, { style: "outline", coded: rnd(2), ...extra }).getContext("2d").getImageData(0, 0, SZ, SZ).data, pl = B.bqrPlacement(SZ), w = drawnAs(mk); let wrong = 0, dirty = 0;
        for (let r = -OUTLINE_CLEAR; r < L.n + OUTLINE_CLEAR; r++) for (let cc = -OUTLINE_CLEAR; cc < L.n + OUTLINE_CLEAR; cc++) { const i = (Math.round(pl.ty + (L.oy + (r + .5) * L.m) * pl.k) * SZ + Math.round(pl.tx + (L.ox + (cc + .5) * L.m) * pl.k)) * 4, y = (data[i] + data[i + 1] + data[i + 2]) / 3; if (r >= 0 && r < L.n && cc >= 0 && cc < L.n) { if ((y < 128) !== w(r, cc)) wrong++; } else if (y < 250) dirty++; }
        ok(wrong === 0 && dirty === 0, `L3 coded${n}: the code reads back ${wrong} wrong, its ring ${dirty} non-white`); }
    const readCoded = (coded) => { const SZ = 1200, data = renderBqr(T, SZ, { style: "outline", coded }).getContext("2d").getImageData(0, 0, SZ, SZ).data, pl = B.bqrPlacement(SZ); return cells.map(([c, r]) => { const i = (Math.round(pl.ty + (L.oy + (r + .5) * L.m) * pl.k) * SZ + Math.round(pl.tx + (L.ox + (c + .5) * L.m) * pl.k)) * 4; return data[i] < 160 ? 1 : 0; }); };
    let bad = 0; for (let s = 0; s < 20; s++) { const b = rnd(s + 5), r = readCoded(b); for (let i = 0; i < 192; i++) if (r[i] !== b[i % 96]) bad++; }
    ok(bad === 0, `L5: 20 words of 96 bits read back, each twice, ${bad} wrong`);
    { const b = rnd(5), r = readCoded(b.map((x, i) => (i === 40 ? 1 - x : x))); ok(r[40] !== b[40] && r[136] !== b[40], "L5 control: one flipped bit is seen, in both its places"); }
    function throws2(o) { try { renderBqr(T, 64, o); return false; } catch { return true; } }
}

// ---- the images ------------------------------------------------------------------------------------------------------------------
const CARD_TEXT = { title: "Home Coffee", caption: "Scan to order here", foot: "homecoffee.heartbank.ceo" };
async function card(text, accent, style) {
    const c = createCanvas(C.CARD.W, C.CARD.H);
    await C.paintQrCard(c.getContext("2d"), { url: text, accent, style, ...CARD_TEXT }, "sans-serif");
    return c;
}
/** The pre-B-QR card, exactly as `drawQrCard` drew it: a plain 900 px code with a 1-module margin at y 260 — the BASELINE. */
function plainCard(text) {
    const c = createCanvas(1200, 1560), g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, 1200, 1560);
    const q = QRCode.create(text, { errorCorrectionLevel: "M" }), n = q.modules.size, s = 900 / (n + 2);
    g.fillStyle = "#000";
    for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) if (q.modules.data[r * n + cc])
        g.fillRect(Math.floor(150 + (cc + 1) * s), Math.floor(260 + (r + 1) * s), Math.ceil(s), Math.ceil(s));
    g.fillStyle = "#16141c"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "600 72px sans-serif"; g.fillText(CARD_TEXT.title, 600, 150, 1080);
    g.font = "500 54px sans-serif"; g.fillText(CARD_TEXT.caption, 600, 1290, 1080);
    return c;
}
/** The card's emblem with no words, at a chosen ECC or quiet ring — the ECC sweep, and ⛔ the BROKEN control (quiet < 4). */
// ---- §body-palette B1 · B2 · B3 · B4 (pre-registered in the header, 2026-10-12, commit aeb8f15) -----------------------------------
console.log("\n— §body-palette B1 identity · B2 the guard · B3 one source · B4 darkness");
const OWNERS = [...B.BQR_OWNERS];
ok(OWNERS.length === 10, `aperture: ${OWNERS.length} owners (${OWNERS.join(" · ")})`);
for (const style of ["pixels", "outline"]) {
    const same = P.filter(([, text]) => renderBqr(text, 640, { style }).toBuffer("image/png").equals(renderBqr(text, 640, { style, owner: "heartbank.ceo" }).toBuffer("image/png"))).length;
    ok(same === P.length, `B1 ${style}: owner heartbank.ceo draws the same bytes as no hue — ${same}/${P.length} payloads`);
    ok(!renderBqr(P[0][1], 640, { style }).toBuffer("image/png").equals(renderBqr(P[0][1], 640, { style, owner: "SW" }).toBuffer("image/png")), `B1 control ${style}: owner SW draws different bytes`);
}
{
    const throws = (o) => { try { renderBqr(P[0][1], 64, o); return false; } catch { return true; } };
    ok(throws({ owner: "SW", hue: "#f28500" }), "B2: owner with hue throws");
    ok(throws({ owner: "XYZ" }), "B2: an unknown owner throws");
    ok(throws({ owner: "H3" }), "B2: \"H3\" alone throws (an H3 code names its domain)");
    const quiet = OWNERS.filter((o) => !throws({ owner: o }));
    ok(quiet.length === OWNERS.length, `B2 control: each owner alone does not throw — ${quiet.length}/${OWNERS.length}`);
}
{
    const tlds = JSON.parse(readFileSync(join(ROOT, "data", "tlds.json"), "utf8"));
    const pairs = tlds.candidateValues.pairs;
    const bad = tlds.tlds.filter((t) => {
        const want = t.tld === "heartbank.ceo" ? B.BQR_INK : pairs[t.hue]?.light?.toLowerCase();
        return (B.BQR_OWNER_HUES[t.tld] ?? "").toLowerCase() !== want;
    }).map((t) => t.tld);
    ok(tlds.tlds.length === 6 && bad.length === 0, `B3: the six domain sources equal tlds.json's candidate LIGHT values (heartbank.ceo = ${B.BQR_INK}) — mismatched: ${bad.join(", ") || "none"}`);
    const raw = readFileSync(join(ROOT, "data", "bodies.json"), "utf8"), bodies = JSON.parse(raw).bodies;
    const names = bodies.map((b) => b.body).join(" · "), h3 = bodies.find((b) => b.body === "H3")?.owners ?? [];
    const listed = bodies.flatMap((b) => b.owners).sort().join(","), coded = [...OWNERS].sort().join(",");
    const hexes = raw.replace(/"\$comment"[\s\S]*?\],/, "").match(/#[0-9a-f]{3,8}\b/gi) ?? [];
    ok(names === "H3 · SW · TH · F333 · MA" && h3.length === 6 && h3.every((d) => tlds.tlds.some((t) => t.tld === d)) && listed === coded && hexes.length === 0,
        `B3: bodies.json names ${names}; H3 owns ${h3.length} domains; its owners ${listed === coded ? "match" : "DIFFER FROM"} BQR_OWNERS; hexes in it: ${hexes.length}`);
}
{
    const rows = OWNERS.map((o) => { const ink = B.bqrOwnerInk(o), L = lumH(ink); return { o, ink, lighter: L > INK_L + 1e-12, far: INK_L - L > 0.004 }; });
    ok(rows.every((r) => !r.lighter && !r.far), `B4: every owner's ink at the green's darkness — ${rows.map((r) => `${r.o} ${r.ink}`).join(" · ")}`);
}

function bareCard(text, { quiet, ecc = B.BQR_ECC, style = "pixels", ink, accent, hue, owner, turn, lobe, autograph } = {}) {
    const c = createCanvas(C.CARD.W, C.CARD.H), g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, C.CARD.W, C.CARD.H);
    const q = QRCode.create(text, { errorCorrectionLevel: ecc });
    B.paintBqr(g, q.modules, text, { ...C.CARD.code, quiet, style, ink, accent, hue, owner, turn, lobe, autograph });
    return c;
}
/** ⭐ The SAME code pixels with the emblem cut away (code box + quiet ring copied onto white) — separates what the decoration costs
 *  from what the smaller modules cost. If this fails where the B-QR fails, the decoration is not the cause. */
function nakedCard(text) {
    // ⭐ §4Z — `pixels` with the ring pushed past the emblem draws no decoration at all: the same code, the same modules.
    const src = bareCard(text, { quiet: 99 }), q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC });
    const L = B.bqrLayout(q.modules, text, { style: "pixels" }), { k, tx, ty } = B.bqrPlacement(C.CARD.code.size, C.CARD.code.x, C.CARD.code.y);
    const x = Math.round(tx + (L.ox - B.BQR_QUIET * L.m) * k) + 2, y = Math.round(ty + (L.oy - B.BQR_QUIET * L.m) * k) + 2;
    const s = Math.round((L.n + 2 * B.BQR_QUIET) * L.m * k) - 4;
    const c = createCanvas(C.CARD.W, C.CARD.H), g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, C.CARD.W, C.CARD.H); g.drawImage(src, x, y, s, s, x, y, s, s);
    return c;
}
const scale = (src, w) => {
    const h = Math.round(src.height * w / src.width), c = createCanvas(w, h), g = c.getContext("2d");
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high"; g.drawImage(src, 0, 0, w, h); return c;
};
const white = (w, h) => { const c = createCanvas(w, h), g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); return [c, g]; };
const blur = (src) => { const [c, g] = white(src.width, src.height); g.filter = `blur(${Math.max(.4, src.width / 400)}px)`; g.drawImage(src, 0, 0); return c; };
const rotate = (src, deg) => {
    const a = deg * Math.PI / 180, w = Math.ceil(Math.abs(src.width * Math.cos(a)) + Math.abs(src.height * Math.sin(a))),
        h = Math.ceil(Math.abs(src.width * Math.sin(a)) + Math.abs(src.height * Math.cos(a)));
    const [c, g] = white(w, h); g.translate(w / 2, h / 2); g.rotate(a); g.drawImage(src, -src.width / 2, -src.height / 2); return c;
};
function solve(A, b) {
    const n = b.length, M = A.map((r, i) => [...r, b[i]]);
    for (let i = 0; i < n; i++) {
        let p = i; for (let j = i + 1; j < n; j++) if (Math.abs(M[j][i]) > Math.abs(M[p][i])) p = j;
        [M[i], M[p]] = [M[p], M[i]];
        for (let j = 0; j < n; j++) if (j !== i) { const f = M[j][i] / M[i][i]; for (let k = i; k <= n; k++) M[j][k] -= f * M[i][k]; }
    }
    return M.map((r, i) => r[n] / r[i]);
}
/** A mild tilt: the top edge 14% narrower and 3% lower on one side — an inverse homography, bilinear. */
const perspective = (src) => {
    const w = src.width, h = src.height, sp = src.getContext("2d").getImageData(0, 0, w, h).data;
    const dst = [[.07 * w, .03 * h], [.93 * w, 0], [w, h], [0, h]], from = [[0, 0], [w, 0], [w, h], [0, h]];
    const A = [], bb = [];
    for (let i = 0; i < 4; i++) { const [x, y] = dst[i], [u, v] = from[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); bb.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); bb.push(v); }
    const H = solve(A, bb);
    const [c, g] = white(w, h), out = g.getImageData(0, 0, w, h), o = out.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const d = H[6] * x + H[7] * y + 1, u = (H[0] * x + H[1] * y + H[2]) / d, v = (H[3] * x + H[4] * y + H[5]) / d;
        if (u < 0 || v < 0 || u >= w - 1 || v >= h - 1) continue;
        const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0, i = (y * w + x) * 4;
        for (let ch = 0; ch < 3; ch++) {
            const p = (yy, xx) => sp[(yy * w + xx) * 4 + ch];
            o[i + ch] = (p(y0, x0) * (1 - fx) + p(y0, x0 + 1) * fx) * (1 - fy) + (p(y0 + 1, x0) * (1 - fx) + p(y0 + 1, x0 + 1) * fx) * fy;
        }
    }
    g.putImageData(out, 0, 0); return c;
};
const jpeg = async (src) => { const img = await loadImage(await src.encode("jpeg", 60)); const [c, g] = white(img.width, img.height); g.drawImage(img, 0, 0); return c; };
const DISTORT = { clean: (c) => c, blur, "rot+10": (c) => rotate(c, 10), "rot-10": (c) => rotate(c, -10), persp: perspective, jpeg60: jpeg };

// ---- decoding ---------------------------------------------------------------------------------------------------------------------
const cases = [];
const quarter = [];
let seq = 0;
async function decodeAll(family, size, name, text, accent, base) {
    for (const [dn, fn] of Object.entries(DISTORT)) {
        const img = await fn(scale(base, size)), id = img.getContext("2d").getImageData(0, 0, img.width, img.height);
        const j = jsQR(id.data, id.width, id.height, { inversionAttempts: "dontInvert" })?.data ?? null;
        const z = (await zx.readBarcodes(id, { formats: ["QRCode"], tryHarder: true, maxNumberOfSymbols: 1 }))[0]?.text ?? null;
        const file = join(WORK, `c${seq++}.png`);
        if (HAVE_CV) writeFileSync(file, img.toBuffer("image/png"));
        cases.push({ family, size, distort: dn, name, accent, text, jsqr: j === text, zxing: z === text, file });
    }
}
console.log("\n— rendering and decoding the matrix…");
// ⭐ §4AA — the default drawing (one green) and a control colour.
const ACCENTS = [B.BQR_INK, "#7c3aed"];
/** ⛔ §4AA — the candidates and the baseline, written HERE (header): the rule picks among these, never from `src/bqr.ts`. */
const INKS = ["#15803d", "#106430", "#14532d", "#052e16"];
const OLD_INK = "#16141c";
const VERSIONS = { pixels: "Version 1 (pixels)", outline: "Version 2 (outline)" };
for (const [name, text] of P) {
    for (const [style, vname] of Object.entries(VERSIONS)) for (const accent of ACCENTS) {
        const cd = await card(text, accent, style);
        for (const s of [1200, 300, 200, 150]) await decodeAll(`${vname} card`, s, name, text, accent, cd);
        const pv = renderBqr(text, 640, { accent, style });
        for (const s of [300, 200, 150]) await decodeAll(`${vname} preview`, s, name, text, accent, pv);
    }
    // ⭐ §dark-ground G4 · G5 — the default ink only; the families are named so P5's aperture (exact names) never counts them.
    for (const [style, vname] of Object.entries(VERSIONS)) {
        const heart = onGround(renderBqr(text, 640, { style, ground: "heart" }), DARK);
        for (const s of [300, 200, 150]) await decodeAll(`${vname} preview, heart on dark`, s, name, text, B.BQR_INK, heart);
        const tile = onGround(renderBqr(text, 640, { style }), DARK);
        for (const s of [300, 200, 150]) await decodeAll(`${vname} preview, paper on dark (reported)`, s, name, text, B.BQR_INK, tile);
        // ⛔ The broken control: the dark ground pressed up to the code's own module box — no quiet zone left.
        const q = QRCode.create(text, { errorCorrectionLevel: B.BQR_ECC }), L = B.bqrLayout(q.modules, text, { style }), { k, tx, ty } = B.bqrPlacement(640);
        const x0 = Math.round(tx + L.ox * k), y0 = Math.round(ty + L.oy * k), x1 = Math.round(tx + (L.ox + L.n * L.m) * k), y1 = Math.round(ty + (L.oy + L.n * L.m) * k);
        const br = onGround(heart, DARK), bg = br.getContext("2d"); bg.fillStyle = DARK;
        bg.fillRect(0, 0, 640, y0); bg.fillRect(0, y1, 640, 640 - y1); bg.fillRect(0, y0, x0, y1 - y0); bg.fillRect(x1, y0, 640 - x1, y1 - y0);
        for (const s of [300, 200, 150]) await decodeAll(`CONTROL dark ground at the code (${vname})`, s, name, text, B.BQR_INK, br);
    }
    // ⭐ §emblem-hue H4 · H5 — every gem's derived ink, beside the same card with no hue; raw diamond (and citrine, reported).
    {
        const dflt = bareCard(text, {});
        for (const s of [300, 200, 150]) await decodeAll("HUE (none)", s, name, text, B.BQR_INK, dflt);
        for (const [gem, hex] of GEMS) {
            const hc = bareCard(text, { hue: hex });
            for (const s of [300, 200, 150]) await decodeAll(`HUE ${gem}`, s, name, text, hex, hc);
            const op = renderBqr(text, 640, { style: "outline", hue: hex });
            await decodeAll(`HUE ${gem} outline preview`, 300, name, text, hex, op);
        }
        for (const [gem, fam] of [["diamond", "CONTROL raw diamond ink"], ["citrine", "raw citrine ink (reported)"]]) {
            const rc = bareCard(text, { ink: gemHex[gem], accent: gemHex[gem] });
            for (const s of [300, 200, 150]) await decodeAll(fam, s, name, text, gemHex[gem], rc);
        }
    }
    // ⭐ §body-palette B5 — every owner's card beside the no-hue card ("HUE (none)", drawn above).
    for (const owner of OWNERS) {
        const oc = bareCard(text, { owner });
        for (const s of [300, 200, 150]) await decodeAll(`OWNER ${owner}`, s, name, text, B.bqrOwnerInk(owner), oc);
        await decodeAll(`OWNER ${owner} outline preview`, 300, name, text, B.bqrOwnerInk(owner), renderBqr(text, 640, { style: "outline", owner }));
    }
    // ⭐ §turn T4 · T6 — turned against upright, same sizes and distortions; and the turned card at every quarter.
    for (const [style, vname] of Object.entries(VERSIONS)) for (const [tn, turn] of [["turned", undefined], ["upright", false]]) {
        const tc = bareCard(text, { style, turn });
        for (const s of [300, 200, 150]) await decodeAll(`TURN ${tn} card (${vname})`, s, name, text, B.BQR_INK, tc);
        const tp = renderBqr(text, 640, { style, turn });
        for (const s of [300, 200, 150]) await decodeAll(`TURN ${tn} preview (${vname})`, s, name, text, B.BQR_INK, tp);
        const th = onGround(renderBqr(text, 640, { style, ground: "heart", turn }), DARK);
        for (const s of [300, 200, 150]) await decodeAll(`TURN ${tn} heart on dark (${vname})`, s, name, text, B.BQR_INK, th);
    }
    for (const style of ["pixels", "outline"]) for (const deg of [90, 180, 270]) {
        const base = scale(bareCard(text, { style }), 300), sq = createCanvas(390, 390), sg = sq.getContext("2d"); sg.fillStyle = "#fff"; sg.fillRect(0, 0, 390, 390); sg.drawImage(base, 45, 0);
        const img = rotate(sq, deg), id = img.getContext("2d").getImageData(0, 0, img.width, img.height);
        quarter.push({ style, deg, name, jsqr: jsQR(id.data, id.width, id.height, { inversionAttempts: "dontInvert" })?.data === text, zxing: (await zx.readBarcodes(id, { formats: ["QRCode"], tryHarder: true, maxNumberOfSymbols: 1 }))[0]?.text === text });
    }
    // ⭐ §tm S4 · S5 — the sign and the autograph against an empty lobe.
    for (const [style, vname] of Object.entries(VERSIONS)) for (const [ln, o] of [["tm", {}], ["none", { lobe: "none" }], ...(style === "outline" ? [["autograph", { autograph: AUTO }], ["coded", { coded: Array.from({ length: 96 }, (_, i) => (Math.imul(i + 1, 2654435761) >>> 15) & 1) }]] : [])]) {
        const lc = bareCard(text, { style, ...o }); for (const s of [300, 200, 150]) await decodeAll(`LOBE ${ln} card (${vname})`, s, name, text, B.BQR_INK, lc);
        const lp = renderBqr(text, 640, { style, ...o }); for (const s of [300, 200, 150]) await decodeAll(`LOBE ${ln} preview (${vname})`, s, name, text, B.BQR_INK, lp);
    }
    const pl = plainCard(text);
    for (const s of [1200, 300, 200, 150]) await decodeAll("plain card (old)", s, name, text, "—", pl);
    const nk = nakedCard(text);
    for (const s of [1200, 300, 200, 150]) await decodeAll("naked (B-QR code, emblem cut away)", s, name, text, "—", nk);
    // ⭐ The ECC sweep — bare card, green, the sizes where anything fails at all (every case passed at 1200 in the first run).
    for (const ecc of ["L", "M", "Q", "H"]) {
        const ec = bareCard(text, { ecc });
        for (const s of [300, 200, 150]) await decodeAll(`ECC ${ecc} (bare card)`, s, name, text, "#15803d", ec);
    }
    // ⭐ §4AA — the INK sweep (the pre-registered rule in the header): the `pixels` card in each candidate green and in the old ink.
    for (const ink of [OLD_INK, ...INKS]) {
        // ⭐ §4AA amendment — one colour per card: the candidate draws the decoration and outline too; the baseline is the old drawing.
        const ic = bareCard(text, { ink, accent: ink === OLD_INK ? "#15803d" : ink });
        for (const s of [300, 200, 150]) await decodeAll(`INK ${ink}`, s, name, text, "#15803d", ic);
    }
    for (const quiet of [0]) {
        const bc = bareCard(text, { quiet });
        for (const s of [1200, 300, 200, 150]) await decodeAll(`BROKEN quiet ${quiet}`, s, name, text, "#15803d", bc);
    }
}
if (HAVE_CV) {
    const py = `import sys, json, cv2
d = cv2.QRCodeDetector()
for line in sys.stdin:
    p = line.strip()
    try:
        t, _, _ = d.detectAndDecode(cv2.imread(p))
    except Exception:
        t = ""
    print(json.dumps(t or ""), flush=True)
`;
    const r = spawnSync(PY, ["-c", py], { input: cases.map((c) => c.file).join("\n") + "\n", maxBuffer: 1 << 26 });
    const lines = r.stdout.toString().trim().split("\n").map((l) => JSON.parse(l));
    if (lines.length !== cases.length) { console.error(`✗ OpenCV answered ${lines.length} of ${cases.length}\n${r.stderr}`); process.exit(1); }
    cases.forEach((c, i) => { c.opencv = lines[i] === c.text; });
}

// ---- the report -------------------------------------------------------------------------------------------------------------------
const cols = ["jsqr", "zxing", ...(HAVE_CV ? ["opencv"] : [])];
console.log(`\n— decode matrix (k/n decoded exactly; n = payloads × accents). Decoders: jsQR 1.4.0 · ZXing-C++ (zxing-wasm) · ${HAVE_CV ? "OpenCV QRCodeDetector" : "OpenCV NOT RUN"}`);
const fams = [...new Set(cases.map((c) => c.family))];
for (const f of fams) {
    console.log(`\n${f}`);
    console.log(`  ${"size".padEnd(6)}${Object.keys(DISTORT).map((d) => d.padEnd(19)).join("")}`);
    for (const s of [...new Set(cases.filter((c) => c.family === f).map((c) => c.size))]) {
        const row = Object.keys(DISTORT).map((d) => {
            const sub = cases.filter((c) => c.family === f && c.size === s && c.distort === d);
            return cols.map((k) => `${sub.filter((c) => c[k]).length}/${sub.length}`).join(" ").padEnd(19);
        });
        console.log(`  ${String(s).padEnd(6)}${row.join("")}`);
    }
    const all = cases.filter((c) => c.family === f);
    console.log(`  total ${cols.map((k) => `${k} ${all.filter((c) => c[k]).length}/${all.length}`).join(" · ")}`);
    const by = P.map(([n]) => { const s = all.filter((c) => c.name === n); return `${n} ${cols.map((k) => s.filter((c) => !c[k]).length).join("/")}`; });
    console.log(`  misses by payload (${cols.join("/")}): ${by.join(" · ")}`);
}
console.log(`  (each cell: ${cols.join(" ")})`);
if (process.env.BQR_JSON) writeFileSync(process.env.BQR_JSON, JSON.stringify(cases.map(({ file, ...c }) => c)));

console.log("\n— P5 · P6");
const must = cases.filter((c) => c.distort === "clean" && Object.values(VERSIONS).some((v) =>
    (c.family === `${v} card` && (c.size === 1200 || c.size === 300)) || (c.family === `${v} preview` && c.size === 300)));
const miss = must.filter((c) => !(c.jsqr && c.zxing));
ok(must.length === 60, `P5 aperture: ${must.length} cases (2 versions × 5 payloads × 2 accents × 3 renders = 60)`);
ok(miss.length === 0, `P5: ${must.length - miss.length}/${must.length} clean B-QRs (both versions) at card 1200 / card 300 / preview 300 decode in jsQR AND ZXing${miss.length ? " — missed: " + miss.map((c) => `${c.family} ${c.size} ${c.name} ${c.accent}`).join("; ") : ""}`);
const broken = cases.filter((c) => c.family.startsWith("BROKEN"));
const bf = cols.map((k) => `${k} ${broken.filter((c) => !c[k]).length}`).join(" · ");
ok(broken.some((c) => cols.some((k) => !c[k])), `P6: the broken control fails somewhere (failures of ${broken.length}: ${bf})`);

// ---- §dark-ground G4 · G5 ------------------------------------------------------------------------------------------------------
console.log("\n— §dark-ground G4 · G5 (rule in the header: heart on #0a0a0f within 2 of 90 of paper on white; the broken control fails ≥ 45)");
for (const [style, vname] of Object.entries(VERSIONS)) {
    const n = (a, k) => a.filter((c) => c[k]).length;
    const heart = cases.filter((c) => c.family === `${vname} preview, heart on dark`);
    const paper = cases.filter((c) => c.family === `${vname} preview` && c.accent === B.BQR_INK);
    const tile = cases.filter((c) => c.family === `${vname} preview, paper on dark (reported)`);
    ok(heart.length === 90 && paper.length === 90, `G4 aperture ${style}: ${heart.length} heart-on-dark · ${paper.length} paper cases (5 payloads × 3 sizes × 6 distortions = 90)`);
    const clean = heart.filter((c) => c.distort === "clean" && c.size === 300);
    ok(clean.length === 5 && clean.every((c) => c.jsqr && c.zxing), `G4(a) ${style}: ${clean.filter((c) => c.jsqr && c.zxing).length}/${clean.length} clean heart-on-dark previews at 300 decode in jsQR AND ZXing`);
    ok(n(paper, "jsqr") - n(heart, "jsqr") <= 2 && n(paper, "zxing") - n(heart, "zxing") <= 2,
        `G4(b) ${style}: heart on dark jsQR ${n(heart, "jsqr")} · ZXing ${n(heart, "zxing")} of 90 vs paper on white ${n(paper, "jsqr")} · ${n(paper, "zxing")} (margin 2; reported: paper on dark ${n(tile, "jsqr")} · ${n(tile, "zxing")})`);
    const br = cases.filter((c) => c.family === `CONTROL dark ground at the code (${vname})`);
    ok(br.length === 90 && br.length - n(br, "jsqr") >= 45 && br.length - n(br, "zxing") >= 45,
        `G5 control ${style}: the ground pressed to the code fails jsQR ${br.length - n(br, "jsqr")} · ZXing ${br.length - n(br, "zxing")} of ${br.length} (≥ 45 each)`);
}

// ---- §emblem-hue H4 · H5 ------------------------------------------------------------------------------------------------------
console.log("\n— §emblem-hue H4 · H5 (rule in the header: each gem's hue within 2 of 90 of no hue; raw diamond fails ≥ 80)");
{
    const n = (a, k) => a.filter((c) => c[k]).length;
    const base = cases.filter((c) => c.family === "HUE (none)");
    ok(base.length === 90, `H4 aperture: ${base.length} no-hue cases (5 payloads × 3 sizes × 6 distortions)`);
    for (const [gem] of GEMS) {
        const h = cases.filter((c) => c.family === `HUE ${gem}`), op = cases.filter((c) => c.family === `HUE ${gem} outline preview` && c.distort === "clean");
        ok(h.length === 90 && n(base, "jsqr") - n(h, "jsqr") <= 2 && n(base, "zxing") - n(h, "zxing") <= 2 && op.length === 5 && op.every((c) => c.jsqr && c.zxing),
            `H4 ${gem} ${B.bqrInkFor(gemHex[gem])}: jsQR ${n(h, "jsqr")} · ZXing ${n(h, "zxing")} of ${h.length} vs no hue ${n(base, "jsqr")} · ${n(base, "zxing")} · outline clean 300 ${op.filter((c) => c.jsqr && c.zxing).length}/${op.length}`);
    }
    const rd = cases.filter((c) => c.family === "CONTROL raw diamond ink"), rc = cases.filter((c) => c.family === "raw citrine ink (reported)");
    ok(rd.length === 90 && rd.length - n(rd, "jsqr") >= 80 && rd.length - n(rd, "zxing") >= 80,
        `H5 control: raw diamond as the ink fails jsQR ${rd.length - n(rd, "jsqr")} · ZXing ${rd.length - n(rd, "zxing")} of ${rd.length} (≥ 80 each; reported: raw citrine reads ${n(rc, "jsqr")} · ${n(rc, "zxing")})`);
}

// ---- §body-palette B5 + the reported pairs --------------------------------------------------------------------------------------
console.log("\n— §body-palette B5 (rule in the header: each owner within 2 of 90 of no hue; outline clean 5/5)");
{
    const n = (a, k) => a.filter((c) => c[k]).length;
    const base = cases.filter((c) => c.family === "HUE (none)");
    for (const owner of OWNERS) {
        const h = cases.filter((c) => c.family === `OWNER ${owner}`), op = cases.filter((c) => c.family === `OWNER ${owner} outline preview` && c.distort === "clean");
        ok(h.length === 90 && n(base, "jsqr") - n(h, "jsqr") <= 2 && n(base, "zxing") - n(h, "zxing") <= 2 && op.length === 5 && op.every((c) => c.jsqr && c.zxing),
            `B5 ${owner} ${B.bqrOwnerInk(owner)}: jsQR ${n(h, "jsqr")} · ZXing ${n(h, "zxing")} of ${h.length} vs no hue ${n(base, "jsqr")} · ${n(base, "zxing")} · outline clean 300 ${op.filter((c) => c.jsqr && c.zxing).length}/${op.length}`);
    }
    // Reported, gating nothing: the OKLab distance of the accepted near-identical pairs and the pair to print-test.
    const lab = (hex) => {
        const v = parseInt(hex.slice(1), 16), [r, g, b] = [v >> 16, (v >> 8) & 255, v & 255].map(linH);
        const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
        return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * q, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * q, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * q];
    };
    const dE = (a, b) => Math.hypot(...lab(B.bqrOwnerInk(a)).map((x, i) => x - lab(B.bqrOwnerInk(b))[i]));
    console.log(`  reported ΔEok: heartbank.us ↔ F333 ${dE("heartbank.us", "F333").toFixed(3)} · heartbank.me ↔ SW ${dE("heartbank.me", "SW").toFixed(3)} · heartbank.org ↔ SW ${dE("heartbank.org", "SW").toFixed(3)} (accepted) · TH ↔ MA ${dE("TH", "MA").toFixed(3)} (print-test)`);
}

// ---- §tm S4 · S5 decode ------------------------------------------------------------------------------------------------------------
console.log("\n— §tm S4 · S5 (within 2 of 90 of an empty lobe, jsQR and ZXing)");
{
    const n = (fam, k) => cases.filter((c) => c.family === fam && c[k]).length, all = (fam) => cases.filter((c) => c.family === fam).length;
    for (const [style, vname] of Object.entries(VERSIONS)) for (const kind of ["card", "preview"]) for (const ln of ["tm", ...(style === "outline" ? ["autograph", "coded"] : [])]) {
        const t = `LOBE ${ln} ${kind} (${vname})`, u = `LOBE none ${kind} (${vname})`;
        ok(all(t) === 90 && all(u) === 90 && n(u, "jsqr") - n(t, "jsqr") <= 2 && n(u, "zxing") - n(t, "zxing") <= 2, `${ln === "tm" ? "S4" : ln === "coded" ? "L4" : "S5"} ${vname} ${kind}, ${ln}: jsQR ${n(t, "jsqr")} · ZXing ${n(t, "zxing")} of ${all(t)} vs empty ${n(u, "jsqr")} · ${n(u, "zxing")}`);
    }
}

// ---- §turn T4 · T6 ------------------------------------------------------------------------------------------------------------------
console.log("\n— §turn T4 (turned within 2 of 90 of upright, jsQR and ZXing) · T6 any angle");
{
    const n = (fam, k) => cases.filter((c) => c.family === fam && c[k]).length, all = (fam) => cases.filter((c) => c.family === fam).length;
    for (const vname of Object.values(VERSIONS)) for (const kind of ["card", "preview", "heart on dark"]) {
        const t = `TURN turned ${kind} (${vname})`, u = `TURN upright ${kind} (${vname})`;
        ok(all(t) === 90 && all(u) === 90, `T4 aperture ${vname} ${kind}: ${all(t)} turned, ${all(u)} upright`);
        console.log(`  ${n(u, "jsqr") - n(t, "jsqr") <= 2 && n(u, "zxing") - n(t, "zxing") <= 2 ? "within 2" : "⚠️ PAST 2 (recorded, §turn result)"} · T4 ${vname} ${kind}: turned jsQR ${n(t, "jsqr")} · ZXing ${n(t, "zxing")} of ${all(t)} vs upright ${n(u, "jsqr")} · ${n(u, "zxing")}`);
    }
    for (const style of ["pixels", "outline"]) {
        const rows = quarter.filter((x) => x.style === style);
        ok(rows.length === 15 && rows.every((x) => x.jsqr && x.zxing), `T6 ${style}: at 90°, 180° and 270° — jsQR ${rows.filter((x) => x.jsqr).length} · ZXing ${rows.filter((x) => x.zxing).length} of ${rows.length}`);
    }
}

// ---- §4AA the ink ---------------------------------------------------------------------------------------------------------------
console.log("\n— §4AA ink (rule in the header: the lightest green at ISO/IEC 15415 grade A that decodes no worse than the old ink by > 2)");
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const SC = (hex) => 0.85 - lum(hex);
const decoded = (ink, k) => cases.filter((c) => c.family === `INK ${ink}` && c[k]).length;
const inkOf = (ink) => cases.filter((c) => c.family === `INK ${ink}`).length;
const base = { jsqr: decoded(OLD_INK, "jsqr"), zxing: decoded(OLD_INK, "zxing") };
const verdict = INKS.map((ink) => {
    const prints = SC(ink) >= 0.70, j = decoded(ink, "jsqr"), z = decoded(ink, "zxing");
    const scans = base.jsqr - j <= 2 && base.zxing - z <= 2;
    console.log(`  ${ink}  luminance ${lum(ink).toFixed(3)} · SC ${SC(ink).toFixed(3)} ${prints ? "grade A" : "below A"} · contrast ${((1.05) / (lum(ink) + 0.05)).toFixed(2)}:1`
        + ` · jsQR ${j}/${inkOf(ink)} ZXing ${z}/${inkOf(ink)} (old ink ${base.jsqr} · ${base.zxing}) → ${prints && scans ? "PASSES" : "fails " + [!prints && "(a) print", !scans && "(b) scan"].filter(Boolean).join(" + ")}`);
    return { ink, ok: prints && scans, L: lum(ink) };
});
const pick = verdict.filter((v) => v.ok).sort((a, b) => b.L - a.L)[0]?.ink ?? "none";
ok(inkOf(OLD_INK) === 90, `ink sweep aperture: ${inkOf(OLD_INK)} cases per ink (5 payloads × 3 sizes × 6 distortions = 90)`);
ok(verdict.find((v) => v.ink === B.BQR_INK)?.ok === true, `BQR_INK ${B.BQR_INK} passes (a) print and (b) scan on the turned drawing (§turn amendment; reported: the old rule would pick ${pick})`);
ok(SC("#15803d") < 0.70, `control: the accent #15803d is caught by (a) — SC ${SC("#15803d").toFixed(3)} < 0.70`);
ok(SC(OLD_INK) >= 0.70, `control: the old near-black passes (a) — SC ${SC(OLD_INK).toFixed(3)}`);


// ---- §turn T4W — the wide sample (BQR_TURN_WIDE=1; pre-registered in the header) ---------------------------------------------------
if (process.env.BQR_TURN_WIDE) {
    console.log("\n— §turn T4W: 60 payloads × 3 sizes × 6 distortions, turned against upright");
    const rand = (() => { let x = 0x2026_1123; return () => ((x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) ^ (x + 0x6d2b79f5)) >>> 0) / 4294967296; })();
    const pickOf = (abc, n) => Array.from({ length: n }, () => abc[Math.floor(rand() * abc.length)]).join("");
    const CROCK = "0123456789ABCDEFGHJKMNPQRSTVWXYZ", LOW = "abcdefghijkmnpqrstuvwxyz23456789";
    const W = [...Array.from({ length: 20 }, () => `HTTPS://B.333.ECO/${pickOf(CROCK, 7)}`),
        ...Array.from({ length: 20 }, () => `https://${pickOf(LOW, 6)}.heartbank.ceo/?`).map((b) => b + pickOf(LOW, 30 + Math.floor(rand() * 31) - b.length)),
        ...Array.from({ length: 20 }, () => `https://${pickOf(LOW, 6)}.heartbank.ceo/?`).map((b) => b + pickOf(LOW, 61 + Math.floor(rand() * 60) - b.length))];
    ok(W.length === 60 && W.slice(20, 40).every((t) => t.length >= 30 && t.length <= 60) && W.slice(40).every((t) => t.length >= 61 && t.length <= 120) && new Set(W).size === 60, `T4W aperture: ${W.length} distinct payloads, lengths ${Math.min(...W.map((t) => t.length))}–${Math.max(...W.map((t) => t.length))}`);
    const score = {}, add = (k, j, z) => { score[k] ??= { n: 0, j: 0, z: 0 }; score[k].n++; score[k].j += j; score[k].z += z; };
    const run = async (key, text, base) => { for (const s of [300, 200, 150]) for (const fn of Object.values(DISTORT)) { const img = await fn(scale(base, s)), id = img.getContext("2d").getImageData(0, 0, img.width, img.height); add(key, jsQR(id.data, id.width, id.height, { inversionAttempts: "dontInvert" })?.data === text ? 1 : 0, (await zx.readBarcodes(id, { formats: ["QRCode"], tryHarder: true, maxNumberOfSymbols: 1 }))[0]?.text === text ? 1 : 0); } };
    for (const text of W) {
        for (const style of ["pixels", "outline"]) for (const [tn, turn] of [["turned", undefined], ["upright", false]]) {
            await run(`${style} card|${tn}`, text, bareCard(text, { style, turn }));
            await run(`${style} preview|${tn}`, text, renderBqr(text, 640, { style, turn }));
            await run(`${style} heart on dark|${tn}`, text, onGround(renderBqr(text, 640, { style, ground: "heart", turn }), DARK));
        }
        await run("BROKEN quiet 0", text, bareCard(text, { quiet: 0 }));
    }
    const tot = { turned: { j: 0, z: 0 }, upright: { j: 0, z: 0 } };
    for (const fam of ["pixels card", "pixels preview", "pixels heart on dark", "outline card", "outline preview", "outline heart on dark"]) {
        const t = score[`${fam}|turned`], u = score[`${fam}|upright`]; tot.turned.j += t.j; tot.turned.z += t.z; tot.upright.j += u.j; tot.upright.z += u.z;
        console.log(`  ${u.j - t.j <= 11 && u.z - t.z <= 11 ? "within 11" : "⚠️ PAST 11 (recorded; shipped by the founder's override)"} · T4W (a) ${fam}: turned jsQR ${t.j} · ZXing ${t.z} of ${t.n} vs upright ${u.j} · ${u.z}`);
    }
    console.log(`  T4W (b) all six: turned jsQR ${tot.turned.j} · ZXing ${tot.turned.z} vs upright ${tot.upright.j} · ${tot.upright.z} (of 6480)`);
    const b = score["BROKEN quiet 0"], u = score["pixels card|upright"];
    ok(u.j - b.j > 11 && u.z - b.z > 11, `T4W control: the broken drawing is worse by jsQR ${u.j - b.j} · ZXing ${u.z - b.z} of ${b.n}`);
}

// ---- samples to look at ------------------------------------------------------------------------------------------------------------
const label = { "order-here": "Scan to order here", "check-in": "Scan when you arrive", referral: "A friend's code for Home Coffee" };
for (const [name, text] of P.filter(([n]) => n in label)) for (const style of Object.keys(VERSIONS)) {
    const c = createCanvas(C.CARD.W, C.CARD.H);
    await C.paintQrCard(c.getContext("2d"), { url: text, title: "Home Coffee", caption: label[name], foot: "homecoffee.heartbank.ceo", style }, "sans-serif");
    writeFileSync(join(OUT, `card-${style}-${name}.png`), c.toBuffer("image/png"));
    writeFileSync(join(OUT, `preview-${style}-${name}.png`), renderBqr(text, 640, { style }).toBuffer("image/png"));
}
for (const style of Object.keys(VERSIONS)) {
    writeFileSync(join(OUT, `preview-${style}-order-here-heart.png`), renderBqr(P[0][1], 640, { style, ground: "heart" }).toBuffer("image/png"));
    writeFileSync(join(OUT, `preview-${style}-order-here-heart-on-dark.png`), onGround(renderBqr(P[0][1], 640, { style, ground: "heart" }), DARK).toBuffer("image/png"));
}
writeFileSync(join(OUT, "broken-quiet0.png"), bareCard(P[0][1], { quiet: 0 }).toBuffer("image/png"));
writeFileSync(join(OUT, "naked-control.png"), nakedCard(P[0][1]).toBuffer("image/png"));
console.log(`\nsamples → ${OUT}`);
console.log(failed ? `\n✗ ${failed} check(s) failed` : "\n✓ all pre-registered checks passed");
process.exit(failed ? 1 : 0);
