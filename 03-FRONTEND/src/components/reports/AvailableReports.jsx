import React from 'react';
import { FileText, Printer } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const AREA_META = {
  commercial: {
    title: 'Área Comercial',
    description: 'Ventas, ingresos, clientes y métodos de pago.',
    tone: 'border-[var(--app-primary)] bg-[var(--app-primary-soft)]/30',
    badge: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
  },
  inventory: {
    title: 'Área de Inventario',
    description: 'Movimientos, rotación y alertas de stock.',
    tone: 'border-emerald-500 bg-emerald-500/5',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  operations: {
    title: 'Área Operativa',
    description: 'Compras, caja y comparativos de abastecimiento.',
    tone: 'border-amber-500 bg-amber-500/5',
    badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-200',
  },
};

const AvailableReports = ({ reportCatalog, onPrintReport }) => {
  const grouped = reportCatalog.reduce((acc, item) => {
    const key = item.area || 'commercial';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const areaOrder = ['commercial', 'inventory', 'operations'];

  return (
    <Card>
      <CardHeader
        icon={FileText}
        title="Centro de Reportes Disponibles"
        description={`${reportCatalog.length} reportes organizados por área de negocio.`}
      />
      <div className="mt-5 space-y-6">
        {areaOrder.map((areaKey) => {
          const items = grouped[areaKey];
          if (!items?.length) return null;
          const meta = AREA_META[areaKey];

          return (
            <div key={areaKey} className={`rounded-2xl border border-l-4 p-4 ${meta.tone}`}>
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text)]">{meta.title}</h4>
                <p className="mt-0.5 text-[11px] text-[var(--app-text-muted)]">{meta.description}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map(({ key, name, description, count, icon: Icon }) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.badge}`}>
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-[var(--app-text)]">{name}</h5>
                          <span className="rounded-full border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--app-text-muted)]">
                            {count}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[var(--app-text-muted)]">{description}</p>
                        <button
                          type="button"
                          onClick={() => onPrintReport(key)}
                          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-soft)] transition hover:border-[var(--app-primary)] hover:text-[var(--app-primary)]"
                        >
                          <Printer size={12} /> Imprimir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AvailableReports;
