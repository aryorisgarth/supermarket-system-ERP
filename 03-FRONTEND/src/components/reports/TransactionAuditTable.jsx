import React from 'react';
import { FileText, Clock } from 'lucide-react';
import { CardHeader } from '../ui/Card';

const TransactionAuditTable = ({ sales, money }) => {
  return (
    <div className="ui-card overflow-hidden shadow-enterprise-lg">
      <div className="p-6 border-b border-[var(--app-border)]">
        <CardHeader
          icon={FileText}
          title="Auditoría de Transacciones"
          description="Últimos movimientos liquidados en el sistema."
        />
      </div>
      <div className="table-scroll overflow-x-auto">
        <table className="ui-table w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="pl-6">Nº Factura</th>
              <th>Cliente / Titular</th>
              <th>Fecha y Registro</th>
              <th>Cajero</th>
              <th className="text-right">Monto Total</th>
              <th className="pr-6 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)]">
            {sales.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-20 text-center text-[var(--app-text-muted)] font-bold uppercase text-xs tracking-widest italic">
                  No hay registros para este rango de fechas.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-[var(--app-bg-subtle)]/50 transition-colors">
                  <td className="pl-6 py-4 font-bold text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition-colors tracking-tight">
                    {sale.invoiceNumber}
                  </td>
                  <td>
                    <p className="font-bold text-[var(--app-text-soft)] text-sm">{sale.customer?.fullName || 'Consumidor Final'}</p>
                    <p className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase">{sale.customer?.taxId || 'Sin NIT'}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--app-text-soft)]">
                      <Clock size={12} className="text-[var(--app-text-muted)]" />
                      {new Date(sale.saleDate).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="text-xs font-bold text-[var(--app-text-soft)] uppercase">{sale.userFullName || 'Sistema'}</td>
                  <td className="text-right font-bold text-[var(--app-primary)] tabular-nums">{money(sale.totalAmount)}</td>
                  <td className="pr-6 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase border tracking-widest ${
                      sale.status === 'COMPLETED' || sale.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    }`}>
                      {sale.status === 'COMPLETED' || sale.status === 'PAID' ? 'Liquidada' : 'Anulada'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionAuditTable;
