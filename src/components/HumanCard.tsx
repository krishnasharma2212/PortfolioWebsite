/**
 * "P0 — the human": the real photo behind both playable classes. Black and
 * white at rest; on hover it takes the site's grade — teal shadows, orange
 * highlights — the look the whole palette is named after.
 */
export default function HumanCard({
  src,
  srcSet,
  avif,
  w,
  h,
  alt,
}: {
  src: string;
  srcSet: string;
  /** AVIF srcset, preferred where supported */
  avif?: string;
  w: number;
  h: number;
  alt: string;
}) {
  return (
    <figure className="group relative isolate aspect-[2/3] w-full overflow-hidden rounded-[24px] border border-white/10 bg-ink-2">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="ks-teal-orange" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.02 0.16 0.62 1" />
            <feFuncG type="table" tableValues="0.07 0.3 0.52 0.86" />
            <feFuncB type="table" tableValues="0.08 0.31 0.42 0.7" />
          </feComponentTransfer>
        </filter>
      </svg>
      {/* spotlight */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_30%,rgb(255_255_255_/_.09),transparent_70%)]" />
      {[0, 1].map((k) => (
        <picture key={k}>
          {avif && <source type="image/avif" srcSet={avif} sizes="(max-width: 768px) 80vw, 30vw" />}
          <img
            src={src}
            srcSet={srcSet}
            sizes="(max-width: 768px) 80vw, 30vw"
            alt={k ? "" : alt}
            aria-hidden={k === 1}
            width={w}
            height={h}
            loading="lazy"
            decoding="async"
            className={`absolute bottom-0 left-1/2 h-[96%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02] ${k ? "opacity-0 group-hover:opacity-100" : ""}`}
            style={{ filter: k ? "url(#ks-teal-orange) contrast(1.05)" : "grayscale(1) contrast(1.1) brightness(.96)", transformOrigin: "50% 100%" }}
          />
        </picture>
      ))}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink-2 via-ink-2/70 to-transparent" />
      {/* frame marks */}
      <div aria-hidden className="pointer-events-none absolute inset-4">
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"].map((p) => (
          <span key={p} className={`absolute h-5 w-5 border-white/35 ${p}`} />
        ))}
      </div>
      <figcaption className="absolute inset-x-6 top-6 flex items-start justify-between gap-4">
        <span className="label-sm flex items-center gap-2 text-paper">
          <span className="rounded-[4px] bg-paper px-1.5 py-0.5 text-ink">P0</span>
          The human
        </span>
        <span className="label-sm text-faint transition-colors group-hover:text-paper [@media(hover:none)]:hidden">hover to grade</span>
      </figcaption>
      <p className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
        <span className="text-[15px] font-medium leading-tight">
          Krishna Sharma
          <span className="block text-[12.5px] font-normal text-dim">Noida, India · real photo, no avatar</span>
        </span>
        <span className="mono text-[10px] tracking-[0.14em] text-faint">IMG_2655</span>
      </p>
    </figure>
  );
}
