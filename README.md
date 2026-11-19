# CASA VÉU — conceito visual (homepage)

Proposta visual para uma marca de charutos. **CASA VÉU** é um nome de trabalho; tudo é ilustrativo.

## Correr

```bash
npm install
npm run dev        # desenvolvimento → http://localhost:5173
npm run build      # build de produção em dist/
npm run preview    # servir a build → http://localhost:4173
```

A build usa caminhos relativos (`base: "./"`): `dist/` pode ir para qualquer pasta ou domínio.

## Trocar nome, textos, produtos e imagens

Tudo está em **`src/config/site.config.ts`**:

| O quê | Onde no ficheiro |
| --- | --- |
| Nome / wordmark | `brand.first` e `brand.second` (o título da página acompanha) |
| Logótipo real | substituir `src/components/Wordmark.tsx` por um `<svg>` |
| Título, subtítulo e CTA do hero | `hero` |
| Frases da transição por scroll | `reveal.beats` |
| Três charutos (nome, perfil, notas, detalhes, foto) | `collection.products` |
| Secção O ofício | `craft` |
| Fecho e rodapé | `closing`, `footer` |

As imagens ficam em `public/images/`. Troca o ficheiro mantendo o nome, ou muda o caminho no config.
Cada imagem tem `src` (grande) e `srcSm` (≈900 px, para telemóvel).

## Imagens — estado atual

**Não são fotografias.** Foram geradas proceduralmente por `scripts/generate_images.py`
(folha de tabaco, veias, luz lateral, profundidade de campo, grão) para validar direção de arte e
composição. Não há fontes externas nem direitos de terceiros. São placeholders: devem ser substituídos
por fotografia real (ou geração por IA) com a mesma intenção de enquadramento.

| Ficheiro | Formato | Papel |
| --- | --- | --- |
| `hero.webp` / `hero-m.webp` | 16:9 / 9:16 | Hero, charuto em macro na sombra |
| `hero-lit.webp` / `hero-lit-m.webp` | idem | **Mesmo enquadramento**, luz aberta (revelação por scroll) |
| `suave.webp`, `medio.webp`, `intenso.webp` (+ `-sm`) | 4:5 / 10:7 / 4:5 | Os três charutos |
| `folha.webp`, `estrutura.webp`, `acabamento.webp` (+ `-sm`) | 4:5 / 4:3 / 4:3 | O ofício |
| `fecho.webp` (+ `-sm`) | 2:1 | Fecho |

Dica: o par `hero` / `hero-lit` tem de ter exatamente o mesmo enquadramento (o crossfade depende disso).
O ponto de aproximação está em `src/components/Opening.tsx` (`origin`, `scale`).

Regenerar os placeholders: `pip install numpy scipy pillow && python3 scripts/generate_images.py [nome …]`.

## Notas

- Respeita `prefers-reduced-motion`: sem pin/zoom; a imagem iluminada e as frases aparecem como bloco estático.
- O scroll é sempre o nativo (palco `position: sticky`, GSAP ScrollTrigger só lê o progresso).
- Mobile tem layout próprio e transição mais curta (235svh em vez de 330svh).
- Publicidade a tabaco é muito restrita em Portugal/UE: validar legalmente antes de publicar.
