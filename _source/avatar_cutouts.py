"""Cut out the three avatar stills (neutral / editor / engineer).

Same method as the portrait: BiRefNet in two passes (the head at near-native
resolution for hair, then the whole figure), merged with a feathered seam, then
pymatting's foreground estimate so the grey studio background never rides on
the edges. Sources are read in place (never modified); results go to OUT.

  <rembg venv>/python _source/avatar_cutouts.py <out_dir>
"""
import sys
import numpy as np
from PIL import Image
from rembg import new_session, remove
from pymatting import estimate_foreground_ml

SRC = {
    "neutral": "C:/Users/krish/Downloads/base.jpg",
    "edit": "C:/Users/krish/Downloads/editor.jpg",
    "code": "C:/Users/krish/Downloads/enginer.jpg",
}
OUT = sys.argv[1]
session = new_session("birefnet-portrait", providers=["CPUExecutionProvider"])


def mask_of(im, box):
    m = remove(im.crop(box), session=session, only_mask=True, post_process_mask=False)
    return np.asarray(m.convert("L"), np.float32) / 255.0


for key, path in SRC.items():
    im = Image.open(path).convert("RGB")
    W, H = im.size
    alpha = mask_of(im, (0, 0, W, H))                      # B: whole figure
    ys, xs = np.where(alpha > 0.5)
    top = int(ys.min())
    row = np.where(alpha[top + 40] > 0.5)[0]
    cx = int((row.min() + row.max()) / 2)
    side = int(W * 0.56)
    x0 = max(0, min(W - side, cx - side // 2))
    y0 = max(0, top - int(side * 0.08))
    box = (x0, y0, x0 + side, min(H, y0 + side))
    ma = mask_of(im, box)                                   # A: head and shoulders
    blend = np.ones_like(ma)
    ramp = int(side * 0.18)
    blend[-ramp:, :] *= np.linspace(1, 0, ramp)[:, None]
    for k in range(ramp):
        w = (k + 1) / ramp
        blend[:, k] *= w
        blend[:, -k - 1] *= w
    region = alpha[box[1]:box[3], box[0]:box[2]]
    alpha[box[1]:box[3], box[0]:box[2]] = blend * ma + (1 - blend) * region
    img = np.asarray(im, np.float64) / 255.0
    fg = estimate_foreground_ml(img, alpha.astype(np.float64))
    rgba = np.dstack([(fg * 255).clip(0, 255).astype(np.uint8), (alpha * 255).clip(0, 255).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(f"{OUT}/cut_{key}.png")
    print(key, "head box", box, "figure top", top, "cols", xs.min(), xs.max())
