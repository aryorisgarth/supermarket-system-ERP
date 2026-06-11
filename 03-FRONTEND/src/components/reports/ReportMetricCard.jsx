import Card from '../ui/Card';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const ReportMetricCard = ({ title, value, change, isPositive }) => (
  <Card className="min-h-[120px]">
    <p className="ui-eyebrow mb-2 text-[var(--app-text-muted)]">{title}</p>
    <div className="flex items-end justify-between gap-3">
      <h3 className="text-xl sm:text-2xl font-bold text-[var(--app-text)] break-words">{value}</h3>
      {change !== undefined && change !== null && (
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${
            isPositive
              ? 'border-[var(--app-success)]/30 bg-[var(--app-success-soft)] text-[var(--app-success)]'
              : 'border-[var(--app-danger)]/30 bg-[var(--app-danger-soft)] text-[var(--app-danger)]'
          }`}
        >
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}%
        </span>
      )}
    </div>
  </Card>
);

export default ReportMetricCard;
