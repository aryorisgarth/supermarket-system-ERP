import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import SystemAlertService from '../../services/SystemAlertService';
import { canViewSystemAlerts } from '../../utils/accessControl';

const severityClass = {
  CRITICAL: 'border-l-red-500 bg-red-500/5 dark:bg-red-500/10 hover:bg-red-500/10 dark:hover:bg-red-500/15',
  WARNING: 'border-l-amber-500 bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/15',
  INFO: 'border-l-blue-500 bg-blue-500/5 dark:bg-blue-500/10 hover:bg-blue-500/10 dark:hover:bg-blue-500/15',
};

const severityIconClass = {
  CRITICAL: 'text-red-500 dark:text-red-400',
  WARNING: 'text-amber-500 dark:text-amber-400',
  INFO: 'text-blue-500 dark:text-blue-400',
};

const formatWhen = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('es-NI', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const NotificationPanel = () => {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAlerts = useCallback(async () => {
    if (!canViewSystemAlerts()) {
      setAlerts([]);
      return;
    }
    try {
      const data = await SystemAlertService.getAll({ status: 'ACTIVE' });
      setAlerts(Array.isArray(data) ? data : []);
    } catch {
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    if (!canViewSystemAlerts()) return undefined;
    loadAlerts();
    const timer = setInterval(loadAlerts, 60000);
    return () => clearInterval(timer);
  }, [loadAlerts]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const handleToggle = async () => {
    if (!open) {
      setLoading(true);
      await loadAlerts();
      setLoading(false);
    }
    setOpen((v) => !v);
  };

  const handleOpen = (alert) => {
    setOpen(false);
    if (alert.actionPath) {
      navigate(alert.actionPath);
    } else {
      navigate('/alertas');
    }
  };

  const handleResolve = async (e, alert) => {
    e.stopPropagation();
    try {
      await SystemAlertService.resolve(alert.id);
      await loadAlerts();
    } catch {
      /* silencioso */
    }
  };

  const activeCount = alerts.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="app-header-icon-btn relative"
        aria-label={`Notificaciones${activeCount ? `, ${activeCount} activas` : ''}`}
        onClick={handleToggle}
      >
        <Bell size={17} />
        {activeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-[var(--app-surface)]">
            {activeCount > 9 ? '9+' : activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
            <div>
              <p className="text-sm font-black text-[var(--app-text)]">Notificaciones</p>
              <p className="text-[10px] font-semibold text-[var(--app-text-muted)]">
                {activeCount === 0 ? 'Sin alertas activas' : `${activeCount} alerta(s) activa(s)`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/alertas'); }}
              className="text-[10px] font-bold text-[var(--app-primary)] hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-[var(--app-text-muted)]">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-xs font-semibold">Cargando…</span>
              </div>
            ) : activeCount === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-[var(--app-text-muted)]">
                <CheckCircle2 size={28} className="text-emerald-500 opacity-80" />
                <p className="text-xs font-semibold">Todo en orden por ahora.</p>
              </div>
            ) : (
              alerts.slice(0, 8).map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => handleOpen(alert)}
                  className={`flex w-full items-start gap-3 border-b border-[var(--app-border)] border-l-4 px-4 py-3 text-left transition ${severityClass[alert.severity] || severityClass.INFO}`}
                >
                  <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${severityIconClass[alert.severity] || severityIconClass.INFO}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-[var(--app-text)]">{alert.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] font-medium text-[var(--app-text-soft)]">{alert.message}</p>
                    <p className="mt-1 text-[9px] font-semibold text-[var(--app-text-muted)]">{formatWhen(alert.createdAt)}</p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleResolve(e, alert)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResolve(e, alert)}
                    className="shrink-0 rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-emerald-500/10 hover:text-emerald-600"
                    title="Marcar como resuelta"
                  >
                    <CheckCircle2 size={14} />
                  </span>
                </button>
              ))
            )}
          </div>

          {activeCount > 0 && (
            <div className="border-t border-[var(--app-border)] px-4 py-2.5">
              <button
                type="button"
                onClick={() => { setOpen(false); navigate('/alertas'); }}
                className="flex w-full items-center justify-center gap-1.5 text-[11px] font-bold text-[var(--app-primary)] hover:underline"
              >
                <ExternalLink size={12} /> Ir al centro de alertas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
