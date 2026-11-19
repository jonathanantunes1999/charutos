import { useId } from "react";

/** Botão circular com texto a rodar. É um link normal, com nome acessível. */
export function Badge({ href, label, up = false, className = "" }: { href: string; label: string; up?: boolean; className?: string }) {
  const id = "b" + useId().replace(/:/g, "");
  const text = `${label} • ${label} • `.toUpperCase();
  return (
    <a className={`badge ${className}`} href={href} aria-label={label}>
      <svg className="badge__ring" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href={`#${id}`} textLength="484" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="badge__core" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.3">
          {up ? <path d="M12 20V5M6 11l6-6 6 6" /> : <path d="M12 4v15M6 13l6 6 6-6" />}
        </svg>
      </span>
    </a>
  );
}
