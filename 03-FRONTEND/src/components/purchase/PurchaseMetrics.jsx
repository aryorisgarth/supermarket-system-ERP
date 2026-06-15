import React from 'react';
import Card from '../ui/Card';

const PurchaseMetrics = ({ summary, allOrdersCount, money }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 animate-fade-in">
      <Card>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Ordenes activas</p>
        <p className="mt-2 text-2xl font-bold text-[var(--app-text)]">{summary.activeCount}</p>
        <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">{allOrdersCount} historicas</p>
      </Card>
      <Card>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Pendiente de recibir</p>
        <p className="mt-2 text-2xl font-bold text-[var(--app-primary)]">{summary.pendingCount}</p>
        <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">{money(summary.pendingAmount)} comprometidos</p>
      </Card>
      <Card>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Recepciones parciales</p>
        <p className="mt-2 text-2xl font-bold text-amber-500">{summary.partialCount}</p>
        <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Requieren seguimiento</p>
      </Card>
      <Card>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Mercaderia recibida</p>
        <p className="mt-2 text-2xl font-bold text-emerald-500">{money(summary.receivedAmount)}</p>
        <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">{summary.receivedCount} ordenes completas</p>
      </Card>
    </div>
  );
};

export default PurchaseMetrics;
