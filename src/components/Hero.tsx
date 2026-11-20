import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../config/site.config";
import { Picture } from "./Picture";
import { Atmosphere } from "./Atmosphere";
import { TextLink } from "./TextLink";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero: palavra gigante atrás, charuto recortado a cruzar o ecrã.
 * Camadas do charuto (para animações sem conflito):
 *   scroll → rato (parallax) → entrada (rotação/escala) → flutuação
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { hero } = site;

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", small: "(max-width: 760px)", fine: "(pointer: fine)" },
      (ctx) => {
        const { motion, small, fine } = ctx.conditions as { motion: boolean; small: boolean; fine: boolean };
        if (!motion) return;
        const q = gsap.utils.selector(root);
        const base = small ? -64 : -11;
        gsap.set(q(".hero__rot"), { rotate: base });

        // entrada
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(q(".hero__glow"), { opacity: 0, duration: 2.4, ease: "power2.out" }, 0)
          .from(q(".g-l > span"), { yPercent: 118, duration: 1.7, stagger: 0.12 }, 0.05)
          .from(q(".hero__rot"), { xPercent: small ? 10 : 42, yPercent: small ? 30 : 0, rotate: base - (small ? 18 : 16), autoAlpha: 0, duration: 2.1, ease: "power4.out" }, 0.15)
          .from(q(".hero__line > span"), { yPercent: 112, duration: 1.4, stagger: 0.1 }, 0.6)
          .from(q(".hero__cta"), { opacity: 0, y: 14, duration: 1.2 }, 1.2);

        // ── viagem do charuto até ao da coleção ───────────────────────────
        // A pose é calculada a cada fotograma: mistura entre a pose do hero e a pose REAL do
        // charuto da coleção. Ao chegar (e=1) as duas coincidem ao pixel → troca sem se ver.
        const heroEl = root.current!;
        heroEl.classList.add("is-traveling");
        const box = q(".hero__cigar")[0] as HTMLElement;
        const floatEl = q(".hero__float")[0] as HTMLElement;
        const scrollEl = q(".hero__scroll")[0] as HTMLElement;
        const toImg = q(".hero__img--to")[0] as HTMLElement | undefined;
        const parEl = q(".hero__par")[0] as HTMLElement;
        const giantEl = q(".hero__giant")[0] as HTMLElement;
        const collWrap = document.querySelector<HTMLElement>(".coll__cigar-wrap");
        const landAngle = small ? -20 : -12;
        if (collWrap) collWrap.style.opacity = "0";

        const cx = fine ? gsap.quickTo(parEl, "x", { duration: 1.2, ease: "power3" }) : null;
        const cy = fine ? gsap.quickTo(parEl, "y", { duration: 1.2, ease: "power3" }) : null;
        const gx = fine ? gsap.quickTo(giantEl, "x", { duration: 1.6, ease: "power3" }) : null;
        let nx = 0;
        let ny = 0;
        const move = (e: PointerEvent) => {
          nx = e.clientX / window.innerWidth - 0.5;
          ny = e.clientY / window.innerHeight - 0.5;
        };
        if (fine) window.addEventListener("pointermove", move, { passive: true });

        const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
        const smooth = (a: number, b: number, x: number) => {
          const t = clamp((x - a) / (b - a));
          return t * t * (3 - 2 * t);
        };
        const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

        // pose de aterragem medida com a coleção no topo do ecrã (independente do scroll)
        const landing = () => {
          const t = document.querySelector<HTMLElement>(".coll__cigar");
          const c = document.getElementById("colecao");
          if (!t || !c) return null;
          const tr = t.getBoundingClientRect();
          const cr = c.getBoundingClientRect();
          const br = box.getBoundingClientRect();
          return {
            x: tr.left + tr.width / 2 - (br.left + br.width / 2),
            y: tr.top - cr.top + tr.height / 2 - (br.top + br.height / 2),
            s: t.offsetWidth / floatEl.offsetWidth,
            top: c.offsetTop,
          };
        };

        let s = -1; // progresso suavizado
        let wasZero = false;
        const tick = (time: number, delta: number) => {
          const L = landing();
          if (!L) return;
          const dt = Math.min(delta, 50) / 1000;
          const target = clamp(window.scrollY / Math.max(L.top, 1));
          s = s < 0 ? target : s + (target - s) * (1 - Math.exp(-dt * 7));
          if (Math.abs(target - s) < 0.0006) s = target;
          const e = ease(s);
          const k = 1 - smooth(0, 0.45, e); // flutuar e rato desvanecem-se durante a viagem

          const wave = 0.5 - 0.5 * Math.cos((time * Math.PI * 2) / 9.6);
          gsap.set(floatEl, { y: (small ? -8 : -14) * wave * k, rotation: 0.7 * wave * k });
          if (fine && cx && cy && gx) {
            cx(nx * 34 * k);
            cy(ny * 20 * k);
            gx(nx * -54);
          }

          if (e > 0 || !wasZero) {
            const over = Math.max(0, window.scrollY - L.top); // charuto da coleção já subiu esta distância
            gsap.set(scrollEl, {
              x: L.x * e,
              y: (L.y - over) * e,
              scale: 1 + (L.s - 1) * e,
              rotation: (landAngle - base) * e,
            });
            wasZero = e === 0;
          }
          if (toImg) toImg.style.opacity = String(smooth(0.35, 0.92, e));
          // só troca quando a coleção está mesmo no topo (aí as duas poses coincidem)
          const landed = target >= 0.999 && e >= 0.995;
          box.style.visibility = landed ? "hidden" : "visible";
          if (collWrap) collWrap.style.opacity = landed ? "1" : "0";
        };
        gsap.ticker.add(tick);

        // letras gigantes e texto acompanham o scroll
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", scrub: 0.6 },
          })
          .to(q(".g-l")[0], { xPercent: -45, duration: 1 }, 0)
          .to(q(".g-l")[2], { xPercent: 45, duration: 1 }, 0)
          .to(q(".g-l")[1], { yPercent: -35, opacity: 0.2, duration: 1 }, 0)
          .to(q(".hero__copy"), { y: -70, opacity: 0, duration: 0.55 }, 0);

        return () => {
          gsap.ticker.remove(tick);
          window.removeEventListener("pointermove", move);
          heroEl.classList.remove("is-traveling");
          box.style.visibility = "";
          if (collWrap) collWrap.style.opacity = "";
        };
      },
    );
    return () => mm.revert();
  }, []);

  const letters = site.brand.second.split("");

  return (
    <section id="topo" className="hero" ref={root} aria-label="Abertura" tabIndex={-1}>
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__giant" aria-hidden="true">
        {letters.map((l, i) => (
          <span className="g-l" key={i}>
            <span>{l}</span>
          </span>
        ))}
      </div>

      <div className="hero__cigar">
        <div className="hero__scroll">
          <div className="hero__par">
            <div className="hero__rot">
              <div className="hero__float">
                <Picture img={hero.cutout} className="hero__img" eager />
                <Picture img={site.collection.products[0].cutout} className="hero__img hero__img--to" decorative />
              </div>
              <div className="hero__shadow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="hero__dust">
        <Atmosphere />
      </div>
      <div className="hero__fade" aria-hidden="true" />

      <div className="hero__copy">
        <h1 className="hero__title">
          {hero.titleLines.map((line, i) => (
            <span className="hero__line" key={line}>
              <span>{i === hero.titleLines.length - 1 ? <em>{line}</em> : line}</span>
            </span>
          ))}
        </h1>
        <TextLink href={hero.cta.href} label={hero.cta.label} className="hero__cta" />
      </div>


    </section>
  );
}
