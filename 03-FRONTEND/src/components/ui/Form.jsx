export const Field = ({ label, icon: Icon, children, hint }) => (
  <label className="ui-field">
    <span className="ui-label">
      {Icon && <Icon size={13} />}
      {label}
    </span>
    {children}
    {hint && <span className="ui-hint">{hint}</span>}
  </label>
);

export const inputClassName = 'ui-input';
export const selectClassName = 'ui-input ui-select';

export default Field;
