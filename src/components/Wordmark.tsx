import { site } from "../config/site.config";

/** Wordmark tipográfico simples: monograma + nome. Substituir por SVG quando houver logótipo. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label={site.brand.full}>
      <span className="wordmark__mono" aria-hidden="true">
        {site.brand.mono}
      </span>
      <small aria-hidden="true">{site.brand.name}</small>
    </span>
  );
}
