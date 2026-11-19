#!/usr/bin/env python3
"""
Gerador das imagens conceptuais da CASA VÉU.

Não há fotografias reais nesta primeira versão: cada imagem é um render
procedural (folha de tabaco com veias, charuto sem anilha, luz lateral,
profundidade de campo, grão). Servem para validar direção de arte e
composição. Quando chegarem as fotografias oficiais, substituir os ficheiros
em public/images/ (mesmos nomes) ou editar src/config/site.config.ts.

Uso:  python3 scripts/generate_images.py [--scale 0.4] [nome ...]
Requer: numpy, scipy, pillow
"""
import argparse
import os
import time

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates, zoom

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
TW, TH = 4400, 2400  # tamanho da textura da folha (px de "mundo")


# ----------------------------------------------------------------- ruído
def g(shape, sy, sx, rng):
    """Ruído suave normalizado (std=1), anisotrópico, barato para sigmas grandes."""
    h, w = shape
    fy, fx = max(1, int(sy // 2)), max(1, int(sx // 2))
    sh = (-(-h // fy), -(-w // fx))
    n = rng.standard_normal(sh).astype(np.float32)
    n = gaussian_filter(n, (sy / fy, sx / fx), mode="wrap")
    if fy > 1 or fx > 1:
        n = zoom(n, (h / sh[0], w / sh[1]), order=3, mode="nearest")[:h, :w]
        if n.shape != (h, w):
            n = np.pad(n, ((0, h - n.shape[0]), (0, w - n.shape[1])), mode="edge")
    return (n / (n.std() + 1e-8)).astype(np.float32)


def shift(a, dy, dx):
    out = np.zeros_like(a)
    h, w = a.shape
    ys, yd = (slice(0, h - dy), slice(dy, h)) if dy >= 0 else (slice(-dy, h), slice(0, h + dy))
    xs, xd = (slice(0, w - dx), slice(dx, w)) if dx >= 0 else (slice(-dx, w), slice(0, w + dx))
    out[yd, xd] = a[ys, xs]
    return out


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(np.maximum(x, 1e-8), 1 / 2.4) - 0.055)


def ramp(t, pal):
    t = np.clip(t, 0, 1)[..., None]
    c0, c1, c2 = [np.array(c, np.float32) for c in pal]
    lo = c0 + (c1 - c0) * np.clip(t * 2, 0, 1)
    hi = c1 + (c2 - c1) * np.clip(t * 2 - 1, 0, 1)
    return np.where(t < 0.5, lo, hi) ** 2.2  # sRGB -> linear aprox.


# ------------------------------------------------------- textura da folha
def make_leaf_texture(seed, vs=1.0):
    rng = np.random.default_rng(seed)
    shape = (TH, TW)
    S, U = np.mgrid[0:TH, 0:TW].astype(np.float32)
    S -= TH / 2
    grain = 0.5 * g(shape, 1.5, 12, rng) + 0.3 * g(shape, 1, 5, rng) + 0.25 * g(shape, 5, 30, rng)
    blot = g(shape, 40, 90, rng)
    wa = g(shape, 70, 90, rng) * 26 * vs + g(shape, 14, 14, rng) * 3.5 * vs
    wb = g(shape, 70, 90, rng) * 26 * vs + g(shape, 14, 14, rng) * 3.5 * vs
    th = 0.6
    c, s = np.cos(th), np.sin(th)
    Uw, Sw = U + wa, S + wb
    P = Uw * c + Sw * s
    Q = -Uw * s + Sw * c
    per = 900 * vs
    Qm = ((Q + per / 2) % per) - per / 2
    d = 52 * vs * (1 + 0.28 * g(shape, 160, 160, rng))
    ph = (P - np.abs(Qm) * 0.62 + 0.0009 * Qm**2 / vs) / d
    dist = np.abs(ph - np.round(ph)) * d
    vein = np.exp(-((dist / (2.1 * vs)) ** 2)) * (1 - 0.55 * np.abs(Qm) / (per / 2)) * (0.6 + 0.4 * np.clip(0.5 + 0.5 * g(shape, 60, 60, rng), 0, 1))
    rib = np.exp(-((Qm / (15 * vs)) ** 2))
    r1 = np.clip(1 - np.abs(g(shape, 2.2, 2.2, rng)) / 1.1, 0, 1) ** 3
    r2 = np.clip(1 - np.abs(g(shape, 6, 6, rng)) / 1.2, 0, 1) ** 3
    edge = Q % per
    seam = np.exp(-((edge / 7) ** 2)) + 0.5 * np.exp(-(((per - edge) / 7) ** 2))
    H = 0.75 * vein + 0.9 * rib + 0.2 * r1 + 0.28 * r2 + 0.12 * grain + 0.55 * seam
    T = 0.5 + 0.17 * grain + 0.15 * blot + 0.12 * vein + 0.18 * rib - 0.1 * r2 - 0.12 * seam
    Hs = gaussian_filter(H, 0.6)
    Hu = np.gradient(Hs, axis=1)
    Hv = np.gradient(Hs, axis=0)
    Hn = np.clip((H - H.min()) / (np.percentile(H, 99.5) - H.min()), 0, 1)
    return dict(Hu=Hu.astype(np.float32), Hs=Hv.astype(np.float32), T=T.astype(np.float32), Hn=Hn.astype(np.float32))


def make_face_texture(seed, n=2400):
    rng = np.random.default_rng(seed + 99)
    sh = (n, n)
    rid = lambda sy, sx: np.clip(1 - np.abs(g(sh, sy, sx, rng)) / 1.15, 0, 1) ** 2
    Hf = 0.6 * rid(3, 3) + 0.45 * rid(9, 9) + 0.25 * rid(22, 22) + 0.2 * g(sh, 2, 2, rng)
    Hf = (Hf - Hf.min()) / (Hf.max() - Hf.min())
    Tf = 0.5 + 0.22 * g(sh, 14, 14, rng) + 0.16 * g(sh, 3, 3, rng)
    Of = g(sh, 30, 30, rng)  # variação de tom oliva/avermelhado
    Hg = gaussian_filter(Hf, 0.7)
    return dict(
        H=Hf.astype(np.float32),
        gx=np.gradient(Hg, axis=1).astype(np.float32),
        gy=np.gradient(Hg, axis=0).astype(np.float32),
        T=Tf.astype(np.float32),
        O=Of.astype(np.float32),
    )


def samp(arr, rows, cols):
    return map_coordinates(arr, [rows, cols], order=1, mode="reflect").astype(np.float32)


# ------------------------------------------------------------ render base
def norm(v):
    v = np.array(v, np.float32)
    return v / np.linalg.norm(v)


def render_cigar(W, H, f, tex, face, cx, cy, A_deg, R, pal, light, ts=1.0, q=0.42, k=3.2,
                 face_pal=None, show_face=True, spec=0.22):
    """Devolve (rgb linear, alpha do corpo+face, dist. ao foco p/ DOF). Coordenadas em px 'ref' (f=escala)."""
    A = np.deg2rad(A_deg)
    ca, sa = np.cos(A), np.sin(A)
    X, Y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    dx, dy = X / f - cx, Y / f - cy
    xl = dx * ca + dy * sa
    yl = -dx * sa + dy * ca
    Rx = R * (1 + 0.02 * np.sin(xl / 520 + 1.0) + 0.012 * np.sin(xl / 170))
    v = np.clip(yl / Rx, -0.995, 0.995)
    sq = np.sqrt(1 - v * v)
    rows = R * np.arcsin(v) / ts + TH / 2
    cols = (-xl) / ts + 300
    Hu, Hs, T, Hn = (samp(tex[n], rows, cols) for n in ("Hu", "Hs", "T", "Hn"))
    Hxl = -Hu / ts
    Hsl = Hs / ts
    Nx = -k * Hxl
    Ny = v - k * Hsl * sq
    Nz = sq + k * Hsl * v
    nn = np.sqrt(Nx**2 + Ny**2 + Nz**2)
    Nx, Ny, Nz = Nx / nn, Ny / nn, Nz / nn

    def to_local(L):
        L = norm(L)
        return np.array([L[0] * ca + L[1] * sa, -L[0] * sa + L[1] * ca, L[2]], np.float32)

    Lk, Lr = to_local(light["key"]), to_local(light["rim"])
    albedo = ramp(T, pal)
    ao = 0.5 + 0.5 * Hn
    d1 = np.clip((Nx * Lk[0] + Ny * Lk[1] + Nz * Lk[2] + 0.12) / 1.12, 0, 1)
    d2 = np.clip(Nx * Lr[0] + Ny * Lr[1] + Nz * Lr[2], 0, 1)
    Hv = norm(Lk + np.array([0, 0, 1], np.float32))
    ndh = np.clip(Nx * Hv[0] + Ny * Hv[1] + Nz * Hv[2], 0, 1)
    sp = spec * (ndh**28) + 0.06 * (ndh**5)
    kc = np.array(light["key_col"], np.float32) * light["key_i"]
    rc = np.array(light["rim_col"], np.float32) * light["rim_i"]
    body = albedo * (light["amb"] + d1[..., None] * kc + d2[..., None] * rc) * ao[..., None]
    body += sp[..., None] * kc * (0.35 + 0.65 * Hn[..., None] ** 0.5)

    a_body = np.clip((Rx - np.abs(yl)) * f / 1.2 + 0.5, 0, 1) * np.clip(-xl * f / 1.2 + 0.5, 0, 1)
    img = body * a_body[..., None]
    alpha = a_body.copy()

    if show_face:
        ex = q * R
        fx, fy = xl / ex, yl / R
        r = np.sqrt(fx**2 + fy**2)
        th_ = np.arctan2(fy, fx)
        rag = 1 + 0.025 * np.sin(7 * th_ + 1) + 0.018 * np.sin(13 * th_ + 2) + 0.012 * np.sin(23 * th_)
        re = r * rag
        inside = (xl > 0) & (re < 1)
        FA = np.clip((1 - re) * ex * f / 1.2 + 0.5, 0, 1) * (xl > -0.5)
        fcols = (xl / q) + n_face(face) / 2
        frows = yl + n_face(face) / 2
        fr = samp(face["H"], frows, fcols)
        gx, gy = samp(face["gx"], frows, fcols), samp(face["gy"], frows, fcols)
        ft, fo = samp(face["T"], frows, fcols), samp(face["O"], frows, fcols)
        fpal = face_pal or [(0.09, 0.055, 0.03), (0.34, 0.21, 0.09), (0.58, 0.40, 0.19)]
        fcol = ramp(ft + 0.08 * fo, fpal)
        fcol = fcol * (1 + 0.12 * fo[..., None] * np.array([-0.5, 0.2, 0.9], np.float32))
        # anéis: ligante e capa
        ring_w = np.clip((re - 0.72) / 0.08, 0, 1)
        wr = ramp(0.45 + 0.25 * np.sin(re * 95 + th_ * 1.3 + 3 * fo) * 0.5 + 0.12 * ft, pal)
        wr_w = np.clip((re - 0.88) / 0.04, 0, 1)
        binder = ramp(0.35 + 0.2 * np.sin(th_ * 9 + fo * 6) * 0.5 + 0.18 * ft, (pal[0], pal[1], pal[1]))
        fcol = fcol * (1 - ring_w[..., None]) + binder * ring_w[..., None]
        fcol = fcol * (1 - wr_w[..., None]) + wr * wr_w[..., None]
        # normal da face
        qc = ex / R
        Nf = np.array([np.sqrt(1 - qc**2), 0.0, qc], np.float32)
        Tb = np.array([-qc, 0.0, np.sqrt(1 - qc**2)], np.float32)
        kf = 5.5
        fNx = Nf[0] - kf * gx * 0 + (-kf) * gy * 0
        fNy = -kf * gy
        fNx = Nf[0] - kf * gx * Tb[0]
        fNz = Nf[2] - kf * gx * Tb[2]
        nf = np.sqrt(fNx**2 + fNy**2 + fNz**2)
        fNx, fNy, fNz = fNx / nf, fNy / nf, fNz / nf
        fd1 = np.clip((fNx * Lk[0] + fNy * Lk[1] + fNz * Lk[2] + 0.1) / 1.1, 0, 1)
        fd2 = np.clip(fNx * Lr[0] + fNy * Lr[1] + fNz * Lr[2], 0, 1)
        cav = (0.08 + 0.92 * np.clip(fr * 1.35, 0, 1) ** 1.4) * (0.55 + 0.45 * np.clip(1.15 - re, 0, 1) ** 0.6)
        facec = fcol * (light["amb"] * 0.7 + fd1[..., None] * kc + fd2[..., None] * rc) * cav[..., None]
        m = (inside * FA)[..., None]
        img = img * (1 - m) + facec * m
        alpha = np.maximum(alpha, inside * FA)
    dist = np.sqrt(dx**2 + dy**2)
    return img.astype(np.float32), alpha.astype(np.float32), dist


_fn = {}
def n_face(face):
    return face["H"].shape[0]


# ------------------------------------------------------------- composição
def background(W, H, f, alpha, glow_xy, base=(0.012, 0.0095, 0.008), glow=(0.040, 0.027, 0.017),
               glow_r=0.42, shadow_off=(-70, 46), seed=1):
    rng = np.random.default_rng(seed)
    X, Y = np.meshgrid(np.arange(W, dtype=np.float32) / W, np.arange(H, dtype=np.float32) / H)
    d2 = ((X - glow_xy[0]) ** 2 + ((Y - glow_xy[1]) * H / W) ** 2) / (glow_r**2)
    bg = np.array(base, np.float32) + np.exp(-d2)[..., None] * np.array(glow, np.float32)
    # sombra projetada (afastada da luz) e oclusão de contacto
    sh = shift(alpha, int(shadow_off[1] * f), int(shadow_off[0] * f))
    sh = gaussian_filter(sh, 38 * f)
    sh2 = gaussian_filter(shift(alpha, int(14 * f), 0), 10 * f)
    bg *= (1 - 0.9 * np.clip(sh * 1.3, 0, 1))[..., None]
    bg *= (1 - 0.8 * sh2)[..., None]
    surf = gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 2.0 * f) * 0.0035
    return bg + surf[..., None] * np.array([1, 0.8, 0.7], np.float32)


def dof(img, dist, f, focus_r0, focus_r1, s1=5, s2=14):
    w = smoothstep(focus_r0, focus_r1, dist)[..., None]
    b1 = np.stack([gaussian_filter(img[..., i], s1 * f) for i in range(3)], -1)
    b2 = np.stack([gaussian_filter(img[..., i], s2 * f) for i in range(3)], -1)
    soft = b1 * (1 - np.clip(w * 2 - 1, 0, 1)) + b2 * np.clip(w * 2 - 1, 0, 1)
    return img * (1 - np.clip(w * 2, 0, 1)) + soft * np.clip(w * 2, 0, 1)


def finish(img, f, exposure=1.0, vignette=0.55, vg_center=(0.55, 0.5), shadow_grad=None,
           grain=0.016, bloom=0.14, seed=3, warm=0.0):
    H, W, _ = img.shape
    rng = np.random.default_rng(seed)
    lum = img.max(-1)
    hi = np.clip(img - 0.9, 0, None)
    bl = np.stack([gaussian_filter(hi[..., i], 22 * f) for i in range(3)], -1) * 2.2
    bl += np.stack([gaussian_filter(hi[..., i], 6 * f) for i in range(3)], -1) * 1.0
    x = (img + bloom * bl) * exposure
    X, Y = np.meshgrid(np.arange(W, dtype=np.float32) / W, np.arange(H, dtype=np.float32) / H)
    if shadow_grad is not None:
        x *= shadow_grad(X, Y)[..., None]
    vg = 1 - vignette * smoothstep(0.25, 1.05, np.sqrt((X - vg_center[0]) ** 2 + ((Y - vg_center[1]) * 0.9) ** 2) * 1.35)
    x *= vg[..., None]
    x = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)  # ACES
    x = srgb(x)
    x = x + warm * (0.1 - x) * np.array([0.1, 0.02, -0.08], np.float32)
    gr = rng.standard_normal((H, W)).astype(np.float32)
    gr = gaussian_filter(gr, 0.7) * 1.6
    x = x + gr[..., None] * grain * (0.35 + 0.65 * np.sqrt(np.clip(x, 0, 1)))
    return (np.clip(x, 0, 1) * 255 + rng.random((H, W, 1), dtype=np.float32)).astype(np.uint8)


# --------------------------------------------------------------- paletas
PAL = {
    "suave": [(0.42, 0.28, 0.11), (0.66, 0.47, 0.22), (0.82, 0.64, 0.36)],
    "medio": [(0.22, 0.105, 0.05), (0.43, 0.22, 0.10), (0.62, 0.36, 0.17)],
    "intenso": [(0.06, 0.034, 0.02), (0.16, 0.082, 0.042), (0.31, 0.165, 0.085)],
    "hero": [(0.20, 0.10, 0.05), (0.38, 0.205, 0.095), (0.55, 0.335, 0.165)],
}
FACE = {
    "suave": [(0.12, 0.08, 0.04), (0.40, 0.28, 0.12), (0.64, 0.48, 0.24)],
    "medio": [(0.09, 0.05, 0.03), (0.32, 0.19, 0.08), (0.55, 0.36, 0.17)],
    "intenso": [(0.04, 0.025, 0.015), (0.16, 0.09, 0.05), (0.34, 0.2, 0.1)],
    "hero": [(0.08, 0.05, 0.03), (0.30, 0.19, 0.085), (0.52, 0.35, 0.17)],
}

LIGHT_SIDE = dict(key=(0.85, -0.38, 0.34), key_col=(1.0, 0.84, 0.66), key_i=3.0,
                  rim=(-0.9, -0.3, 0.22), rim_col=(0.95, 0.52, 0.3), rim_i=0.55, amb=0.035)
LIGHT_OPEN = dict(key=(0.55, -0.55, 0.62), key_col=(1.0, 0.88, 0.72), key_i=3.4,
                  rim=(-0.9, -0.3, 0.3), rim_col=(0.95, 0.55, 0.32), rim_i=0.8, amb=0.07)


def save(name, arr, width, q=78):
    im = Image.fromarray(arr)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, name + ".webp"), quality=q, method=6)
    if not name.startswith("hero"):  # versão leve para ecrãs pequenos
        sm = im.resize((900, round(900 * im.height / im.width)), Image.LANCZOS)
        sm.save(os.path.join(OUT, name + "-sm.webp"), quality=74, method=6)
    print("  ->", name, im.size)


