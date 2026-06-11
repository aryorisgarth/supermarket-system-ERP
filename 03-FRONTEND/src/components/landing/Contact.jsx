const Contact = ({ handleContactSubmit, formSending }) => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Información de contacto */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C81] bg-[#0F4C81]/10 px-3 py-1.5 rounded-full">
              CONTÁCTANOS
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl uppercase">
              ¿Tienes dudas? Escríbenos directamente
            </h2>
            <p className="mt-6 text-base text-slate-600 leading-relaxed">
              Estamos a tu disposición para solventar cualquier duda acerca del reparto a domicilio, pedidos especiales o consultas sobre el catálogo de productos de Supernova.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F4C81]/5 text-[#0F4C81] text-lg font-bold">
                  📞
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono de atención</p>
                  <p className="text-sm font-black text-slate-800">+505 2278-8000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F4C81]/5 text-[#0F4C81] text-lg font-bold">
                  ✉️
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo electrónico</p>
                  <p className="text-sm font-black text-slate-800">soporte@supernova.com.ni</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F4C81]/5 text-[#0F4C81] text-lg font-bold">
                  📍
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dirección Física</p>
                  <p className="text-sm font-black text-slate-800">Frente a Metrocentro, Managua, Nicaragua</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-xl">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="Juan Pérez"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm focus:border-[#0F4C81] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="juan@ejemplo.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm focus:border-[#0F4C81] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  placeholder="Escribe tus dudas aquí..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm focus:border-[#0F4C81] focus:outline-none transition-all shadow-sm resize-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={formSending}
                className="w-full rounded-xl bg-[#0F4C81] py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all duration-200 hover:bg-[#0c3c66] hover:shadow-xl hover:-translate-y-0.5 transform disabled:opacity-50"
              >
                {formSending ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
