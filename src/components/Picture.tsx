import type { Img } from "../config/site.config";

const url = (p: string) => `${import.meta.env.BASE_URL}${p}`;

type Props = {
  img: Img;
  className?: string;
  /** versão leve usada abaixo deste breakpoint (por defeito 760px) */
  smallBelow?: number;
  eager?: boolean;
  decorative?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

/** <picture> que escolhe a versão leve em ecrãs pequenos. */
export function Picture({ img, className, smallBelow = 760, eager, decorative, sizes, width, height }: Props) {
  return (
    <picture>
      {img.srcSm && <source media={`(max-width: ${smallBelow}px)`} srcSet={url(img.srcSm)} />}
      <img
        className={className}
        src={url(img.src)}
        alt={decorative ? "" : img.alt}
        aria-hidden={decorative || undefined}
        sizes={sizes}
        width={width}
        height={height}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        {...(eager ? { fetchPriority: "high" as const } : {})}
        draggable={false}
      />
    </picture>
  );
}
