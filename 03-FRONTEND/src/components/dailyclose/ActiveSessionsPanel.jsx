import React from 'react';
import { Users, Wallet, Eye } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const ActiveSessionsPanel = ({ activeSessions, onOpenDetail, formatDateTime, formatMoney }) => {
  return (
    <Card className="shadow-enterprise-lg">
      <CardHeader
        icon={Users}
        title="Cajas abiertas ahora"
        description="Resumen en vivo de cada cajero con turno activo."
      />
      <div className="space-y-3">
        {activeSessions.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--app-border)] p-10 text-center">
            <Wallet size={40} className="mx-auto mb-3 text-[var(--app-text-muted)] opacity-30" />
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
              No hay turnos abiertos
            </p>
          </div>
        ) : (
          activeSessions.map((item) => {
            const session = item.session;
            return (
              <div
                key={session.id}
                className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] p-4 transition hover:border-[var(--app-primary)]/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[var(--app-text)]">{session.cashierName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                      Turno #{session.id} · {formatDateTime(session.openedAt)}
                    </p>
                  </div>
                  <Badge tone="green">Abierto</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[var(--app-text-muted)]">Fondo inicial</p>
                    <p className="font-bold tabular-nums">{formatMoney(session.openingBalance)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--app-text-muted)]">Efectivo esperado</p>
                    <p className="font-bold tabular-nums text-emerald-600">{formatMoney(item.expectedCash)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--app-text-muted)]">Ventas efectivo</p>
                    <p className="font-bold tabular-nums">{formatMoney(item.cashSales)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--app-text-muted)]">Ventas tarjeta</p>
                    <p className="font-bold tabular-nums">{formatMoney(item.cardSales)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="secondary" icon={Eye} onClick={() => onOpenDetail(session.id)}>
                    Ver detalle
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default ActiveSessionsPanel;
