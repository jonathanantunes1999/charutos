import { site } from "../config/site.config";
import { Picture } from "./Picture";
import { Wordmark } from "./Wordmark";

export function Closing() {
  const { closing: c, footer } = site;
  return (
    <>
      <section className="closing" aria-label="Fecho">
        <div className="closing__bg">
          <Picture img={c.image} smallBelow={900} />
        </div>
        <div className="closing__shade" aria-hidden="true" />
        <div className="closing__body" data-reveal>
          <p className="closing__line">{c.line}</p>
          <div className="closing__mark">
            <Wordmark className="wordmark--xl" />
          </div>
          <a className="totop" href={c.toTop.href}>
            <span className="totop__arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M12 20V5M6 11l6-6 6 6" />
              </svg>
            </span>
            <span className="totop__label">{c.toTop.label}</span>
          </a>
        </div>
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
