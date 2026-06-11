export const Card = ({ children, className = '', padded = true }) => (
  <section className={`ui-card ${padded ? 'ui-card-pad' : ''} ${className}`}>
    {children}
  </section>
);

export const CardHeader = ({ title, description, action, icon: Icon }) => (
  <div className="ui-card-header">
    <div className="ui-card-title-group">
      {Icon && (
        <span className="ui-icon-tile">
          <Icon size={18} />
        </span>
      )}
      <div>
        <h3 className="ui-card-title">{title}</h3>
        {description && <p className="ui-card-description">{description}</p>}
      </div>
    </div>
    {action}
  </div>
);

export default Card;
