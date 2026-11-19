import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../config/site.config";
import { Picture } from "./Picture";

gsap.registerPlugin(ScrollTrigger);

export function Craft() {
  const { craft: c } = site;
  const root = useRef<HTMLElement>(null);

  // Parallax subtil dentro das molduras (só com movimento permitido).
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.current?.querySelectorAll<HTMLElement>(".fig__inner").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -7 },
          { yPercent: 7, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id={c.id} className="craft section" ref={root} aria-labelledby="oficio-titulo" tabIndex={-1}>
      <div className="wrap">
        <header className="sec-head" data-reveal>
          <p className="kicker">{c.kicker}</p>
          <h2 id="oficio-titulo" className="sec-title">
            {c.title.map((l, i) => (
              <span key={l} className={i > 0 ? "sec-title__soft" : undefined}>
                {l}
              </span>
            ))}
          </h2>
          <p className="sec-intro">{c.intro}</p>
        </header>

        <ol className="steps">
          {c.steps.map((s, i) => (
            <li className={`step step--${i + 1}`} key={s.title}>
              <figure className="fig" data-reveal>
                <div className="fig__inner">
                  <Picture img={s.image} sizes="(max-width: 900px) 100vw, 50vw" smallBelow={900} />
                </div>
              </figure>
              <div className="step__text" data-reveal>
                <span className="step__num" aria-hidden="true">
                  {s.number}
                </span>
                <h3 className="step__title">{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="craft__note">{c.note}</p>
      </div>
    </section>
  );
}
