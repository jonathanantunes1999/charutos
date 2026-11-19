import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../config/site.config";
import { Picture } from "./Picture";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero + transição principal.
 * O wrapper é alto; o palco é `position: sticky`, por isso o scroll nativo
 * nunca é bloqueado. O progresso do scroll comanda a aproximação à folha e
 * a revelação da segunda imagem (mais iluminada) do mesmo charuto.
 */
export function Opening() {
  const wrap = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const lit = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", small: "(max-width: 760px)" },
      (ctx) => {
        const { small } = ctx.conditions as { motion: boolean; small: boolean };
        // Mobile: transição mais curta (ver altura do wrapper em CSS), aproximação mais contida.
        const scale = small ? 2.15 : 2.25;
        const origin = small ? { x: 0.46, y: 0.6 } : { x: 0.5, y: 0.58 };
        gsap.set(media.current, { transformOrigin: `${origin.x * 100}% ${origin.y * 100}%` });

        const [c1, c2, c3] = caps.current;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        tl.to(content.current, { autoAlpha: 0, y: -48, duration: 0.14, ease: "power1.in" }, 0)
          .to(cue.current, { autoAlpha: 0, duration: 0.06 }, 0)
          .to(
            media.current,
            { scale, yPercent: (0.5 - origin.y) * 100, xPercent: (0.5 - origin.x) * 100, duration: 1, ease: "power2.inOut" },
            0,
          )
          .to(shade.current, { opacity: 1, duration: 0.25 }, 0.05)
          .to(lit.current, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, 0.28)
          .fromTo(beam.current, { xPercent: -60, opacity: 0 }, { xPercent: 60, duration: 0.6, ease: "power1.inOut" }, 0.22)
          .to(beam.current, { opacity: 0.9, duration: 0.2, yoyo: true, repeat: 1 }, 0.22);

        const beat = (el: HTMLElement | null, inAt: number, outAt?: number) => {
          if (!el) return;
          tl.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.07, ease: "power2.out" }, inAt);
          if (outAt) tl.to(el, { autoAlpha: 0, y: -20, duration: 0.06, ease: "power1.in" }, outAt);
        };
        beat(c1, 0.12, 0.3);
        beat(c2, 0.36, 0.62);
        beat(c3, 0.72);
      },
    );
    return () => mm.revert();
  }, []);

  const { hero, reveal } = site;

  return (
    <section id="topo" className="opening" ref={wrap} aria-label="Abertura" tabIndex={-1}>
      <div className="opening__sticky">
        <div className="opening__media" ref={media}>
          <Picture img={hero.images.dark} className="opening__img" eager />
          <div className="opening__lit" ref={lit}>
            <Picture img={hero.images.lit} className="opening__img" eager />
          </div>
          <div className="opening__beam" ref={beam} aria-hidden="true" />
        </div>
        <div className="opening__vignette" aria-hidden="true" />
        <div className="opening__shade" ref={shade} aria-hidden="true" />

        <div className="opening__content" ref={content}>
          <h1 className="hero-title">
            {hero.titleLines.map((line, i) => (
              <span className="hero-title__line" key={line}>
                <span className="hero-title__in" style={{ ["--i" as string]: i }}>
                  {i === hero.titleLines.length - 1 ? <em>{line}</em> : line}
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-lede">{hero.lede}</p>
          <a className="cta" href={hero.cta.href}>
            <span className="cta__label">{hero.cta.label}</span>
            <span className="cta__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M12 4v15M6 13l6 6 6-6" />
              </svg>
            </span>
          </a>
        </div>

        <div className="opening__cue" ref={cue} aria-hidden="true">
          <span>{hero.scrollCue}</span>
          <i />
        </div>

        <div className="beats" aria-live="off">
          {reveal.beats.map((b, i) => (
            <div className="beat" key={b.kicker} ref={(el) => void (caps.current[i] = el)}>
              <p className="beat__kicker">{b.kicker}</p>
              <p className="beat__text">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alternativa estática para prefers-reduced-motion (a transição fica desligada). */}
      <div className="opening__static">
        <div className="opening__static-frame">
          <Picture img={hero.images.lit} className="opening__img" />
        </div>
        <ul>
          {reveal.beats.map((b) => (
            <li key={b.kicker}>
              <span className="beat__kicker">{b.kicker}</span>
              <span className="beat__text">{b.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
