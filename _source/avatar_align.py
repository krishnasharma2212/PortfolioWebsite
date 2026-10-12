"""Measure how the Veo clip maps onto the base still (run before avatar_idle.py).

Veo returns 9:16 even from a 3:4 image; it centre-crops and rescales. SIFT on
frame 0 vs base.jpg + RANSAC (similarity: scale, rotation, shift) recovers that
exactly; avatar_idle.py warps every frame back into the stills' canvas with it.
Last measured: scale 1.2502, rotation 0.019°, tx 221.4, ty -0.3.

  python _source/avatar_align.py <scratch_dir>
"""
import subprocess
import sys

import cv2
import numpy as np

SP = sys.argv[1]
STILL = "C:/Users/krish/Downloads/base.jpg"
VIDEO = "C:/Users/krish/Downloads/video.mp4"

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", VIDEO, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
                     capture_output=True).stdout
frame = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
still = cv2.imread(STILL)

sift = cv2.SIFT_create(6000)
k1, d1 = sift.detectAndCompute(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY), None)
k2, d2 = sift.detectAndCompute(cv2.cvtColor(still, cv2.COLOR_BGR2GRAY), None)
good = [a for a, b in cv2.BFMatcher().knnMatch(d1, d2, k=2) if a.distance < 0.7 * b.distance]
src = np.float32([k1[m.queryIdx].pt for m in good])
dst = np.float32([k2[m.trainIdx].pt for m in good])
M, inliers = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=2.0)
scale = float(np.hypot(M[0, 0], M[1, 0]))
rot = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
print(f"matches {len(good)}, inliers {int(inliers.sum())}, scale {scale:.4f}, rotation {rot:.3f}°, "
      f"tx {M[0, 2]:.1f}, ty {M[1, 2]:.1f}")
np.save(f"{SP}/video_to_still.npy", M)
