import React from 'react';
import { Landmark, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import Card from '../ui/Card';

const FinanceMetrics = ({ summary, transactionsCount, money }) => {
  const StatBox = ({ title, value, icon: Icon, hint }) => (
    <Card className="relative min-h-[120px] overflow-hidden border border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="relative z-10 flex h-full flex-col justify-between p-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">{title}</p>
            <p className="mt-1 truncate text-2xl font-bold tabular-nums tracking-tight text-[var(--app-text)]">{value}</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
            <Icon size={22} />
          </span>
        </div>
        {hint ? <p className="mt-3 text-[11px] font-medium text-[var(--app-text-muted)]">{hint}</p> : null}
      </div>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatBox
        title="Pendiente de liquidar"
        value={money(summary.pendingNet)}
        icon={Landmark}
        hint={`${summary.pending?.length || 0} pagos con tarjeta aún no depositados`}
      />
      <StatBox
        title="Ya liquidado"
        value={money(summary.settledNet)}
        icon={CheckCircle2}
        hint={`${summary.settled?.length || 0} depósitos confirmados`}
      />
      <StatBox
        title="Comisiones"
        value={money(summary.commissions)}
        icon={CreditCard}
        hint={`${(summary.commissionRate || 0).toFixed(2)}% promedio`}
      />
      <StatBox
        title="Volumen bruto tarjeta"
        value={money(summary.gross)}
        icon={Banknote}
        hint={`${transactionsCount} transacciones (incluye Stripe)`}
      />
    </div>
  );
};

export default FinanceMetrics;
