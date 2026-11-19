import { useLayoutEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../config/site.config";
import { Picture } from "./Picture";

gsap.registerPlugin(ScrollTrigger);

/** Papel marfim. Em desktop: pista horizontal fixada (scroll nativo na vertical → desloca na horizontal). */
export function Craft() {
  const { craft: c } = site;
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const dist = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
      gsap.to(track.current, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: pin.current,
          pin: true,
          scrub: 0.6,
          start: "top top",
          end: () => "+=" + dist(),
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
      // numerais em contra-movimento
      gsap.utils.toArray<HTMLElement>(".craft__num").forEach((el) => {
        gsap.fromTo(el, { xPercent: 14 }, { xPercent: -14, ease: "none", scrollTrigger: { trigger: pin.current, scrub: true, start: "top top", end: () => "+=" + dist() } });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id={c.id} className="craft" aria-labelledby="oficio-titulo" tabIndex={-1}>
      <div className="craft__pin" ref={pin}>
        <div className="craft__track" ref={track}>
          <div className="craft__intro">
            <p className="kicker">{c.kicker}</p>
            <h2 id="oficio-titulo" className="craft__title">
              {c.title}
            </h2>
            <p className="craft__lede">{c.intro}</p>
            <p className="craft__swipe" aria-hidden="true">
              <span>Scroll</span>
              <i />
            </p>
          </div>

          {c.steps.map((s, i) => (
            <article className={`craft__step craft__step--${i + 1}`} key={s.title}>
              <span className="craft__num" aria-hidden="true">
                {s.number}
              </span>
              <figure className="craft__fig" data-reveal>
                <Picture img={s.image} smallBelow={900} style={{ objectPosition: s.focus } as CSSProperties} />
              </figure>
              <div className="craft__text" data-reveal>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </article>
          ))}

          <p className="craft__note">{c.note}</p>
        </div>
        <i className="craft__bar" ref={bar} aria-hidden="true" />
      </div>
    </section>
  );
}
