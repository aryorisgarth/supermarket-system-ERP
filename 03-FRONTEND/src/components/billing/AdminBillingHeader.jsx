import React from 'react';
import { Receipt, Search } from 'lucide-react';

const AdminBillingHeader = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Receipt className="text-primary animate-pulse" size={28} />
          Control y Auditoría de Facturas
        </h2>
        <p className="text-slate-500 text-sm font-medium">Historial inmutable de ventas. Inspecciona transacciones y genera anulaciones/devoluciones de inventario.</p>
      </div>

      <div className="relative w-full md:w-80">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          placeholder="Buscar por N° factura, cajero..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-sm shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AdminBillingHeader;
