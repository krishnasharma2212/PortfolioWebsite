import { sources } from "@/lib/media";

/** The <source> children of a <video>: AV1 first, H.264 for browsers that can't decode it. */
export default function Sources({ base }: { base: string }) {
  return sources(base).map((s) => <source key={s.src} src={s.src} type={s.type} />);
}
