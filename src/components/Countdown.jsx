import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import marcobottom from "../assets/marcobottom.png";

function getTimeLeft(targetDate) {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0 };

  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

const UNIDADES = [
  { key: "dias", label: "Días" },
  { key: "horas", label: "Horas" },
  { key: "minutos", label: "Minutos" },
  { key: "segundos", label: "Segundos" },
];

export default function Countdown({ fechaBoda }) {
  const target = new Date(`${fechaBoda}T16:00:00`);
  const [tiempo, setTiempo] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const timer = setInterval(() => setTiempo(getTimeLeft(target)), 1000);
    return () => clearInterval(timer);
  }, [fechaBoda]);

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {/* <div
              className="absolute top-0 left-0 z-20 w-full bg-blush-dark/20 [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]"
              // style={{ clipPath: PICADO_CLIP_PATH }}
            >
              <img
                src={marcobottom}
                alt=""
                className="mx-auto w-full max-w-2xl rotate-180 select-none"
              />
            </div> */}
      {UNIDADES.map((u, i) => (
        <motion.div
          key={u.key}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-terracotta/30 bg-white/60 sm:h-24 sm:w-24"
        >
          <span className="font-serif text-2xl text-terracotta sm:text-3xl">
            {String(tiempo[u.key]).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] tracking-widest text-charcoal/60 uppercase">
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
