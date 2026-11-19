import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; a: number; seed: number };

/**
 * Fumo e poeira em canvas 2D (meia resolução; pausa fora do ecrã/separador).
 * `getOrigin` devolve o ponto de emissão em frações do canvas.
 */
export function Atmosphere({ getOrigin }: { getOrigin: () => { x: number; y: number } | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const org = useRef(getOrigin);
  org.current = getOrigin;

  useEffect(() => {
    const cv = ref.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 96;
    const sg = sprite.getContext("2d")!;
    const g = sg.createRadialGradient(48, 48, 0, 48, 48, 48);
    g.addColorStop(0, "rgba(255,236,214,1)");
    g.addColorStop(0.35, "rgba(236,208,180,0.45)");
    g.addColorStop(1, "rgba(220,190,160,0)");
    sg.fillStyle = g;
    sg.fillRect(0, 0, 96, 96);

    let W = 0;
    let H = 0;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      W = cv.width = Math.max(2, Math.round(r.width * 0.5));
      H = cv.height = Math.max(2, Math.round(r.height * 0.5));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const smoke: P[] = [];
    const dust = Array.from({ length: 34 }, () => ({
      x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, s: 0.004 + Math.random() * 0.012,
      ph: Math.random() * 6.28, a: 0.15 + Math.random() * 0.5,
    }));

    let run = true;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(cv);
    const onVis = () => (run = !document.hidden);
    document.addEventListener("visibilitychange", onVis);

    let last = performance.now();
    let acc = 0;
    let t = 0;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!run || !visible) return;
      t += dt;
      const o = org.current();
      if (o) acc += dt * 70;
      while (acc > 1 && o) {
        acc -= 1;
        smoke.push({
          x: o.x * W + (Math.random() - 0.5) * W * 0.012,
          y: o.y * H,
          vx: (Math.random() - 0.5) * 6,
          vy: -(26 + Math.random() * 26) * (H / 500),
          age: 0,
          life: 5 + Math.random() * 4,
          size: 4 + Math.random() * 6,
          a: 0.03 + Math.random() * 0.04,
          seed: Math.random() * 100,
        });
      }
      acc = Math.min(acc, 3);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.age += dt;
        if (p.age > p.life) {
          smoke.splice(i, 1);
          continue;
        }
        const u = p.age / p.life;
        p.vx += (Math.sin(p.y * 0.022 + p.seed + t * 0.8) * 14 + Math.sin(p.y * 0.009 + t * 0.3) * 8 + 5) * dt;
        p.vx *= 0.985;
        p.x += p.vx * dt * (W / 700);
        p.y += p.vy * dt;
        const s = (p.size + u * 38) * (W / 700);
        ctx.globalAlpha = p.a * Math.sin(Math.PI * u) ** 1.4;
        ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
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
