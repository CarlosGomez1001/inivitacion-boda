import { motion } from "framer-motion";
import { formatFechaLarga } from "../utils/formatDate";
// import fondoNovios from "../assets/Principal_novios.png";
import fondoNovios from "../assets/main-image.jpeg";
import marcobottom from "../assets/marcobottom.png";

const PICADO_TEETH = 36;
const PICADO_CLIP_PATH = `polygon(0% 0%, 100% 0%, ${Array.from(
  { length: PICADO_TEETH + 1 },
  (_, i) => `${100 - (i / PICADO_TEETH) * 100}% ${i % 2 === 0 ? 100 : 96}%`
).join(", ")})`;

export default function Hero({ datosGenerales }) {
  const { nombreNovio, nombreNovia, fechaBoda } = datosGenerales;

  return (
    <section
      id="inicio"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-linear-to-b from-blush-dark to-blush px-6 text-center"
    >
      <div
        className="absolute inset-0 bg-cover bg-position-[30%_0px] md:bg-center"
        // className="absolute inset-0 bg-cover bg-right md:bg-center"
        style={{ backgroundImage: `url(${fondoNovios})` }}
      />
      <div className="absolute inset-0 bg-linear-to-t  from-black/70 via-black/20 to-black/10" />
      {/* <div className="absolute inset-0 bg-linear-to-t  from-charcoal/80 via-charcoal/20 to-charcoal/10" /> */}
      {/* <div className="absolute inset-0 bg-terracotta-dark/15 mix-blend-multiply" /> */}
      <div className="absolute inset-0 " />

      <div
        className="absolute top-0 left-0 z-20 w-full bg-blush-dark/90 "
        // style={{ clipPath: PICADO_CLIP_PATH }}
      >
        <img
          src={marcobottom}
          alt=""
          className="mx-auto w-full max-w-2xl rotate-180 select-none"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">


        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          // className="mt-6 font-serif text-5xl leading-tight text-charcoal sm:text-6xl md:text-7xl"
          // className="mt-80 font-parisienne text-6xl leading-tight text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.55)] sm:text-7xl md:text-8xl"
          className="mt-80 font-serif text-5xl leading-tight text-white [text-shadow:0_4px_30px_rgba(0,0,0,0.55)] sm:text-7xl md:text-8xl"
        >
          {nombreNovia}
          <span className="mx-3 text-gold sm:mx-5">&amp;</span>
          {nombreNovio}
        </motion.h1>

        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-8 h-px w-16 bg-gold/70"
        /> */}

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          // className="font-sans text-xs tracking-[0.4em] text-terracotta uppercase"
          // className="font-sans text-xs tracking-[0.4em] text-gold uppercase [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]"
          className="font-sans text-xs tracking-[0.4em] text-amber-300 uppercase [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]"
        >
          Nos casamos 
        </motion.p>
        {/* 
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-8 max-w-md font-sans text-base leading-relaxed text-charcoal/80"
        >
          Te invitan a celebrar con ellos este gran día
        </motion.p> */}

        {/* <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-4 font-serif text-xl text-terracotta capitalize"
        >
          {formatFechaLarga(fechaBoda)}
        </motion.p> */}
      </div>
    </section>
  );
}
