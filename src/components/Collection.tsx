import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { site } from "../config/site.config";
import { Picture } from "./Picture";

export function Collection() {
  const { collection: c } = site;
  const [active, setActive] = useState(1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const p = c.products[active];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cnt = c.products.length;
    let next = active;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (active + 1) % cnt;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (active - 1 + cnt) % cnt;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = cnt - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  const n = p.word.length;

  return (
    <section
      id={c.id}
      className="coll"
      aria-labelledby="colecao-titulo"
      tabIndex={-1}
      style={{ ["--bg" as string]: p.theme.bg, ["--glow" as string]: p.theme.glow } as CSSProperties}
    >
      <header className="coll__head" data-reveal>
        <h2 id="colecao-titulo" className="coll__title">
          {c.title}
        </h2>
      </header>

      <div className="coll__body">
        <div className="coll__stage">
          <div className="coll__halo" aria-hidden="true" />
          <div className="coll__word" aria-hidden="true" key={`w-${p.id}`} style={{ ["--ws" as string]: Math.min(23, 118 / n), ["--wm" as string]: Math.min(29, 138 / n) } as CSSProperties}>
            {p.word.split("").map((ch, i) => (
              <span key={i} style={{ ["--i" as string]: i } as CSSProperties}>
                {ch}
              </span>
            ))}
          </div>
          <div className="coll__cigar-wrap">
            <div className="coll__cigar" key={`c-${p.id}`}>
              <div className="coll__cigar-in">
                <Picture img={p.cutout} smallBelow={900} />
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
        </div>
      </div>

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
            onClick={() => setActive(i)}
          >
            <span className="ctab__name">{pr.name}</span>
            <span className="ctab__profile">{pr.profile}</span>
          </button>
        ))}
      </div>
      <p className="coll__disclaimer">{c.disclaimer}</p>
    </section>
  );
}
