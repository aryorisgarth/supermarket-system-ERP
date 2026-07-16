import React from 'react';
import { WalletCards, ShieldCheck, Globe2, CreditCard } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import { PAYMENT_GATEWAY_OPTIONS, getGatewayScopeLabel } from '../../utils/paymentGateways';

const PaymentGatewaysPanel = () => {
  return (
    <Card className="border border-[var(--app-border)] bg-[var(--app-surface)]">
      <CardHeader
        icon={WalletCards}
        title="Pasarelas de pago"
        description="Stripe y demás procesadores. Los cobros con tarjeta del POS aparecen en la pestaña Conciliación."
      />

      <div className="mt-5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60 px-4 py-3 text-xs text-[var(--app-text-soft)]">
        <div className="mb-1 flex items-center gap-2 font-bold text-[var(--app-text)]">
          <CreditCard size={14} className="text-[var(--app-primary)]" /> ¿Dónde veo los pagos de Stripe?
        </div>
        Ve a la pestaña <strong>Conciliación</strong>. Cada venta con tarjeta genera una fila con referencia{' '}
        <code className="rounded bg-[var(--app-surface)] px-1">pi_...</code> (PaymentIntent de Stripe).
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {PAYMENT_GATEWAY_OPTIONS.map((gateway) => {
          const isInternational = gateway.scope === 'INTERNACIONAL';
          const isStripe = gateway.value === 'STRIPE';
          return (
            <div
              key={gateway.value}
              className={`rounded-xl border p-4 ${
                isStripe
                  ? 'border-[var(--app-primary)]/40 bg-[var(--app-primary-soft)]/30'
                  : 'border-[var(--app-border)] bg-[var(--app-surface)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary)] text-white">
                    {isInternational ? <Globe2 size={18} /> : <ShieldCheck size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--app-text)]">{gateway.label}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                      {gateway.value}
                    </p>
                  </div>
                </div>
                <Badge tone={isStripe ? 'blue' : 'neutral'}>{getGatewayScopeLabel(gateway.scope)}</Badge>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--app-text-soft)]">{gateway.description}</p>
              {isStripe ? (
                <p className="mt-2 text-[11px] font-medium text-[var(--app-primary)]">
                  Requiere STRIPE_SECRET_KEY + VITE_STRIPE_PUBLIC_KEY (mismo modo test).
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PaymentGatewaysPanel;
