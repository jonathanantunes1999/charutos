#!/usr/bin/env python3
"""
Processa a fotografia de charuto (Unsplash, Fabian Garcia Acevedo) e gera as imagens do site.

 1. remove a anilha (clona a capa de uma zona limpa do mesmo charuto)
 2. recorta o charuto (GrabCut) → RGBA, cabeça à esquerda / pé à direita
 3. variantes de cor para os três perfis (aproximação para o conceito)
 4. recortes macro (folha, ofício) e imagem de fecho

Uso:  python3 scripts/process_photo.py [foto.jpg]
Requer: numpy, pillow, opencv-python-headless
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "assets", "source", "cigar-unsplash.jpg")
OUT = os.path.join(HERE, "..", "public", "images")


# ─────────────────────────────── 1. sem anilha
def remove_band(im):
    f = im.astype(np.float32)
    x0, x1, y0, y1 = 3700, 4458, 1690, 2350  # colunas limpas imediatamente fora da anilha
    D = 1650  # origem da clonagem (x - D), sem a fissura
    td0, bd0, td1, bd1 = 1738, 2309, 1750, 2308  # topo/base do charuto nas pontas da anilha
    ts0, bs0, ts1, bs1 = 1730, 2306, 1727, 2305  # idem, na origem
    W, H = x1 - x0, y1 - y0
    mapx = np.zeros((H, W), np.float32)
    mapy = np.zeros((H, W), np.float32)
    for i in range(W):
        u = i / (W - 1)
        td, bd = td0 + (td1 - td0) * u, bd0 + (bd1 - bd0) * u
        ts, bs = ts0 + (ts1 - ts0) * u, bs0 + (bs1 - bs0) * u
        mapy[:, i] = ts + (np.arange(y0, y1) - td) * (bs - ts) / (bd - td)
        mapx[:, i] = x0 + i - D
    patch = cv2.remap(f, mapx, mapy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    def off(xc, left):
        n = 10
        dst = f[y0:y1, xc - n:xc].mean(1) if left else f[y0:y1, xc:xc + n].mean(1)
        i0 = 0 if left else W - n
        d = dst - patch[:, i0:i0 + n].mean(1)
        return cv2.GaussianBlur(d.reshape(-1, 1, 3), (1, 0), sigmaX=0.1, sigmaY=18).reshape(-1, 3)

    oL, oR = off(x0, True), off(x1, False)
    u = np.linspace(0, 1, W, dtype=np.float32)[None, :, None]
    patch = patch + oL[:, None, :] * (1 - u) + oR[:, None, :] * u
    td, bd = np.linspace(td0, td1, W), np.linspace(bd0, bd1, W)
    rows = np.arange(y0, y1)[:, None]
    inside = ((rows >= td[None, :] - 3) & (rows <= bd[None, :] + 3)).astype(np.float32)
    fe = np.ones(W, np.float32)
    fe[:8] = np.linspace(0, 1, 8)
    fe[-8:] = np.linspace(1, 0, 8)
    a = (inside * fe[None, :])[..., None]
    res = f.copy()
    res[y0:y1, x0:x1] = res[y0:y1, x0:x1] * (1 - a) + patch * a
    res = np.clip(res, 0, 255).astype(np.uint8)
    m2 = np.zeros(im.shape[:2], np.uint8)
    for i in range(6, W - 6):
        t, b = int(td[i]), int(bd[i])
        m2[t - 38:t + 3, x0 + i] = 255
        m2[b - 1:b + 30, x0 + i] = 255
    return cv2.inpaint(res, m2, 7, cv2.INPAINT_TELEA)


# ─────────────────────────────── 2. recorte
def cutout(im):
    X0, X1, Y0, Y1 = 860, 5400, 1640, 2400
    sc = 0.5
    small = cv2.resize(im[Y0:Y1, X0:X1], None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
    h, w = small.shape[:2]
    P = lambda x, y: (int((x - X0) * sc), int((y - Y0) * sc))
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    cv2.rectangle(mask, P(920, 1700), P(5300, 2340), cv2.GC_PR_FGD, -1)
    cv2.rectangle(mask, P(1000, 1800), P(4300, 2250), cv2.GC_FGD, -1)
    cv2.fillConvexPoly(mask, np.array([P(4300, 1780), P(4900, 1900), P(5200, 2010), P(4900, 2160), P(4300, 2250)], np.int32), cv2.GC_FGD)
    mask[: P(0, 1690)[1]] = cv2.GC_BGD
    mask[P(0, 2350)[1]:] = cv2.GC_BGD
    mask[:, : P(900, 0)[0]] = cv2.GC_BGD
    mask[:, P(5330, 0)[0]:] = cv2.GC_BGD
    cv2.grabCut(small, mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 6, cv2.GC_INIT_WITH_MASK)
    m = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    m = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    # alisar topo/base por coluna (remove degraus da zona reparada)
    ys, xs = np.where(m > 0)
    top = np.full(w, -1.0)
    bot = np.full(w, -1.0)
    for x in np.unique(xs):
        col = np.where(m[:, x] > 0)[0]
        top[x], bot[x] = col.min(), col.max()
    valid = top >= 0
    idx = np.where(valid)[0]
    k = 41
    def med(a):
        b = a.copy()
        v = a[idx]
        pad = np.pad(v, k // 2, mode="edge")
        sm = np.array([np.median(pad[i:i + k]) for i in range(len(v))])
        b[idx] = sm
        return b
    # só alisa o miolo (as pontas têm curvas legítimas)
    t2, b2 = med(top), med(bot)
    keep = (idx > idx.min() + 12) & (idx < idx.max() - 330)
    top[idx[keep]] = t2[idx[keep]]
    bot[idx[keep]] = b2[idx[keep]]
    # zona onde estava a anilha: contorno por interpolação linear entre as pontas limpas
    cL, cR = int((3690 - X0) * sc), int((4465 - X0) * sc)
    for arr in (top, bot):
        a0 = np.median(arr[cL - 40:cL - 6])
        a1 = np.median(arr[cR + 6:cR + 40])
        xs_ = np.arange(cL, cR + 1)
        arr[cL:cR + 1] = a0 + (a1 - a0) * (xs_ - cL) / (cR - cL)
    m2 = np.zeros_like(m)
    for x in idx:
        m2[int(round(top[x])): int(round(bot[x])) + 1, x] = 1
    # para a zona da ponta mantém a máscara original
    tipzone = np.zeros_like(m)
    tipzone[:, idx.max() - 330:] = 1
    m2 = np.where(tipzone > 0, m, m2).astype(np.uint8)
    # a escala completa
    full = np.zeros(im.shape[:2], np.uint8)
    big = cv2.resize(m2 * 255, (X1 - X0, Y1 - Y0), interpolation=cv2.INTER_CUBIC)
    full[Y0:Y1, X0:X1] = big
    full = cv2.GaussianBlur(full, (0, 0), 2.2)
    full = cv2.erode((full > 150).astype(np.uint8) * 255, np.ones((5, 5), np.uint8))   # tira o halo do fundo
    alpha = cv2.GaussianBlur(full, (0, 0), 1.6)
    ys, xs = np.where(alpha > 20)
    pad = 24
    box = (xs.min() - pad, ys.min() - pad, xs.max() + pad, ys.max() + pad)
    rgba = np.dstack([cv2.cvtColor(im, cv2.COLOR_BGR2RGB), alpha])
    return rgba[box[1]:box[3], box[0]:box[2]]


# ─────────────────────────────── 3. cor
def grade(rgb, hue=0.0, sat=1.0, gamma=1.0, gain=1.0, warm=(1, 1, 1)):
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 0] = (hsv[..., 0] + hue) % 180
    hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 255)
    v = (hsv[..., 2] / 255) ** gamma * gain
    hsv[..., 2] = np.clip(v, 0, 1) * 255
    out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
    out *= np.array(warm, np.float32)
    return np.clip(out, 0, 255).astype(np.uint8)


def save_rgba(arr, name, width):
    im = Image.fromarray(arr, "RGBA")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".webp"), quality=90, alpha_quality=100, method=6)
    sm = im.resize((1200, round(1200 * im.height / im.width)), Image.LANCZOS)
    sm.save(os.path.join(OUT, name + "-sm.webp"), quality=86, alpha_quality=100, method=6)
    print("  ->", name, im.size)


# ─────────────────────────────── 4. recortes macro e fecho
def crop_save(im, box, size, name, sharpen=0.7, grain=2.2, q=82, sm_w=900):
    x, y, w, h = box
    c = Image.fromarray(cv2.cvtColor(im[y:y + h, x:x + w], cv2.COLOR_BGR2RGB)).resize(size, Image.LANCZOS)
    a = np.asarray(c).astype(np.float32)
    blur = cv2.GaussianBlur(a, (0, 0), 1.4)
    a = a + sharpen * (a - blur)
    if grain:
        rng = np.random.default_rng(3)
        a += cv2.GaussianBlur(rng.standard_normal(a.shape[:2]).astype(np.float32), (0, 0), 0.7)[..., None] * grain
    c = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    os.makedirs(OUT, exist_ok=True)
    c.save(os.path.join(OUT, name + ".webp"), quality=q, method=6)
    sm = c.resize((sm_w, round(sm_w * c.height / c.width)), Image.LANCZOS)
    sm.save(os.path.join(OUT, name + "-sm.webp"), quality=78, method=6)
    print("  ->", name, c.size)


def main():
    os.makedirs(OUT, exist_ok=True)
    im = cv2.imread(SRC)
    print("a remover a anilha …")
    clean = remove_band(im)
    print("a recortar …")
    rgba = cutout(clean)
    rgba = rgba[:, ::-1].copy()  # pé (extremo plano) à direita, cabeça pontiaguda à esquerda
    rgb, a = rgba[..., :3], rgba[..., 3]
    variants = {
        "cut-hero": grade(rgb, 0, 1.0, 0.92, 1.05),
        "cut-claro": grade(rgb, 6, 0.72, 0.58, 1.08, (1.0, 0.97, 0.88)),
        "cut-ambar": grade(rgb, 0, 1.12, 0.8, 1.02, (1.04, 0.99, 0.95)),
        "cut-noite": grade(rgb, 0, 0.85, 1.15, 0.92),
    }
    for n, v in variants.items():
        save_rgba(np.dstack([v, a]), n, 2400)
    print("a gerar macros …")
    # 4:5 e 16:10 a partir da foto sem anilha (alta resolução)
    crop_save(clean, (1750, 1735, 928, 580), (2000, 1250), "folha")             # íris (paisagem)
    crop_save(clean, (2880, 1730, 464, 580), (1000, 1250), "hero-lit")           # ofício I  (fissura da folha)
    crop_save(clean, (880, 1730, 464, 580), (1000, 1250), "estrutura")           # ofício II (extremo cortado)
    crop_save(clean, (4830, 1710, 464, 580), (1000, 1250), "acabamento")         # ofício III (ponta)
    crop_save(clean, (0, 484, 6144, 3072), (2560, 1280), "fecho", sharpen=0.4, grain=1.6, sm_w=1000)
    # a versão "-m" do hero-lit só existe por compatibilidade com o config antigo
    import shutil
    shutil.copy(os.path.join(OUT, "hero-lit.webp"), os.path.join(OUT, "hero-lit-m.webp"))
    # versão vertical da folha para telemóvel (corte mais fechado)
    crop_save(clean, (2150, 1735, 464, 580), (900, 1125), "folha-m", q=80)
    os.replace(os.path.join(OUT, "folha-m.webp"), os.path.join(OUT, "folha-sm.webp"))
    os.remove(os.path.join(OUT, "folha-m-sm.webp"))


if __name__ == "__main__":
    main()
