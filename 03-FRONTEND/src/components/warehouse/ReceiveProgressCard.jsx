import React from 'react';
import Card from '../ui/Card';
import { TrendingUp } from 'lucide-react';

const ReceiveProgressCard = ({ progressStats }) => {
  return (
    <Card className="border-[var(--app-border)]">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="text-[var(--app-primary)]" size={16} />
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
          Resumen General
        </h4>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold text-[var(--app-text-soft)]">Total Recibido</span>
          <span className="text-sm font-bold text-[var(--app-text)]">
            {progressStats.receivedItems} u / {progressStats.totalItems} u
          </span>
        </div>
        <div className="w-full h-3 bg-[var(--app-bg-subtle)] rounded-full overflow-hidden border border-[var(--app-border)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--app-primary)] to-blue-500 transition-all duration-500"
            style={{ width: `${progressStats.percent}%` }}
          />
        </div>
        <div className="text-[9px] font-bold text-[var(--app-text-muted)] text-right">
          {progressStats.percent}% del total completado
        </div>
      </div>
    </Card>
  );
};

export default ReceiveProgressCard;
