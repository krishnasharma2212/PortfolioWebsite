// Writes src/lib/media-manifest.json: a content hash for every file under
// public/media, public/work and public/og (so their URLs can carry ?v=<hash>
// and be cached for a year), plus, for each video, the exact MIME/codecs
// string a <source type> needs to let the browser choose AV1 or H.264 before
// it downloads a byte. Runs before `dev` and `build`.
//
//   node scripts/media-manifest.mjs
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const DIRS = ["media", "work", "og"];
const OUT = join(ROOT, "src", "lib", "media-manifest.json");

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : d.name.startsWith(".") || d.name.startsWith("_") ? [] : [join(dir, d.name)],
  );

const hex2 = (n) => Number(n).toString(16).padStart(2, "0");

/** RFC 6381 codecs string from ffprobe, e.g. avc1.64001f / av01.0.05M.08 / mp4a.40.2 */
function codecs(file) {
  let streams;
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "stream=codec_type,codec_name,profile,level,pix_fmt,width,height:format=duration", "-of", "json", file],
      { encoding: "utf8" },
    );
    streams = JSON.parse(out);
  } catch {
    return { type: "video/mp4" }; // no ffprobe: let the browser sniff it
  }
  const parts = [];
  let w, h;
  for (const s of streams.streams) {
    if (s.codec_type === "video") {
      w = s.width;
      h = s.height;
      if (s.codec_name === "h264") {
        const profile = { Baseline: "42", "Constrained Baseline": "42", Main: "4d", High: "64" }[s.profile] ?? "64";
        parts.push(`avc1.${profile}${s.profile === "Constrained Baseline" ? "e0" : "00"}${hex2(s.level)}`);
      } else if (s.codec_name === "av1") {
        const depth = /10/.test(s.pix_fmt ?? "") ? "10" : "08";
        parts.push(`av01.0.${String(Math.max(0, s.level)).padStart(2, "0")}M.${depth}`);
      }
    } else if (s.codec_type === "audio" && s.codec_name === "aac") {
      parts.push("mp4a.40.2");
    } else if (s.codec_type === "audio" && s.codec_name === "opus") {
      parts.push("opus");
    }
  }
  return {
    type: parts.length ? `video/mp4; codecs="${parts.join(", ")}"` : "video/mp4",
    w,
    h,
    duration: Math.round(Number(streams.format?.duration ?? 0) * 1000) / 1000 || undefined,
  };
}

/** Pixel size from an image's header (WebP, AVIF, PNG, JPEG, SVG), for width/height attributes. */
function dimensions(buf, file) {
  try {
    if (file.endsWith(".png")) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (file.endsWith(".webp")) {
      const chunk = buf.toString("ascii", 12, 16);
      if (chunk === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (chunk === "VP8L") {
        const b = buf.readUInt32LE(21);
        return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) };
      }
      if (chunk === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    }
    if (file.endsWith(".avif")) {
      const i = buf.indexOf("ispe"); // image spatial extents: version/flags, width, height
      if (i > 0) return { w: buf.readUInt32BE(i + 8), h: buf.readUInt32BE(i + 12) };
    }
    if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
      for (let i = 2; i < buf.length; ) {
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
          return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
        i += 2 + len;
      }
    }
    if (file.endsWith(".svg")) {
      const s = buf.toString("utf8", 0, 600);
      const w = s.match(/\bwidth="(\d+(?:\.\d+)?)"/)?.[1];
      const h = s.match(/\bheight="(\d+(?:\.\d+)?)"/)?.[1];
      if (w && h) return { w: Math.round(+w), h: Math.round(+h) };
    }
  } catch {}
  return {};
}

const manifest = {};
for (const dir of DIRS) {
  let files = [];
  try {
    files = walk(join(PUBLIC, dir));
  } catch {
    continue;
  }
  for (const file of files.sort()) {
    const url = "/" + relative(PUBLIC, file).split(sep).join("/");
    const buf = readFileSync(file);
    const entry = { v: createHash("sha256").update(buf).digest("hex").slice(0, 10) };
    if (file.endsWith(".mp4")) Object.assign(entry, codecs(file), { size: statSync(file).size });
    else Object.assign(entry, dimensions(buf, file));
    manifest[url] = entry;
  }
}

const json = JSON.stringify(manifest, null, 1) + "\n";
let prev = "";
try {
  prev = readFileSync(OUT, "utf8");
} catch {}
if (json !== prev) writeFileSync(OUT, json);
console.log(`media manifest: ${Object.keys(manifest).length} files${json === prev ? " (unchanged)" : ""}`);