# ----------------------------------------------------------------- cenas
def scene_hero(tex, face, W, H, ref_w, lit, mobile, f_override=None):
    f = W / ref_w
    ref_h = H / f
    pal, fpal = PAL["hero"], FACE["hero"]
    if not mobile:
        cx, cy, A, R = 0.74 * ref_w, 0.50 * ref_h, -9, 0.115 * ref_w
        glow_xy = (0.78, 0.55)
    else:
        cx, cy, A, R = 0.74 * ref_w, 0.34 * ref_h, -66, 0.215 * ref_w
        glow_xy = (0.78, 0.35)
    light = dict(LIGHT_OPEN if lit else LIGHT_SIDE)
    img, alpha, dist = render_cigar(W, H, f, tex, face, cx, cy, A, R, pal, light, ts=1.0, q=0.62,
                                    face_pal=fpal)
    bg = background(W, H, f, alpha, glow_xy, glow=(0.05, 0.034, 0.022) if lit else (0.03, 0.02, 0.013),
                    shadow_off=(-60, 40) if not mobile else (-50, 30))
    out = img + bg * (1 - alpha[..., None])
    if not lit:
        out = dof(out, dist, f, 0.40 * ref_w, 1.05 * ref_w) if not mobile else dof(out, dist, f, 0.45 * ref_w, 1.25 * ref_w)
    if not mobile:
        sg = (lambda X, Y: (0.12 + 0.88 * smoothstep(0.08, 0.7, X)) ** 1.1) if not lit else (lambda X, Y: 0.55 + 0.45 * smoothstep(0.0, 0.6, X))
    else:
        sg = (lambda X, Y: 0.1 + 0.9 * (1 - smoothstep(0.35, 0.95, Y)) ) if not lit else (lambda X, Y: 0.6 + 0.4 * (1 - smoothstep(0.5, 1.0, Y)))
    return finish(out, f, exposure=1.0 if not lit else 1.15, shadow_grad=sg,
                  vg_center=(0.65, 0.5) if not mobile else (0.7, 0.35), seed=5 if lit else 4)


