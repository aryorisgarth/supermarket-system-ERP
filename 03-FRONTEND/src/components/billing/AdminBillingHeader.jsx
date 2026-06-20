import React, { useState, useEffect } from 'react';
import { Receipt, Search, FilterX } from 'lucide-react';
import UserService from '../../services/UserService';

const AdminBillingHeader = ({ 
  searchTerm, 
  setSearchTerm,
  filterUserId,
  setFilterUserId,
  filterStatus,
  setFilterStatus,
  filterFromDate,
  setFilterFromDate,
  filterToDate,
  setFilterToDate
}) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await UserService.getActive();
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterUserId('');
    setFilterStatus('');
    setFilterFromDate('');
    setFilterToDate('');
  };

  return (
    <div className="space-y-4">
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

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Cajero</label>
          <select 
            value={filterUserId} 
            onChange={(e) => setFilterUserId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-slate-700"
          >
            <option value="">Todos los cajeros</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Estado</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-slate-700"
          >
            <option value="">Todos los estados</option>
            <option value="PAID">Pagada</option>
            <option value="PENDING">Pendiente</option>
            <option value="CANCELLED">Anulada</option>
            <option value="PARTIALLY_REFUNDED">Devolución parcial</option>
            <option value="REFUNDED">Reembolsada</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Desde</label>
          <input 
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-slate-700"
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Hasta</label>
          <input 
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-slate-700"
          />
        </div>

        <button 
          onClick={clearFilters}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors flex items-center gap-2 font-medium text-sm h-[38px]"
          title="Limpiar filtros"
        >
          <FilterX size={18} />
          <span className="hidden sm:inline">Limpiar</span>
        </button>
      </div>
    </div>
  );
};

export default AdminBillingHeader;
