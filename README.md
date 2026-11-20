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
2. **Coleção** — três blocos de cor (verde, terracota, vinho); cada charuto muda cor, palavra gigante, charuto e painel. Teclado (setas, Home, End), toque e, no telemóvel, deslizar o dedo sobre o charuto.
3. **O ofício** — papel marfim; em desktop, pista horizontal fixada ao scroll; em mobile, coluna.
4. **Fecho** — wordmark gigante, imagem e "voltar ao topo".

## Trocar nome, textos, produtos e imagens

Tudo está em **`src/config/site.config.ts`**: nome (`brand`), textos, produtos (nome, perfil, notas, detalhes, **cores do bloco**) e caminhos das imagens.
Logótipo real: substituir `src/components/Wordmark.tsx` por um `<svg>`.

### Imagens (`public/images/`)

Vêm todas de **uma única fotografia** (`assets/source/cigar-unsplash.jpg`, de Fabian Garcia Acevedo, via Unsplash; licença Unsplash), processada por `scripts/process_photo.py`:

1. a **anilha** da marca é removida (reconstrução da capa com a textura do próprio charuto);
2. o charuto é **recortado** com fundo transparente (cabeça à esquerda, pé à direita);
3. os três perfis (`cut-claro`, `cut-ambar`, `cut-noite`) são **o mesmo charuto com correção de cor**, só para validar o conceito; `cut-hero` é o original;
4. os macros (`hero-lit`, `estrutura`, `acabamento`) e o fecho (`fecho`) são recortes da fotografia.

| Tipo | Ficheiros | Notas |
| --- | --- | --- |
| **Recortes** (WebP com transparência) | `cut-hero`, `cut-claro`, `cut-ambar`, `cut-noite` (+ `-sm`) | Charuto **inteiro**, na horizontal, **ponta à esquerda e extremo plano à direita**, fundo transparente. |
| **Macro / fotografia** | `hero-lit`, `estrutura`, `acabamento`, `fecho` | `focus` em `craft.steps` escolhe o ponto de corte. |

Quando houver fotografias oficiais de cada charuto, basta substituir os ficheiros mantendo os nomes (ou alterar os caminhos no config).
Reprocessar: `pip install numpy pillow opencv-python-headless && python3 scripts/process_photo.py [outra-foto.jpg]` (os pontos de reparação e recorte estão ajustados a esta fotografia).

## Notas

- `prefers-reduced-motion`: sem pin/zoom; as frases e imagens aparecem como blocos estáticos e a pista do ofício passa a coluna.
- O scroll é sempre o nativo (`sticky`/pin do ScrollTrigger; nunca se sequestra o scroll).
- Publicidade a tabaco é muito restrita em Portugal/UE: validar legalmente antes de publicar.

- **Encomendas** (`#/encomendas?perfil=claro|ambar|noite`): rota por hash (funciona no GitHub Pages). É um *pedido de encomenda* de conceito: valida o formulário e mostra confirmação, **não envia dados nem processa pagamentos**. Para o tornar real, ligar o `onSubmit` em `src/components/Orders.tsx` a um serviço de formulários/email. Texto em `site.orders`.
