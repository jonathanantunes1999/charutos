import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "../config/site.config";
import { Picture } from "./Picture";
import { TextLink } from "./TextLink";

const PIN_QUERY = "(prefers-reduced-motion: no-preference) and (min-height: 561px)";

/**
 * A secção fica fixa no ecrã e o scroll percorre os três perfis (desce: 1→2→3; sobe: 3→2→1).
 * O scroll é a única fonte de verdade: abas, teclado e deslize movem o scroll para o sítio do perfil.
 */
export function Collection({ active, onChange: setActive }: { active: number; onChange: (i: number) => void }) {
  const { collection: c } = site;
  const N = c.products.length;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const lock = useRef<{ on: boolean; t: number }>({ on: false, t: 0 });
  const p = c.products[active];

  const [pinned, setPinned] = useState(() => window.matchMedia(PIN_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const on = () => setPinned(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // scroll → perfil
  useLayoutEffect(() => {
    if (!pinned || !wrap.current) return;
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const el = wrap.current!;
        el.style.setProperty("--p", self.progress.toFixed(4));
        const idx = Math.min(N - 1, Math.floor(self.progress * N));
        el.style.setProperty("--seg", (self.progress * N - idx).toFixed(3));
        if (lock.current.on) {
          // a seguir a um clique/gesto: espera que o scroll pare, sem passar pelos perfis intermédios
          window.clearTimeout(lock.current.t);
          lock.current.t = window.setTimeout(() => (lock.current.on = false), 160);
          return;
        }
        const i = Math.min(N - 1, Math.floor(self.progress * N));
        if (i !== activeRef.current) setActive(i);
      },
    });
    return () => st.kill();
  }, [pinned, N, setActive]);

  // perfil → scroll
  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(N - 1, i));
    setActive(next);
    const w = wrap.current;
    if (!pinned || !w) return;
    const top = w.getBoundingClientRect().top + window.scrollY;
    const dist = w.offsetHeight - window.innerHeight;
    lock.current.on = true;
    window.clearTimeout(lock.current.t);
    lock.current.t = window.setTimeout(() => (lock.current.on = false), 900);
    window.scrollTo({ top: top + dist * ((next + 0.5) / N), behavior: "smooth" });
  };

  // deslizar o dedo sobre o charuto muda de perfil (só toque; o scroll vertical continua livre)
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const go = (d: number) => goTo(activeRef.current + d);
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    const s0 = swipe.current;
    swipe.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x;
    const dy = e.clientY - s0.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    let next = active;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(N - 1, active + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, active - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = N - 1;
    else return;
    e.preventDefault();
    goTo(next);
    tabs.current[next]?.focus();
  };

  const n = p.word.length;

  return (
    <div id={c.id} ref={wrap} className={`coll-pin${pinned ? " coll-pin--on" : ""}`} tabIndex={-1}>
    <section
      className="coll"
      aria-labelledby="colecao-titulo"
      style={{ ["--bg" as string]: p.theme.bg, ["--glow" as string]: p.theme.glow } as CSSProperties}
    >
      <header className="coll__head" data-reveal>
        <h2 id="colecao-titulo" className="coll__title">
          {c.title}
        </h2>
      </header>

      <div className="coll__tabs" role="tablist" aria-label="Perfis da coleção" onKeyDown={onKey}>
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
            className={`ctab${i === active ? " is-active" : ""}`}
            onClick={() => goTo(i)}
          >
            <span className="ctab__name">{pr.name}</span>
            <span className="ctab__profile">{pr.profile}</span>
          </button>
        ))}
      </div>
      <div className="coll__body">
        <div className="coll__stage" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (swipe.current = null)}>
          <div className="coll__halo" aria-hidden="true" />
          <div className="coll__word" aria-hidden="true" key={`w-${p.id}`} style={{ ["--ws" as string]: Math.min(23, 118 / n), ["--wm" as string]: Math.min(29, 138 / n) } as CSSProperties}>
            {p.word.split("").map((ch, i) => (
              <span key={i} style={{ ["--i" as string]: i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </div>
          <div className="coll__cigar-wrap">
            <div className="coll__cigar">
              <div className="coll__cigar-in">
                {c.products.map((pr, i) => (
                  <div key={pr.id} className={`coll__layer${i === active ? " is-on" : ""}`}>
                    <Picture img={pr.cutout} smallBelow={900} eager={i === 0} decorative={i !== active} />
                  </div>
                ))}
              </div>
              <div className="coll__shadow" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="coll__panel" role="tabpanel" id="painel-produto" aria-labelledby={`tab-${p.id}`} tabIndex={0} key={`p-${p.id}`}>
          <h3 className="coll__name">{p.name}</h3>
          <p className="coll__line">{p.line}</p>

          <div className="meter" role="img" aria-label={`${c.intensityLabel}: ${p.profile}, ${p.intensity} de 3`}>
            <span>{c.intensityLabel}</span>
            <span className="meter__bars" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <i key={n} className={n <= p.intensity ? "on" : ""} />
              ))}
            </span>
            <span>{p.profile}</span>
          </div>

          <ul className="notes" aria-label="Notas">
            {p.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>

          <dl className="details">
            {p.details.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
          <TextLink href={`#/encomendas?perfil=${p.id}`} label={site.orders.moreInfo} className="coll__more" arrow="right" />
        </div>
      </div>

      <p className="coll__disclaimer">{c.disclaimer}</p>
    </section>
    </div>
  );
}
