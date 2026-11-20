import { useEffect, useRef } from "react";
import { site } from "../config/site.config";
import { Picture } from "./Picture";
import { TextLink } from "./TextLink";

export function Closing() {
  const { closing: c, footer } = site;
  const foot = useRef<HTMLElement>(null);

  // o fecho + rodapé ocupam exatamente um ecrã: mede a altura real do rodapé
  useEffect(() => {
    const el = foot.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--footer-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <>
      <section className="end" aria-label="Fecho">
        <div className="end__bg">
          <Picture img={c.image} smallBelow={900} />
        </div>
        <div className="end__shade" aria-hidden="true" />
        <div className="end__giant" aria-hidden="true" data-reveal>
          <small>{site.brand.name}</small>
          <span>{site.brand.mono}</span>
        </div>
        <p className="end__line" data-reveal>
          {c.line}
        </p>
        <TextLink href={c.toTop.href} label={c.toTop.label} up className="end__top" />
      </section>
      <footer className="footer" ref={foot}>
        <p className="footer__concept">
          {footer.concept}
          <span className="footer__sep" aria-hidden="true">
            ·
          </span>
          <span className="footer__made">
            {footer.madeBy.label}{" "}
            <a href={footer.madeBy.href} target="_blank" rel="noopener noreferrer" aria-label={`${footer.madeBy.name} (abre num novo separador)`}>
              {footer.madeBy.name}
            </a>
          </span>
        </p>
        <p className="footer__legal">
          {site.brand.full} · {footer.legal}
        </p>
      </footer>
    </>
  );
}
