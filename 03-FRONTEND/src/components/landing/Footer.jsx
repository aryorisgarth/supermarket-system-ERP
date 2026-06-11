const Footer = () => {
  return (
    <footer className="border-t border-slate-100 bg-[#FFFFFF] py-10 text-center text-xs font-bold text-[#6B7280] uppercase tracking-widest">
      <div className="mx-auto max-w-7xl px-6">
        <p>© {new Date().getFullYear()} Supermercado Supernova. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
