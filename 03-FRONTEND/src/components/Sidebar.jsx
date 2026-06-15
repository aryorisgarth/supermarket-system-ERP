import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthService from '../services/AuthService';
import { sections } from '../config/sidebarRoutes';


const badgeStyles = {
  live: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25',
  count: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)] border border-[var(--app-primary)]/20',
  new: 'bg-amber-500/10 text-amber-500 border border-amber-500/25',
};

const Badge = ({ badge }) => {
  if (!badge) return null;
  const isLive = badge.variant === 'live';
  return (
    <span
      className={`ml-auto shrink-0 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${badgeStyles[badge.variant] || badgeStyles.count}`}
    >
      {isLive && (
        <span className="relative flex h-1 w-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
        </span>
      )}
      {badge.text}
    </span>
  );
};

const Tooltip = ({ label, collapsed }) => {
  if (!collapsed) return null;
  return (
    <span
      className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--app-text)] opacity-0 translate-x-2 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
    >
      {label}
    </span>
  );
};

const SidebarItem = ({ icon: Icon, label, path, active, onNavigate, badge, collapsed }) => (
  <Link
    to={path}
    onClick={onNavigate}
    title={collapsed ? label : undefined}
    className={`group relative flex items-center rounded-[var(--radius-lg)] px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-[var(--app-primary)] to-blue-700 text-white shadow-md shadow-primary/15 dark:shadow-blue-500/15'
        : 'text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)]'
    } ${collapsed ? 'justify-center px-0' : 'justify-between'}`}
  >
    {active && (
      <motion.div
        layoutId="activeAccentBar"
        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-white"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    )}

    <span className={`flex min-w-0 items-center ${collapsed ? 'justify-center w-full' : 'w-full'}`}>
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
          collapsed ? 'h-10 w-10' : 'h-8 w-8'
        } ${
          active
            ? 'bg-white/20 text-white'
            : 'bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] group-hover:bg-[var(--app-surface)] group-hover:text-[var(--app-primary)] group-hover:shadow-sm'
        }`}
      >
        <Icon size={collapsed ? 20 : 18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
      </span>

      {!collapsed && (
        <span className="truncate tracking-tight ml-3.5 font-semibold text-[13px] transition-all duration-200 group-hover:translate-x-1">
          {label}
        </span>
      )}
    </span>

    {!collapsed && <Badge badge={badge} />}

    <Tooltip label={label} collapsed={collapsed} />
  </Link>
);

const Sidebar = ({ onNavigate, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [storeName, setStoreName] = useState('SuperNova');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [logo, setLogo] = useState(null);
  const searchRef = useRef(null);

  const collapsed = isCollapsed;

  const user = AuthService.getCurrentUser();
  const roleName = user?.role?.name;
  const permissionKey = (user?.permissions || []).join(',');

  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('supernova_expanded_sections');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      'Inicio': true,
      'Operaciones': true,
      'Inventario': true,
      'Bodega': true,
      'Analitica': true,
      'Sistema': true,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('supernova_expanded_sections', JSON.stringify(expandedSections));
    } catch (e) {
      console.error(e);
    }
  }, [expandedSections]);

  const toggleSection = (title) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  useEffect(() => {
    if (collapsed) setSearchQuery('');
  }, [collapsed]);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('supernova_settings');
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved);
        if (parsed.companyName) setStoreName(parsed.companyName);
      } catch (error) {
        console.error(error);
      }
    };

    const loadLogo = () => {
      const savedLogo = localStorage.getItem('supernova_logo');
      setLogo(savedLogo || null);
    };

    loadSettings();
    loadLogo();
    window.addEventListener('supernova_settings_updated', loadSettings);
    window.addEventListener('supernova_logo_updated', loadLogo);
    return () => {
      window.removeEventListener('supernova_settings_updated', loadSettings);
      window.removeEventListener('supernova_logo_updated', loadLogo);
    };
  }, []);

  const visibleSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            const roleAllowed = item.roles.includes(roleName);
            const permissions = Array.isArray(item.permissions) ? item.permissions : [];
            const permissionAllowed = permissions.length === 0 || AuthService.hasAnyPermission(permissions);
            return roleAllowed && permissionAllowed;
          }),
        }))
        .filter((section) => section.items.length > 0),
    [roleName, permissionKey]
  );

  const allItems = useMemo(
    () => visibleSections.flatMap((s) => s.items.map((item) => ({ ...item, sectionTitle: s.title }))),
    [visibleSections]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery, allItems]);

  const showSearchResults = searchFocused && searchQuery.trim().length > 0;

  const handleToggleCollapse = () => setIsCollapsed((v) => !v);

  const handleSearchNavigate = () => {
    setSearchQuery('');
    onNavigate?.();
  };

  const userInitials = useMemo(() => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'US';
  }, [user]);

  return (
    <aside
      className={`app-sidebar flex flex-col h-full transition-all duration-300 ease-in-out bg-[var(--app-surface)] border-r border-[var(--app-border)] ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{ 
        width: collapsed ? 72 : 260,
        minWidth: collapsed ? 72 : 260,
        maxWidth: collapsed ? 72 : 260 
      }}
    >
      
      <div className={`relative px-4 py-5 ${collapsed ? 'px-2' : 'px-6'}`}>
        <div className={`flex items-center gap-3.5 ${collapsed ? 'justify-center' : ''}`}>
          <motion.div
            whileHover={{ scale: 1.06, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={`flex ${collapsed ? 'h-10 w-10' : 'h-14 w-14'} shrink-0 items-center justify-center overflow-hidden transition-all duration-300`}
          >
            <img src={logo || "/supernova_logo.png"} alt="Logo" className="w-full h-full object-contain" />
          </motion.div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="min-w-0 flex-1 overflow-hidden"
            >
              <h1
                className="truncate text-base font-black tracking-tight bg-gradient-to-r from-[var(--app-primary)] to-blue-600 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent"
                title={storeName}
              >
                {storeName}
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--app-text-muted)] opacity-60">
                Enterprise POS
              </p>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={handleToggleCollapse}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] shadow-md transition-all hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)] z-30"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            <ChevronRight size={12} />
          </motion.span>
        </motion.button>
      </div>

      
      {!collapsed && (
        <div className="px-4 pb-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] pointer-events-none transition-transform duration-200"
              style={{ transform: searchFocused ? 'translateY(-50%) scale(1.1)' : 'translateY(-50%)' }}
            />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Buscar módulo..."
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] py-2 pl-8 pr-8 text-[11.5px] font-medium text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none transition focus:border-[var(--app-primary)] focus:bg-[var(--app-surface)] focus:ring-4 focus:ring-[var(--app-primary)]/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition"
              >
                <X size={12} />
              </button>
            )}
          </div>

          
          {showSearchResults && (
            <div className="absolute left-4 right-4 mt-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur-md shadow-xl overflow-hidden z-30 animate-fade-in">
              {searchResults.length === 0 ? (
                <p className="px-3 py-3 text-[11px] text-[var(--app-text-muted)]">Sin resultados</p>
              ) : (
                searchResults.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleSearchNavigate}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[11.5px] font-medium text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)] transition"
                  >
                    <item.icon size={14} className="shrink-0 text-[var(--app-text-muted)]" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] opacity-50">
                      {item.sectionTitle}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      )}

      
      <nav
        className={`pos-scroll flex-1 space-y-4 overflow-y-auto pb-4 transition-all duration-300 ${
          collapsed ? 'px-2' : 'px-4'
        }`}
      >
        {visibleSections.map((section) => {
          const isSectionExpanded = collapsed || expandedSections[section.title] !== false;
          return (
            <div key={section.title} className="space-y-1">
              {!collapsed ? (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center justify-between px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors duration-200 outline-none group"
                >
                  <span>{section.title}</span>
                  <motion.span
                    animate={{ rotate: isSectionExpanded ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                    className="text-[var(--app-text-muted)] opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown size={10} />
                  </motion.span>
                </button>
              ) : (
                <div className="mx-auto my-2 h-px w-6 bg-[var(--app-border)]/40" />
              )}
              
              <AnimatePresence initial={false}>
                {isSectionExpanded && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto", marginTop: 4 },
                      collapsed: { opacity: 0, height: 0, marginTop: 0 }
                    }}
                    transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {section.items.map((item) => (
                      <SidebarItem
                        key={item.path}
                        {...item}
                        active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))}
                        onNavigate={onNavigate}
                        collapsed={collapsed}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      
      <div className={`mt-auto p-3 ${collapsed ? 'px-1' : 'p-4'}`}>
        <div
          className={`flex items-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 transition-all duration-300 ${
            collapsed ? 'flex-col gap-2 px-0 py-3 justify-center w-full' : 'gap-3 px-4 py-3'
          }`}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold shadow-sm uppercase">
            {userInitials}
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full border-2 border-[var(--app-surface)] bg-emerald-500" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-[var(--app-text)] leading-none mb-1">
                {user?.fullName || user?.username}
              </p>
              <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--app-primary-soft)] text-[var(--app-primary)] text-[8px] font-bold uppercase tracking-wider">
                {roleName?.replace('_', ' ')}
              </span>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={async () => {
                await AuthService.logout();
              }}
              title="Cerrar sesión"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:border-[var(--app-danger)] hover:bg-[var(--app-danger-soft)] hover:text-[var(--app-danger)] transition-all duration-200 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;