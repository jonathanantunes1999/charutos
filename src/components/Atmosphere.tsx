import { useEffect, useRef } from "react";

type Origin = { x: number; y: number } | null;

/**
 * Fumo e poeira.
 *  · WebGL: shader com ruído fractal e distorção de domínio → fios finos que sobem quase retos,
 *    ondulam e abrem em volutas (como fumo real).
 *  · Alternativa 2D (sem WebGL): partículas suaves.
 * Meia resolução; pausa fora do ecrã/separador; não corre com prefers-reduced-motion.
 * `getOrigin` devolve o ponto de emissão em frações do canvas.
 */
export function Atmosphere({ getOrigin }: { getOrigin: () => Origin }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const org = useRef(getOrigin);
  org.current = getOrigin;

  useEffect(() => {
    const cv = ref.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: "low-power" });
    const stop = gl ? startGL(cv, gl, () => org.current()) : start2D(cv, () => org.current());
    return stop;
  }, []);

  return <canvas ref={ref} className="atmo" aria-hidden="true" />;
}

/* ───────────────────────── helpers comuns ───────────────────────── */
function watch(cv: HTMLCanvasElement, onResize: (w: number, h: number) => void) {
  const resize = () => {
    const r = cv.getBoundingClientRect();
    const w = Math.max(2, Math.round(r.width * 0.5));
    const h = Math.max(2, Math.round(r.height * 0.5));
    cv.width = w;
    cv.height = h;
    onResize(w, h);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(cv);
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
  io.observe(cv);
  let hidden = document.hidden;
  const onVis = () => (hidden = document.hidden);
  document.addEventListener("visibilitychange", onVis);
  return {
    active: () => visible && !hidden,
    off: () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}

/* ───────────────────────── WebGL ───────────────────────── */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_org;      // origem em px (canto inferior esquerdo)

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec2 hash2(vec2 p){ return vec2(hash(p), hash(p+19.19)); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a*noise(p); p = p*2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

float dust(vec2 uv, float t){
  float a = 0.0;
  for (int i = 0; i < 2; i++){
    float sc = 11.0 + float(i)*8.0;
    vec2 p = uv*sc; p.y -= t*(0.22 + 0.12*float(i));
    vec2 c = floor(p), f = fract(p);
    vec2 o = hash2(c + float(i)*7.0);
    vec2 pos = 0.2 + 0.6*o + vec2(sin(t*0.4 + o.x*6.28)*0.12, 0.0);
    float d = length(f - pos);
    float sz = 0.022 + 0.03*hash(c+3.1);
    float tw = 0.4 + 0.6*sin(t*1.4 + o.y*20.0);
    a += smoothstep(sz, 0.0, d) * tw * step(0.62, hash(c + 11.0));
  }
  return a;
}

void main(){
  vec2 org = u_org;
  float H = max(u_res.y - org.y, 40.0);            // espaço disponível acima da origem
  vec2 d = (gl_FragCoord.xy - org) / H;            // h=1 → topo do ecrã (a pluma adapta-se)
  vec2 dpx = (gl_FragCoord.xy - org) / u_res.y;
  float h = d.y;
  float t = u_t;

  float dens = 0.0;
  if (h > 0.0){
    // linha central: oscila e inclina com a altura (vento)
    float xc = sin(h*6.0 - t*0.8)*0.012*h + 0.05*h*h + sin(t*0.27)*0.03*h;
    // distorção de domínio crescente com a altura: laminar em baixo, turbulento em cima
    vec2 q = vec2(fbm(vec2(d.x*5.0, h*3.2 - t*0.32)),
                  fbm(vec2(d.x*5.0 + 5.2, h*3.2 - t*0.32 + 1.3)));
    float warp = 0.004 + 0.46*h*h;
    float x = d.x - xc + (q.x - 0.5)*warp*2.0;
    float w = 0.0045 + 0.115*pow(h, 1.1);
    float core = exp(-(x*x)/(w*w));
    // filamentos finos (ruído "ridged") dentro da coluna
    float n = fbm(vec2(x*(22.0/(0.35 + h)), h*6.5 - t*0.55 + q.y*2.4));
    float r = pow(1.0 - abs(2.0*n - 1.0), 3.0);
    // pulsos (baforadas) ao longo da altura
    float puff = 0.62 + 0.38*sin(h*8.0 - t*1.35 + q.x*5.0);
    dens = core * (0.28 + 1.0*r) * puff;
    dens *= smoothstep(0.0, 0.02, h) * (1.0 - smoothstep(0.45, 1.0, h));
    dens *= 1.0/(1.0 + 1.2*h);
  }
  // cor: quente junto à brasa, azulada mais acima
  vec3 smokeCol = mix(vec3(1.0, 0.9, 0.78), vec3(0.64, 0.72, 0.84), clamp(h*1.5, 0.0, 1.0));
  float a = clamp(dens*1.25, 0.0, 0.9);

  // pó em suspensão (ligeiro, quente)
  vec2 uv = gl_FragCoord.xy / u_res.y;
  float ds = dust(uv, t);
  vec3 col = smokeCol*a + vec3(1.0, 0.82, 0.6)*ds*0.5;
  float alpha = max(a, ds*0.5);

  // brilho muito discreto no ponto de emissão
  float g = exp(-pow(length(dpx*vec2(1.0, 1.4))/0.03, 2.0)) * (0.16 + 0.05*sin(t*2.3));
  col += vec3(1.0, 0.5, 0.2)*g;
  alpha = max(alpha, g);

  gl_FragColor = vec4(col, alpha);
}`;

function startGL(cv: HTMLCanvasElement, gl: WebGLRenderingContext, getOrigin: () => Origin) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("Atmosphere: shader não compilou", gl.getProgramInfoLog(prog));
    return () => {};
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, "u_res");
  const uT = gl.getUniformLocation(prog, "u_t");
  const uOrg = gl.getUniformLocation(prog, "u_org");

  const w = watch(cv, (W, H) => gl.viewport(0, 0, W, H));
  const t0 = performance.now();
  let raf = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (!w.active()) return;
    const o = getOrigin();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!o) return;
    gl.uniform2f(uRes, cv.width, cv.height);
    gl.uniform1f(uT, (now - t0) / 1000);
    gl.uniform2f(uOrg, o.x * cv.width, (1 - o.y) * cv.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    w.off();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}

/* ───────────────────────── alternativa 2D ───────────────────────── */
type P = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; a: number; seed: number };

function start2D(cv: HTMLCanvasElement, getOrigin: () => Origin) {
  const ctx = cv.getContext("2d");
  if (!ctx) return () => {};
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 96;
  const sg = sprite.getContext("2d")!;
  const g = sg.createRadialGradient(48, 48, 0, 48, 48, 48);
  g.addColorStop(0, "rgba(255,236,214,1)");
  g.addColorStop(0.35, "rgba(236,208,180,0.45)");
  g.addColorStop(1, "rgba(220,190,160,0)");
  sg.fillStyle = g;
  sg.fillRect(0, 0, 96, 96);
  let W = 2;
  let H = 2;
  const w = watch(cv, (a, b) => ((W = a), (H = b)));
  const smoke: P[] = [];
  let last = performance.now();
  let acc = 0;
  let t = 0;
  let raf = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!w.active()) return;
    t += dt;
    const o = getOrigin();
    if (o) acc = Math.min(acc + dt * 70, 3);
    while (acc > 1 && o) {
      acc -= 1;
      smoke.push({
        x: o.x * W + (Math.random() - 0.5) * W * 0.012, y: o.y * H, vx: (Math.random() - 0.5) * 6,
        vy: -(26 + Math.random() * 26) * (H / 500), age: 0, life: 5 + Math.random() * 4,
        size: 4 + Math.random() * 6, a: 0.03 + Math.random() * 0.04, seed: Math.random() * 100,
      });
    }
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
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    w.off();
  };
}
