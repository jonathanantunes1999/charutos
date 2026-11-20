/** Link de texto simples com seta. */
export function TextLink({
  href,
  label,
  up = false,
  arrow = "down",
  className = "",
}: {
  href: string;
  label: string;
  up?: boolean;
  arrow?: "down" | "right";
  className?: string;
}) {
  const dir = up ? "up" : arrow;
  return (
    <a className={`tlink tlink--${dir} ${className}`} href={href}>
      <span>{label}</span>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        {dir === "up" ? <path d="M12 20V5M6 11l6-6 6 6" /> : dir === "right" ? <path d="M4 12h15M13 6l6 6-6 6" /> : <path d="M12 4v15M6 13l6 6 6-6" />}
      </svg>
    </a>
  );
}
