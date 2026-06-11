const PageLoader = ({ label = 'Cargando módulo...' }) => (
  <div className="flex min-h-[50vh] items-center justify-center text-[var(--app-text-muted)]">
    <div className="text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--app-border)] border-t-[var(--app-primary)]" />
      <p className="text-xs font-black uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default PageLoader;
