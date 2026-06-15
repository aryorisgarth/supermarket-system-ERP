import React from 'react';
import { FileText, Printer } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const AvailableReports = ({ reportCatalog, onPrintReport }) => {
  return (
    <Card>
      <CardHeader
        icon={FileText}
        title="Centro de Reportes Disponibles"
        description={`${reportCatalog.length} reportes conectados para análisis comercial, inventario, caja y clientes.`}
      />
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reportCatalog.map(({ key, name, description, count, icon: Icon }) => (
          <div key={key} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[var(--app-text)]">{name}</h4>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[var(--app-primary)] border border-[var(--app-border)]">
                    {count}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--app-text-muted)]">{description}</p>
                <button
                  type="button"
                  onClick={() => onPrintReport(key)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-soft)] transition hover:border-[var(--app-primary)] hover:text-[var(--app-primary)] cursor-pointer"
                >
                  <Printer size={12} /> Imprimir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AvailableReports;
