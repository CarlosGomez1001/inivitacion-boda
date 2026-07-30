import dataBoda from "./dataBoda";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Countdown from "./components/Countdown";
import EventCard from "./components/EventCard";
import Timeline from "./components/Timeline";
import Historia from "./components/Historia";
import DressCode from "./components/DressCode";
import Regalos from "./components/Regalos";
import Rsvp from "./components/Rsvp";
import Footer from "./components/Footer";
import Reveal from "./components/Reveal";
import { buildEventDates } from "./utils/eventLinks";
import marcobottom from "./assets/marcobottom.png";

function App({ tokenInvitado }) {
  const { datosGenerales, itinerario } = dataBoda;
  const { nombreNovio, nombreNovia, fechaBoda } = datosGenerales;
  const { ceremonia, recepcion, masInformacion } = itinerario;

  const ceremoniaDates = buildEventDates(fechaBoda, ceremonia.hora);
  const recepcionDates = buildEventDates(fechaBoda, recepcion.hora);

  return (
    <div className="font-sans text-charcoal">
      <Navbar />

      <Hero datosGenerales={datosGenerales} />

      <section className="bg-blush px-1 py-1 text-center">
        <div
          className="z-20 w-full bg-blush-dark/20 "
        // style={{ clipPath: PICADO_CLIP_PATH }}
        >
          <img
            src={marcobottom}
            alt=""
            className="mx-auto w-full max-w-2xl rotate-180 select-none"
          />
        </div>
        <Reveal>
          <p className="font-sans mt-4 text-xs tracking-[0.3em] text-terracotta uppercase">
            Cuenta regresiva
          </p>
          <h2 className="mt-3 mb-10 font-serif text-3xl text-charcoal sm:text-4xl">
            Falta muy poco
          </h2>
        </Reveal>
        <Countdown fechaBoda={fechaBoda} />
      </section>

      <Historia texto={masInformacion.nuestraHistoria} />

      <section id="evento" className="bg-blush-dark px-6 py-24">
        <Reveal className="mx-auto mb-14 max-w-lg text-center">
          <p className="font-sans text-xs tracking-[0.3em] text-terracotta uppercase">
            El gran día
          </p>
          <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">
            Ceremonia &amp; Recepción
          </h2>
        </Reveal>

        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
          <Reveal>
            <EventCard
              titulo="Ceremonia"
              hora={ceremonia.hora}
              lugar={ceremonia.lugar}
              start={ceremoniaDates.start}
              end={ceremoniaDates.end}
              descripcion={`Ceremonia religiosa de ${nombreNovio} & ${nombreNovia}`}
            />
          </Reveal>
          <Reveal delay={0.15}>
            <EventCard
              titulo="Recepción"
              hora={recepcion.hora}
              lugar={recepcion.lugar}
              start={recepcionDates.start}
              end={recepcionDates.end}
              descripcion={`Recepción de la boda de ${nombreNovio} & ${nombreNovia}`}
            />
          </Reveal>
        </div>
      </section>

      <section id="itinerario" className="bg-blush px-6 py-24">
        <Reveal className="mx-auto mb-14 max-w-lg text-center">
          <p className="font-sans text-xs tracking-[0.3em] text-terracotta uppercase">
            Programa
          </p>
          <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Minuto a minuto</h2>
        </Reveal>

        <Timeline itinerario={itinerario} />
      </section>

      <DressCode texto={masInformacion.codigoVestimenta} />

      <Regalos texto={masInformacion.MesaDeRegalos} />

      <Rsvp
        mensaje={masInformacion.mensajeNovios}
        confirmacion={masInformacion.confirmacionAsistencia}
        token={tokenInvitado}
      />

      <Footer nombreNovio={nombreNovio} nombreNovia={nombreNovia} />
    </div>
  );
}

export default App;