def scene_product(name, tex, face, W, H, ref_w, geo, light_scale=1.0, exposure=1.0, seed=10):
    f = W / ref_w
    ref_h = H / f
    cx, cy, A, R, q = geo
    light = dict(LIGHT_SIDE)
    light["key_i"] *= light_scale
    img, alpha, dist = render_cigar(W, H, f, tex, face, cx * ref_w, cy * ref_h, A, R * ref_w,
                                    PAL[name], light, q=q, face_pal=FACE[name],
                                    spec=0.08 if name == "intenso" else 0.22)
    bg = background(W, H, f, alpha, (0.7, 0.55), shadow_off=(-60, 40), seed=seed)
    out = img + bg * (1 - alpha[..., None])
    out = dof(out, dist, f, 0.55 * ref_w, 1.3 * ref_w, 4, 10)
    return finish(out, f, exposure=exposure, vignette=0.6, vg_center=(0.62, 0.5), seed=seed)


def scene_leaf(tex, W, H, ref_w):
    """Folha plana com luz rasante: veias em relevo."""
    f = W / ref_w
    X, Y = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    ts = 1.9
    th = np.deg2rad(18)
    dx, dy = X / f - ref_w / 2, Y / f - (H / f) / 2
    u = dx * np.cos(th) + dy * np.sin(th)
    s = -dx * np.sin(th) + dy * np.cos(th)
    cols, rows = u / ts + 2200, s / ts + TH / 2
    Hu, Hs, T, Hn = (samp(tex[n], rows, cols) for n in ("Hu", "Hs", "T", "Hn"))
    k = 5.0
    # derivadas em coordenadas do ecrã
    gx = (Hu * np.cos(th) - Hs * np.sin(th)) / ts
    gy = (Hu * np.sin(th) + Hs * np.cos(th)) / ts
    N = np.stack([-k * gx, -k * gy, np.ones_like(gx)], -1)
    N /= np.linalg.norm(N, axis=-1, keepdims=True)
    L = norm((0.88, -0.28, 0.30))
    d = np.clip((N @ L + 0.05) / 1.05, 0, 1)
    Hh = norm(L + np.array([0, 0, 1]))
    sp = np.clip(N @ Hh, 0, 1) ** 24 * 0.22
    alb = ramp(T, PAL["medio"])
    ao = 0.45 + 0.55 * Hn
    kc = np.array([1.0, 0.84, 0.66], np.float32) * 3.0
    col = alb * (0.03 + d[..., None] * kc) * ao[..., None] + sp[..., None] * kc * 0.6
    X0 = X / W
    col *= (0.18 + 0.82 * smoothstep(0.0, 0.8, X0))[..., None]
    return finish(col, f, exposure=1.05, vignette=0.5, seed=21, grain=0.017)


