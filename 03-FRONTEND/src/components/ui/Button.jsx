const variants = {
  primary: 'ui-button-primary',
  secondary: 'ui-button-secondary',
  ghost: 'ui-button-ghost',
  danger: 'ui-button-danger',
  success: 'ui-button-success',
};

const sizes = {
  sm: 'ui-button-sm',
  md: 'ui-button-md',
  lg: 'ui-button-lg',
};

export const Button = ({
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => (
  <button className={`ui-button ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
    {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
    {children}
  </button>
);

export default Button;
