import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import gsap from "gsap";
import { site } from "../config/site.config";
import { Picture } from "./Picture";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Collection() {
  const { collection: c } = site;
  const [active, setActive] = useState(0);
  const prev = useRef(0);
  const imgs = useRef<(HTMLDivElement | null)[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const first = useRef(true);

  // Transição entre fotografias: máscara a subir + aproximação suave.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = imgs.current[active];
    if (!el || reduced()) {
      prev.current = active;
      return;
    }
    const tween = gsap.fromTo(
      el,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.95,
        ease: "expo.out",
        onComplete: () => {
          prev.current = active;
        },
      },
    );
    const inner = el.querySelector("img");
    const t2 = inner ? gsap.fromTo(inner, { scale: 1.14 }, { scale: 1, duration: 1.4, ease: "expo.out" }) : null;
    return () => {
      tween.kill();
      t2?.kill();
      gsap.set(el, { clearProps: "clipPath" });
      if (inner) gsap.set(inner, { clearProps: "transform" });
    };
  }, [active]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = c.products.length;
    let next = active;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (active + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (active - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  const p = c.products[active];

  return (
    <section id={c.id} className="collection section" aria-labelledby="colecao-titulo" tabIndex={-1}>
      <div className="wrap">
        <header className="sec-head" data-reveal>
          <p className="kicker">{c.kicker}</p>
          <h2 id="colecao-titulo" className="sec-title">
            {c.title.map((l, i) => (
              <span key={l} className={i === 1 ? "sec-title__soft" : undefined}>
                {l}
              </span>
            ))}
          </h2>
          <p className="sec-intro">{c.intro}</p>
        </header>

        <div className="collection__grid">
          <div className="stage" data-reveal>
            <div className="stage__frame">
              {c.products.map((pr, i) => (
                <div
                  key={pr.id}
                  ref={(el) => void (imgs.current[i] = el)}
                  className={`stage__img${i === active ? " is-on" : i === prev.current ? " is-under" : ""}`}
                  aria-hidden={i !== active}
                >
                  <Picture img={pr.image} sizes="(max-width: 900px) 100vw, 58vw" smallBelow={900} />
                </div>
              ))}
              <span className="stage__num" aria-hidden="true">
                {p.number}
              </span>
            </div>
            <p className="stage__caption">{c.disclaimer}</p>
          </div>

          <div className="picker" data-reveal>
            <div className="picker__tabs" role="tablist" aria-label="Perfis da coleção" onKeyDown={onKey}>
              {c.products.map((pr, i) => (
                <button
                  key={pr.id}
                  ref={(el) => void (tabs.current[i] = el)}
                  role="tab"
                  type="button"
                  id={`tab-${pr.id}`}
                  aria-selected={i === active}
                  aria-controls="painel-produto"
                  tabIndex={i === active ? 0 : -1}
                  className={`tab${i === active ? " is-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <span className="tab__num">{pr.number}</span>
                  <span className="tab__name">{pr.name}</span>
                  <span className="tab__profile">{pr.profile}</span>
                </button>
              ))}
            </div>

            <div className="panel" role="tabpanel" id="painel-produto" aria-labelledby={`tab-${p.id}`} tabIndex={0} key={p.id}>
              <p className="panel__line">{p.line}</p>

              <div className="meter" role="img" aria-label={`${c.intensityLabel}: ${p.profile}, ${p.intensity} de 3`}>
                <span className="meter__label">{c.intensityLabel}</span>
                <span className="meter__bars" aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <i key={n} className={n <= p.intensity ? "on" : ""} />
                  ))}
                </span>
                <span className="meter__value">{p.profile}</span>
              </div>

              <h3 className="panel__h">Notas</h3>
              <ul className="notes">
                {p.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>

              <h3 className="panel__h">Detalhes</h3>
              <dl className="details">
                {p.details.map((d) => (
                  <div key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
