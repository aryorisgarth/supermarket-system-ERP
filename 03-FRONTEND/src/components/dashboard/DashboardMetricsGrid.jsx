import React from 'react';
import { DollarSign, Package, AlertTriangle, TrendingUp, Building2, Tag, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';

const StatCard = ({ title, value, icon: Icon, tone = 'blue', trend, note }) => {
  const toneClass = {
    blue: 'text-[var(--app-primary)] bg-[var(--app-primary-soft)] border-[var(--app-primary)]/10',
    green: 'text-[var(--app-success)] bg-[var(--app-success-soft)] border-[var(--app-success)]/10',
    amber: 'text-[var(--app-warning)] bg-[var(--app-warning-soft)] border-[var(--app-warning)]/10',
    red: 'text-[var(--app-danger)] bg-[var(--app-danger-soft)] border-[var(--app-danger)]/10',
  }[tone];

  const isLong = typeof value === 'string' && value.length > 9;
  const valueClass = isLong
    ? 'text-lg sm:text-xl font-bold tracking-tight text-[var(--app-text)]'
    : 'text-xl sm:text-2xl font-bold tracking-tighter text-[var(--app-text)]';

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
          <h3 className={`${valueClass} truncate`}>{value}</h3>
          
          {(trend !== undefined || note) && (
            <div className="flex items-center gap-2 mt-2">
              {trend !== undefined && (
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(trend).toFixed(1)}%
                </span>
              )}
              {note && <p className="text-[10px] font-bold text-[var(--app-text-muted)] truncate">{note}</p>}
            </div>
          )}
        </div>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${toneClass}`}>
          <Icon size={24} />
        </span>
      </div>
    </Card>
  );
};

const DashboardMetricsGrid = ({
  kpis,
  inventoryStatus,
  comparativeKpis,
  suppliersCount,
  categoriesCount,
  totalWeeklySales,
  compactMoney,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 animate-fade-in">
      <StatCard 
        title="Ingresos (30d)" 
        value={compactMoney(kpis?.totalSales ?? totalWeeklySales)} 
        icon={DollarSign} 
        tone="green" 
        trend={comparativeKpis?.totalSalesChangePercentage}
      />
      <StatCard 
        title="Valor Stock" 
        value={compactMoney(kpis?.inventoryValue ?? inventoryStatus?.totalInventoryValue)} 
        icon={Package} 
        tone="blue" 
      />
      <StatCard 
        title="Stock Crítico" 
        value={kpis?.criticalStockProducts ?? inventoryStatus?.lowStockCount ?? 0} 
        icon={AlertTriangle} 
        tone="red" 
        note="Acción requerida"
      />
      <StatCard 
        title="Ticket Medio" 
        value={compactMoney(kpis?.averageTicket ?? 0)} 
        icon={TrendingUp} 
        tone="amber" 
        trend={comparativeKpis?.averageTicketChangePercentage}
      />
      <StatCard title="Proveedores" value={suppliersCount} icon={Building2} tone="blue" />
      <StatCard title="Categorías" value={categoriesCount} icon={Tag} tone="green" />
    </div>
  );
};

export default DashboardMetricsGrid;
