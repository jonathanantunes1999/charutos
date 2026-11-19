/**
 * ─────────────────────────────────────────────────────────────
 *  CASA VÉU · ficheiro único de configuração
 * ─────────────────────────────────────────────────────────────
 *  Nome, textos, produtos e caminhos das imagens.
 *  Imagens: ficheiros em /public/images (caminhos relativos a /public).
 *  `srcSm` = versão leve (≈900–1200 px) para ecrãs pequenos.
 *
 *  Dois tipos de imagem:
 *   · RECORTES (cut-*.webp): charuto inteiro com fundo transparente.
 *   · FOTOGRAFIAS (hero-lit, estrutura, …): macro com fundo.
 * ─────────────────────────────────────────────────────────────
 */

export type Img = { src: string; srcSm?: string; alt: string };

export type Product = {
  id: string;
  name: string;
  profile: "Suave" | "Médio" | "Intenso";
  /** palavra gigante atrás do charuto */
  word: string;
  intensity: 1 | 2 | 3;
  line: string;
  notes: string[];
  details: { label: string; value: string }[];
  /** cores da secção quando este charuto está selecionado */
  theme: { bg: string; glow: string };
  cutout: Img;
};

export const site = {
  brand: {
    /** Nome de trabalho. Troca aqui e o wordmark, o título da página e o rodapé acompanham. */
    first: "CASA",
    second: "VÉU",
    get full() {
      return `${this.first} ${this.second}`;
    },
  },

  nav: [
    { label: "Coleção", href: "#colecao" },
    { label: "O ofício", href: "#oficio" },
  ],

  hero: {
    titleLines: ["O detalhe", "revela-se", "devagar."],
    cta: { label: "Descobrir a coleção", href: "#colecao" },
    cutout: {
      src: "images/cut-hero.webp",
      srcSm: "images/cut-hero-sm.webp",
      alt: "Charuto torpedo de capa escura e castanha, com textura de folha visível, em diagonal sobre fundo escuro.",
    } satisfies Img,
  },

  collection: {
    id: "colecao",
    title: "Três perfis. Escolhe um.",
    disclaimer: "Perfis e notas ilustrativos, para apresentação do conceito.",
    intensityLabel: "Intensidade",
    products: [
      {
        id: "claro",
        name: "Véu Claro",
        profile: "Suave",
        word: "SUAVE",
        intensity: 1,
        line: "Abre devagar, sem pressa e sem peso.",
        notes: ["Mel claro", "Cedro", "Amêndoa tostada"],
        details: [
          { label: "Capa", value: "Dourado claro, veia fina" },
          { label: "Corpo", value: "Leve" },
          { label: "Formato", value: "Robusto" },
          { label: "Momento", value: "Fim de tarde" },
        ],
        theme: { bg: "#14241b", glow: "#3d7556" },
        cutout: {
          src: "images/cut-claro.webp",
          srcSm: "images/cut-claro-sm.webp",
          alt: "Charuto torpedo de capa dourada clara, inteiro, com a ponta à esquerda.",
        },
      },
      {
        id: "ambar",
        name: "Véu Âmbar",
        profile: "Médio",
        word: "MÉDIO",
        intensity: 2,
        line: "Equilíbrio entre doçura e carácter.",
        notes: ["Cacau", "Couro", "Especiarias doces"],
        details: [
          { label: "Capa", value: "Castanho avermelhado" },
          { label: "Corpo", value: "Médio" },
          { label: "Formato", value: "Toro" },
          { label: "Momento", value: "Depois de jantar" },
        ],
        theme: { bg: "#7c2f14", glow: "#e0742f" },
        cutout: {
          src: "images/cut-ambar.webp",
          srcSm: "images/cut-ambar-sm.webp",
          alt: "Charuto torpedo de capa castanha avermelhada, inteiro, com textura visível.",
        },
      },
      {
        id: "noite",
        name: "Véu Noite",
        profile: "Intenso",
        word: "INTENSO",
        intensity: 3,
        line: "Escuro, denso e demorado.",
        notes: ["Café negro", "Madeira queimada", "Pimenta"],
        details: [
          { label: "Capa", value: "Quase negra, oleosa" },
          { label: "Corpo", value: "Pleno" },
          { label: "Formato", value: "Gordo" },
          { label: "Momento", value: "Noite longa" },
        ],
        theme: { bg: "#13070a", glow: "#7a2430" },
        cutout: {
          src: "images/cut-noite.webp",
          srcSm: "images/cut-noite-sm.webp",
          alt: "Charuto torpedo de capa quase negra, inteiro.",
        },
      },
    ] satisfies Product[],
  },

  craft: {
    id: "oficio",
    title: "O ofício",
    intro: "Um charuto é feito de camadas. Cada uma tem um trabalho.",
    steps: [
      {
        title: "A folha",
        text: "A capa é a folha que se vê e se toca. Procura-se uma superfície elástica, de tom uniforme e veias finas. É a primeira leitura do charuto.",
        image: {
          src: "images/hero-lit.webp",
          srcSm: "images/hero-lit-m.webp",
          alt: "Macro da capa de um charuto, com uma fissura na folha e a transição do escuro para o cobre.",
        } satisfies Img,
        focus: "50% 50%",
      },
      {
        title: "A construção",
        text: "Folhas de enchimento dispostas para o ar passar, unidas por uma folha de ligação. Por dentro, o charuto é um desenho de camadas.",
        image: {
          src: "images/estrutura.webp",
          srcSm: "images/estrutura-sm.webp",
          alt: "Macro do extremo cortado de um charuto, onde a capa se dobra sobre o corpo.",
        } satisfies Img,
        focus: "50% 50%",
      },
      {
        title: "O acabamento",
        text: "A capa enrola-se em espiral, a cabeça fecha-se e o charuto descansa até estar pronto. Aqui, o detalhe é quase todo à vista.",
        image: {
          src: "images/acabamento.webp",
          srcSm: "images/acabamento-sm.webp",
          alt: "Macro da ponta pontiaguda de um charuto torpedo.",
        } satisfies Img,
        focus: "50% 50%",
      },
    ],
    note: "Descrição geral do ofício. Os processos próprios da marca entram quando houver materiais oficiais.",
  },

  closing: {
    image: {
      src: "images/fecho.webp",
      srcSm: "images/fecho-sm.webp",
      alt: "Charuto torpedo pousado sobre um copo de bebida escura, vista de cima, em madeira escura.",
    } satisfies Img,
    line: "O detalhe revela-se devagar.",
    toTop: { label: "Voltar ao topo", href: "#topo" },
  },

  footer: {
    concept: "Conceito visual para apresentação",
    legal: "Conteúdo ilustrativo. Destinado a maiores de 18 anos.",
  },
};
