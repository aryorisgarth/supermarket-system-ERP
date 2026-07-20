export const PageHeader = ({ eyebrow, title, description, actions, meta, compact }) => {
  if (compact) {
    return (
      <div className="pos-page-header shrink-0">
        <h1 className="pos-page-header-title text-[var(--app-text)]">{title}</h1>
        {meta && <div className="shrink-0">{meta}</div>}
        {actions && <div className="ui-page-actions">{actions}</div>}
      </div>
    );
  }

  return (
    <div className="ui-page-header mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="ui-eyebrow mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--app-primary)]">
            {eyebrow}
          </p>
        )}
        <h1 className="ui-page-title break-words text-2xl font-black tracking-tighter text-[var(--app-text)] sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="ui-page-description mt-2 hidden max-w-2xl text-sm font-bold leading-relaxed text-[var(--app-text-muted)] sm:block">
            {description}
          </p>
        )}
        {meta && <div className="ui-page-meta mt-3 flex flex-wrap items-center gap-2 sm:mt-4">{meta}</div>}
      </div>
      {actions && (
        <div className="ui-page-actions flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
