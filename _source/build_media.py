"""Builds every video/image the site serves into public/media.

    python _source/build_media.py            # everything (skips outputs that already exist)
    python _source/build_media.py --force    # rebuild

Sources live outside the repo, in the Resolve workspace (D:/Basic/davinci) and
in this folder (_source/, gitignored). Each output is deterministic, so the
public/ folder can always be regenerated from here.

Colour: iPhone HEVC is decoded with an explicit BT.709 matrix and every encode
is tagged BT.709 — ffmpeg's default RGB<->YUV is BT.601, which shifts the lime
and orange accents of the reels (see D:/Basic/davinci/_tools/README.md).
"""
import json, subprocess, sys, pathlib
import numpy as np
from PIL import Image

FORCE = "--force" in sys.argv
ROOT = pathlib.Path(__file__).resolve().parents[1]
PUB = ROOT / "public" / "media"
SRC = ROOT / "_source"
DV = pathlib.Path("D:/Basic/davinci")

TAGS = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
H264 = ["-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", *TAGS]
# AV1 twin of every web video (name.av1.mp4), served first to browsers that can
# decode it. CRFs were picked with VMAF against the 4K master: full reels at
# CRF 38 score ~96 vs H.264's 95.7 at about half the bytes; 480p previews at
# CRF 42 score 95.1 vs 92.6 at 70% of the bytes. Opus replaces AAC — every
# browser that plays AV1 plays Opus in MP4.
AV1 = ["-c:v", "libsvtav1", "-preset", "4", "-pix_fmt", "yuv420p", "-svtav1-params", "tune=0",
       "-movflags", "+faststart", *TAGS]
OPUS = ["-c:a", "libopus", "-b:a", "112k", "-ar", "48000"]


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-2000:])
        raise SystemExit(f"failed: {' '.join(map(str, cmd[:6]))} ...")


def todo(*paths):
    return FORCE or not all(p.exists() for p in paths)


def scale(w, h):
    return (f"scale={w}:{h}:flags=lanczos:in_color_matrix=bt709:in_range=tv:"
            f"out_color_matrix=bt709:out_range=tv,format=yuv420p")


def webp(src_png, out, width=None, q=82, alpha=False):
    im = Image.open(src_png)
    im = im.convert("RGBA" if alpha else "RGB")
    if width and im.width != width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(out, "WEBP", quality=q, method=6, alpha_quality=90)


def avif(im, out, q=68):
    """AVIF twin of a WebP still. q68 matches the WebPs' PSNR at about half the bytes."""
    im.save(out, "AVIF", quality=q, speed=4, subsampling="4:2:0")


def frame_png(video, t, out, w, h):
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t}", "-i", str(video), "-frames:v", "1",
         "-vf", f"scale={w}:{h}:flags=lanczos:in_color_matrix=bt709:in_range=tv,format=rgb24", str(out)])


# --------------------------------------------------------------------------- reels
# slug: (source, poster time s, preview start s, preview length s)
REELS = {
    "copilot-day-1": (DV / "reel5/exports/Copilot_Day1_reel_4K_FINAL.mp4", 4.05, 11.0, 6),
    "canva-ai-day-3": (DV / "reel6/exports/CanvaAI_Day3_reel_4K_FINAL.mp4", 11.1, 9.8, 6),
    "three-secret-tools": (DV / "reel7/delivery/Reel07_Final.mp4", 12.0, 10.5, 6),
    "edit-with-one-prompt": (DV / "reel_export/IMG_2167_VIRAL_REEL_FINAL.mp4", 0.8, 0.0, 6),
}


