import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Landing from './pages/Landing';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/ui/PageLoader';
import { ThemeProvider } from './context/ThemeContext';
import { CashRegisterProvider } from './context/CashRegisterContext';
import AuthService from './services/AuthService';
import { getDefaultPathForRole } from './utils/authRoutes';
import { normalizeRoleName } from './utils/rolePermissions';
import {
  LazyRoleHome,
  LazyInventory,
  LazyBatchManagement,
  LazyPromotions,
  LazyElectronicInvoices,
  LazyBilling,
  LazySuppliers,
  LazyPurchases,
  LazyCategories,
  LazyUsers,
  LazyReports,
  LazyMaintenance,
  LazyAuditLogs,
  LazySettings,
  LazyAdminBillingControl,
  LazyFinance,
  LazyCashRegisterControl,
  LazyDailyClose,
  LazySystemAlerts,
  LazyProfile,
  LazyCashierDashboard,
  LazyWarehouseDashboard,
  LazyWarehouseReceptionList,
  LazyWarehouseReceiveOrder,
  LazyWarehouseProducts,
  LazyWarehouseCountList,
  LazyWarehouseCountSession,
  LazyNotificationRules,
  LazyBrands,
  LazyLocations,
  LazyCustomers,
} from './routes/lazyPages';

const LazyPage = ({ Page }) => (
  <Suspense fallback={<PageLoader />}>
    <Page />
  </Suspense>
);

const AuthLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--app-text-muted)]">
    <div className="text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--app-border)] border-t-[var(--app-primary)]" />
      <p className="text-xs font-bold uppercase tracking-widest">Validando sesión...</p>
    </div>
  </div>
);

const RoleHomeRedirect = () => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const roleName = AuthService.getCurrentUser()?.role?.name;
  return <Navigate to={getDefaultPathForRole(roleName)} replace />;
};

const RootRoute = () => {
  if (!AuthService.isAuthenticated()) {
    return <Landing />;
  }
  const roleName = AuthService.getCurrentUser()?.role?.name;
  const defaultPath = getDefaultPathForRole(roleName);
  
  if (defaultPath === '/') {
    return (
      <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CONSULTOR']}>
        <LazyPage Page={LazyRoleHome} />
      </ProtectedRoute>
    );
  }
  
  return <Navigate to={defaultPath} replace />;
};

const ProtectedRoute = ({ children, allowedRoles, allowedPermissions }) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles || allowedPermissions) {
    const user = AuthService.getCurrentUser();
    const roleName = normalizeRoleName(user?.role?.name);
    
    if (allowedPermissions && allowedPermissions.length > 0) {
      // Si la ruta requiere permisos específicos, el acceso se determina SOLO por los permisos.
      if (!AuthService.hasAnyPermission(allowedPermissions)) {
        return <Navigate to={getDefaultPathForRole(roleName)} replace />;
      }
    } else if (allowedRoles && allowedRoles.length > 0) {
      // Si no hay permisos requeridos, validamos por rol
      const roleAllowed = allowedRoles.some((role) => normalizeRoleName(role) === roleName);
      if (!roleAllowed) {
        return <Navigate to={getDefaultPathForRole(roleName)} replace />;
      }
    }
  }

  return <MainLayout>{children}</MainLayout>;
};

