import React from 'react';
import { Landmark, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import Card from '../ui/Card';

const FinanceMetrics = ({ summary, transactionsCount, money }) => {
  const StatBox = ({ title, value, icon: Icon, hint }) => {
    return (
      <Card className="relative overflow-hidden group border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-500/40 transition-all duration-300 min-h-[128px] bg-white dark:bg-slate-900">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all duration-500 pointer-events-none" />
        
        <div className="relative p-1 z-10 flex flex-col h-full justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</p>
              <p className="mt-1 truncate text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{value}</p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Icon size={24} />
            </span>
          </div>
          {hint && (
            <div className="mt-4 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{hint}</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatBox 
        title="Pendiente" 
        value={money(summary.pendingNet)} 
        icon={Landmark} 
        hint={`${summary.pending?.length || 0} transacciones flotantes`} 
      />
      <StatBox 
        title="Liquidado" 
        value={money(summary.settledNet)} 
        icon={CheckCircle2} 
        hint={`${summary.settled?.length || 0} depósitos recibidos`} 
      />
      <StatBox 
        title="Comisiones" 
        value={money(summary.commissions)} 
        icon={CreditCard} 
        hint={`${(summary.commissionRate || 0).toFixed(2)}% promedio`} 
      />
      <StatBox 
        title="Volumen Bruto" 
        value={money(summary.gross)} 
        icon={Banknote} 
        hint={`${transactionsCount} pagos procesados`} 
      />
    </div>
  );
};

export default FinanceMetrics;
