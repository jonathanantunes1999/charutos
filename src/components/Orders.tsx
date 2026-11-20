import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { site } from "../config/site.config";
import { Picture } from "./Picture";
import { TextLink } from "./TextLink";

/** Pedido de encomenda (conceito): valida e mostra confirmação; não envia nada. */
export function Orders({ profile }: { profile: string | null }) {
  const { orders: o, collection: c } = site;
  const start = Math.max(0, c.products.findIndex((p) => p.id === profile));
  const [active, setActive] = useState(start);
  const [sent, setSent] = useState(false);
  const done = useRef<HTMLHeadingElement>(null);
  const p = c.products[active];

  useEffect(() => setActive(start), [start]);
  useEffect(() => {
    if (sent) done.current?.focus();
  }, [sent]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // conceito: nada é enviado
    setSent(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <main
      id="conteudo"
      className="order"
      style={{ ["--bg" as string]: p.theme.bg, ["--glow" as string]: p.theme.glow } as CSSProperties}
    >
      <div className="order__wrap">
        <TextLink href={o.back.href} label={o.back.label} className="order__back" arrow="right" />

        <div className="order__grid">
          <div className="order__visual" aria-hidden={false}>
            <div className="order__halo" aria-hidden="true" />
            <div className="order__cigar" key={p.id}>
              <Picture img={p.cutout} smallBelow={900} eager />
            </div>
            <div className="order__caption">
              <h2>{p.name}</h2>
              <p>{p.line}</p>
              <ul aria-label="Notas">
                {p.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="order__panel">
            <h1 className="order__title">{o.title}</h1>
            <p className="order__intro">{o.intro}</p>

            {sent ? (
              <div className="order__done" role="status">
                <h2 tabIndex={-1} ref={done}>
                  {o.success.title}
                </h2>
                <p>{o.success.text}</p>
                <button type="button" className="tlink" onClick={() => setSent(false)}>
                  <span>{o.success.again}</span>
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={onSubmit}>
                <fieldset className="form__profiles">
                  <legend>{o.fields.profile}</legend>
                  {c.products.map((pr, i) => (
                    <label key={pr.id} className={`pill${i === active ? " is-on" : ""}`}>
                      <input type="radio" name="perfil" value={pr.id} checked={i === active} onChange={() => setActive(i)} />
                      <span>{pr.name}</span>
                    </label>
                  ))}
                </fieldset>

                <div className="field">
                  <label htmlFor="f-q">{o.fields.quantity}</label>
                  <input id="f-q" name="quantidade" type="number" min={1} max={100} defaultValue={1} required inputMode="numeric" />
                </div>
                <div className="field">
                  <label htmlFor="f-n">{o.fields.name}</label>
                  <input id="f-n" name="nome" type="text" autoComplete="name" required />
                </div>
                <div className="field">
                  <label htmlFor="f-e">{o.fields.email}</label>
                  <input id="f-e" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="field">
                  <label htmlFor="f-t">{o.fields.phone}</label>
                  <input id="f-t" name="telefone" type="tel" autoComplete="tel" />
                </div>
                <div className="field">
                  <label htmlFor="f-m">{o.fields.message}</label>
                  <textarea id="f-m" name="mensagem" rows={3} />
                </div>
                <label className="check">
                  <input type="checkbox" name="maior" required />
                  <span>{o.fields.adult}</span>
                </label>

                <button type="submit" className="submit">
                  {o.submit}
                </button>
              </form>
            )}
            <p className="order__note">{o.disclaimer}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
