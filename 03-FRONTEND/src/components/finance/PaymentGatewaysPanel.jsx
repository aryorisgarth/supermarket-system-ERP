import React from 'react';
import { WalletCards, ShieldCheck, Globe2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import { PAYMENT_GATEWAY_OPTIONS, getGatewayScopeLabel } from '../../utils/paymentGateways';

const PaymentGatewaysPanel = () => {
  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="relative">
        <CardHeader
          icon={WalletCards}
          title="Pasarelas de Pago Habilitadas"
          description="Procesadores de tarjeta activos para cobros en el POS."
        />
        
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {PAYMENT_GATEWAY_OPTIONS.map((gateway) => {
            const isInternational = gateway.scope === 'INTERNACIONAL';
            return (
              <div 
                key={gateway.value} 
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                        {isInternational ? <Globe2 size={20} /> : <ShieldCheck size={20} />}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{gateway.label}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{gateway.value}</p>
                      </div>
                    </div>
                    <Badge tone="blue" className="shadow-sm">
                      {getGatewayScopeLabel(gateway.scope)}
                    </Badge>
                  </div>
                  
                  <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                    {gateway.description}
                  </p>

                  <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      Procesador Habilitado
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default PaymentGatewaysPanel;
