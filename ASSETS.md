# Assets — the 3D avatar

**Status: done and live in the hero** (base / editor / engineer stills and the
Veo idle loop, generated 12 Oct 2026). How they were processed is in the README
("The player character and the human"). The prompts below are kept for when you
want new looks — a new outfit, a new class, the optional poses at the end.

The hero is a **character-select screen**: one Krishna, two playable classes,
**three images of the same character** — neutral, editor, engineer — plus an
idle loop for the neutral state. Each look keeps its own lighting; the stage
adds the rim light.

## The rules that make it work

- **Generate the base first, then *edit* it** for the two variants. Never
  generate the variants from scratch, or the face will drift.
- **Same framing in all three**: waist-up, centred, same camera, same size.
  The page swaps them in place, so any shift shows.
- **Flat light-grey background (#BDBDBD)**, nothing else. I cut the character
  out; a plain background gives a clean edge on hair.
- **Vertical 3:4**, as large as the tool allows (2048 × 2732 or more).
- No text, logos or watermarks anywhere.

Use **Nano Banana Pro** (Gemini) for all three. Attach 2–3 clear, well-lit
photos of yourself for the base: IMG_2655 (the plaid-shirt photo) plus one
close-up of your face, front-on, in soft light.

---

## 1 · Base avatar (neutral)

```
Create a high-end 3D animated character of the man in the attached photos, in the
style of a modern Pixar / Disney feature film: stylised proportions, slightly
larger eyes, soft subsurface skin, individually detailed hair.

Keep his likeness exact: slim face, skin tone, eyes, eyebrows, nose, lips, his
light moustache and short chin beard, and his thick, voluminous dark hair with a
soft side-swept fringe. Slim build.

Pose and framing: waist-up, standing straight and centred, facing the camera,
shoulders relaxed, his left hand in his pocket and his right arm relaxed at his
side, a calm, confident half-smile. Leave clear space above the head, about 8%
of the image height. Vertical 3:4.

Wardrobe: his blue-and-white plaid shirt with the sleeves rolled up, one hand
in the pocket of dark olive-grey jeans — the same outfit as the reference photo.

Lighting: soft cinematic studio key light from the front, a subtle warm rim
light on his left side and a subtle cool rim light on his right side.

Background: completely flat, plain light grey (#BDBDBD). No gradient, no floor,
no shadow, no props, no text, no logo, no watermark.

Ultra detailed, sharp focus.
```

Iterate until the face is unmistakably you. Everything else depends on it.

## 2 · Editor variant (edit the base image)

Attach the base image you picked, then:

```
Edit this image. Keep the character, face, hair, body, pose, framing, camera
angle, image size and the flat light-grey background exactly the same.

Change only:
- over-ear studio headphones resting around his neck
- he holds a compact cinema camera (like a Blackmagic Pocket Cinema Camera) in
  his right hand at chest height, lens angled toward the viewer
- warmer lighting: a strong tungsten-orange key light (#FF6A3D) from his left
  side; keep his right side in shadow

No text, no logo.
```

## 3 · Engineer variant (edit the base image)

Attach the same base image, then:

```
Edit this image. Keep the character, face, hair, body, pose, framing, camera
angle, image size and the flat light-grey background exactly the same.

Change only:
- he wears slim rectangular glasses
- he holds an open silver laptop at waist height, screen facing him; its glow
  lights his face softly from below
- cooler lighting: a teal key light (#3FD8C9) from his right side; keep his
  left side in shadow

No text, no logo.
```

### If you use ChatGPT instead

Same three prompts. ChatGPT can also return a **transparent PNG** directly: add
"transparent background, PNG" in place of the grey-background line. Keep the
base and the two edits in **one conversation** so it holds the character.

---

## 4 · Optional, phase 2 — idle loops (Veo 3.1)

A character-select screen feels alive when the characters idle. Use Veo's
**first & last frame** mode with the **same image in both slots** (one run per
image), so the clip loops seamlessly:

```
The character stands still and breathes gently, blinks once naturally, and makes
a tiny head tilt toward the camera, then returns exactly to the starting pose.
Locked-off camera: no camera movement, no zoom. The flat grey background stays
unchanged. He does not speak.
```

8 seconds, highest resolution available, 3:4 if offered (otherwise 9:16).
I'll matte them and wire them in as looping alpha video.

## 5 · Optional — two extra poses

Same edit method from the base image, for the end of the page:

- **Contact (“Ready, player?”):** pointing straight at the viewer, friendly grin.
- **Credits (“Thanks for playing”):** a relaxed wave.

---

## Where they live, and how to redo them

The originals stay where you saved them (`Downloads/base.jpg`, `editor.jpg`,
`enginer.jpg`, `video.mp4`) and are only ever read. To regenerate the web
versions after replacing one:

1. `python _source/avatar_cutouts.py <scratch>` — the three cut-outs (needs the
   rembg + pymatting environment; BiRefNet runs on the CPU, ~2 min per image).
2. `python _source/avatar_idle.py <scratch> <scratch>` — the stacked-alpha idle
   loop. If Veo returns a different crop, re-measure the clip→still transform
   first (it is saved as `video_to_still.npy`).
3. Copy the outputs into `public/media/hero/` — the file names
   `src/app/page.tsx` expects are listed in the README.

A new Veo clip should start and end on the same pose (first & last frame mode,
same image in both slots), or the last frames are eased into the first.
