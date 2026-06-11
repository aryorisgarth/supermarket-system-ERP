import { useState } from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import Services from '../components/landing/Services';
import Products from '../components/landing/Products';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';

const Landing = () => {
  const [activeNav, setActiveNav] = useState('Home');
  const [activeCategory, setActiveCategory] = useState('VEGETABLES');
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState('');
  const [formSending, setFormSending] = useState(false);

  const getSectionId = (link) => {
    if (link === 'Home') return 'hero';
    if (link === 'Service') return 'services';
    if (link === 'Product') return 'products';
    return link.toLowerCase();
  };

  const scrollToSection = (link) => {
    const sectionId = getSectionId(link);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveNav(link);
    }
  };

  const handleAddToCart = (productName) => {
    setCartCount((prev) => prev + 1);
    setNotification(`¡"${productName}" se añadió al carrito de Supernova!`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSending(true);
    setTimeout(() => {
      setFormSending(false);
      setNotification('¡Gracias por comunicarte con Supernova! Tu consulta ha sido enviada con éxito.');
      e.target.reset();
      setTimeout(() => setNotification(''), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Toast de Notificaciones */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-md animate-fade-in-up items-center gap-3 rounded-2xl bg-[#0F4C81] px-5 py-4 text-sm font-semibold text-white shadow-2xl ring-4 ring-[#0F4C81]/15">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-[#0F4C81]">✓</span>
          <p>{notification}</p>
        </div>
      )}

      {/* Cabecera */}
      <Header
        activeNav={activeNav}
        scrollToSection={scrollToSection}
        cartCount={cartCount}
      />

      <main>
        {/* Banner de Presentación */}
        <Hero scrollToSection={scrollToSection} />

        {/* Sección Nosotros */}
        <About />

        {/* Sección Servicios */}
        <Services />

        {/* Sección Productos */}
        <Products
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          handleAddToCart={handleAddToCart}
        />

        {/* Sección Contacto */}
        <Contact
          handleContactSubmit={handleContactSubmit}
          formSending={formSending}
        />
      </main>

      {/* Pie de Página */}
      <Footer />
    </div>
  );
};

export default Landing;
