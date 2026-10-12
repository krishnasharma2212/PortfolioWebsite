// After `next build` (static export into out/):
//
// 1. Flattens the client router's segment-prefetch files. The client requests
//    `/code/__next.code.__PAGE__.txt` (every "/" of the segment path becomes
//    "."), but on Windows Next 16.4 writes `/code/__next.code/__PAGE__.txt`:
//    export/index.js builds the name from path.relative(), whose backslashes
//    the converter doesn't touch. Without this every prefetch 404s. On other
//    platforms there is nothing to move and this is a no-op.
// 2. Writes out/.assetsignore so videos stay out of the static-asset upload:
//    they are served from R2 by worker/index.ts, which answers Range requests
//    (Safari needs 206s to play video at all; static assets don't send them).
//
//   node scripts/postbuild.mjs
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../out", import.meta.url));
if (!existsSync(OUT)) throw new Error("out/ not found — run next build first");

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : [join(dir, d.name)]));

let moved = 0;
const walk = (dir) => {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const full = join(dir, d.name);
    if (d.name.startsWith("__next.") || d.name === "__next") {
      // every file below <route>/__next.a/b/c.txt -> <route>/__next.a.b.c.txt
      for (const f of files(full)) {
        const flat = relative(dir, f).split(sep).join(".");
        const dest = join(dir, flat);
        mkdirSync(dirname(dest), { recursive: true });
        renameSync(f, dest);
        moved++;
      }
      rmSync(full, { recursive: true, force: true });
    } else if (d.name !== "_next" && d.name !== "media") {
      walk(full);
    }
  }
};
walk(OUT);

writeFileSync(join(OUT, ".assetsignore"), "# served from R2 by worker/index.ts\n*.mp4\n");

const mp4 = files(OUT).filter((f) => f.endsWith(".mp4"));
const bytes = mp4.reduce((n, f) => n + statSync(f).size, 0);
console.log(`postbuild: flattened ${moved} segment files; ${mp4.length} videos (${(bytes / 1e6).toFixed(1)} MB) left to R2`);
