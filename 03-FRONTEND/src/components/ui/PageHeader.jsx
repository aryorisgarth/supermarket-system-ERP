export const PageHeader = ({ eyebrow, title, description, actions, meta, compact }) => {
  if (compact) {
    return (
      <div className="pos-page-header shrink-0">
        <h1 className="pos-page-header-title">{title}</h1>
        {meta && <div className="shrink-0">{meta}</div>}
        {actions && <div className="ui-page-actions">{actions}</div>}
      </div>
    );
  }

  return (
    <div className="ui-page-header shrink-0">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
        <h1 className="ui-page-title break-words">{title}</h1>
        {description && <p className="ui-page-description hidden sm:block">{description}</p>}
        {meta && <div className="ui-page-meta">{meta}</div>}
      </div>
      {actions && <div className="ui-page-actions w-full sm:w-auto">{actions}</div>}
    </div>
  );
};

export default PageHeader;
