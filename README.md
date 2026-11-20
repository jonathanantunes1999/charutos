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

1. **Hero** — palavra gigante atrás, charuto recortado a cruzar o ecrã (parallax com o rato) e poeira dourada discreta.
2. **Transição** — ao fazer scroll, o charuto do hero viaja e pousa exatamente no charuto da coleção (pose calculada a cada fotograma, sem duplicar silhuetas).
3. **Coleção** — a secção fica fixa no ecrã e o **scroll percorre os três perfis** (desce: Claro → Âmbar → Noite; sobe: o contrário), cada um com a sua cor, palavra gigante, charuto e painel. Abas, teclado (setas, Home, End) e, no telemóvel, deslizar sobre o charuto movem o scroll para o perfil escolhido. Com movimento reduzido ou ecrã muito baixo (< 561 px), fica estática e navega-se só pelas abas. Cada perfil tem "Mais informação" → encomendas. (Duração: `180svh` em `.coll-pin--on`, 60svh por perfil.)
4. **O ofício** — papel marfim; em desktop, pista horizontal fixada ao scroll; em mobile, coluna.
5. **Fecho** — wordmark gigante, fotografia e "Voltar ao topo".
6. **Encomendas** (`#/encomendas?perfil=…`) — pedido de encomenda de conceito.

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

- `prefers-reduced-motion`: sem viagem do charuto, pin nem poeira; as frases e imagens aparecem como blocos estáticos e a pista do ofício passa a coluna.
- O scroll é sempre o nativo (`sticky`/pin do ScrollTrigger; nunca se sequestra o scroll).
- Publicidade a tabaco é muito restrita em Portugal/UE: validar legalmente antes de publicar.

- **Encomendas** (`#/encomendas?perfil=claro|ambar|noite`): rota por hash (funciona no GitHub Pages). É um *pedido de encomenda* de conceito: valida o formulário e mostra confirmação, **não envia dados nem processa pagamentos**. Para o tornar real, ligar o `onSubmit` em `src/components/Orders.tsx` a um serviço de formulários/email. Texto em `site.orders`.

## Estado de qualidade (auditoria)

- `axe-core` (WCAG 2.1 AA + boas práticas) sem violações em 22 estados: topo, a meio da viagem, os 3 perfis, ofício, fecho, as 3 páginas de encomenda e a confirmação, em desktop e mobile.
- Sem deslocamento horizontal nem texto cortado de 320 a 2560 px; alvos de toque ≥ 44 px no mobile.
- Ordem de teclado correta; foco visível; ligação "Saltar para o conteúdo".
- O site tem `noindex` (conceito de apresentação, não deve ser indexado).
- Falta testar em dispositivos reais (só Chromium emulado), e em Safari/Firefox.