function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AuthService.init().finally(() => {
      if (mounted) setAuthReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!authReady) {
    return (
      <ThemeProvider>
        <AuthLoading />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <CashRegisterProvider>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            <Route path="/cajero" element={
              <ProtectedRoute allowedRoles={['CAJERO']}>
                <LazyPage Page={LazyCashierDashboard} />
              </ProtectedRoute>
            } />

            <Route path="/bodega" element={
              <ProtectedRoute allowedRoles={['BODEGUERO']} allowedPermissions={['PURCHASE_RECEIVE', 'INVENTORY_VIEW']}>
                <LazyPage Page={LazyWarehouseDashboard} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/recepcion" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PURCHASE_RECEIVE']}>
                <LazyPage Page={LazyWarehouseReceptionList} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/recepcion/:orderId" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PURCHASE_RECEIVE']}>
                <LazyPage Page={LazyWarehouseReceiveOrder} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/productos" element={
              <ProtectedRoute allowedRoles={['BODEGUERO']} allowedPermissions={['INVENTORY_VIEW']}>
                <LazyPage Page={LazyWarehouseProducts} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/conteo" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_COUNT', 'INVENTORY_ADJUST']}>
                <LazyPage Page={LazyWarehouseCountList} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/conteo/:sessionId" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_COUNT', 'INVENTORY_ADJUST']}>
                <LazyPage Page={LazyWarehouseCountSession} />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<RootRoute />} />
            
            <Route path="/inventario" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST']}>
                <LazyPage Page={LazyInventory} />
              </ProtectedRoute>
            } />

            <Route path="/lotes" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST', 'BATCH_MANAGE']}>
                <LazyPage Page={LazyBatchManagement} />
              </ProtectedRoute>
            } />

            <Route path="/promociones" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PROMO_MANAGE']}>
                <LazyPage Page={LazyPromotions} />
              </ProtectedRoute>
            } />

            <Route path="/facturas-electronicas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['EINVOICE_VIEW']}>
                <LazyPage Page={LazyElectronicInvoices} />
              </ProtectedRoute>
            } />

            <Route path="/proveedores" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PURCHASE_MANAGE', 'PURCHASE_RECEIVE']}>
                <LazyPage Page={LazySuppliers} />
              </ProtectedRoute>
            } />

            <Route path="/compras" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PURCHASE_MANAGE', 'PURCHASE_RECEIVE']}>
                <LazyPage Page={LazyPurchases} />
              </ProtectedRoute>
            } />

            <Route path="/categorias" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST']}>
                <LazyPage Page={LazyCategories} />
              </ProtectedRoute>
            } />

            <Route path="/marcas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST']}>
                <LazyPage Page={LazyBrands} />
              </ProtectedRoute>
            } />

            <Route path="/ubicaciones" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'BODEGUERO']} allowedPermissions={['INVENTORY_ADJUST', 'WAREHOUSE_LOCATION']}>
                <LazyPage Page={LazyLocations} />
              </ProtectedRoute>
            } />

            <Route path="/facturacion" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CAJERO']} allowedPermissions={['SALE_CREATE']}>
                <LazyPage Page={LazyBilling} />
              </ProtectedRoute>
            } />

            <Route path="/clientes" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']}>
                <LazyPage Page={LazyCustomers} />
              </ProtectedRoute>
            } />
            
            <Route path="/reportes" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CONSULTOR']} allowedPermissions={['REPORT_VIEW']}>
                <LazyPage Page={LazyReports} />
              </ProtectedRoute>
            } />
            
            <Route path="/usuarios" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['USER_MANAGE']}>
                <LazyPage Page={LazyUsers} />
              </ProtectedRoute>
            } />

            <Route path="/mantenimiento" element={
              <ProtectedRoute allowedRoles={['ADMIN_INGENIERO']} allowedPermissions={['MAINTENANCE_MANAGE']}>
                <LazyPage Page={LazyMaintenance} />
              </ProtectedRoute>
            } />

            <Route path="/auditoria" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['AUDIT_VIEW']}>
                <LazyPage Page={LazyAuditLogs} />
              </ProtectedRoute>
            } />

            <Route path="/configuracion" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['USER_MANAGE']}>
                <LazyPage Page={LazySettings} />
              </ProtectedRoute>
            } />

            <Route path="/configuracion-alertas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['USER_MANAGE']}>
                <LazyPage Page={LazyNotificationRules} />
              </ProtectedRoute>
            } />

            <Route path="/control-ventas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['SALE_CANCEL']}>
                <LazyPage Page={LazyAdminBillingControl} />
              </ProtectedRoute>
            } />

            <Route path="/finanzas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['FINANCE_VIEW', 'FINANCE_MANAGE']}>
                <LazyPage Page={LazyFinance} />
              </ProtectedRoute>
            } />

            <Route path="/control-cajas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['CASH_OPEN', 'CASH_MOVE', 'CASH_CLOSE']}>
                <LazyPage Page={LazyCashRegisterControl} />
              </ProtectedRoute>
            } />

            <Route path="/cierre-dia" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['CASH_CLOSE']}>
                <LazyPage Page={LazyDailyClose} />
              </ProtectedRoute>
            } />

            <Route path="/alertas" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['REPORT_VIEW']}>
                <LazyPage Page={LazySystemAlerts} />
              </ProtectedRoute>
            } />

            <Route path="/mi-perfil" element={
              <ProtectedRoute>
                <LazyPage Page={LazyProfile} />
              </ProtectedRoute>
            } />

            <Route path="*" element={<RoleHomeRedirect />} />
          </Routes>
          </CashRegisterProvider>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
