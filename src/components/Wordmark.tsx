import { site } from "../config/site.config";

/** Wordmark tipográfico simples. Substituir por SVG quando houver logótipo. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label={site.brand.full}>
      <small aria-hidden="true">{site.brand.first}</small>
      <span aria-hidden="true">{site.brand.second}</span>
    </span>
  );
}
