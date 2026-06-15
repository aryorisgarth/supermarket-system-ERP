import React from 'react';
import { Activity, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardHeader } from '../ui/Card';

const RecentSalesCard = ({ recentSales = [], money }) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader
        icon={Activity}
        title="Ventas Recientes"
        description="Últimos movimientos registrados en caja."
        action={
          <Link
            to="/control-ventas"
            className="text-[10px] font-bold uppercase text-[var(--app-primary)] hover:underline animate-fade-in"
          >
            Ver Todo
          </Link>
        }
      />
      <div className="space-y-3">
        {recentSales.length === 0 ? (
          <p className="py-6 text-center text-xs font-bold text-[var(--app-text-muted)] italic">
            No hay ventas hoy
          </p>
        ) : (
          recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] group hover:border-[var(--app-primary)]/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-white shadow-sm border border-[var(--app-border)] text-[var(--app-primary)]">
                  <DollarSign size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-normal text-[var(--app-text-soft)] truncate font-mono">
                    {sale.invoiceNumber}
                  </p>
                  <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase">
                    Por: {sale.userFullName || 'Sistema'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-[var(--app-success)]">{money(sale.totalAmount)}</p>
                <p className="text-[9px] font-bold text-[var(--app-text-muted)]">
                  {new Date(sale.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentSalesCard;
