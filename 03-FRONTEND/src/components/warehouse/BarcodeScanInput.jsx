import { Barcode } from 'lucide-react';
import { forwardRef } from 'react';

const BarcodeScanInput = forwardRef(({
  value,
  onChange,
  onKeyDown,
  disabled = false,
  placeholder = 'Escanee código de barras y presione Enter...',
  className = '',
}, ref) => (
  <div className={`relative ${className}`}>
    <Barcode
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-primary)] pointer-events-none"
    />
    <input
      ref={ref}
      className="ui-input w-full pl-10 font-mono"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      autoComplete="off"
      spellCheck={false}
    />
  </div>
));

BarcodeScanInput.displayName = 'BarcodeScanInput';

export default BarcodeScanInput;
