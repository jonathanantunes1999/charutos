import type { CSSProperties } from "react";
import type { Img } from "../config/site.config";

const url = (p: string) => `${import.meta.env.BASE_URL}${p}`;

type Props = {
  img: Img;
  className?: string;
  smallBelow?: number;
  eager?: boolean;
  decorative?: boolean;
  style?: CSSProperties;
};

/** <picture> que escolhe a versão leve em ecrãs pequenos. */
export function Picture({ img, className, smallBelow = 760, eager, decorative, style }: Props) {
  return (
    <picture>
      {img.srcSm && <source media={`(max-width: ${smallBelow}px)`} srcSet={url(img.srcSm)} />}
      <img
        className={className}
        style={style}
        src={url(img.src)}
        alt={decorative ? "" : img.alt}
        aria-hidden={decorative || undefined}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        {...(eager ? { fetchPriority: "high" as const } : {})}
        draggable={false}
      />
    </picture>
  );
}
