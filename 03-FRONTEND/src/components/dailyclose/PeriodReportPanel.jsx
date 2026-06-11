import React from 'react';
import { TrendingUp, Banknote, CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const PeriodReportPanel = ({ report, closedWithDiff, formatMoney }) => {
  return (
    <Card className="shadow-enterprise-lg overflow-hidden">
      <div className="border-b border-[var(--app-border)] p-6">
        <CardHeader
          icon={TrendingUp}
          title="Reporte del periodo"
          description="Indicadores consolidados para supervisión y auditoría."
        />
      </div>
      <div className="grid gap-0 divide-y divide-[var(--app-border)]">
        {[
          ['Ventas en efectivo', report?.totalCashSales, Banknote],
          ['Ventas con tarjeta', report?.totalCardSales, CreditCard],
          ['Ventas por transferencia', report?.totalTransferSales, Wallet],
          ['Diferencia tarjeta (cierres)', report?.totalCardDifference, CreditCard],
          ['Diferencia transferencia (cierres)', report?.totalTransferDifference, Wallet],
          ['Turnos con descuadre', closedWithDiff, AlertTriangle],
        ].map(([label, value, Icon]) => (
          <div key={label} className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)]">
                <Icon size={16} />
              </span>
              <span className="text-sm font-bold text-[var(--app-text-soft)]">{label}</span>
            </div>
            <span className="font-black tabular-nums text-[var(--app-text)]">
              {typeof value === 'number' && label.includes('Turnos') ? value : formatMoney(value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PeriodReportPanel;
