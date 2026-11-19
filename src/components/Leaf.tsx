import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../config/site.config";
import { Picture } from "./Picture";

gsap.registerPlugin(ScrollTrigger);

/**
 * "Iris": um círculo abre-se a partir do centro e revela o macro da folha.
 * Palco `sticky` — o scroll continua nativo.
 */
export function Leaf() {
  const root = useRef<HTMLElement>(null);
  const iris = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const { leaf } = site;

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", small: "(max-width: 760px)" }, (ctx) => {
      const { motion, small } = ctx.conditions as { motion: boolean; small: boolean };
      if (!motion) return;
      const q = gsap.utils.selector(root);
      const st = { p: 0 };
      const paint = () => {
        const w = root.current!.clientWidth;
        const h = window.innerHeight;
        const maxR = Math.hypot(w, h) / 2 + 4;
        const r = maxR * st.p;
        iris.current!.style.clipPath = `circle(${r.toFixed(1)}px at 50% 50%)`;
        ring.current!.style.width = ring.current!.style.height = `${(r * 2).toFixed(1)}px`;
        ring.current!.style.opacity = String(Math.max(0, 1 - st.p * 1.25));
      };
      paint();
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true, onRefresh: paint },
      });
      tl.to(st, { p: 1, duration: 0.7, ease: "power2.in", onUpdate: paint }, 0)
        .to(q(".leaf__lead"), { scale: 1.35, duration: 0.7, ease: "power2.in" }, 0)
        .fromTo(q(".leaf__img"), { scale: 1.4 }, { scale: 1, duration: 1 }, 0.1);
      const notes = q(".leaf__note");
      notes.forEach((n, i) => {
        const at = 0.5 + i * 0.16;
        tl.fromTo(n, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: "power2.out" }, at);
        if (small && i < notes.length - 1) tl.to(n, { autoAlpha: 0, y: -24, duration: 0.07 }, at + 0.15);
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="leaf" ref={root} aria-labelledby="leaf-t">
      <div className="leaf__stick">
        <div className="leaf__intro">
          <p className="kicker">{leaf.kicker}</p>
          <h2 id="leaf-t" className="leaf__lead">
            <span>{leaf.lead[0]}</span>
            <em>{leaf.lead[1]}</em>
          </h2>
        </div>

        <div className="leaf__iris" ref={iris}>
          <Picture img={leaf.image} className="leaf__img" smallBelow={900} />
          <div className="leaf__shade" aria-hidden="true" />
          <ul className="leaf__notes">
            {leaf.notes.map((n, i) => (
              <li className={`leaf__note leaf__note--${i + 1}`} key={n.n}>
                <span className="leaf__n">{n.n}</span>
                <strong>{n.t}</strong>
                <span className="leaf__d">{n.d}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="leaf__ring" ref={ring} aria-hidden="true" />
      </div>
    </section>
  );
}
