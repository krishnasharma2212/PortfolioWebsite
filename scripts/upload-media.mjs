// Uploads every video under public/media to the R2 bucket the Worker serves
// them from (key = the URL path without the leading slash). Only files whose
// content changed since the last upload are sent; the record of what was
// uploaded lives in .media-uploaded.json.
//
//   node scripts/upload-media.mjs            # changed files only
//   node scripts/upload-media.mjs --force    # everything
//   node scripts/upload-media.mjs --local    # into wrangler dev's local R2
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const BUCKET = "krishna-media";
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const local = process.argv.includes("--local");
const force = process.argv.includes("--force");
const STATE = join(ROOT, local ? ".media-uploaded.local.json" : ".media-uploaded.json");

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]));

const state = existsSync(STATE) && !force ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const videos = walk(join(PUBLIC, "media")).filter((f) => f.endsWith(".mp4"));
// wrangler's JS entry run through this Node — no shell, so paths with spaces survive
const wrangler = join(ROOT, "node_modules", "wrangler", "bin", "wrangler.js");

let sent = 0;
for (const file of videos) {
  const key = relative(PUBLIC, file).split(sep).join("/");
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (state[key] === hash) continue;
  process.stdout.write(`↑ ${key} … `);
  execFileSync(
    process.execPath,
    [
      wrangler,
      "r2", "object", "put", `${BUCKET}/${key}`,
      "--file", file,
      "--content-type", "video/mp4",
      "--cache-control", "public, max-age=31536000, immutable",
      local ? "--local" : "--remote",
    ],
    { stdio: ["ignore", "ignore", "inherit"], cwd: ROOT },
  );
  state[key] = hash;
  writeFileSync(STATE, JSON.stringify(state, null, 1) + "\n");
  sent++;
  console.log("ok");
}
console.log(`media: ${sent} uploaded, ${videos.length - sent} unchanged (${local ? "local" : "remote"} bucket ${BUCKET})`);
