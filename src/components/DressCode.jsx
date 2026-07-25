import { Shirt } from "lucide-react";
import Reveal from "./Reveal";

export default function DressCode({ texto }) {
  return (
    <section className="bg-blush-dark px-6 py-24">
      <Reveal className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-terracotta/30 bg-blush">
          <Shirt size={22} className="text-terracotta" />
        </span>
        <p className="mt-6 font-sans text-xs tracking-[0.3em] text-terracotta uppercase">
          Código de vestimenta
        </p>
        <h2 className="mt-3 font-serif text-4xl text-charcoal">Formal</h2>
        <p className="mt-5 font-sans text-sm leading-relaxed text-charcoal/70">{texto}</p>
      </Reveal>
    </section>
  );
}
