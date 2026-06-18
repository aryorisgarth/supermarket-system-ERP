import React from 'react';
import { Tag } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const TopBrandsCard = ({ salesByBrand = [], money }) => {
  return (
    <Card className="shadow-enterprise-lg animate-fade-in">
      <CardHeader icon={Tag} title="Top Ventas por Marca" description="Marcas con mayor recaudación" />
      <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {salesByBrand.slice(0, 8).map((b, i) => (
          <div key={i} className="flex justify-between items-center py-3 text-xs">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-bold">
                {i + 1}
              </div>
              <span className="font-bold text-slate-800 dark:text-white truncate">
                {b.brandName || 'Sin Marca'}
              </span>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <span className="block font-black text-emerald-600 dark:text-emerald-400">
                {money(b.totalSales)}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                {b.salesCount} ventas
              </span>
            </div>
          </div>
        ))}
        {salesByBrand.length === 0 && (
          <p className="py-8 text-center text-xs font-semibold text-slate-400">
            No hay datos de ventas por marca en este periodo.
          </p>
        )}
      </div>
    </Card>
  );
};

export default TopBrandsCard;
