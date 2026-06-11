const categories = [
  { id: 'VEGETABLES', label: 'VEGETALES', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=400&auto=format&fit=crop' },
  { id: 'FRUITS', label: 'FRUTAS', image: 'https://images.unsplash.com/photo-1519996521430-02b798c1d881?q=80&w=400&auto=format&fit=crop' },
  { id: 'DRINKS', label: 'BEBIDAS', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=400&auto=format&fit=crop' },
  { id: 'FRESH NUTS', label: 'FRUTOS SECOS', image: 'https://images.unsplash.com/photo-1536628896463-0026268536f1?q=80&w=400&auto=format&fit=crop' },
  { id: 'FRESH FISH', label: 'PESCADO FRESCO', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop' },
  { id: 'MEAT', label: 'CARNES', image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=400&auto=format&fit=crop' }
];

const productsData = {
  VEGETABLES: [
    { id: 'v1', name: 'Lechuga Orgánica', price: 1.20, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=400&auto=format&fit=crop' },
    { id: 'v2', name: 'Tomate Manzana', price: 2.50, image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=400&auto=format&fit=crop' },
    { id: 'v3', name: 'Zanahorias Baby', price: 1.80, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400&auto=format&fit=crop' }
  ],
  FRUITS: [
    { id: 'f1', name: 'Manzanas Rojas', price: 3.00, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=400&auto=format&fit=crop' },
    { id: 'f2', name: 'Plátanos Orgánicos', price: 1.50, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=400&auto=format&fit=crop' },
    { id: 'f3', name: 'Fresas Silvestres', price: 4.20, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=400&auto=format&fit=crop' }
  ],
  DRINKS: [
    { id: 'd1', name: 'Jugo de Naranja Natural', price: 3.50, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400&auto=format&fit=crop' },
    { id: 'd2', name: 'Té Verde Matcha', price: 5.00, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=400&auto=format&fit=crop' },
    { id: 'd3', name: 'Agua Mineral Manantial', price: 1.20, image: 'https://images.unsplash.com/photo-1608885898957-a599fb16ec8d?q=80&w=400&auto=format&fit=crop' }
  ],
  'FRESH NUTS': [
    { id: 'n1', name: 'Almendras Tostadas', price: 6.80, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?q=80&w=400&auto=format&fit=crop' },
    { id: 'n2', name: 'Nueces de Nogal', price: 7.20, image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?q=80&w=400&auto=format&fit=crop' },
    { id: 'n3', name: 'Pistachos Salados', price: 8.00, image: 'https://images.unsplash.com/photo-1555465910-313575a60023?q=80&w=400&auto=format&fit=crop' }
  ],
  'FRESH FISH': [
    { id: 'fi1', name: 'Filete de Salmón Fresco', price: 14.50, image: 'https://images.unsplash.com/photo-1485921325814-a50438496fe4?q=80&w=400&auto=format&fit=crop' },
    { id: 'fi2', name: 'Lomo de Atún Rojo', price: 12.00, image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?q=80&w=400&auto=format&fit=crop' },
    { id: 'fi3', name: 'Camarones Jumbo', price: 15.80, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format&fit=crop' }
  ],
  MEAT: [
    { id: 'm1', name: 'Corte de Res Ribeye', price: 18.00, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop' },
    { id: 'm2', name: 'Pechuga de Pollo Orgánica', price: 7.50, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400&auto=format&fit=crop' },
    { id: 'm3', name: 'Chuletas de Cerdo Ahumadas', price: 11.20, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop' }
  ]
};

const Products = ({ activeCategory, setActiveCategory, handleAddToCart }) => {
  return (
    <section id="products" className="py-24 bg-slate-50 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C81] bg-[#0F4C81]/10 px-3 py-1.5 rounded-full">
            NUESTRO CATÁLOGO
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl uppercase">
            Productos frescos seleccionados
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Filtra por categorías y añade productos directamente a tu carrito simulado para probar la experiencia.
          </p>
        </div>

        
        <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-none snap-x md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 w-[220px] snap-center md:w-auto flex flex-col items-center rounded-3xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md ${
                  isActive
                    ? 'border-[#0F4C81] bg-white ring-2 ring-[#0F4C81]/10'
                    : 'border-slate-150 bg-[#FFFFFF] hover:border-slate-250'
                }`}
              >
                <div className="h-32 w-full overflow-hidden rounded-2xl bg-slate-50">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
                <span
                  className={`mt-4 text-xs font-black uppercase tracking-wider ${
                    isActive ? 'text-[#0F4C81]' : 'text-[#6B7280]'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        
        <div className="mt-12">
          <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase mb-8 border-b border-slate-200 pb-2">
            Destacados en {categories.find((c) => c.id === activeCategory)?.label}
          </h3>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {productsData[activeCategory]?.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-200"
              >
                <div className="h-48 w-full overflow-hidden rounded-2xl bg-slate-50 mb-6">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">{prod.name}</h4>
                  <span className="text-lg font-black text-[#0F4C81]">
                    ${prod.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  100% Orgánico y Fresco
                </p>
                <button
                  onClick={() => handleAddToCart(prod.name)}
                  className="mt-6 w-full rounded-xl bg-[#0F4C81] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition duration-200 hover:bg-[#0c3c66] hover:shadow-lg hover:-translate-y-0.5 transform"
                >
                  Añadir al Carrito
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
