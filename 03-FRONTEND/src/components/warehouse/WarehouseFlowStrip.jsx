import { ArrowRight, ClipboardCheck, PackageCheck, Send, ShoppingCart } from 'lucide-react';

const STEPS = [
  {
    icon: ShoppingCart,
    label: '1. Comprar',
    hint: 'OC ordenada',
  },
  {
    icon: PackageCheck,
    label: '2. Recibir',
    hint: 'Stock en bodega',
  },
  {
    icon: Send,
    label: '3. Trasladar',
    hint: 'Bodega → piso',
  },
  {
    icon: ClipboardCheck,
    label: '4. Contar',
    hint: 'Stock total',
  },
];

/**
 * Mini-flujo operativo para orientar compras / bodega / conteo.
 * activeStep: 1..4 (opcional)
 */
const WarehouseFlowStrip = ({ activeStep = null, className = '' }) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 px-3 py-3 sm:px-4 ${className}`}
    >
      <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
        Flujo operativo
      </p>
      <div className="flex flex-wrap items-center gap-2 sm:gap-1">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const stepNumber = index + 1;
          const isActive = activeStep === stepNumber;
          return (
            <div key={step.label} className="flex items-center gap-1 sm:gap-2">
              <div
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 ${
                  isActive
                    ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                    : 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-soft)]'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold leading-none">{step.label}</p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide opacity-70">{step.hint}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <ArrowRight size={12} className="hidden text-[var(--app-text-muted)] sm:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarehouseFlowStrip;
