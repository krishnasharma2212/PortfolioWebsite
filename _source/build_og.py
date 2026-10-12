"""Builds the Open Graph cards (1200x630) for /edit, /code and every reel page
into public/og. The home page keeps src/app/opengraph-image.jpg.

    python _source/build_og.py

Type is Roboto Flex (the site's display face, instanced here through its
variable axes) with Consolas standing in for JetBrains Mono on the labels.
"""
import pathlib, re
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUB = ROOT / "public"
OUT = PUB / "og"
FLEX = str(ROOT / "_source/fonts/RobotoFlex.ttf")
MONO = "C:/Windows/Fonts/consola.ttf"
W, H = 1200, 630
INK, PAPER, DIM, EDIT, CODE = (10, 10, 11), (242, 238, 232), (167, 162, 154), (255, 106, 61), (63, 216, 201)


def flex(size, wght=900, wdth=40):
    f = ImageFont.truetype(FLEX, size)
    axes = {a["name"]: a["default"] for a in f.get_variation_axes()}
    axes[b"Optical Size"], axes[b"Weight"], axes[b"Width"] = 144, wght, wdth
    f.set_variation_by_axes(list(axes.values()))
    return f


def mono(size):
    return ImageFont.truetype(MONO, size)


def stage(glow):
    """Ink background with the site's two stage lights."""
    im = Image.new("RGB", (W, H), INK)
    light = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(light)
    for (cx, cy, r, c, k) in glow:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=tuple(int(v * k) for v in c))
    light = light.filter(ImageFilter.GaussianBlur(120))
    return Image.fromarray(np.clip(np.asarray(im, np.int16) + np.asarray(light, np.int16), 0, 255).astype(np.uint8))


def rounded(im, r):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = im.convert("RGBA")
    out.putalpha(m)
    return out


def paste_card(base, im, box_h, x, y, angle=0, r=22):
    im = im.convert("RGB")
    im = im.resize((round(im.width * box_h / im.height), box_h), Image.LANCZOS)
    card = rounded(im, r)
    edge = Image.new("RGBA", card.size, (0, 0, 0, 0))
    ImageDraw.Draw(edge).rounded_rectangle((0, 0, card.width - 1, card.height - 1), r, outline=(255, 255, 255, 46), width=2)
    card = Image.alpha_composite(card, edge)
    if angle:
        card = card.rotate(angle, resample=Image.BICUBIC, expand=True)
    shadow = Image.new("RGBA", (card.width + 120, card.height + 120), (0, 0, 0, 0))
    sm = card.getchannel("A").point(lambda a: int(a * 0.75))
    shadow.paste((0, 0, 0, 255), (60, 84), sm)
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    base.alpha_composite(shadow, (x - 60, y - 60))
    base.alpha_composite(card, (x, y))


def mark(d, x, y, s=26):
    """The site mark: a play triangle and a prompt chevron."""
    k = s / 24
    d.polygon([(x + 3 * k, y + 3.5 * k), (x + 3 * k, y + 20.5 * k), (x + 12.2 * k, y + 12 * k)], fill=EDIT)
    d.line([(x + 13 * k, y + 4.5 * k), (x + 20.5 * k, y + 12 * k), (x + 13 * k, y + 19.5 * k)], fill=CODE, width=max(2, round(2.6 * k)), joint="curve")


def fit_lines(text, font_for, max_w, max_lines, start, floor=56):
    """Largest size (and its wrapped lines) at which `text` fits in max_lines."""
    words = text.split()
    size = start
    while size >= floor:
        f = font_for(size)
        lines, cur = [], ""
        for w in words:
            t = f"{cur} {w}".strip()
            if f.getlength(t) <= max_w:
                cur = t
            else:
                if cur:
                    lines.append(cur)
                cur = w
        lines.append(cur)
        if len(lines) <= max_lines and all(f.getlength(l) <= max_w for l in lines):
            return f, lines, size
        size -= 4
    return font_for(floor), [text], floor


def footer(d, label, accent):
    mark(d, 64, 556, 26)
    d.text((102, 557), "KRISHNA SHARMA", font=flex(30, 800, 60), fill=PAPER)
    d.text((102 + flex(30, 800, 60).getlength("KRISHNA SHARMA") + 18, 563), label, font=mono(19), fill=accent)


