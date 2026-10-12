"""Edge-correct RGBA preparation for web encoders.

Resizing straight RGBA averages the black under transparent pixels into the
edge colours, and 4:2:0 chroma (H.264, lossy WebP) smears any hard colour step
at the matte edge — both show as a thin dark outline over light backgrounds.
So: resize premultiplied, un-premultiply, then pad colour outward under the
transparent pixels so the encoder never sees a colour edge where the alpha has one.
"""
import cv2
import numpy as np


def prep(rgba, size=None):
    """rgba: float32 HxWx4 in 0..1 (straight alpha). size: (w, h) or None."""
    a = rgba[..., 3]
    p = rgba[..., :3] * a[..., None]
    if size is not None:
        p = cv2.resize(p, size, interpolation=cv2.INTER_AREA)
        a = cv2.resize(a, size, interpolation=cv2.INTER_AREA)
    rgb = p / np.maximum(a[..., None], 1e-4)
    pb = cv2.GaussianBlur(p, (0, 0), 10)
    ab = cv2.GaussianBlur(a, (0, 0), 10)[..., None]
    fill = np.where(ab > 1e-3, pb / np.maximum(ab, 1e-4), 0.04)
    t = np.clip(a / 0.3, 0, 1)[..., None]          # low-alpha edge pixels lean on the padded colour
    out = rgb * t + fill * (1 - t)
    return np.dstack([np.clip(out, 0, 1), np.clip(a, 0, 1)]).astype(np.float32)


def to_uint8(rgba):
    return (np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8)
