import React from 'react';
import Card from '../ui/Card';
import { PackageCheck } from 'lucide-react';

const ReceivePedagogicalSummary = ({ lines }) => {
  return (
    <Card className="border-[var(--app-border)] bg-[var(--app-surface)] shadow-md">
      <div className="flex items-center gap-2 mb-4 border-b border-[var(--app-border)] pb-3">
        <PackageCheck className="text-[var(--app-text)]" size={20} />
        <h4 className="text-sm font-extrabold uppercase tracking-widest text-[var(--app-text)]">
          ¿Qué y cómo debo recibir?
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lines.map((line) => {
          const isPack = line.unitsPerPack > 1;
          return (
            <div
              key={line.itemId}
              className="p-4 bg-[var(--app-surface)] rounded-xl border border-[var(--app-border)] text-sm text-[var(--app-text)] space-y-3"
            >
              <p className="font-extrabold text-sm text-[var(--app-text)] border-b border-[var(--app-border)] pb-2 flex items-center justify-between">
                <span>{line.productName}</span>
                <span className="text-xs font-bold bg-[var(--app-bg-subtle)] text-[var(--app-text)] px-2 py-1 rounded">
                  Pendiente: {line.pending}
                </span>
              </p>
              <p className="leading-relaxed">
                Mira, el proveedor entregará{' '}
                <strong>
                  {line.quantityInPacks}{' '}
                  {line.packLabel === 'UN' ? 'unidades sueltas' : line.packLabel.toUpperCase()}
                </strong>
                .
              </p>
              {isPack && (
                <p className="leading-relaxed text-xs">
                  Esa presentación trae <strong>{line.unitsPerPack} unidades base</strong>, lo que
                  significa que en total recibirás <strong>{line.pending} unidades al inventario</strong>.
                </p>
              )}
              <div className="bg-[var(--app-bg-subtle)]/50 p-3 rounded-lg text-xs text-[var(--app-text)] mt-3 font-semibold border border-[var(--app-border)]/50">
                En el lector, tú escanearás el código{' '}
                <code className="bg-[var(--app-surface)] px-1.5 py-0.5 border border-[var(--app-border)] rounded font-mono font-bold text-sm select-all mx-1">
                  {line.barcode}
                </code>
                .
                <div className="mt-2 flex flex-col gap-1.5 border-t border-[var(--app-border)]/50 pt-2">
                  <span className="flex justify-between items-center">
                    <span>Escaneas 1 vez:</span>{' '}
                    <strong className="text-[var(--app-primary)]">+{line.unitsPerPack} unid.</strong>
                  </span>
                  {line.quantityInPacks > 1 && (
                    <span className="flex justify-between items-center text-[var(--app-text)]">
                      <span>Escaneas {line.quantityInPacks} veces:</span>{' '}
                      <strong>+{line.pending} unid. (Completado)</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ReceivePedagogicalSummary;
