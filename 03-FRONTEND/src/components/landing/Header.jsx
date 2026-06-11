import { Link } from 'react-router-dom';
import { ShoppingCart, Bell, User } from 'lucide-react';

const Header = ({ activeNav, scrollToSection, cartCount }) => {
  const navLinks = ['Home', 'About', 'Service', 'Product', 'Contact'];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('Home')}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F4C81] text-white">
            <ShoppingCart size={20} />
          </span>
          <span className="text-lg font-black tracking-tight text-[#0F4C81]">
            Supernova
          </span>
        </div>

        {/* Navegación Superior */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => scrollToSection(link)}
              className={`transition duration-200 hover:text-[#0F4C81] relative py-1 ${
                activeNav === link
                  ? 'text-[#0F4C81] border-b-2 border-[#0F4C81]'
                  : 'text-[#6B7280]'
              }`}
            >
              {link === 'About'
                ? 'Nosotros'
                : link === 'Service'
                ? 'Servicios'
                : link === 'Product'
                ? 'Productos'
                : link === 'Contact'
                ? 'Contacto'
                : link}
            </button>
          ))}
        </nav>

        {/* Iconos de cabecera */}
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#6B7280] transition hover:bg-slate-200 hover:text-[#0F4C81]" aria-label="Notificaciones">
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#6B7280] transition hover:bg-slate-200" title="Carrito de Compras">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white ring-2 ring-white animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <Link
            to="/login"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#6B7280] transition hover:bg-[#0F4C81] hover:text-white"
            aria-label="Iniciar Sesión"
            title="Acceder al Sistema"
          >
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
