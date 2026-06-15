const Services = () => {
  return (
    <section id="services" className="py-24 bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C81] bg-[#0F4C81]/10 px-3 py-1.5 rounded-full">
            SERVICIOS
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl uppercase">
            Servicios diseñados para tu comodidad
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Llevamos la experiencia de compra en Supernova al siguiente nivel con tecnología moderna y un enfoque absoluto en la calidad.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="group rounded-3xl border border-slate-100 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-[#0F4C81] group-hover:text-white mb-6">
              <span className="text-xl">🚚</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase">Envío Express</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Despachos rápidos y refrigerados directamente a tu domicilio en menos de 2 horas en Managua. Preservamos la cadena de frío.
            </p>
          </div>

          
          <div className="group rounded-3xl border border-slate-100 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-[#0F4C81] group-hover:text-white mb-6">
              <span className="text-xl">🍏</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase">Frescura 100%</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Garantía de cambio inmediato y gratuito si algún producto no cumple con la frescura exigida por el cliente.
            </p>
          </div>

          
          <div className="group rounded-3xl border border-slate-100 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-[#0F4C81] group-hover:text-white mb-6">
              <span className="text-xl">📄</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase">Facturación Ágil</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Generación de comprobantes y facturas electrónicas automatizadas que llegan directamente a tu email al instante.
            </p>
          </div>

          
          <div className="group rounded-3xl border border-slate-100 p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F4C81]/10 text-[#0F4C81] transition-colors group-hover:bg-[#0F4C81] group-hover:text-white mb-6">
              <span className="text-xl">⭐</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase">Club de Clientes</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Acumula puntos en cada compra, accede a descuentos especiales y promociones exclusivas adaptadas a tus gustos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
