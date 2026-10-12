/**
 * Videos render with preload="none", so a page load downloads no video at all.
 * This starts buffering one when it comes within `margin` of the viewport, so
 * by the time it is on screen and asked to play, the first frames are there.
 * Save-Data visitors skip the head start and load on play only.
 */
export function warmWhenNear(video: HTMLVideoElement, margin = "80% 0px") {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return () => {};
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (av1Broken() && dropAv1(video)) video.load();
      if (video.preload === "none") video.preload = "auto";
    },
    { rootMargin: margin },
  );
  io.observe(video);
  return () => io.disconnect();
}

// ─────────────────────────────────────────────────── AV1 that doesn't decode
// A browser can claim AV1 ("probably") and still fail to decode it — WebKit
// builds without a working AV1 decoder do. A decode error mid-stream never
// falls back to the next <source>, so: the first one switches that video to
// H.264 at the same moment, and the rest of the visit skips AV1.

const KEY = "ks-av1-broken";

export const av1Broken = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Take a video's AV1 <source> children out of the running; true if it had any.
 * Their type becomes one no browser plays, so the next load() skips them. The
 * elements stay: removing them could happen before React hydrates the video,
 * and a missing child is a hydration error, a changed attribute isn't.
 */
const OFF = "video/x-unplayable";
function dropAv1(video: HTMLVideoElement) {
  const av1 = video.querySelectorAll<HTMLSourceElement>(`source[src*=".av1.mp4"]:not([type="${OFF}"])`);
  av1.forEach((s) => (s.type = OFF));
  return av1.length > 0;
}

/**
 * Inlined in <head> by the layout, so it is listening before any video can
 * load — whatever order React's effects run in. A video whose AV1 encode fails
 * to decode switches off its AV1 <source> and reloads on H.264 at the same moment; a
 * script-set src (the hero loop) gets a "ks:av1-failed" event and re-picks.
 */
export const AV1_FALLBACK_SCRIPT = `document.addEventListener("error",function(e){var v=e.target;if(!(v instanceof HTMLVideoElement)||v.currentSrc.indexOf(".av1.mp4")<0)return;var c=v.error&&v.error.code;if(c!==3&&c!==4)return;try{sessionStorage.setItem("${KEY}","1")}catch(x){}var s=v.querySelectorAll('source[src*=".av1.mp4"]:not([type="${OFF}"])');if(!s.length){v.dispatchEvent(new Event("ks:av1-failed"));return}var t=v.currentTime,p=!v.paused;s.forEach(function(n){n.type="${OFF}"});v.load();if(t)v.currentTime=t;if(p)v.play().catch(function(){})},true)`;
