import { useEffect, useRef } from "react";

/**
 * Poeira em suspensão: partículas douradas muito discretas, em canvas 2D (meia resolução).
 * Pausa fora do ecrã/separador e não corre com prefers-reduced-motion.
 */
export function Atmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let W = 2;
    let H = 2;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      W = cv.width = Math.max(2, Math.round(r.width * 0.5));
      H = cv.height = Math.max(2, Math.round(r.height * 0.5));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const dust = Array.from({ length: 34 }, () => ({
      x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, s: 0.004 + Math.random() * 0.012,
      ph: Math.random() * 6.28, a: 0.15 + Math.random() * 0.5,
    }));

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(cv);
    let hidden = document.hidden;
    const onVis = () => (hidden = document.hidden);
    document.addEventListener("visibilitychange", onVis);

    let last = performance.now();
    let t = 0;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || hidden) return;
      t += dt;
      ctx.clearRect(0, 0, W, H);
      for (const d of dust) {
        d.y -= d.s * dt;
        d.x += Math.sin(t * 0.3 + d.ph) * 0.0004;
        if (d.y < -0.02) d.y = 1.02;
        const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + d.ph * 3);
        ctx.fillStyle = `rgba(255,214,170,${d.a * tw * 0.55})`;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r * (W / 900), 0, 6.283);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="atmo" aria-hidden="true" />;
}