def scene_closing(tex, face, W, H, ref_w):
    f = W / ref_w
    ref_h = H / f
    cx, cy, A, R = 0.80 * ref_w, 0.67 * ref_h, 0, 0.055 * ref_w
    light = dict(LIGHT_SIDE)
    light["key"] = (0.5, -0.7, 0.35)
    light["key_i"] = 3.6
    img, alpha, dist = render_cigar(W, H, f, tex, face, cx, cy, A, R, PAL["medio"], light, q=0.36,
                                    face_pal=FACE["medio"])
    bg = background(W, H, f, alpha, (0.72, 0.7), glow=(0.05, 0.035, 0.024), glow_r=0.5,
                    shadow_off=(-30, 20), seed=31)
    # reflexo numa superfície escura brilhante
    base_y = int((cy + R * 0.98) * f)
    refl = np.zeros_like(img)
    rl = np.zeros_like(alpha)
    n = min(base_y, H - base_y)
    refl[base_y:base_y + n] = img[base_y - n:base_y][::-1]
    rl[base_y:base_y + n] = alpha[base_y - n:base_y][::-1]
    fade = np.zeros(H, np.float32)
    fade[base_y:base_y + n] = np.exp(-np.arange(n) / (0.07 * ref_h * f))
    refl = np.stack([gaussian_filter(refl[..., i], 3 * f) for i in range(3)], -1)
    rl = gaussian_filter(rl, 3 * f)
    refl_a = (rl * fade[:, None])[..., None] * 0.35
    below = (np.arange(H)[:, None] >= base_y)
    out = np.where(below[..., None], bg * (1 - refl_a) + refl * refl_a, bg)
    out = img + out * (1 - alpha[..., None])
    out = dof(out, dist, f, 0.5 * ref_w, 1.2 * ref_w, 3, 8)
    sg = lambda X, Y: 0.35 + 0.65 * smoothstep(0.1, 0.75, X)
    return finish(out, f, exposure=1.0, vignette=0.55, vg_center=(0.65, 0.65), shadow_grad=sg, seed=32)


