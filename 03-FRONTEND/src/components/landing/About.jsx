const About = () => {
  return (
    <section id="about" className="py-24 bg-slate-50 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-[#0F4C81]/5 blur-xl" />
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop"
              alt="Sobre Supermercado Supernova"
              className="relative z-10 w-full rounded-[2rem] object-cover shadow-xl border-4 border-white"
            />
          </div>

          
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C81] bg-[#0F4C81]/10 px-3 py-1.5 rounded-full">
              NOSOTROS
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl uppercase">
              Cultivando frescura para tu bienestar diario
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-600">
              En <strong>Supernova</strong> seleccionamos minuciosamente cada producto de nuestra tienda de la mano con productores y agricultores locales en Nicaragua. Garantizamos alimentos 100% orgánicos que conservan su frescura original y su valor nutritivo desde el campo hasta tu hogar.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Nuestro sistema integrado y automatizado de control de stock asegura que nunca recibas algo fuera de su punto óptimo de maduración y frescura.
            </p>

            
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
              <div>
                <p className="text-3xl font-bold text-[#0F4C81]">100%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Orgánico</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0F4C81]">50+</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Agricultores</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0F4C81]">12k+</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Pedidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
