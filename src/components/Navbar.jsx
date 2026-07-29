import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "historia", label: "Historia" },
  { id: "evento", label: "Evento" },
  { id: "itinerario", label: "Itinerario" },
  { id: "regalos", label: "Regalos" },
  { id: "rsvp", label: "RSVP" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("inicio");
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      setVisible(heroBottom <= 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      // className={`fixed top-0 left-0 z-50 w-full bg-blush/95 shadow-sm backdrop-blur transition-transform duration-300 ${
      className={`fixed top-0 left-0 z-50 w-full bg-[#CD3F72] shadow-sm backdrop-blur transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* <a href="#inicio" className="font-serif text-lg tracking-wide text-terracotta"> */}
        <a href="#inicio" className="font-serif text-lg tracking-wide text-amber-300">
          A &amp; A
        </a>

        {/* <ul className="hidden gap-8 font-sans text-xs tracking-[0.2em] text-charcoal uppercase md:flex"> */}
        <ul className="hidden gap-8 font-sans text-xs tracking-[0.2em] text-charcoal uppercase md:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} className="transition-colors hover:text-terracotta">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="text-amber-300 md:hidden"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <ul className="flex flex-col gap-4 border-t border-terracotta/10 bg-blush px-6 py-6 font-sans text-sm tracking-[0.2em] text-charcoal uppercase md:hidden">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
