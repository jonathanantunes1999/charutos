# CASA VÉU — conceito visual (homepage)

Proposta visual para uma marca de charutos. **CASA VÉU** é um nome de trabalho; tudo é ilustrativo.

## Correr

```bash
npm install
npm run dev          # desenvolvimento → http://localhost:5173
npm run build        # build de produção em dist/
npm run preview      # servir a build → http://localhost:4173
npm run build:pages  # build para docs/ (GitHub Pages: Branch → /docs)
```

A build usa caminhos relativos (`base: "./"`): funciona em qualquer pasta ou domínio.

## Estrutura da página

1. **Hero** — palavra gigante atrás, charuto recortado a cruzar o ecrã (parallax com o rato), fumo e poeira, botão circular com texto a rodar.
2. **A folha** — um círculo abre-se e revela o macro da folha (palco `sticky`, scroll nativo).
3. **Coleção** — três blocos de cor (verde, terracota, vinho); cada charuto muda cor, palavra gigante, charuto e painel. Teclado (setas, Home, End) e toque.
4. **O ofício** — papel marfim; em desktop, pista horizontal fixada ao scroll; em mobile, coluna.
5. **Fecho** — wordmark gigante, imagem e "voltar ao topo".

## Trocar nome, textos, produtos e imagens

Tudo está em **`src/config/site.config.ts`**: nome (`brand`), textos, produtos (nome, perfil, notas, detalhes, **cores do bloco**) e caminhos das imagens.
Logótipo real: substituir `src/components/Wordmark.tsx` por um `<svg>`.

### Imagens (`public/images/`)

**Não são fotografias**: são renders procedurais (`scripts/generate_images.py`), sem direitos de terceiros. São placeholders.

| Tipo | Ficheiros | Notas |
| --- | --- | --- |
| **Recortes** (PNG/WebP com transparência) | `cut-hero`, `cut-claro`, `cut-ambar`, `cut-noite` (+ `-sm`) | Charuto **inteiro**, na horizontal, **cabeça à esquerda e pé à direita**, fundo transparente, ≈ 2400×450. Quanto mais o recorte for limpo, melhor. |
| **Macro** | `folha`, `hero-lit`, `estrutura`, `acabamento`, `fecho` (+ `-sm`) | Fotografias com fundo. `focus` em `craft.steps` escolhe o ponto de corte. |

Com fotografias reais, o ideal é fotografar cada charuto isolado em fundo liso (ou recortar) e exportar WebP com transparência.

Regenerar placeholders: `pip install numpy scipy pillow && python3 scripts/generate_images.py [nome …]`.

## Notas

- `prefers-reduced-motion`: sem pin/zoom/iris/fumo; as frases e imagens aparecem como blocos estáticos e a pista do ofício passa a coluna.
- O scroll é sempre o nativo (`sticky`/pin do ScrollTrigger; nunca se sequestra o scroll).
- Publicidade a tabaco é muito restrita em Portugal/UE: validar legalmente antes de publicar.
