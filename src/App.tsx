import { useEffect } from "react";
import { site } from "./config/site.config";
import { Header } from "./components/Header";
import { Opening } from "./components/Opening";
import { Collection } from "./components/Collection";
import { Craft } from "./components/Craft";
import { Closing } from "./components/Closing";
import { useReveal } from "./components/useReveal";

export default function App() {
  useReveal();

  // O título do separador acompanha o nome configurado.
  useEffect(() => {
    document.title = `${site.brand.full} — ${site.hero.titleLines.join(" ")}`;
  }, []);

  return (
    <>
      <a className="skip" href="#colecao">
        Saltar para a coleção
      </a>
      <Header />
      <main>
        <Opening />
        <Collection />
        <Craft />
        <Closing />
      </main>
    </>
  );
}
