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

const AppHeader = ({ sidebarOpen, onToggleSidebar, onLogout }) => {
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

  return (
    <header className={`app-header ${isPosPage ? 'app-header--pos' : ''}`}>
      <div className="app-header-start">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="app-header-menu lg:hidden"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>

        <div className="flex items-center lg:hidden mr-2">
          <img src={logo || "/supernova_logo.png"} alt="Logo" className="h-8 w-8 object-contain rounded-lg p-0.5 bg-white border border-[var(--app-border)] shadow-sm" />
        </div>

        {!isPosPage && (
          <div className="hidden items-center gap-1.5 rounded-lg bg-[var(--app-bg-subtle)] px-2.5 py-1 text-[11.5px] font-black tabular-nums text-[var(--app-text-soft)] md:flex border border-[var(--app-border)]/50">
            <Clock size={12} className="text-[var(--app-primary)]" />
            <span className="uppercase tracking-wider">
              {time.toLocaleDateString('es-NI', { weekday: 'short', day: 'numeric', month: 'short' })} - {time.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {isPosPage && (
          <div className="flex items-center gap-3">
            <span className="app-header-pos-label hidden sm:inline">Terminal POS</span>
            <div className="hidden items-center gap-1.5 rounded-lg bg-[var(--app-bg-subtle)] px-2.5 py-1 text-[11px] font-black tabular-nums text-[var(--app-text-soft)] lg:flex">
              <Clock size={12} className="text-[var(--app-primary)]" />
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        )}
      </div>

      <div className="app-header-end">
        {showCash && (
          <CashRegisterStatus compact={isPosPage} className="app-header-cash" />
        )}

        <div className="app-header-tools">
          <ThemeToggle className="app-header-icon-btn" />
          {!isPosPage && canViewSystemAlerts() && <NotificationPanel />}
        </div>

        <div className="app-header-user border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/30 rounded-xl px-3 py-1.5 shadow-sm">
          <div className="app-header-user-text hidden sm:block">
            <p className="app-header-user-name">{fullName}</p>
            <p className="app-header-user-role">{roleName.replace(/_/g, ' ')}</p>
          </div>
          <span className="app-header-avatar sm:hidden" title={fullName}>
            {getInitials(fullName)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
