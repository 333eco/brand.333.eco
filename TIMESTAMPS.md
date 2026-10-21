# Timestamps

This repository keeps OpenTimestamps proofs for the **frozen definitions** under `sign/`
(`sign/DEFINITION-v*.md`), starting with *3 for Kiitos*, v0.

Its presence is also what admits this repo to the estate's stamping sweep: `stamp-new.sh`
discovers proof-bearing repos by looking for existing `.ots` files, which a repo holding none
can never satisfy. A `TIMESTAMPS.md` is the deliberate act of saying *proofs are kept here*.

## What is stamped, and what is not

**Stamped:** `sign/DEFINITION-v*.md`. Each is a dated, frozen statement of the sign. A change
is a new file with its own proof, never an edit of an existing one.

**Not stamped:** everything else here. The tokens, the emblem and the site are a design layer
and a website, versioned by `brand.lock` and git, not documents whose date someone must prove.
Stamping them would make the proof set universal, and therefore meaningless.

## The RFC 3161 leg (added 2026-10-21)

Copied from `SW/formal-abhidhamma`: `./tsa-stamp.sh` writes a dated manifest of every
git-tracked path and its SHA-256 under `timestamps/manifests/`, signed by three authorities
(one eIDAS-qualified) and stamped to Bitcoin; `./tsa-verify.sh` checks it offline against the
roots pinned in `timestamps/ca/`. `.github/workflows/tsa-stamp.yml` runs it weekly and on
every push that touches `sign/`. The scope argument above is about the per-file `.ots`
proofs: a manifest records the whole tracked state without declaring every file a document.
`pages-deploy.yml` ignores `timestamps/**`, `TIMESTAMPS.md` and `**/*.ots`, so a timestamping
commit never redeploys the site.

## Keeping the proofs

`./ots-upgrade.sh` bakes the Bitcoin attestation into each proof a few hours after stamping.
It never stamps. Stamping goes through the estate's `.claude/skills/ots/stamp-new.sh`, which
selects only files that have no proof yet.
