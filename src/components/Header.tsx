import { site } from "../config/site.config";
import { Wordmark } from "./Wordmark";

/** Cabeçalho em mix-blend-mode: difference, legível sobre qualquer cor de secção. */
export function Header() {
  return (
    <header className="header">
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
