import React from 'react';
import { Tag, Plus } from 'lucide-react';

const PromotionsHeader = ({ onCreate }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--app-text)] tracking-tight flex items-center gap-2">
          <Tag className="text-[var(--app-primary)] shrink-0 animate-pulse" size={26} /> Promociones y Ofertas
        </h1>
        <p className="text-[var(--app-text-soft)] text-sm font-medium">
          Administración de descuentos por porcentaje, monto fijo y combos 2x1 activables por caducidad de lotes.
        </p>
      </div>
      <button 
        onClick={onCreate} 
        className="flex items-center gap-2 bg-[var(--app-primary)] hover:bg-[var(--app-primary-strong)] text-white px-5 py-3 rounded-2xl transition-all shadow-md font-bold hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer text-sm"
      >
        <Plus size={18} /> Nueva Promoción
      </button>
    </div>
  );
};

export default PromotionsHeader;
