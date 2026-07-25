import Reveal from "./Reveal";

export default function Historia({ texto }) {
  return (
    <section id="historia" className="bg-blush px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-sans text-xs tracking-[0.3em] text-terracotta uppercase">
            Nuestra historia
          </p>
          <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Cómo empezó todo</h2>
          <p className="mt-6 font-sans text-base leading-loose text-charcoal/75">{texto}</p>
        </Reveal>
      </div>
    </section>
  );
}
