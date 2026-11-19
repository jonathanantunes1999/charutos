/**
 * ─────────────────────────────────────────────────────────────
 *  CASA VÉU · ficheiro único de configuração
 * ─────────────────────────────────────────────────────────────
 *  Aqui mora tudo o que muda quando chegarem os materiais oficiais:
 *  nome, textos, produtos e caminhos das imagens.
 *
 *  Imagens: ficheiros em /public/images. Os caminhos são relativos a
 *  /public (sem barra inicial). Para trocar uma fotografia, substitui o
 *  ficheiro mantendo o nome, ou altera o caminho aqui.
 *  `srcSm` é a versão leve (≈900 px) usada em ecrãs pequenos.
 * ─────────────────────────────────────────────────────────────
 */

export type Img = { src: string; srcSm?: string; alt: string };

export type Product = {
  id: string;
  number: string;
  name: string;
  profile: "Suave" | "Médio" | "Intenso";
  /** 1–3, alimenta o medidor de intensidade */
  intensity: 1 | 2 | 3;
  line: string;
  notes: string[];
  details: { label: string; value: string }[];
  image: Img;
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
    /** palavra(s) da última linha a pôr em itálico */
    lede: "Folha, ligação e capa, vistos de muito perto.",
    cta: { label: "Descobrir a coleção", href: "#colecao" },
    scrollCue: "Scroll",
    /** O mesmo charuto em duas luzes: sombra → luz aberta (usadas na transição por scroll). */
    images: {
      dark: {
        src: "images/hero.webp",
        srcSm: "images/hero-m.webp",
        alt: "Charuto em macro, parcialmente na sombra, com a textura da capa a ganhar relevo sob luz lateral.",
      },
      lit: {
        src: "images/hero-lit.webp",
        srcSm: "images/hero-lit-m.webp",
        alt: "O mesmo charuto sob luz aberta: veias, relevo e tom da folha de capa.",
      },
    },
  },

  reveal: {
    beats: [
      { kicker: "01 — Aproximar", text: "Chega mais perto." },
      { kicker: "02 — A capa", text: "Cada veia é um caminho. Cada reflexo, uma pista." },
      { kicker: "03 — A luz", text: "A folha só se mostra a quem lhe dá tempo." },
    ],
  },

  collection: {
    id: "colecao",
    kicker: "02 — Coleção",
    title: ["Três perfis.", "Uma só folha de atenção."],
    intro: "Do mais leve ao mais denso. Escolhe um e vê o que cada um guarda.",
    disclaimer: "Perfis e notas ilustrativos, para apresentação do conceito.",
    intensityLabel: "Intensidade",
    products: [
      {
        id: "claro",
        number: "01",
        name: "Véu Claro",
        profile: "Suave",
        intensity: 1,
        line: "Abre devagar, sem pressa e sem peso.",
        notes: ["Mel claro", "Cedro", "Amêndoa tostada"],
        details: [
          { label: "Capa", value: "Dourado claro, veia fina" },
          { label: "Corpo", value: "Leve" },
          { label: "Formato", value: "Robusto" },
          { label: "Momento", value: "Fim de tarde" },
        ],
        image: {
          src: "images/suave.webp",
          srcSm: "images/suave-sm.webp",
          alt: "Charuto de capa dourada clara em macro, com veias finas e o pé do charuto à vista.",
        },
      },
      {
        id: "ambar",
        number: "02",
        name: "Véu Âmbar",
        profile: "Médio",
        intensity: 2,
        line: "Equilíbrio entre doçura e carácter.",
        notes: ["Cacau", "Couro", "Especiarias doces"],
        details: [
          { label: "Capa", value: "Castanho avermelhado" },
          { label: "Corpo", value: "Médio" },
          { label: "Formato", value: "Toro" },
          { label: "Momento", value: "Depois de jantar" },
        ],
        image: {
          src: "images/medio.webp",
          srcSm: "images/medio-sm.webp",
          alt: "Charuto de capa castanha avermelhada em macro, com relevo e veias visíveis sob luz lateral.",
        },
      },
      {
        id: "noite",
        number: "03",
        name: "Véu Noite",
        profile: "Intenso",
        intensity: 3,
        line: "Escuro, denso e demorado.",
        notes: ["Café negro", "Madeira queimada", "Pimenta"],
        details: [
          { label: "Capa", value: "Quase negra, oleosa" },
          { label: "Corpo", value: "Pleno" },
          { label: "Formato", value: "Gordo" },
          { label: "Momento", value: "Noite longa" },
        ],
        image: {
          src: "images/intenso.webp",
          srcSm: "images/intenso-sm.webp",
          alt: "Charuto de capa quase negra em macro, com brilho discreto nas veias.",
        },
      },
    ] satisfies Product[],
  },

  craft: {
    id: "oficio",
    kicker: "03 — O ofício",
    title: ["Folha,", "construção,", "acabamento."],
    intro: "Um charuto é feito de camadas. Cada uma tem um trabalho.",
    steps: [
      {
        number: "I",
        title: "A folha",
        text: "A capa é a folha que se vê e se toca. Procura-se uma superfície elástica, de tom uniforme e veias finas. É a primeira leitura do charuto.",
        image: {
          src: "images/folha.webp",
          srcSm: "images/folha-sm.webp",
          alt: "Detalhe de uma folha de tabaco sob luz rasante, com veias e relevo em evidência.",
        },
      },
      {
        number: "II",
        title: "A construção",
        text: "Folhas de enchimento dispostas para o ar passar, unidas por uma folha de ligação. Por dentro, o charuto é um desenho de camadas.",
        image: {
          src: "images/estrutura.webp",
          srcSm: "images/estrutura-sm.webp",
          alt: "Macro do pé de um charuto, onde se distinguem o enchimento, a ligação e a capa.",
        },
      },
      {
        number: "III",
        title: "O acabamento",
        text: "A capa enrola-se em espiral, a cabeça fecha-se e o charuto descansa até estar pronto. Aqui, o detalhe é quase todo à vista.",
        image: {
          src: "images/acabamento.webp",
          srcSm: "images/acabamento-sm.webp",
          alt: "Macro da costura em espiral da capa de um charuto.",
        },
      },
    ],
    note: "Descrição geral do ofício. Os processos próprios da marca entram quando houver materiais oficiais.",
  },

  closing: {
    image: {
      src: "images/fecho.webp",
      srcSm: "images/fecho-sm.webp",
      alt: "Charuto pousado numa superfície escura, com reflexo suave e luz lateral.",
    },
    line: "O detalhe revela-se devagar.",
    toTop: { label: "Voltar ao topo", href: "#topo" },
  },

  footer: {
    concept: "Conceito visual para apresentação",
    legal: "Conteúdo ilustrativo. Destinado a maiores de 18 anos.",
  },
};