def save(im, name):
    OUT.mkdir(exist_ok=True)
    im.convert("RGB").save(OUT / name, "JPEG", quality=88, optimize=True, progressive=True)
    print(name, round((OUT / name).stat().st_size / 1024), "KB")


def reels():
    src = (ROOT / "src/lib/content.ts").read_text(encoding="utf-8")
    block = src[src.index("export const reels"):src.index("export const services")]
    out = []
    for m in re.finditer(r'slug: "([^"]+)",\s*title: "([^"]+)",(?:\s*series: "([^"]+)",)?\s*hook: "([^"]+)",\s*format: "[^"]+",\s*formatLabel: "([^"]+)"', block):
        ink = re.search(r'ink: "(#[0-9a-fA-F]{6})"', block[m.end():]).group(1)
        out.append(dict(slug=m.group(1), title=m.group(2), series=m.group(3), hook=m.group(4), fmt=m.group(5), ink=ink))
    return out


def reel_card(r):
    base = stage([(140, 120, 360, EDIT, 0.22), (1100, 600, 300, CODE, 0.10)]).convert("RGBA")
    poster = Image.open(PUB / f"media/reels/{r['slug']}/poster.webp")
    paste_card(base, poster, 540, 830, 45, angle=-3)
    d = ImageDraw.Draw(base)
    d.text((64, 62), ("REEL EDIT · " + (r["series"] or r["fmt"])).upper(), font=mono(20), fill=DIM)
    f, lines, size = fit_lines(r["title"].upper(), lambda s: flex(s, 900, 38), 690, 3, 150)
    y = 104
    for l in lines:
        d.text((60, y), l, font=f, fill=EDIT)
        y += round(size * 0.86)
    hook = f"“{r['hook']}”"
    hf, hlines, hs = fit_lines(hook, lambda s: flex(s, 500, 92), 680, 2, 32, 22)
    y += 14
    for l in hlines:
        d.text((64, y), l, font=hf, fill=PAPER)
        y += round(hs * 1.25)
    footer(d, "VIDEO EDITOR · NOIDA, INDIA", EDIT)
    save(base, f"reel-{r['slug']}.jpg")


def edit_card(rs):
    base = stage([(160, 140, 380, EDIT, 0.26), (1150, 620, 280, CODE, 0.08)]).convert("RGBA")
    for i, r in enumerate(rs[:3]):
        poster = Image.open(PUB / f"media/reels/{r['slug']}/poster.webp")
        paste_card(base, poster, 400 + (i == 1) * 40, 668 + i * 142, 128 - (i == 1) * 40, angle=(-6, 0, 6)[i])
    d = ImageDraw.Draw(base)
    d.text((64, 62), "P1 · THE EDITOR", font=mono(20), fill=EDIT)
    d.text((58, 96), "VIDEO", font=flex(200, 900, 36), fill=EDIT)
    d.text((58, 266), "EDITOR", font=flex(200, 900, 36), fill=EDIT)
    d.text((64, 452), "Talking-head & educational edits", font=flex(34, 500, 92), fill=PAPER)
    d.text((64, 494), "for YouTube and Instagram Reels", font=flex(34, 500, 92), fill=DIM)
    footer(d, "NOIDA, INDIA · WORLDWIDE", EDIT)
    save(base, "edit.jpg")


def code_card():
    base = stage([(1050, 120, 380, CODE, 0.22), (120, 620, 280, EDIT, 0.08)]).convert("RGBA")
    shot = Image.open(PUB / "work/cluemate.webp")
    paste_card(base, shot, 330, 640, 150, angle=-3, r=16)
    d = ImageDraw.Draw(base)
    d.text((64, 62), "P2 · THE ENGINEER", font=mono(20), fill=CODE)
    d.text((58, 96), "FULL-STACK", font=flex(132, 900, 30), fill=CODE)
    d.text((58, 210), "& AI", font=flex(132, 900, 30), fill=CODE)
    d.text((58, 324), "ENGINEER", font=flex(132, 900, 30), fill=CODE)
    d.text((64, 470), "AI products that survive contact with users", font=flex(30, 500, 92), fill=PAPER)
    footer(d, "TYPESCRIPT · PYTHON · GO · C#", CODE)
    save(base, "code.jpg")


if __name__ == "__main__":
    rs = reels()
    assert rs, "no reels parsed from content.ts"
    for r in rs:
        reel_card(r)
    edit_card(rs)
    code_card()