JOBS = ["hero", "hero-lit", "hero-m", "hero-lit-m", "suave", "medio", "intenso",
        "folha", "estrutura", "acabamento", "fecho"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("names", nargs="*")
    a = ap.parse_args()
    names = a.names or JOBS
    sc = a.scale
    t0 = time.time()
    cache = {}

    def get(seed, vs=1.0):
        if (seed, vs) not in cache:
            print("  textura", seed, "…")
            cache[(seed, vs)] = (make_leaf_texture(seed, vs), make_face_texture(seed))
        return cache[(seed, vs)]

    def sz(w, h):
        return int(w * sc), int(h * sc)

    for n in names:
        print(n, f"[{time.time() - t0:.0f}s]")
        if n in ("hero", "hero-lit"):
            tex, face = get(1)
            W, H = sz(2800, 1575)
            arr = scene_hero(tex, face, W, H, 2800, n == "hero-lit", False)
            save(n, arr, 2560, 76)
        elif n in ("hero-m", "hero-lit-m"):
            tex, face = get(1)
            W, H = sz(1260, 2240)
            arr = scene_hero(tex, face, W, H, 1260, n == "hero-lit-m", True)
            save(n, arr, 1260, 76)
        elif n == "suave":
            tex, face = get(2)
            W, H = sz(1500, 1875)
            arr = scene_product("suave", tex, face, W, H, 1500, (0.60, 0.40, -32, 0.105, 0.40), 1.1, 1.05, 11)
            save(n, arr, 1500)
        elif n == "medio":
            tex, face = get(3)
            W, H = sz(2000, 1400)
            arr = scene_product("medio", tex, face, W, H, 2000, (1.25, 0.55, 4, 0.20, 0.4), 1.0, 1.0, 12)
            save(n, arr, 2000)
        elif n == "intenso":
            tex, face = get(4)
            W, H = sz(1500, 1875)
            arr = scene_product("intenso", tex, face, W, H, 1500, (0.60, 0.30, -58, 0.16, 0.5), 1.7, 1.2, 13)
            save(n, arr, 1500)
        elif n == "folha":
            tex, face = get(5, 1.0)
            W, H = sz(1500, 1875)
            arr = scene_leaf(tex, W, H, 1500)
            save(n, arr, 1500)
        elif n == "estrutura":
            tex, face = get(6)
            W, H = sz(1800, 1350)
            arr = scene_product("medio", tex, face, W, H, 1800, (0.64, 0.50, -18, 0.46, 0.62), 1.25, 1.05, 14)
            save(n, arr, 1800)
        elif n == "acabamento":
            tex, face = get(7)
            W, H = sz(1800, 1350)
            arr = scene_product("suave", tex, face, W, H, 1800, (1.25, 0.9, -28, 0.55, 0.4), 1.2, 1.05, 15)
            save(n, arr, 1800)
        elif n == "fecho":
            tex, face = get(8)
            W, H = sz(2800, 1400)
            arr = scene_closing(tex, face, W, H, 2800)
            save(n, arr, 2560, 76)
    print(f"feito em {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