def build_reels():
    for slug, (src, poster_t, pv_t, pv_len) in REELS.items():
        out = PUB / "reels" / slug
        out.mkdir(parents=True, exist_ok=True)
        full, prev = out / "full.mp4", out / "preview.mp4"
        if todo(full):
            run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", scale(720, 1280), *H264,
                 "-crf", "23", "-maxrate", "3200k", "-bufsize", "6400k", "-g", "60",
                 "-c:a", "aac", "-b:a", "128k", "-ar", "48000", str(full)])
        if todo(prev):
            run(["ffmpeg", "-v", "error", "-y", "-ss", f"{pv_t}", "-t", f"{pv_len}", "-i", str(src),
                 "-vf", scale(480, 854), *H264, "-crf", "27", "-g", "30", "-an", str(prev)])
        if todo(out / "full.av1.mp4"):
            run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", scale(720, 1280), *AV1,
                 "-crf", "38", "-g", "60", *OPUS, str(out / "full.av1.mp4")])
        if todo(out / "preview.av1.mp4"):
            run(["ffmpeg", "-v", "error", "-y", "-ss", f"{pv_t}", "-t", f"{pv_len}", "-i", str(src),
                 "-vf", scale(480, 854), *AV1, "-crf", "42", "-g", "30", "-an", str(out / "preview.av1.mp4")])
        if todo(out / "poster.webp", out / "poster-sm.webp"):
            tmp = out / "_poster.png"
            frame_png(src, poster_t, tmp, 720, 1280)
            webp(tmp, out / "poster.webp", q=80)
            webp(tmp, out / "poster-sm.webp", width=360, q=78)
            tmp.unlink()
        print("reel", slug, round(full.stat().st_size / 1e6, 2), "MB")


# ----------------------------------------------------------------- exploded edit
# Reel 3 (Julius AI), record frame 120: every layer of the composite is live at once.
LAYERS = [
    ("plate", "derived_speaker_anim.mov", False),
    ("panel", "reel3_gfx_v3.mov", True),
    ("popout", "derived_popout.mov", True),
    ("fx", "reel3_fx_v3.mov", True),
    ("captions", "reel3_cap_v2.mov", True),
]


def build_breakdown():
    out = PUB / "breakdown" / "julius"
    out.mkdir(parents=True, exist_ok=True)
    if not todo(out / "final.webp"):
        return
    comp = None
    for name, src, alpha in LAYERS:
        png = out / f"_{name}.png"
        run(["ffmpeg", "-v", "error", "-y", "-i", str(DV / "reel3/overlays" / src), "-vf",
             r"select=eq(n\,120),scale=720:1280:flags=lanczos,format=rgba", "-frames:v", "1", str(png)])
        im = Image.open(png).convert("RGBA")
        comp = im if comp is None else Image.alpha_composite(comp, im)
        webp(png, out / f"{name}.webp", q=84, alpha=alpha)
        png.unlink()
    comp.convert("RGB").save(out / "final.webp", "WEBP", quality=84, method=6)
    print("breakdown ok")


# ------------------------------------------------------------- raw <-> final (Reel 07)
# The delivered edit is these half-open source ranges of IMG_2599.MOV, in order
# (reel7/delivery/README.md). Concatenating them gives a raw take that is
# frame-for-frame aligned with the final — 617 frames each.
CUTS = [(0, 58), (62, 148), (158, 290), (306, 451), (457, 583), (587, 657)]


def build_rawfinal():
    out = PUB / "rawfinal" / "reel07"
    out.mkdir(parents=True, exist_ok=True)
    raw, fin = out / "raw.mp4", out / "final.mp4"
    parts, labels = [], []
    for i, (a, b) in enumerate(CUTS):
        parts.append(f"[0:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS[v{i}];"
                     f"[0:a]atrim=start={a / 30:.6f}:end={b / 30:.6f},asetpts=PTS-STARTPTS[a{i}];")
        labels.append(f"[v{i}][a{i}]")
    fc = "".join(parts) + "".join(labels) + f"concat=n={len(CUTS)}:v=1:a=1[cv][ca];[cv]{scale(720, 1280)}[v]"
    if todo(raw):
        run(["ffmpeg", "-v", "error", "-y", "-i", str(DV / "reel7/IMG_2599.MOV"), "-filter_complex", fc,
             "-map", "[v]", "-map", "[ca]", "-r", "30", *H264, "-crf", "24", "-g", "30",
             "-c:a", "aac", "-b:a", "96k", "-ar", "48000", str(raw)])
    if todo(fin):
        run(["ffmpeg", "-v", "error", "-y", "-i", str(DV / "reel7/delivery/Reel07_Final.mp4"),
             "-vf", scale(720, 1280), "-r", "30", *H264, "-crf", "23", "-g", "30",
             "-c:a", "aac", "-b:a", "128k", "-ar", "48000", str(fin)])
    if todo(out / "raw.av1.mp4"):
        run(["ffmpeg", "-v", "error", "-y", "-i", str(DV / "reel7/IMG_2599.MOV"), "-filter_complex", fc,
             "-map", "[v]", "-map", "[ca]", "-r", "30", *AV1, "-crf", "38", "-g", "30",
             "-c:a", "libopus", "-b:a", "96k", "-ar", "48000", str(out / "raw.av1.mp4")])
    if todo(out / "final.av1.mp4"):
        run(["ffmpeg", "-v", "error", "-y", "-i", str(DV / "reel7/delivery/Reel07_Final.mp4"),
             "-vf", scale(720, 1280), "-r", "30", *AV1, "-crf", "38", "-g", "30", *OPUS,
             str(out / "final.av1.mp4")])
    for v in (raw, fin):
        n = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries",
                            "stream=nb_read_frames", "-of", "csv=p=0", str(v)], capture_output=True, text=True).stdout.strip()
        print("rawfinal", v.name, n, "frames", round(v.stat().st_size / 1e6, 2), "MB")
    if todo(out / "poster-raw.webp"):
        for name, v in (("raw", raw), ("final", fin)):
            tmp = out / f"_{name}.png"
            frame_png(v, 5.4, tmp, 720, 1280)
            webp(tmp, out / f"poster-{name}.webp", q=78)
            tmp.unlink()


