import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

const SIZE_CLASS_MAP = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
};

const SIZE_LABELS = {
  sm: 'Compacto',
  md: 'Mediano',
  lg: 'Grande',
  xl: 'Amplio',
  full: 'Pantalla completa',
};

const ResponsiveModal = ({
  isOpen = true,
  onClose,
  icon: Icon,
  title,
  subtitle,
  children,
  headerActions = null,
  initialSize = 'lg',
  sizeOptions = ['md', 'lg', 'xl', 'full'],
  bodyClassName = '',
  panelClassName = '',
  headerClassName = 'bg-[var(--app-primary)] text-white',
}) => {
  const availableSizes = useMemo(
    () => sizeOptions.filter((size) => ['sm', 'md', 'lg', 'xl', 'full'].includes(size)),
    [sizeOptions]
  );
  const defaultSize = availableSizes.includes(initialSize) ? initialSize : availableSizes[0] || 'lg';
  const [size, setSize] = useState(defaultSize);

  useEffect(() => {
    if (isOpen) {
      setSize(defaultSize);
    }
  }, [isOpen, defaultSize]);

  if (!isOpen) return null;

  const sizeIndex = availableSizes.indexOf(size);
  const canShrink = sizeIndex > 0;
  const canGrow = sizeIndex < availableSizes.length - 1;
  const isFull = size === 'full';

  const panelSizeClass = isFull
    ? 'w-[97vw] h-[94vh] max-w-none'
    : `w-full ${SIZE_CLASS_MAP[size] || SIZE_CLASS_MAP.lg} max-h-[94vh]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 md:p-4 animate-fade-in">
      <div
        className={`flex flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl ${panelSizeClass} ${panelClassName}`}
      >
        <div className={`flex items-center justify-between gap-3 p-4 md:p-5 ${headerClassName}`}>
          <div className="flex min-w-0 items-center gap-3">
            {Icon ? <Icon size={22} strokeWidth={2.5} className="shrink-0" /> : null}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold uppercase tracking-wider">{title}</h3>
              {subtitle ? (
                <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-widest text-white/80">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {headerActions}
            <span className="hidden md:inline-flex rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
              {SIZE_LABELS[size] || 'Ajustable'}
            </span>
            <button
              type="button"
              onClick={() => canShrink && setSize(availableSizes[sizeIndex - 1])}
              disabled={!canShrink}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Reducir tamaño"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => canGrow && setSize(availableSizes[sizeIndex + 1])}
              disabled={!canGrow}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Ampliar tamaño"
            >
              <ChevronRight size={18} />
            </button>
            {availableSizes.includes('full') ? (
              <button
                type="button"
                onClick={() => setSize(isFull ? defaultSize : 'full')}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                title={isFull ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                <Expand size={18} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveModal;
