import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "./config/site.config";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Collection } from "./components/Collection";
import { Craft } from "./components/Craft";
import { Closing } from "./components/Closing";
import { Orders } from "./components/Orders";
import { useReveal } from "./components/useReveal";

/** Rotas por hash (funciona no GitHub Pages): "#/encomendas?perfil=ambar" → página de encomendas. */
function parse(hash: string) {
  if (hash.startsWith("#/encomendas")) {
    const q = new URLSearchParams(hash.split("?")[1] ?? "");
    return { page: "orders" as const, profile: q.get("perfil") };
  }
  return { page: "home" as const, profile: null };
}

function Home() {
  useReveal();
  const [active, setActive] = useState(0);
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    // ao voltar da página de encomendas, vai para a secção pedida
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          document.getElementById(id)?.scrollIntoView();
        }),
      );
    }
    return () => window.removeEventListener("load", refresh);
  }, []);
  return (
    <main>
      <Hero profile={active} />
      <Collection active={active} onChange={setActive} />
      <Craft />
      <Closing />
    </main>
  );
}

export default function App() {
  const [route, setRoute] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const on = () => {
      const next = parse(window.location.hash);
      setRoute((r) => {
        if (next.page === "orders") window.scrollTo({ top: 0, behavior: "auto" });
        return r.page === next.page && r.profile === next.profile ? r : next;
      });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  useEffect(() => {
    document.title =
      route.page === "orders"
        ? `${site.orders.title} — ${site.brand.full}`
        : `${site.brand.full} — ${site.hero.titleLines.join(" ")}`;
  }, [route.page]);

  return (
    <>
      <a className="skip" href={route.page === "orders" ? "#conteudo" : "#colecao"}>
        Saltar para o conteúdo
      </a>
      <Header />
      {route.page === "orders" ? <Orders profile={route.profile} /> : <Home />}
    </>
  );
}
