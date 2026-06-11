import React from 'react';
import { Search, Filter } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';

const AuditFilterForm = ({
  filters,
  setFilters,
  applyFilters,
  clearFilters,
  actionOptions,
  getActionLabel,
  tableOptions,
}) => {
  return (
    <Card>
      <CardHeader
        icon={Filter}
        title="Filtros de Investigación"
        description="Búsqueda avanzada por usuario, IP, tipo de acción, módulo o rango de fechas."
      />
      <form onSubmit={applyFilters} className="mt-5 grid gap-3 lg:grid-cols-[1fr_160px_190px_160px_160px_auto]">
        <label className="ui-field">
          <span className="ui-label">Buscar</span>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
            <input
              className="ui-input pl-9"
              placeholder="Usuario, evento o IP"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </div>
        </label>
        <label className="ui-field">
          <span className="ui-label">Acción</span>
          <select
            className="ui-input ui-select"
            value={filters.action}
            onChange={(event) => setFilters({ ...filters, action: event.target.value })}
          >
            <option value="">Todas</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>
        </label>
        <label className="ui-field">
          <span className="ui-label">Módulo operativo</span>
          <input
            className="ui-input"
            list="audit-table-options-new"
            placeholder="Ej. sales, products, users"
            value={filters.affectedTable}
            onChange={(event) => setFilters({ ...filters, affectedTable: event.target.value })}
          />
          <datalist id="audit-table-options-new">
            {tableOptions.map((table) => (
              <option key={table} value={table} />
            ))}
          </datalist>
        </label>
        <label className="ui-field">
          <span className="ui-label">Desde</span>
          <input
            type="date"
            className="ui-input"
            value={filters.fromDate}
            onChange={(event) => setFilters({ ...filters, fromDate: event.target.value })}
          />
        </label>
        <label className="ui-field">
          <span className="ui-label">Hasta</span>
          <input
            type="date"
            className="ui-input"
            value={filters.toDate}
            onChange={(event) => setFilters({ ...filters, toDate: event.target.value })}
          />
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit" icon={Filter} className="flex-1">
            Filtrar
          </Button>
          <Button type="button" variant="ghost" onClick={clearFilters}>
            Limpiar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AuditFilterForm;
