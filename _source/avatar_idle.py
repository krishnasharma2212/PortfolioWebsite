"""Build the hero's idle loop from the Veo clip.

Veo returned 9:16 — an exact centre crop of base.jpg at 0.8× (measured with
SIFT + RANSAC: scale 1.2502, rotation 0.02°, tx 221.4 px). So each frame is:
  1. matted with RobustVideoMatting (recurrent, so the edge is stable
     frame to frame; warmed up on the first frames before output starts)
  2. warped into the stills' canvas (1792×2400)
  3. completed with the base still where Veo's crop cut the elbows off,
     colour-matched to the clip and feathered across the seam
  4. cropped to the hero frame, and written as "stacked alpha": colour on top,
     the matte below, one ordinary video file a WebGL shader recombines
The last frames ease into frame 0, so the 8 s clip loops without a seam.

The frames go to a lossless FFV1 master first; the web files are encoded from
it — avatar-idle.mp4 (H.264, plays everywhere) and avatar-idle.av1.mp4 (AV1,
chosen by browsers that can decode it).

Sources are read in place. Usage (rembg/onnx venv):
  python _source/avatar_idle.py <scratch_dir> <out_dir>
"""
import subprocess
import sys

import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image

sys.path.insert(0, "D:/Code/Personal Projects/Krishna Website/v3/_source")
from avatar_prep import prep, to_uint8  # noqa: E402

SP, OUT = sys.argv[1], sys.argv[2]
VIDEO = "C:/Users/krish/Downloads/video.mp4"
VW, VH, N = 1080, 1920, 192
CANVAS = (1792, 2400)
M = np.load(f"{SP}/video_to_still.npy")           # video -> still affine
CROP = (130, 100, 1662, 2400)                       # hero frame in canvas pixels (x0, y0, x1, y1)
OUT_W = 864                                         # per-half width of the web video
OUT_H = round(OUT_W * (CROP[3] - CROP[1]) / (CROP[2] - CROP[0]) / 2) * 2
BLEND_TAIL = 4
AV1_CRF = int(sys.argv[3]) if len(sys.argv) > 3 else 34

sess = ort.InferenceSession("D:/Basic/davinci/_tools/models/rvm_mobilenetv3_fp32.onnx",
                            providers=["DmlExecutionProvider", "CPUExecutionProvider"])
print("provider", sess.get_providers()[0], "out", OUT_W, "x", OUT_H, "per half")


def frames():
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", VIDEO, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(VW * VH * 3)
        if len(b) < VW * VH * 3:
            break
        yield np.frombuffer(b, np.uint8).reshape(VH, VW, 3)


def matte(rgb, rec):
    x = rgb.astype(np.float32).transpose(2, 0, 1)[None] / 255.0
    fgr, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3],
                                     "downsample_ratio": np.array([0.3], np.float32)})
    return fgr[0].transpose(1, 2, 0), pha[0, 0], rec


# the base still (already cut out, sky-free edges) fills what Veo cropped away
still = np.asarray(Image.open(f"{SP}/cut_neutral.png"), np.float32) / 255.0
s_rgb, s_a = still[..., :3], still[..., 3]

# horizontal weight: 1 where the clip is used, 0 where the still is, 64 px ramps inside the clip's edge
xs = np.arange(CANVAS[0], dtype=np.float32)
left, right = M[0, 2], M[0, 2] + VW * M[0, 0]
ramp = lambda a, b, x: np.clip((x - a) / (b - a), 0, 1)
w_x = np.minimum(ramp(left + 14, left + 78, xs), 1 - ramp(right - 78, right - 14, xs))
w_x = (w_x * w_x * (3 - 2 * w_x))[None, :]

rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
for i, f in enumerate(frames()):           # warm the recurrent state
    _, _, rec = matte(f, rec)
    if i == 24:
        break

MASTER = f"{SP}/idle-master.mkv"
enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OUT_W}x{OUT_H * 2}", "-r", "24",
     "-i", "-", "-c:v", "ffv1", "-level", "3", "-pix_fmt", "bgr0", MASTER],
    stdin=subprocess.PIPE)

def write(rgba):
    color = (np.clip(rgba[..., :3], 0, 1) * 255).astype(np.uint8)
    alpha = (np.clip(rgba[..., 3], 0, 1) * 255).astype(np.uint8)
    enc.stdin.write(np.vstack([color, np.dstack([alpha] * 3)]).tobytes())


s_fit = None
first = None       # frame 0 at web size, for the loop blend
tail = []          # the last BLEND_TAIL frames are held back and eased into frame 0
for i, f in enumerate(frames()):
    fgr, pha, rec = matte(f, rec)
    v_rgb = cv2.warpAffine(fgr, M, CANVAS, flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    v_a = np.clip(cv2.warpAffine(pha, M, CANVAS, flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0), 0, 1)
    if s_fit is None:
        # colour-match the still to the clip, on solid figure pixels near both seams
        band = (np.abs(xs - left - 120) < 90) | (np.abs(xs - right + 120) < 90)
        sel = (v_a > 0.95) & (s_a > 0.95) & band[None, :]
        fit = [np.polyfit(s_rgb[..., c][sel], np.clip(v_rgb[..., c][sel], 0, 1), 1) for c in range(3)]
        print("still->clip colour fit", [tuple(round(float(v), 3) for v in g) for g in fit])
        s_fit = np.dstack([np.clip(fit[c][0] * s_rgb[..., c] + fit[c][1], 0, 1) for c in range(3)])
    w = np.broadcast_to(w_x, v_a.shape)
    a = w * v_a + (1 - w) * s_a
    p = (w * v_a)[..., None] * v_rgb + ((1 - w) * s_a)[..., None] * s_fit   # premultiplied blend
    rgb = p / np.maximum(a[..., None], 1e-4)
    rgba = np.dstack([np.clip(rgb, 0, 1), a])[CROP[1]:CROP[3], CROP[0]:CROP[2]].astype(np.float32)
    small = prep(rgba, (OUT_W, OUT_H))            # premultiplied resize + edge padding
    if i == 0:
        first = small.copy()
        Image.fromarray(to_uint8(small), "RGBA").save(f"{SP}/idle_poster.png")   # = frame 0, video resolution
    tail.append(small)
    if len(tail) > BLEND_TAIL:
        write(tail.pop(0))
    if i % 32 == 0:
        print("frame", i)

for j, out in enumerate(tail):            # close the loop
    t = (j + 1) / (len(tail) + 1)
    write((1 - t) * out + t * first)
enc.stdin.close()
enc.wait()

# web encodes, from the lossless master
YUV = ["-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", "-an"]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", MASTER, *YUV, "-c:v", "libx264", "-preset", "slow", "-crf", "21",
                "-profile:v", "high", "-g", "48", f"{OUT}/avatar-idle.mp4"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", MASTER, *YUV, "-c:v", "libsvtav1", "-preset", "4", "-crf", str(AV1_CRF),
                "-g", "48", "-svtav1-params", "tune=0", f"{OUT}/avatar-idle.av1.mp4"], check=True)
print("done")
