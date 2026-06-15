import React from 'react';
import { Database, Loader2, CalendarDays, Eye } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import BackendPagination from '../ui/BackendPagination';

const AuditLogsTable = ({
  quickFilter,
  handleQuickFilter,
  loading,
  displayedLogs,
  getRisk,
  getActionTone,
  getActionLabel,
  getModuleLabel,
  formatDateTime,
  handleOpenDetail,
  page,
  setPage,
  size,
  setSize,
  totalPages,
  totalElements,
  logs,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mr-2">
          Filtros Rápidos:
        </span>
        <button
          onClick={() => handleQuickFilter('ALL')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
            quickFilter === 'ALL'
              ? 'bg-[var(--app-primary)] text-white border-[var(--app-primary)]'
              : 'bg-[var(--app-surface)] text-[var(--app-text-soft)] border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          Todos los eventos
        </button>
        <button
          onClick={() => handleQuickFilter('HIGH_RISK')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1 ${
            quickFilter === 'HIGH_RISK'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-[var(--app-surface)] text-red-600 border-[var(--app-border)] hover:bg-red-50 dark:hover:bg-red-950/20'
          }`}
        >
          ⚠️ Riesgo Alto / Crítico
        </button>
        <button
          onClick={() => handleQuickFilter('DENIED')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1 ${
            quickFilter === 'DENIED'
              ? 'bg-rose-700 text-white border-rose-700'
              : 'bg-[var(--app-surface)] text-[var(--app-text-soft)] border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          🚫 Accesos Denegados
        </button>
        <button
          onClick={() => handleQuickFilter('CASH')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
            quickFilter === 'CASH'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-[var(--app-surface)] text-[var(--app-text-soft)] border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          💰 Modificaciones de Caja
        </button>
        <button
          onClick={() => handleQuickFilter('INVENTORY')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
            quickFilter === 'INVENTORY'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-[var(--app-surface)] text-[var(--app-text-soft)] border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          📦 Ajustes de Inventario
        </button>
        <button
          onClick={() => handleQuickFilter('TODAY')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
            quickFilter === 'TODAY'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-[var(--app-surface)] text-[var(--app-text-soft)] border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          📅 Operaciones de Hoy
        </button>
      </div>

      
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-[var(--app-border)] p-6">
          <CardHeader
            icon={Database}
            title="Eventos Registrados"
            description="Clasificación detallada por riesgo, trazabilidad de modificaciones e IP origen."
          />
        </div>

        {loading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
            <Loader2 className="animate-spin text-[var(--app-primary)]" size={40} />
            <p className="text-xs font-bold uppercase tracking-widest">Cargando bitácora de auditoría...</p>
          </div>
        ) : displayedLogs.length === 0 ? (
          <div className="p-16 text-center text-sm font-bold text-[var(--app-text-muted)]">
            No se encontraron registros de auditoría con los criterios seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table w-full min-w-[980px]">
              <thead>
                <tr>
                  <th className="pl-6">Fecha y hora</th>
                  <th>Usuario</th>
                  <th>Evento</th>
                  <th>Riesgo</th>
                  <th>Módulo operativo</th>
                  <th>Registro ID</th>
                  <th>IP</th>
                  <th className="pr-6 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {displayedLogs.map((log) => {
                  const risk = getRisk(log);
                  return (
                    <tr key={log.id} className="hover:bg-[var(--app-bg-subtle)]/60">
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-[var(--app-text-soft)]">
                          <CalendarDays size={14} className="text-[var(--app-text-muted)]" />
                          {formatDateTime(log.logDate)}
                        </div>
                      </td>
                      <td className="font-bold text-[var(--app-text)]">{log.userFullName || 'Sistema'}</td>
                      <td>
                        <Badge tone={getActionTone(log.action)}>{getActionLabel(log.action)}</Badge>
                        <p className="mt-1 font-mono text-[10px] font-bold text-[var(--app-text-muted)]">{log.action || 'N/A'}</p>
                      </td>
                      <td>
                        <Badge tone={risk.tone} icon={risk.icon}>
                          {risk.label}
                        </Badge>
                      </td>
                      <td>
                        <span className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-2 py-1 text-xs font-bold">
                          {getModuleLabel(log.affectedTable)}
                        </span>
                        <p className="mt-1 font-mono text-[10px] font-bold text-[var(--app-text-muted)]">
                          {log.affectedTable || '-'}
                        </p>
                      </td>
                      <td className="font-mono text-xs font-bold text-[var(--app-text-muted)]">#{log.recordId || '-'}</td>
                      <td className="font-mono text-xs font-bold text-[var(--app-text-soft)]">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="pr-6 text-center">
                        <Button size="sm" variant="secondary" icon={Eye} onClick={() => handleOpenDetail(log)}>
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        
        <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40">
          <BackendPagination
            currentPage={page + 1}
            totalPages={totalPages}
            itemsPerPage={size}
            indexOfFirstItem={page * size}
            indexOfLastItem={page * size + logs.length}
            totalItems={totalElements}
            onPageChange={(p) => setPage(p - 1)}
            onItemsPerPageChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            label="eventos"
          />
        </div>
      </Card>
    </div>
  );
};

export default AuditLogsTable;
