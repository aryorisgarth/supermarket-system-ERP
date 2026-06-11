import { Award } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const TopProductsList = ({ topProducts }) => (
  <Card>
    <CardHeader
      icon={Award}
      title="Productos mas vendidos"
      description="Ranking reciente de unidades vendidas."
    />
    <div className="space-y-2">
      {(topProducts || []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--app-border)] py-12 text-center text-sm font-semibold text-[var(--app-text-muted)]">
          Sin datos de ventas en el periodo
        </div>
      ) : (
        topProducts.slice(0, 5).map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] px-3 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">
                {index + 1}
              </span>
              <p className="truncate text-sm font-bold text-[var(--app-text)]">{item.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--app-primary)]">{item.quantity}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--app-text-muted)]">
                Unid.
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </Card>
);

export default TopProductsList;
