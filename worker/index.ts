/**
 * krishnasharma.online — the site is a static export (out/), served straight
 * from Cloudflare's edge without running this code. The Worker runs only for
 * the paths listed in run_worker_first (wrangler.jsonc):
 *
 *   /media/**\/*.mp4   the videos, kept in R2 (out/.assetsignore keeps them out
 *                     of the static upload) and served with byte ranges — Safari
 *                     won't play a video whose server ignores Range, and seeking
 *                     needs it everywhere. Each data centre caches the whole file
 *                     after the first request and answers later ranges from it.
 *   paths with "$"    the router's segment prefetches, fetched in their %24 form.
 */

interface Env {
  ASSETS: Fetcher;
  MEDIA: R2Bucket;
}

/** Every URL the site itself uses carries ?v=<content hash>, so those can be cached for good. */
const IMMUTABLE = "public, max-age=31536000, immutable";
const UNVERSIONED = "public, max-age=3600, stale-while-revalidate=86400";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/media/") && url.pathname.endsWith(".mp4")) return media(request, env, ctx, url);
    if (url.pathname.includes("$")) {
      // routed here by run_worker_first: fetch the canonical %24 form, not a redirect to it
      url.pathname = url.pathname.replaceAll("$", "%24");
      return env.ASSETS.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function media(request: Request, env: Env, ctx: ExecutionContext, url: URL): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const key = decodeURIComponent(url.pathname.slice(1)); // "media/reels/<slug>/full.mp4"
  const cacheControl = url.searchParams.has("v") ? IMMUTABLE : UNVERSIONED;
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), { method: "GET" });

  // 1. This data centre's cache. match() answers a Range request with a 206
  //    and If-None-Match with a 304, straight from the cached full file.
  const conditional = new Headers();
  for (const h of ["range", "if-none-match", "if-modified-since"]) {
    const v = request.headers.get(h);
    if (v) conditional.set(h, v);
  }
  const hit = await cache.match(new Request(cacheKey.url, { headers: conditional }));
  if (hit) return request.method === "HEAD" ? new Response(null, hit) : hit;

  // 2. R2: answer this request now; put the whole file in the cache for the next one.
  const wantsRange = request.headers.has("range");
  let obj: R2Object | R2ObjectBody | null;
  try {
    obj = await env.MEDIA.get(key, { range: wantsRange ? request.headers : undefined, onlyIf: request.headers });
  } catch {
    // unparseable or unsatisfiable Range
    const head = await env.MEDIA.head(key);
    if (!head) return notFound(request, env);
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${head.size}`, "Accept-Ranges": "bytes" } });
  }
  if (!obj) return notFound(request, env);

  const headers = baseHeaders(obj, cacheControl);
  if (!("body" in obj)) {
    // a precondition held back the body: If-None-Match matched (not modified), or If-Match failed
    const notModified = request.headers.has("if-none-match") || request.headers.has("if-modified-since");
    return new Response(null, { status: notModified ? 304 : 412, headers });
  }

  const size = obj.size;
  if (wantsRange && obj.range) {
    const r = obj.range as { offset?: number; length?: number; suffix?: number };
    const start = r.suffix !== undefined ? Math.max(0, size - r.suffix) : (r.offset ?? 0);
    const end = r.suffix !== undefined ? size - 1 : Math.min(size - 1, start + (r.length ?? size - start) - 1);
    headers.set("content-range", `bytes ${start}-${end}/${size}`);
    headers.set("content-length", String(end - start + 1));
    if (start === 0 && end === size - 1) {
      // "bytes=0-" — the usual first request: this body is the whole file, so cache it as it streams
      const [toClient, toCache] = obj.body.tee();
      ctx.waitUntil(store(cache, cacheKey, toCache, obj, cacheControl));
      return new Response(request.method === "HEAD" ? null : toClient, { status: 206, headers });
    }
    ctx.waitUntil(fill(env, cache, cacheKey, key, cacheControl));
    return new Response(request.method === "HEAD" ? null : obj.body, { status: 206, headers });
  }

  headers.set("content-length", String(size));
  if (request.method === "HEAD") {
    await obj.body.cancel();
    return new Response(null, { headers });
  }
  const [toClient, toCache] = obj.body.tee();
  ctx.waitUntil(store(cache, cacheKey, toCache, obj, cacheControl));
  return new Response(toClient, { headers });
}

/** The site's 404 page — not cacheable, unlike everything else under /media. */
async function notFound(request: Request, env: Env) {
  const page = await env.ASSETS.fetch(new Request(new URL("/404", request.url)));
  return new Response(request.method === "HEAD" ? null : page.body, {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}

function baseHeaders(obj: R2Object, cacheControl: string) {
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  if (!headers.has("content-type")) headers.set("content-type", "video/mp4");
  headers.set("etag", obj.httpEtag);
  headers.set("last-modified", obj.uploaded.toUTCString());
  headers.set("cache-control", cacheControl);
  headers.set("accept-ranges", "bytes");
  headers.set("x-content-type-options", "nosniff");
  return headers;
}

/** Cache a full 200 for this URL. Content-Length is what lets match() serve ranges from it later. */
function store(cache: Cache, cacheKey: Request, body: ReadableStream, obj: R2Object, cacheControl: string) {
  const headers = baseHeaders(obj, cacheControl);
  headers.set("content-length", String(obj.size));
  return cache.put(cacheKey, new Response(body, { headers })).catch(() => {});
}

/** A mid-file range was served from R2; fetch the whole file once so the next request hits the cache. */
async function fill(env: Env, cache: Cache, cacheKey: Request, key: string, cacheControl: string) {
  if (await cache.match(cacheKey)) return;
  const full = await env.MEDIA.get(key);
  if (full) await store(cache, cacheKey, full.body, full, cacheControl);
}
