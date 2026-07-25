import { Gift } from "lucide-react";
import Reveal from "./Reveal";

export default function Regalos({ texto }) {
  const enlaceMatch = texto.match(/\[([^\]]+)\]/);
  const enlaceLabel = enlaceMatch ? enlaceMatch[1] : "Mesa de regalos";
  const textoSinEnlace = texto.replace(/\[[^\]]+\]\.?/, "").trim();

  return (
    <section id="regalos" className="bg-blush px-6 py-24">
      <Reveal className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-terracotta/30 bg-blush-dark">
          <Gift size={22} className="text-terracotta" />
        </span>
        <p className="mt-6 font-sans text-xs tracking-[0.3em] text-terracotta uppercase">
          Mesa de regalos
        </p>
        <h2 className="mt-3 font-serif text-4xl text-charcoal">Un detalle para ustedes</h2>
        <p className="mt-5 font-sans text-sm leading-relaxed text-charcoal/70">{textoSinEnlace}</p>
        <a
          href="#"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-xs tracking-wide text-white uppercase transition-opacity hover:opacity-90"
        >
          <Gift size={14} /> {enlaceLabel}
        </a>
      </Reveal>
    </section>
  );
}
