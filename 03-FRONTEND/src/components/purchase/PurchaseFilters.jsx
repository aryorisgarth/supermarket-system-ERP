import React from 'react';
import { Search, Filter } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import { PURCHASE_STATUS_LABELS } from '../../utils/purchaseReceipt';

const PurchaseFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  supplierFilter,
  setSupplierFilter,
  suppliers
}) => {
  return (
    <Card>
      <CardHeader
        icon={Filter}
        title="Filtros de abastecimiento"
        description="Busca por orden, proveedor o notas, y separa por estado operativo."
      />
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_220px]">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
          <input
            className="ui-input w-full pl-9"
            placeholder="Buscar orden, proveedor o notas..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <select
          className="ui-input ui-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">Todos los estados</option>
          {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="ui-input ui-select"
          value={supplierFilter}
          onChange={(event) => setSupplierFilter(event.target.value)}
        >
          <option value="ALL">Todos los proveedores</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name || supplier.companyName}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
};

export default PurchaseFilters;
