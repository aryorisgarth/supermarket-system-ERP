import React from 'react';
import { Package, DollarSign, AlertTriangle, Tag } from 'lucide-react';
import Card from '../ui/Card';
import { formatCompactMoney } from '../../utils/formatMoney';

const InventoryMetricsGrid = ({
  inventoryStatus = {},
  totalProductsCount = 0,
  categoriesCount = 0,
}) => {
  const StatBox = ({ title, value, icon: Icon, tone = 'blue', hint }) => {
    const toneClass = {
      blue: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)] border-[var(--app-primary)]/10',
      green: 'bg-[var(--app-success-soft)] text-[var(--app-success)] border-[var(--app-success)]/10',
      amber: 'bg-[var(--app-warning-soft)] text-[var(--app-warning)] border-[var(--app-warning)]/10',
      red: 'bg-[var(--app-danger-soft)] text-[var(--app-danger)] border-[var(--app-danger)]/10',
    }[tone];

    return (
      <Card className="min-h-[110px] relative overflow-hidden group">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">
              {title}
            </p>
            <p className="mt-2 truncate text-xl sm:text-2xl font-bold text-[var(--app-text)] tabular-nums">
              {value}
            </p>
            {hint && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                {hint}
              </p>
            )}
          </div>
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 ${toneClass}`}
          >
            <Icon size={20} />
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 animate-fade-in">
      <StatBox
        title="Catálogo Único"
        value={inventoryStatus?.totalProductsCount || totalProductsCount}
        icon={Package}
        tone="blue"
        hint="Modelos registrados"
      />
      <StatBox
        title="Valoración de Inventario"
        value={formatCompactMoney(inventoryStatus?.totalInventoryValue || 0)}
        icon={DollarSign}
        tone="green"
        hint="Costo de reposición"
      />
      <StatBox
        title="Alertas de Stock"
        value={inventoryStatus?.lowStockCount || 0}
        icon={AlertTriangle}
        tone={inventoryStatus?.lowStockCount > 0 ? 'red' : 'amber'}
        hint="Bajo mínimos"
      />
      <StatBox
        title="Grupos de Categoría"
        value={categoriesCount}
        icon={Tag}
        tone="blue"
        hint="Segmentación"
      />
    </div>
  );
};

export default InventoryMetricsGrid;
