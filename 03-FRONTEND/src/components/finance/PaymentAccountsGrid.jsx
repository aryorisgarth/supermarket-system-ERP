import React from 'react';
import { Building2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import PaymentAccountCard from './PaymentAccountCard';

const PaymentAccountsGrid = ({ accounts, onEdit, onDelete }) => {
  return (
    <Card className="shadow-xl shadow-slate-200/50 dark:shadow-none border-0 ring-1 ring-slate-200 dark:ring-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <CardHeader 
        icon={Building2} 
        title="Cuentas Bancarias Vinculadas" 
        description="Destinos para abonos de tarjetas y transferencias (Lafise, Banpro, etc)." 
      />
      <div className="grid gap-5 md:grid-cols-2 mt-6 relative z-10">
        {accounts.map((account) => (
          <PaymentAccountCard 
            key={account.id} 
            account={account} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-16 text-center bg-slate-50/50 dark:bg-slate-800/20">
            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Building2 size={32} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Sin cuentas vinculadas</h3>
            <p className="font-medium text-slate-500 text-xs">Agrega una cuenta para empezar a recibir pagos</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentAccountsGrid;