# ------------------------------------------------------------------ portrait
# Krishna, IMG_2655 (iPhone 15, Display P3 → sRGB). Cut out with BiRefNet in two
# passes (head at near-native resolution, then the body) and pymatting's
# foreground estimate, so hair edges carry no sky spill — see
# _source/portrait/matte_birefnet.py. Here it is only cropped and exported.
PORTRAIT_CROP_BOTTOM = 2300  # rows of the cut-out kept: head to just below the hands
FACE = (640, 380)            # face centre in cut-out pixels, for the retouch


def retouch(im):
    """Poster retouch, baked in: the hero shows this photo graded three ways
    (black-and-white, tungsten, teal), all driven by luminance, so luminance is
    what gets shaped.
      - spotlight falloff: exposure eases down from the chest to the crop edge,
        so the eye lands on the face rather than the bright shirt
      - a soft lift and a touch of clarity on the face
      - a gentle shoulder on highlights so the white plaid never glares
    Colour is kept for whatever comes next (the class variants)."""
    from PIL import ImageFilter
    rgb = np.asarray(im.convert("RGB"), np.float32) / 255
    a = np.asarray(im.getchannel("A"))
    h, w = rgb.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # vertical falloff: 1.0 above the chest, easing to 0.6 at the bottom edge
    t = np.clip((yy - 820) / (h - 820), 0, 1)
    fall = 1 - 0.4 * (t * t * (3 - 2 * t))
    # face lift
    d2 = (xx - FACE[0]) ** 2 + (yy - FACE[1]) ** 2
    lift = 1 + 0.13 * np.exp(-d2 / (2 * 250 ** 2))
    lum = (rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]
    target = lum * fall[..., None] * lift[..., None]
    knee = 0.8
    target = np.where(target > knee, knee + (target - knee) * 0.55, target)
    out = rgb * (target / np.maximum(lum, 1e-4))
    out = np.clip(out, 0, 1)
    img = Image.fromarray((out * 255 + 0.5).astype(np.uint8))
    # clarity on the face only: a wide, weak unsharp mask blended through a soft mask
    clar = np.asarray(img.filter(ImageFilter.UnsharpMask(radius=16, percent=28, threshold=0)), np.float32)
    m = np.exp(-d2 / (2 * 260 ** 2))[..., None]
    img = Image.fromarray((clar * m + np.asarray(img, np.float32) * (1 - m)).clip(0, 255).astype(np.uint8))
    img.putalpha(Image.fromarray(a))
    return img


