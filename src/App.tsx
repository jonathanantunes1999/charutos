import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "./config/site.config";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Leaf } from "./components/Leaf";
import { Collection } from "./components/Collection";
import { Craft } from "./components/Craft";
import { Closing } from "./components/Closing";
import { useReveal } from "./components/useReveal";

export default function App() {
  useReveal();

  useEffect(() => {
    document.title = `${site.brand.full} — ${site.hero.titleLines.join(" ")}`;
    // Fontes e imagens mudam alturas: recalcula os pontos do scroll.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <>
      <a className="skip" href="#colecao">
        Saltar para a coleção
      </a>
      <Header />
      <main>
        <Hero />
        <Leaf />
        <Collection />
        <Craft />
        <Closing />
      </main>
    </>
  );
}
