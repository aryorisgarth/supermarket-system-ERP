import React from 'react';
import { Building2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import PaymentAccountCard from './PaymentAccountCard';

const PaymentAccountsGrid = ({ accounts, onEdit, onDelete }) => {
  return (
    <Card className="shadow-enterprise-lg">
      <CardHeader 
        icon={Building2} 
        title="Cuentas Bancarias Vinculadas" 
        description="Gestión de destinos para abonos de tarjeta y transferencias." 
      />
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {accounts.map((account) => (
          <PaymentAccountCard 
            key={account.id} 
            account={account} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-[var(--app-border)] p-12 text-center">
            <Building2 size={48} className="mx-auto text-[var(--app-text-muted)] opacity-30 mb-4" />
            <p className="font-bold text-[var(--app-text-muted)] uppercase tracking-widest text-xs">No hay cuentas configuradas</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentAccountsGrid;
