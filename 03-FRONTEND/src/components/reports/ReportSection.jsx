const accentStyles = {
  primary: {
    bar: 'border-[var(--app-primary)]',
    chip: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
  },
  charts: {
    bar: 'border-indigo-500',
    chip: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
  reports: {
    bar: 'border-emerald-500',
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  analysis: {
    bar: 'border-amber-500',
    chip: 'bg-amber-500/10 text-amber-800 dark:text-amber-200',
  },
};

const ReportSection = ({ icon: Icon, title, description, accent = 'primary', children, className = '' }) => {
  const styles = accentStyles[accent] || accentStyles.primary;

  return (
    <section className={`space-y-4 ${className}`}>
      <div className={`rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] border-l-4 ${styles.bar} px-4 py-3.5 sm:px-5`}>
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.chip}`}>
              <Icon size={18} strokeWidth={2.25} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--app-text)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-[var(--app-text-muted)]">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
};

export default ReportSection;
