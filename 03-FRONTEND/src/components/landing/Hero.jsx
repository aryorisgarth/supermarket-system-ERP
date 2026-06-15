import { useNavigate } from 'react-router-dom';

const Hero = ({ scrollToSection }) => {
  const navigate = useNavigate();

  return (
    <section id="hero" className="bg-[#0F4C81] text-white overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFFFFF] bg-white/10 px-3 py-1.5 rounded-full self-start mb-6">
              🌱 Supermercado Supernova
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl uppercase leading-none text-white">
              ALIMENTOS FRESCOS Y SALUDABLES
            </h1>
            
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300">
              En Supernova nos enorgullecemos de ofrecer una cuidada selección de productos frescos, orgánicos y ricos en nutrientes para apoyar un estilo de vida saludable y activo.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => scrollToSection('About')}
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#0F4C81] shadow-lg transition duration-200 hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 transform"
              >
                CONÓCENOS MÁS
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/80 bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition duration-200 hover:bg-white/10 hover:border-white hover:-translate-y-0.5 transform"
              >
                INGRESAR AL SISTEMA
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-white/5 blur-3xl" />
            <div className="relative w-full max-w-[500px] overflow-hidden rounded-[2.5rem] border-4 border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop"
                alt="Supermercado Supernova"
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
