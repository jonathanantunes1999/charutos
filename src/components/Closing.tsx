import { site } from "../config/site.config";
import { Picture } from "./Picture";
import { TextLink } from "./TextLink";

export function Closing() {
  const { closing: c, footer } = site;
  return (
    <>
      <section className="end" aria-label="Fecho">
        <div className="end__bg">
          <Picture img={c.image} smallBelow={900} />
        </div>
        <div className="end__shade" aria-hidden="true" />
        <div className="end__giant" aria-hidden="true" data-reveal>
          <small>{site.brand.first}</small>
          <span>{site.brand.second}</span>
        </div>
        <p className="end__line" data-reveal>
          {c.line}
        </p>
        <TextLink href={c.toTop.href} label={c.toTop.label} up className="end__top" />
      </section>
      <footer className="footer">
        <p className="footer__concept">{footer.concept}</p>
        <p className="footer__legal">
          {site.brand.full} · {footer.legal}
        </p>
      </footer>
    </>
  );
}
