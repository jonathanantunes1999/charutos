import { useEffect, useState } from "react";
import { site } from "../config/site.config";
import { Wordmark } from "./Wordmark";

export function Header() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const o = document.getElementById("topo");
        setSolid(window.scrollY > (o ? o.offsetHeight - window.innerHeight * 0.6 : window.innerHeight));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className={`header${solid ? " is-solid" : ""}`}>
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
