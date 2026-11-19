import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../config/site.config";

gsap.registerPlugin(ScrollTrigger);

/** Manifesto: palavras que se acendem com o scroll + faixa tipográfica em movimento. */
export function Statement() {
  const root = useRef<HTMLElement>(null);
  const { text, band } = site.statement;

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = root.current!.querySelectorAll(".st-w");
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: ".statement__text", start: "top 82%", end: "bottom 48%", scrub: 0.4 },
        },
      );
      gsap.fromTo(
        ".band__track",
        { xPercent: 0 },
        { xPercent: -33.33, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
      );
    });
    return () => mm.revert();
  }, []);

  const loop = [...band, ...band, ...band];
  return (
    <section className="statement" ref={root} aria-label="Manifesto">
      <p className="statement__text">
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {text.split(" ").map((w, i) => (
            <span className="st-w" key={i}>
              {w}{" "}
            </span>
          ))}
        </span>
      </p>
      <div className="band" aria-hidden="true">
        <div className="band__track">
          {loop.map((w, i) => (
            <span key={i}>
              {w}
              <i />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
