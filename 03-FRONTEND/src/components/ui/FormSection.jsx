const FormSection = ({ title, description, children, className = '', bodyClassName = '' }) => (
  <section className={`overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] ${className}`}>
    <div className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-4 py-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text)]">{title}</h3>
      {description ? (
        <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--app-text-muted)]">{description}</p>
      ) : null}
    </div>
    <div className={`space-y-4 p-4 ${bodyClassName}`}>{children}</div>
  </section>
);

export default FormSection;
