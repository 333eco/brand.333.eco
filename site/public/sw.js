// brand.333.eco — offline shell.
//
// Served to the browser VERBATIM: publicDir copies this file into dist without
// passing it through Vite, so it is plain ES5-compatible script with no imports
// and no build step of its own. The one thing that IS rewritten is the two
// placeholders below, stamped by the stampServiceWorker plugin in
// vite.config.ts with a hash of everything else in dist.
//
// WHY A BUILD HASH AND NOT A VERSION NUMBER. A hand-bumped version is a version
// somebody forgets to bump; a hash of the output means an identical rebuild
// evicts nobody and a one-word edit evicts everybody, with no discipline
// required of the person editing.
//
// ⚠️ NEVER CALL A BARE caches.match(). Two cache generations coexist during a
// deploy — sweep() retains the previous one so a tab still running it can reach
// its own hashed chunks — and a bare match searches EVERY cache in creation
// order, handing back the older copy of anything not content-hashed. Go through
// lookup(), which tries the current cache first AND refuses to cross a
// generation boundary for anything whose name is not content-hashed.
//
// ⚠️ THE CACHE NAME IS THE ONLY EXPIRY THIS FILE HAS. Nothing here revalidates,
// so a stable-named file (the icons, the manifest, analytics.js) is fresh for
// exactly as long as BUILD is unchanged, and is re-fetched once on the deploy
// that changes it. That is the whole freshness story, and it works only while
// the cross-generation fallback stays shut to stable names — reaching back for
// one hands over yesterday's file under today's URL, forever.

const BUILD = "__BUILD_ID__";
const CACHE = "brand-" + BUILD;
const ASSETS = __ASSET_LIST__;

// The document itself is not content-hashed, so it is fetched fresh where the
// network allows and served from cache only as a fallback. The assets ARE
// hashed, so they are cache-first and never revalidated.
const SHELL = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE)
            .then((c) => c.addAll(SHELL.concat(ASSETS)))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => {
                // Retain the immediately previous generation, drop the rest.
                //
                // ⚠️ DO NOT .sort() THIS. caches.keys() resolves in CREATION
                // order, which is the only record of age we have; the names are
                // hex hashes, so sorting them reorders the generations at random
                // and slice(-2) then keeps two arbitrary old caches instead of
                // the newest two. CACHE is itself in `mine` — install() created
                // it — so the last two entries are [previous, current].
                const mine = keys.filter((k) => k.indexOf("brand-") === 0);
                const keep = mine.slice(-2).concat([CACHE]);
                return Promise.all(
                    keys
                        .filter((k) => keep.indexOf(k) === -1)
                        .map((k) => caches.delete(k))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Whether an older cache generation may answer for this request. Only the
// content-hashed build output qualifies: those names are unique per build, so
// an old cache's copy is byte-for-byte what the old document asked for. Every
// other URL here has a STABLE name — "/", the icons, the manifest,
// analytics.js — and an older generation therefore holds a DIFFERENT resource
// at the same address.
//
// "/" is deliberately NOT special-cased for the offline fallback: install()
// addAll()s SHELL before the worker can activate, so a running worker always
// has the document in its OWN cache, and a failed install never activates.
function crossGenerationOk(request) {
    const url = typeof request === "string" ? request : request.url;
    try {
        return new URL(url, self.location.origin).pathname.indexOf("/assets/") === 0;
    } catch (e) {
        return false;
    }
}

function lookup(request) {
    return caches.open(CACHE).then((c) =>
        c.match(request).then((hit) => {
            if (hit) return hit;
            if (!crossGenerationOk(request)) return undefined;
            // Fall back to an older generation explicitly, by name, rather than
            // letting a bare caches.match() pick one for us.
            return caches.keys().then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k.indexOf("brand-") === 0 && k !== CACHE)
                        .map((k) => caches.open(k).then((old) => old.match(request)))
                ).then((hits) => hits.filter(Boolean)[0])
            );
        })
    );
}

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE).then((c) => c.put("/", copy));
                    return response;
                })
                .catch(() => lookup("/").then((hit) => hit || fetch(request)))
        );
        return;
    }

    event.respondWith(
        lookup(request).then((hit) => {
            if (hit) return hit;
            return fetch(request).then((response) => {
                if (response && response.status === 200 && response.type === "basic") {
                    const copy = response.clone();
                    caches.open(CACHE).then((c) => c.put(request, copy));
                }
                return response;
            });
        })
    );
});
