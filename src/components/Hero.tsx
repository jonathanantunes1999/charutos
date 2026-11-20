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

        // flutuação
        gsap.to(q(".hero__float"), { y: small ? -8 : -14, rotate: 0.7, duration: 4.8, ease: "sine.inOut", yoyo: true, repeat: -1 });

        // parallax do rato
        let off = () => {};
        if (fine) {
          const cx = gsap.quickTo(q(".hero__par")[0], "x", { duration: 1.2, ease: "power3" });
          const cy = gsap.quickTo(q(".hero__par")[0], "y", { duration: 1.2, ease: "power3" });
          const gx = gsap.quickTo(q(".hero__giant")[0], "x", { duration: 1.6, ease: "power3" });
          const move = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            cx(nx * 34);
            cy(ny * 20);
            gx(nx * -54);
          };
          window.addEventListener("pointermove", move, { passive: true });
          off = () => window.removeEventListener("pointermove", move);
        }

        // scroll: o charuto viaja até à posição do charuto da coleção
        const heroEl = root.current!;
        heroEl.classList.add("is-traveling");
        const box = q(".hero__cigar")[0] as HTMLElement;
        const float = q(".hero__float")[0] as HTMLElement;
        const landAngle = small ? -20 : -12;
        const collWrap = document.querySelector<HTMLElement>(".coll__cigar-wrap");
        if (collWrap) gsap.set(collWrap, { opacity: 0 });
        // pose de aterragem (centro, escala) medida na coleção
        const land = () => {
          const t = document.querySelector<HTMLElement>(".coll__cigar");
          const c = document.getElementById("colecao");
          if (!t || !c) return { x: 0, y: 0, s: 1 };
          const tr = t.getBoundingClientRect();
          const cr = c.getBoundingClientRect();
          const br = box.getBoundingClientRect();
          return {
            x: tr.left + tr.width / 2 - (br.left + br.width / 2),
            y: tr.top - cr.top + tr.height / 2 - (br.top + br.height / 2),
            s: t.offsetWidth / float.offsetWidth,
          };
        };

        const st = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
        });
        st.to(q(".hero__scroll"), { x: () => land().x, y: () => land().y, scale: () => land().s, ease: "power2.inOut", duration: 1 }, 0)
          .to(q(".hero__rot"), { rotate: landAngle, ease: "power2.inOut", duration: 1 }, 0)
          .to(q(".g-l")[0], { xPercent: -45, duration: 1 }, 0)
          .to(q(".g-l")[2], { xPercent: 45, duration: 1 }, 0)
          .to(q(".g-l")[1], { yPercent: -35, opacity: 0.2, duration: 1 }, 0)
          .to(q(".hero__copy"), { y: -70, autoAlpha: 0, duration: 0.55 }, 0);
        // passagem: o charuto do hero dá lugar ao da coleção, no mesmo sítio
        if (collWrap) {
          st.to(box, { autoAlpha: 0, duration: 0.1, ease: "none" }, 0.9).to(collWrap, { opacity: 1, duration: 0.1, ease: "none" }, 0.9);
        }

        return () => {
          off();
          heroEl.classList.remove("is-traveling");
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