def build_portrait():
    from PIL import ImageFilter
    out = PUB / "hero"
    out.mkdir(parents=True, exist_ok=True)
    dst = out / "krishna-1259.webp"
    if not todo(dst, out / "krishna-1259.avif", out / "krishna-630.avif"):
        return
    cut = Image.open(SRC / "portrait" / "cut_birefnet.png").convert("RGBA")
    im = retouch(cut.crop((0, 0, cut.width, min(cut.height, PORTRAIT_CROP_BOTTOM))))
    half = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
    rgb = half.convert("RGB").filter(ImageFilter.UnsharpMask(radius=0.8, percent=60, threshold=1))
    rgb.putalpha(half.getchannel("A"))
    if todo(dst):
        im.save(dst, "WEBP", quality=86, method=6, alpha_quality=92)
        rgb.save(out / "krishna-630.webp", "WEBP", quality=84, method=6, alpha_quality=90)
    if todo(out / "krishna-1259.avif", out / "krishna-630.avif"):
        avif(im, out / "krishna-1259.avif")
        avif(rgb, out / "krishna-630.avif")
    with open(out / "krishna.json", "w") as f:
        json.dump({"w": im.width, "h": im.height}, f)
    print("portrait", im.size, round(dst.stat().st_size / 1024), "KB /", round((out / "krishna-630.webp").stat().st_size / 1024), "KB")


# ------------------------------------------------------------------- hero looks
# The three looks of the 3D character, from the cut-outs in _source/hero
# (avatar_cutouts.py; the stills share one 1792x2400 canvas). Neutral is frame 0
# of the idle loop (idle_poster.png, written by avatar_idle.py) so the poster
# and the loop line up to the pixel. prep() keeps the matte edges clean under
# 4:2:0 encoders (see avatar_prep.py).
HERO_CROP = (130, 100, 1662, 2400)  # the hero frame on that canvas: 1532x2300


def build_hero():
    sys.path.insert(0, str(SRC))
    from avatar_prep import prep, to_uint8
    out, hero = PUB / "hero", SRC / "hero"
    poster = hero / "idle_poster.png"
    if poster.exists() and todo(out / "avatar-neutral-864.webp", out / "avatar-neutral-864.avif"):
        im = Image.open(poster).convert("RGBA")
        if todo(out / "avatar-neutral-864.webp"):
            im.save(out / "avatar-neutral-864.webp", "WEBP", quality=86, method=6, alpha_quality=92)
        avif(im, out / "avatar-neutral-864.avif")
    for key in ("edit", "code"):
        names = [out / f"avatar-{key}-{w}.{ext}" for w in (1532, 766) for ext in ("webp", "avif")]
        if not (hero / f"cut_{key}.png").exists() or not todo(*names):
            continue
        x0, y0, x1, y1 = HERO_CROP
        rgba = np.asarray(Image.open(hero / f"cut_{key}.png").convert("RGBA"), np.float32)[y0:y1, x0:x1] / 255
        for w in (1532, 766):
            im = Image.fromarray(to_uint8(prep(rgba, None if w == 1532 else (w, round(w * 2300 / 1532)))), "RGBA")
            if todo(out / f"avatar-{key}-{w}.webp"):
                im.save(out / f"avatar-{key}-{w}.webp", "WEBP", quality=86, method=6, alpha_quality=92)
            avif(im, out / f"avatar-{key}-{w}.avif")
    print("hero", sorted(f.name for f in out.glob("avatar-*")))


# ------------------------------------------------------------------- waveforms
# Peak envelope of each reel's mix, 240 bins, for the A1 track on the timeline.
def build_waves(bins=240):
    out = {}
    for slug, (src, *_rest) in REELS.items():
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(PUB / "reels" / slug / "full.mp4"), "-ac", "1",
                              "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
        a = np.abs(np.frombuffer(raw, np.int16).astype(np.float32)) / 32768
        edges = np.linspace(0, len(a), bins + 1).astype(int)
        peaks = np.array([a[edges[i]:edges[i + 1]].max(initial=0) for i in range(bins)])
        rms = np.array([np.sqrt((a[edges[i]:edges[i + 1]] ** 2).mean()) if edges[i + 1] > edges[i] else 0 for i in range(bins)])
        v = 0.55 * peaks / max(peaks.max(), 1e-6) + 0.45 * rms / max(rms.max(), 1e-6)
        out[slug] = [round(float(x), 3) for x in v]
    ts = ("/** Generated by _source/build_media.py: peak/RMS envelope of each reel's final mix. */" + chr(10)
          + f"export const waves: Record<string, number[]> = {json.dumps(out)};" + chr(10))
    (ROOT / "src" / "lib" / "waves.ts").write_text(ts, encoding="utf-8")
    print("waves", {k: len(v) for k, v in out.items()})


if __name__ == "__main__":
    build_hero()
    build_portrait()
    build_breakdown()
    build_reels()
    build_rawfinal()
    build_waves()
