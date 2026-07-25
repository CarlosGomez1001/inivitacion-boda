# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build (output to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint over the whole project

There is no test suite configured in this project.

## Architecture

Single-page React (Vite + SWC) wedding invitation site, styled with Tailwind CSS v4 (via `@tailwindcss/vite`, configured through `@theme` in `src/index.css` rather than a `tailwind.config.js`). All UI text is in Spanish.

**Data-driven content**: `src/dataBoda.js` is the single source of truth for the wedding's content (couple's names, date, ceremony/reception venues, itinerary steps, and the free-text blocks under `masInformacion`). `src/App.jsx` destructures this object and passes slices of it down as props to section components — there is no routing, context, or state management library; the page is one linear scroll of `<section>` blocks composed in `App.jsx`.

To customize this invitation for a different wedding, editing `dataBoda.js` is normally sufficient; component code should rarely need to change.

**Itinerary shape**: `dataBoda.itinerario` has fixed keys (`ceremonia`, `recepcion`, `cena`, `baile`, `desvelados`) that `Timeline.jsx` maps to hardcoded icon/label lookup tables (`ICONOS`, `ETIQUETAS`). Adding a new itinerary step requires updating both those tables in `Timeline.jsx`, not just the data file.

**Components** (`src/components/`) are presentational and receive data via props from `App.jsx`; none fetch their own data.
- `Reveal.jsx` is a shared scroll-in-view animation wrapper (Framer Motion `whileInView`) used by most sections — wrap new sections in it for visual consistency.
- `EventCard.jsx` builds "add to calendar" (Google Calendar link + downloadable `.ics`) and map links (Google Maps + Waze) per event.
- `Countdown.jsx` runs its own `setInterval` ticking every second against `fechaBoda`.
- `Rsvp.jsx` holds local form state only (name + attendance choice); submission is not wired to any backend — confirming just flips a local `enviado` flag and shows a thank-you message. There is no persistence of RSVPs.

**Utils** (`src/utils/`):
- `eventLinks.js` — builds Google Maps/Waze URLs, Google Calendar URLs, and generates/downloads `.ics` files from a `{title, description, location, start, end}` event shape. `buildEventDates(fechaBoda, horaRango)` parses itinerary time ranges like `"16:00 a 17:00"` into `Date` start/end pairs (falls back to a 1-hour duration if there's no end time).
- `formatDate.js` — formats ISO dates (`YYYY-MM-DD`) into long/short Spanish date strings using a local `MESES` array.

**Theme**: colors and fonts are defined once as CSS custom properties in the `@theme` block of `src/index.css` (`blush`, `terracotta`, `sage`, `charcoal`, `gold`, plus `font-serif`/`font-sans`) and consumed via Tailwind utility classes (e.g. `text-terracotta`, `bg-blush-dark`) throughout components — change the palette/fonts there rather than per-component.
