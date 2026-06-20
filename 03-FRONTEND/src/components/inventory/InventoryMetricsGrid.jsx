import React from 'react';
import { Package, DollarSign, AlertTriangle, Tag, CalendarClock } from 'lucide-react';
import Card from '../ui/Card';
import { formatCompactMoney } from '../../utils/formatMoney';

const InventoryMetricsGrid = ({
  inventoryStatus = {},
  totalProductsCount = 0,
  categoriesCount = 0,
}) => {
  const StatBox = ({ title, value, icon: Icon, tone = 'blue', hint }) => {
    const toneClass = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200',
      red: 'bg-rose-50 text-rose-600 border-rose-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    }[tone];

    return (
      <Card className="min-h-[110px] relative overflow-hidden border border-gray-200 shadow-sm bg-white">
        <div className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="mt-2 truncate text-2xl font-bold text-gray-900 tabular-nums">
              {value}
            </p>
            {hint && (
              <p className="mt-1 text-xs text-gray-400">
                {hint}
              </p>
            )}
          </div>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneClass}`}
          >
            <Icon size={18} strokeWidth={2} />
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5 pb-2">
      <StatBox
        title="Catálogo Único"
        value={inventoryStatus?.totalProductsCount || totalProductsCount}
        icon={Package}
        tone="blue"
        hint="Modelos registrados"
      />
      <StatBox
        title="Valoración"
        value={formatCompactMoney(inventoryStatus?.totalInventoryValue || 0)}
        icon={DollarSign}
        tone="green"
        hint="Costo de reposición"
      />
      <StatBox
        title="Lotes por Vencer"
        value={inventoryStatus?.expiringBatchesCount || 0}
        icon={CalendarClock}
        tone={inventoryStatus?.expiringBatchesCount > 0 ? 'red' : 'purple'}
        hint="Menor a 30 días"
      />
      <StatBox
        title="Alertas de Stock"
        value={inventoryStatus?.lowStockCount || 0}
        icon={AlertTriangle}
        tone={inventoryStatus?.lowStockCount > 0 ? 'red' : 'amber'}
        hint="Debajo del mínimo"
      />
      <StatBox
        title="Categorías"
        value={categoriesCount}
        icon={Tag}
        tone="purple"
        hint="Grupos registrados"
      />
    </div>
  );
};

export default InventoryMetricsGrid;
