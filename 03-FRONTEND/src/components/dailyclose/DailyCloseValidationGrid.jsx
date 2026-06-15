import React from 'react';
import { AlertTriangle, ShieldCheck, FileText, Eye, Printer } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const DailyCloseValidationGrid = ({
  alerts,
  officialClosure,
  closing,
  closureNotes,
  setClosureNotes,
  onCloseOfficially,
  closureHistory,
  onOpenHistory,
  onPrintHistory,
  formatMoney,
  date
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon={AlertTriangle} title="Alertas de cierre" description="Puntos que deben revisarse antes de firmar el día." />
        <div className="mt-4 space-y-3">
          {alerts.map((alert, index) => (
            <div key={`${alert.title}-${index}`} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
              <Badge tone={alert.tone}>{alert.title}</Badge>
              <p className="mt-2 text-sm font-bold text-[var(--app-text-soft)]">{alert.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader icon={ShieldCheck} title="Acta de validación" description="Checklist mínimo para cierre administrativo." />
        <div className="mt-4 space-y-3 text-sm font-bold text-[var(--app-text-soft)]">
          <label className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] p-3">
            <input type="checkbox" className="h-4 w-4" /> Todas las cajas fueron revisadas.
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] p-3">
            <input type="checkbox" className="h-4 w-4" /> Diferencias justificadas en observaciones.
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] p-3">
            <input type="checkbox" className="h-4 w-4" /> Compras parciales y stock crítico revisados.
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-[var(--app-border)] p-3">
            <input type="checkbox" className="h-4 w-4" /> Liquidaciones pendientes conciliadas o programadas.
          </label>
          <label className="ui-field pt-2">
            <span className="ui-label">Notas oficiales del cierre</span>
            <textarea
              className="ui-input min-h-[96px] resize-none"
              value={closureNotes}
              disabled={Boolean(officialClosure)}
              maxLength={500}
              onChange={(event) => setClosureNotes(event.target.value)}
              placeholder="Observaciones del responsable, diferencias justificadas, pendientes para el siguiente turno..."
            />
          </label>
          {!officialClosure && (
            <Button
              type="button"
              variant="success"
              icon={ShieldCheck}
              onClick={onCloseOfficially}
              disabled={closing}
              className="w-full"
            >
              {closing ? 'Guardando cierre...' : 'Cerrar día oficialmente'}
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader icon={FileText} title="Firma interna" />
        <div className="mt-5 space-y-5">
          <div className="border-b border-dashed border-[var(--app-border)] pb-8">
            <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Responsable de cierre</p>
          </div>
          <div className="border-b border-dashed border-[var(--app-border)] pb-8">
            <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Supervisor / administración</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={FileText} title="Historial de cierres" description="Últimas actas oficiales guardadas." />
        <div className="mt-4 space-y-2">
          {closureHistory.slice(0, 12).map((closure) => (
            <div
              key={closure.id}
              className={`rounded-xl border p-3 transition ${
                date === closure.closureDate
                  ? 'border-[var(--app-primary)]/50 bg-[var(--app-primary-soft)]/30'
                  : 'border-[var(--app-border)] hover:border-[var(--app-primary)]/40 hover:bg-[var(--app-bg-subtle)]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-[var(--app-text)]">{closure.closureDate}</span>
                <Badge tone="green">{formatMoney(closure.totalSales)}</Badge>
              </div>
              <p className="mt-1 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                {closure.salesCount} ventas · {closure.closedBy?.fullName || 'Usuario'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenHistory(closure)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--app-border)] px-2.5 py-1.5 text-[10px] font-bold uppercase text-[var(--app-text-soft)] hover:bg-[var(--app-surface)] cursor-pointer"
                >
                  <Eye size={12} /> Ver acta
                </button>
                <button
                  type="button"
                  onClick={() => onPrintHistory(closure)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--app-primary)]/30 bg-[var(--app-primary-soft)] px-2.5 py-1.5 text-[10px] font-bold uppercase text-[var(--app-primary)] hover:opacity-90 cursor-pointer"
                >
                  <Printer size={12} /> Imprimir
                </button>
              </div>
            </div>
          ))}
          {closureHistory.length === 0 && (
            <p className="rounded-xl border border-dashed border-[var(--app-border)] p-6 text-center text-xs font-bold text-[var(--app-text-muted)]">
              Aún no hay cierres oficiales guardados.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DailyCloseValidationGrid;
