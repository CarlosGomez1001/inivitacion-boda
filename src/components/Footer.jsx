import marcobottom from "../assets/marcobottom.png";

export default function Footer({ nombreNovio, nombreNovia }) {
  return (
    <footer className="bg-blush px-6 py-10 text-center">
      <p className="font-serif text-2xl text-terracotta">
        {nombreNovio} &amp; {nombreNovia}
      </p>
      <p className="mt-2 text-xs tracking-widest text-charcoal/50 uppercase">
        Con amor, gracias por ser parte de nuestra historia
      </p>
      <img src={marcobottom} alt="" className="mt-8 w-full select-none" />
    </footer>
  );
}
