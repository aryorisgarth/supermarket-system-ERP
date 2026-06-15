import React from 'react';
import { History, Activity, Database, Terminal, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';

const StatCard = ({ title, value, hint, icon: Icon, tone = 'blue' }) => {
  const toneClass = {
    blue: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
    green: 'bg-[var(--app-success-soft)] text-[var(--app-success)]',
    amber: 'bg-[var(--app-warning-soft)] text-[var(--app-warning)]',
    red: 'bg-[var(--app-danger-soft)] text-[var(--app-danger)]',
  }[tone];

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold text-[var(--app-text)] tabular-nums">{value ?? 0}</p>
          {hint && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">{hint}</p>}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={20} />
        </span>
      </div>
    </Card>
  );
};

const AuditStats = ({ summary, operationalSummary }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard title="Eventos totales" value={summary?.totalLogs} hint="Bitácora histórica" icon={History} tone="blue" />
      <StatCard title="Activity hoy" value={summary?.todayLogs} hint="Operación del día" icon={Activity} tone="green" />
      <StatCard title="Ventas auditadas" value={operationalSummary?.salesEvents} hint="Página de búsqueda" icon={Database} tone="blue" />
      <StatCard title="Caja / efectivo" value={operationalSummary?.cashEvents} hint="Aperturas y cierres" icon={Terminal} tone="amber" />
      <StatCard title="Riesgo alto" value={summary?.highRiskLogs} hint="Eventos sensibles" icon={AlertTriangle} tone="red" />
    </div>
  );
};

export default AuditStats;
