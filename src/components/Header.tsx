import { useEffect, useState } from "react";
import { site } from "../config/site.config";
import { Wordmark } from "./Wordmark";

/** Cabeçalho fixo. Sobre a secção em papel (marfim) passa a tinta escura; nas restantes, marfim. */
export function Header() {
  const [ink, setInk] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const stack = document.elementsFromPoint(window.innerWidth / 2, 28);
      setInk(stack.some((el) => el.closest(".craft")));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className={`header${ink ? " header--ink" : ""}`}>
      <a className="header__brand" href="#topo" aria-label={`${site.brand.full} — topo da página`}>
        <Wordmark />
      </a>
      <nav aria-label="Principal">
        <ul className="header__nav">
          {site.nav.map((n) => (
            <li key={n.href}>
              <a className="navlink" href={n.href}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
