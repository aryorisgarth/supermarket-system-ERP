import React from 'react';
import { Search, Filter } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { getModuleLabel } from '../../utils/auditLogsHelper';

const AuditFilterForm = ({
  filters,
  setFilters,
  applyFilters,
  clearFilters,
  actionOptions,
  actionCategoryOptions,
  getActionLabel,
  moduleOptions,
  userOptions = [],
}) => {
  return (
    <Card>
      <CardHeader
        icon={Filter}
        title="Filtros combinables"
        description="Combina rango de fechas, usuario, categoría de evento, acción específica y módulo."
      />
      <form onSubmit={applyFilters} className="mt-5 space-y-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <label className="ui-field lg:col-span-2">
            <span className="ui-label">Buscar</span>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
              <input
                className="ui-input pl-9"
                placeholder="Texto libre: usuario, IP, evento..."
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              />
            </div>
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
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <label className="ui-field">
            <span className="ui-label">Usuario</span>
            <select
              className="ui-input ui-select"
              value={filters.userId}
              onChange={(event) => setFilters({ ...filters, userId: event.target.value })}
            >
              <option value="">Todos</option>
              {userOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-label">Categoría</span>
            <select
              className="ui-input ui-select"
              value={filters.actionCategory}
              onChange={(event) => setFilters({ ...filters, actionCategory: event.target.value, action: '' })}
            >
              <option value="">Todas</option>
              {actionCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-label">Acción específica</span>
            <select
              className="ui-input ui-select"
              value={filters.action}
              onChange={(event) => setFilters({ ...filters, action: event.target.value, actionCategory: '' })}
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
            <span className="ui-label">Módulo</span>
            <select
              className="ui-input ui-select"
              value={filters.affectedTable}
              onChange={(event) => setFilters({ ...filters, affectedTable: event.target.value })}
            >
              <option value="">Todos</option>
              {moduleOptions.map((table) => (
                <option key={table} value={table}>
                  {getModuleLabel(table)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" icon={Filter}>
            Aplicar filtros
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
