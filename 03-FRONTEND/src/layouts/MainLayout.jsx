import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AuthService from '../services/AuthService';
import AppHeader from '../components/layout/AppHeader';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('supernova_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const isPosPage = location.pathname === '/facturacion';

  const [permissionsTick, setPermissionsTick] = useState(0);

  const refreshSessionUser = useCallback(async () => {
    await AuthService.refreshCurrentUser();
    setPermissionsTick((value) => value + 1);
  }, []);

  useEffect(() => {
    refreshSessionUser();
    const onFocus = () => { refreshSessionUser(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshSessionUser]);

  useEffect(() => {
    try {
      localStorage.setItem('supernova_sidebar_collapsed', String(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  const handleLogout = async () => {
    await AuthService.logout();
  };

  return (
    <div className="app-shell flex h-screen w-full bg-[var(--app-bg)] overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar navegacion"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 h-full transition-all duration-300
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
        `}
      >
        <Sidebar
          key={permissionsTick}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onLogout={handleLogout}
        />

        <div
          className={`flex min-h-0 flex-1 flex-col overflow-x-hidden safe-padding-x ${
            isPosPage ? 'overflow-hidden p-1 sm:p-2' : 'overflow-y-auto p-4 sm:p-6 pos-scroll'
          }`}
        >
          <div
            className={`app-page-flex mx-auto w-full min-w-0 ${
              isPosPage ? 'h-full max-w-none min-h-0 animate-fade-in' : 'max-w-[1600px] animate-fade-in'
            }`}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
