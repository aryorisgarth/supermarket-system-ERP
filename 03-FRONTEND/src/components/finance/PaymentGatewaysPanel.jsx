import React from 'react';
import { WalletCards } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import { PAYMENT_GATEWAY_OPTIONS, getGatewayScopeLabel } from '../../utils/paymentGateways';

const PaymentGatewaysPanel = () => {
  return (
    <Card className="border-[var(--app-primary)]/15 bg-[var(--app-primary-soft)]/20">
      <CardHeader
        icon={WalletCards}
        title="Pasarelas de pago"
        description="El POS autoriza tarjetas con la pasarela activa en application.yml (PAYMENT_GATEWAY_PROVIDER). Las cuentas aquí definen comisión y ciclo de depósito."
      />
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {PAYMENT_GATEWAY_OPTIONS.map((gateway) => (
          <div key={gateway.value} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-[var(--app-text)]">{gateway.label}</p>
              <Badge tone={gateway.scope === 'NACIONAL' ? 'blue' : gateway.scope === 'INTERNACIONAL' ? 'amber' : 'neutral'}>
                {getGatewayScopeLabel(gateway.scope)}
              </Badge>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--app-text-muted)]">{gateway.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PaymentGatewaysPanel;
