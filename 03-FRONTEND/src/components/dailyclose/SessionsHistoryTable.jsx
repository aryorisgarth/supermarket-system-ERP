import React from 'react';
import { Search, Eye } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const SessionsHistoryTable = ({
  history,
  cashiers,
  filters,
  setFilters,
  onSearch,
  onOpenDetail,
  statusTone,
  statusLabel,
  diffTone,
  formatDateTime,
  formatMoney
}) => {
  return (
    <Card className="shadow-enterprise-lg overflow-hidden">
      <div className="border-b border-[var(--app-border)] p-6">
        <CardHeader
          icon={Search}
          title="Historial de turnos"
          description="Filtra por cajero, estado y rango de fechas."
        />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <select
            className="ui-input ui-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="OPEN">Abiertos</option>
            <option value="CLOSED">Cerrados</option>
          </select>
          <select
            className="ui-input ui-select"
            value={filters.cashierId}
            onChange={(e) => setFilters({ ...filters, cashierId: e.target.value })}
          >
            <option value="">Todos los cajeros</option>
            {cashiers.map((cashier) => (
              <option key={cashier.id} value={cashier.id}>
                {cashier.fullName || cashier.username}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="ui-input"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
          <input
            type="date"
            className="ui-input"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
          <Button icon={Search} onClick={onSearch}>
            Buscar
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="ui-table w-full min-w-[980px]">
          <thead>
            <tr>
              <th className="pl-6">Turno</th>
              <th>Cajero</th>
              <th>Apertura</th>
              <th>Cierre</th>
              <th className="text-right">Fondo inicial</th>
              <th className="text-right">Dif. efectivo</th>
              <th className="text-center">Estado</th>
              <th className="pr-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {history.map((session) => (
              <tr key={session.id} className="hover:bg-[var(--app-bg-subtle)]/50">
                <td className="pl-6 py-4 font-black">#{session.id}</td>
                <td className="font-bold text-[var(--app-text-soft)]">{session.cashierName}</td>
                <td className="text-sm text-[var(--app-text-muted)]">{formatDateTime(session.openedAt)}</td>
                <td className="text-sm text-[var(--app-text-muted)]">{formatDateTime(session.closedAt)}</td>
                <td className="text-right font-bold tabular-nums">{formatMoney(session.openingBalance)}</td>
                <td className="text-right">
                  <Badge tone={diffTone(session.difference)}>
                    {formatMoney(session.difference || 0)}
                  </Badge>
                </td>
                <td className="text-center">
                  <Badge tone={statusTone[session.status] || 'blue'}>
                    {statusLabel[session.status] || session.status}
                  </Badge>
                </td>
                <td className="pr-6 text-center">
                  <Button size="sm" variant="ghost" icon={Eye} onClick={() => onOpenDetail(session.id)}>
                    Detalle
                  </Button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="8" className="py-16 text-center text-xs font-black uppercase tracking-widest text-[var(--app-text-muted)] italic">
                  No hay turnos en el rango seleccionado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SessionsHistoryTable;
