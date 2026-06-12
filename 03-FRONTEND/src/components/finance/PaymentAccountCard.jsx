import React from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { getGatewayOption, getGatewayScopeLabel } from '../../utils/paymentGateways';

const PaymentAccountCard = ({ account, onEdit, onDelete }) => {
  const gateway = getGatewayOption(account.gatewayProvider);

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] p-5 group hover:border-[var(--app-primary)]/40 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-black text-[var(--app-text)] text-lg truncate group-hover:text-[var(--app-primary)] transition-colors">
            {account.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-black text-[var(--app-text-soft)] uppercase">{account.bankName}</span>
            <span className="text-[10px] font-bold text-[var(--app-text-muted)] font-mono bg-[var(--app-bg-subtle)] px-1.5 py-0.5 rounded border border-[var(--app-border)]">
              {account.accountNumberMasked}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          {account.isDefault && <Badge tone="blue">Principal</Badge>}
          <Badge tone={account.isActive ? 'green' : 'red'}>{account.isActive ? 'Activa' : 'Inactiva'}</Badge>
        </div>
      </div>
      
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-tight text-[var(--app-text-soft)]">
        <div className="flex justify-between border-b border-[var(--app-border)] pb-1 col-span-2">
          <span className="text-[var(--app-text-muted)]">Titular</span>
          <span className="truncate ml-2">{account.accountHolder}</span>
        </div>
        <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
          <span className="text-[var(--app-text-muted)]">Pasarela</span>
          <span className="truncate ml-1">{gateway.label}</span>
        </div>
        <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
          <span className="text-[var(--app-text-muted)]">Alcance</span>
          <span>{getGatewayScopeLabel(gateway.scope)}</span>
        </div>
        <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
          <span className="text-[var(--app-text-muted)]">Comisión</span>
          <span>{account.commissionPercentage}%</span>
        </div>
        <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
          <span className="text-[var(--app-text-muted)]">Ciclo</span>
          <span>T+{account.settlementDays}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button size="sm" variant="secondary" className="flex-1" onClick={() => onEdit(account)}>
          Editar
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          icon={Trash2} 
          className="text-[var(--app-danger)] hover:bg-[var(--app-danger-soft)]" 
          onClick={() => onDelete(account)} 
        />
      </div>
    </div>
  );
};

export default PaymentAccountCard;
