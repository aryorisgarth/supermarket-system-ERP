import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, GripHorizontal, X } from 'lucide-react';

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
  custom: 'Personalizado',
};

const MIN_WIDTH = 360;
const MIN_HEIGHT = 280;

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
  resizable = true,
  footer = null,
}) => {
  const panelRef = useRef(null);
  const availableSizes = useMemo(
    () => sizeOptions.filter((size) => ['sm', 'md', 'lg', 'xl', 'full'].includes(size)),
    [sizeOptions]
  );
  const defaultSize = availableSizes.includes(initialSize) ? initialSize : availableSizes[0] || 'lg';
  const [size, setSize] = useState(defaultSize);
  const [customSize, setCustomSize] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSize(defaultSize);
      setCustomSize(null);
    }
  }, [isOpen, defaultSize]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const applyPresetSize = useCallback((nextSize) => {
    setSize(nextSize);
    setCustomSize(null);
  }, []);

  const startResize = useCallback((event) => {
    event.preventDefault();
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;
    const maxWidth = window.innerWidth * 0.97;
    const maxHeight = window.innerHeight * 0.94;

    const onMove = (moveEvent) => {
      const nextWidth = Math.min(maxWidth, Math.max(MIN_WIDTH, startWidth + moveEvent.clientX - startX));
      const nextHeight = Math.min(maxHeight, Math.max(MIN_HEIGHT, startHeight + moveEvent.clientY - startY));
      setCustomSize({ width: nextWidth, height: nextHeight });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  if (!isOpen) return null;

  const sizeIndex = availableSizes.indexOf(size);
  const canShrink = !customSize && sizeIndex > 0;
  const canGrow = !customSize && sizeIndex < availableSizes.length - 1;
  const isFull = !customSize && size === 'full';
  const sizeLabel = customSize ? SIZE_LABELS.custom : SIZE_LABELS[size] || 'Ajustable';

  const panelSizeClass = customSize
    ? 'max-w-none'
    : isFull
      ? 'w-[97vw] h-[94vh] max-w-none'
      : `w-full ${SIZE_CLASS_MAP[size] || SIZE_CLASS_MAP.lg} max-h-[94vh]`;

  const panelStyle = customSize
    ? {
        width: `${customSize.width}px`,
        height: `${customSize.height}px`,
        maxWidth: '97vw',
        maxHeight: '94vh',
      }
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-3 md:p-4 animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        style={panelStyle}
        className={`relative flex flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl ${panelSizeClass} ${panelClassName}`}
      >
        <div className={`flex items-center justify-between gap-3 p-4 md:p-5 ${headerClassName}`}>
          <div className="flex min-w-0 items-center gap-3">
            {Icon ? <Icon size={22} strokeWidth={2.5} className="shrink-0" /> : null}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold uppercase tracking-wider text-inherit">{title}</h3>
              {subtitle ? (
                <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-widest opacity-80 text-inherit">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {headerActions}
            <span className="hidden md:inline-flex rounded-lg bg-black/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-80 text-inherit">
              {sizeLabel}
            </span>
            <button
              type="button"
              onClick={() => canShrink && applyPresetSize(availableSizes[sizeIndex - 1])}
              disabled={!canShrink}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Reducir tamaño"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => canGrow && applyPresetSize(availableSizes[sizeIndex + 1])}
              disabled={!canGrow}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Ampliar tamaño"
            >
              <ChevronRight size={18} />
            </button>
            {availableSizes.includes('full') ? (
              <button
                type="button"
                onClick={() => (isFull ? applyPresetSize(defaultSize) : applyPresetSize('full'))}
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

        <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>

        {footer ? <div className="shrink-0 border-t border-[var(--app-border)]">{footer}</div> : null}

        {resizable ? (
          <button
            type="button"
            aria-label="Redimensionar modal"
            onMouseDown={startResize}
            className="absolute bottom-1.5 right-1.5 z-10 flex h-7 w-7 cursor-nwse-resize items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]/95 text-[var(--app-text-muted)] shadow-sm transition-colors hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-primary)]"
            title="Arrastra para cambiar el tamaño"
          >
            <GripHorizontal size={14} className="rotate-[-45deg]" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ResponsiveModal;
