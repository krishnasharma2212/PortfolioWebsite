"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { pickSmooth, sources } from "@/lib/media";
import { reducedMotion } from "@/lib/motion";
import { av1Broken } from "@/lib/video";

/**
 * A transparent video, the portable way: one ordinary H.264 file with the
 * colour in its top half and the matte in its bottom half ("stacked alpha"),
 * recombined by a two-line WebGL shader. Works in every browser that has
 * WebGL — Safari included, where VP9 alpha does not.
 *
 * The poster underneath stays visible until the first frame is drawn, so the
 * swap is invisible; if WebGL or the video fails, the poster simply remains.
 */

const VS = `attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;
const FS = `precision mediump float;uniform sampler2D t;varying vec2 uv;
void main(){vec3 c=texture2D(t,vec2(uv.x,uv.y*.5)).rgb;
float a=clamp(dot(texture2D(t,vec2(uv.x,.5+uv.y*.5)).rgb,vec3(.2126,.7152,.0722)),0.,1.);
gl_FragColor=vec4(c*a,a);}`;

type Props = {
  /** path without extension; the AV1 or H.264 encode is chosen per browser */
  base: string;
  /** size of one half (the visible frame), in pixels */
  width: number;
  height: number;
  /** load at all (e.g. once the hero's entrance has started) */
  load: boolean;
  /** play now — false pauses on the current frame */
  playing: boolean;
  /** mirrors the hero's data-on flag, for the pick flash */
  picked?: boolean;
  /** first frame drawn — the poster underneath must hide now, or a moving head ghosts over it */
  onReady?: () => void;
  className?: string;
  style?: CSSProperties;
};

export default function AlphaVideo({ base, width, height, load, playing, picked, onReady, className = "", style }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const readyEvent = useEffectEvent(() => onReady?.());

  // Decide once whether this visitor should download the loop at all.
  useEffect(() => {
    if (!load || reducedMotion()) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || (conn?.effectiveType && /(^|-)2g|3g/.test(conn.effectiveType))) return;
    const id = (window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 400)))(() => setAllowed(true));
    return () => (window.cancelIdleCallback ?? clearTimeout)(id as number);
  }, [load]);

  useEffect(() => {
    if (!allowed) return;
    const c = canvas.current;
    const v = video.current;
    if (!c || !v) return;
    const gl = c.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    const shader = (type: number, code: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, code);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.viewport(0, 0, width, height);

    let alive = true;
    let handle = 0;
    let drawn = false;
    const draw = () => {
      if (!alive || v.readyState < 2) return;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!drawn) {
        drawn = true;
        setReady(true);
        readyEvent();
      }
    };
    const loop = () => {
      draw();
      if (!alive) return;
      handle = v.requestVideoFrameCallback ? v.requestVideoFrameCallback(loop) : requestAnimationFrame(loop);
    };
    const start = () => loop();
    v.addEventListener("loadeddata", start, { once: true });
    const choose = (skipAv1: boolean) =>
      pickSmooth(v, sources(base), 24, skipAv1).then((s) => {
        if (!alive) return;
        v.src = s.src;
        v.load();
      });
    void choose(av1Broken());
    // the AV1 encode failed to decode (lib/video.ts): same loop, H.264
    const onAv1Failed = () => {
      // stop the old frame loop; start() begins a new one on the new file's first frame
      if (v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(handle);
      cancelAnimationFrame(handle);
      v.addEventListener("loadeddata", start, { once: true });
      void choose(true).then(() => void v.play().catch(() => {}));
    };
    v.addEventListener("ks:av1-failed", onAv1Failed);
    return () => {
      alive = false;
      v.removeEventListener("loadeddata", start);
      v.removeEventListener("ks:av1-failed", onAv1Failed);
      if (v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(handle);
      cancelAnimationFrame(handle);
      v.removeAttribute("src");
      v.load();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [allowed, base, width, height]);

  // play / pause with the hero's state and visibility
  useEffect(() => {
    const v = video.current;
    const c = canvas.current;
    if (!v || !c || !allowed) return;
    let onScreen = true;
    const sync = () => {
      if (playing && onScreen) void v.play().catch(() => {});
      else v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(c);
    sync();
    // the src is picked asynchronously (pickSmooth), so a play() above can come
    // before there is anything to play: sync again once the file can play
    v.addEventListener("canplay", sync);
    return () => {
      io.disconnect();
      v.removeEventListener("canplay", sync);
    };
  }, [playing, allowed]);

  return (
    <>
      <canvas
        ref={canvas}
        width={width}
        height={height}
        aria-hidden
        data-on={picked}
        className={className}
        style={{ ...style, opacity: ready ? (style?.opacity ?? 1) : 0 }}
      />
      {/* the decoder; kept in the document (and on screen) so browsers never throttle it */}
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none absolute left-1/2 top-1/2 h-px w-px opacity-0"
      />
    </>
  );
}
