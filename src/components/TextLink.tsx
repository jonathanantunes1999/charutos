/** Link de texto simples com seta. */
export function TextLink({ href, label, up = false, className = "" }: { href: string; label: string; up?: boolean; className?: string }) {
  return (
    <a className={`tlink ${className}`} href={href}>
      <span>{label}</span>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        {up ? <path d="M12 20V5M6 11l6-6 6 6" /> : <path d="M12 4v15M6 13l6 6 6-6" />}
      </svg>
    </a>
  );
}
