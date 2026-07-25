import { Church, PartyPopper, UtensilsCrossed, Music, Moon } from "lucide-react";
import Reveal from "./Reveal";

const ICONOS = {
  ceremonia: Church,
  recepcion: PartyPopper,
  cena: UtensilsCrossed,
  baile: Music,
  desvelados: Moon,
};

const ETIQUETAS = {
  ceremonia: "Ceremonia",
  recepcion: "Recepción",
  cena: "Cena",
  baile: "Baile",
  desvelados: "Desvelados",
};

export default function Timeline({ itinerario }) {
  const pasos = ["ceremonia", "recepcion", "cena", "baile", "desvelados"];

  return (
    <div className="relative mx-auto max-w-xl">
      <div className="absolute top-2 bottom-2 left-6 w-px bg-terracotta/25" />

      <ol className="flex flex-col gap-10">
        {pasos.map((key, i) => {
          const Icono = ICONOS[key];
          const item = itinerario[key];
          return (
            <Reveal key={key} delay={i * 0.08}>
              <li className="relative flex items-start gap-5 pl-16">
                <span className="absolute left-6 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-terracotta/30 bg-blush">
                  <Icono size={18} className="text-terracotta" />
                </span>
                <div>
                  <h4 className="font-serif text-xl text-charcoal">{ETIQUETAS[key]}</h4>
                  <p className="mt-1 text-xs tracking-widest text-gold uppercase">{item.hora}</p>
                  <p className="mt-1 text-sm text-charcoal/70">{item.lugar}</p>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
