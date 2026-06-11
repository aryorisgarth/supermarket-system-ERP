import Card from '../ui/Card';

const toneClasses = {
  blue: 'text-[var(--app-primary)] bg-[var(--app-primary-soft)]',
  green: 'text-[var(--app-success)] bg-[var(--app-success-soft)]',
  amber: 'text-[var(--app-warning)] bg-[var(--app-warning-soft)]',
  red: 'text-[var(--app-danger)] bg-[var(--app-danger-soft)]',
};

const StatCard = ({ title, value, icon: Icon, tone = 'blue', note }) => (
  <Card className="min-h-[132px]">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="ui-eyebrow mb-2 text-[var(--app-text-muted)]">{title}</p>
        <h3 className="truncate text-2xl font-bold text-[var(--app-text)]">{value}</h3>
        {note && <p className="mt-3 text-xs font-semibold text-[var(--app-text-muted)]">{note}</p>}
      </div>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone] || toneClasses.blue}`}
      >
        <Icon size={21} />
      </span>
    </div>
  </Card>
);

export default StatCard;
