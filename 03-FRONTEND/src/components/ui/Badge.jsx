const tones = {
  neutral: 'ui-badge-neutral',
  blue: 'ui-badge-blue',
  green: 'ui-badge-green',
  amber: 'ui-badge-amber',
  red: 'ui-badge-red',
};

export const Badge = ({ children, tone = 'neutral', icon: Icon, className = '' }) => (
  <span className={`ui-badge ${tones[tone]} ${className}`}>
    {Icon && <Icon size={12} />}
    {children}
  </span>
);

export default Badge;
