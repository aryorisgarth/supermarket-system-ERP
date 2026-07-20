import { Clock, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import Button from '../ui/Button';
import ThemeToggle from '../ThemeToggle';
import CashRegisterStatus from '../CashRegisterStatus';
import NotificationPanel from './NotificationPanel';
import { canViewSystemAlerts } from '../../utils/accessControl';

const getInitials = (name) =>
  String(name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

const CASH_ROLES = ['CAJERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'];

const AppHeader = ({ sidebarOpen, onToggleSidebar }) => {
  const location = useLocation();
  const isPosPage = location.pathname === '/facturacion';
  const user = AuthService.getCurrentUser();
  const fullName = user?.fullName || 'Usuario';
  const roleName = user?.role?.name || 'Invitado';
  const showCash = CASH_ROLES.includes(roleName);

  const [time, setTime] = useState(new Date());
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadLogo = () => {
      const savedLogo = localStorage.getItem('supernova_logo');
      setLogo(savedLogo || null);
    };

    loadLogo();
    window.addEventListener('supernova_logo_updated', loadLogo);
    return () => window.removeEventListener('supernova_logo_updated', loadLogo);
  }, []);

  const dateLabel = time.toLocaleDateString('es-NI', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timeLabel = time.toLocaleTimeString('es-NI', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const posTimeLabel = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const headerShellClass = isPosPage
    ? 'px-2 py-1 sm:px-3 sm:py-1.5'
    : 'px-2 py-1.5 sm:px-3 sm:py-2 md:px-4';

  const clockChipClass =
    'inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold tabular-nums uppercase tracking-wide text-slate-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px]';

  const userCardClass =
    'flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/60 sm:px-3 sm:py-1.5';

  const toolsWrapClass =
    'flex items-center gap-0.5 border-slate-200 sm:gap-1 md:border-l md:border-r md:px-1 dark:border-zinc-700';

  return (
    <header
      className={`app-header sticky top-0 z-30 w-full shrink-0 border-b border-slate-200 bg-white/95 text-slate-900 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-100 ${headerShellClass} ${isPosPage ? 'app-header--pos' : ''}`}
    >
      <div className="flex w-full flex-col gap-1.5 sm:gap-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="app-header-menu shrink-0 lg:hidden"
              onClick={onToggleSidebar}
              aria-label={sidebarOpen ? 'Cerrar menu' : 'Abrir menu'}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>

            <div className="flex h-7 w-7 shrink-0 items-center overflow-hidden sm:h-8 sm:w-8 lg:hidden">
              <img
                src={logo || '/supernova_logo.png'}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {!isPosPage && (
              <div className={`${clockChipClass} hidden md:inline-flex`}>
                <Clock size={12} className="shrink-0 text-blue-800 dark:text-blue-400" />
                <span>
                  {dateLabel} - {timeLabel}
                </span>
              </div>
            )}

            {!isPosPage && (
              <div className={`${clockChipClass} md:hidden`}>
                <Clock size={11} className="shrink-0 text-blue-800 dark:text-blue-400" />
                <span>{timeLabel}</span>
              </div>
            )}

            {isPosPage && (
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-500 dark:text-zinc-400 sm:text-[11px]">
                  Terminal POS
                </span>
                <div className={`${clockChipClass} hidden lg:inline-flex`}>
                  <Clock size={12} className="shrink-0 text-blue-800 dark:text-blue-400" />
                  <span>{posTimeLabel}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 md:gap-2">
            {showCash && (
              <div className="hidden min-w-0 md:block">
                <CashRegisterStatus compact={isPosPage} className="app-header-cash max-w-[280px]" />
              </div>
            )}

            <div className={toolsWrapClass}>
              <ThemeToggle className="app-header-icon-btn" />
              {!isPosPage && canViewSystemAlerts() && <NotificationPanel />}
            </div>

            <div className={userCardClass}>
              <div className="app-header-user-text hidden min-w-0 sm:block">
                <p className="truncate text-[11px] font-extrabold leading-tight text-slate-900 dark:text-zinc-100">
                  {fullName}
                </p>
                <p className="truncate text-[9px] font-bold uppercase tracking-[0.06em] text-slate-500 dark:text-zinc-400">
                  {roleName.replace(/_/g, ' ')}
                </p>
              </div>
              <span
                className="app-header-avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[11px] font-extrabold text-blue-800 sm:hidden dark:bg-blue-500/20 dark:text-blue-300"
                title={fullName}
              >
                {getInitials(fullName)}
              </span>
            </div>
          </div>
        </div>

        {showCash && (
          <div className="w-full min-w-0 md:hidden">
            <CashRegisterStatus compact className="app-header-cash w-full max-w-none" />
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
