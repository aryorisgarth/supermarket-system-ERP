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
  LazyHistory,
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
  LazyWarehouseTransfer,
  LazyNotificationRules,
  LazyBrands,
  LazyLocations,
  LazyCustomers,
  LazyScaleConfig,
  LazyLabels,
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

const ProtectedRoute = ({ children, allowedRoles, allowedPermissions, allowPermissionOverride = false }) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles || allowedPermissions) {
    const user = AuthService.getCurrentUser();
    const roleName = normalizeRoleName(user?.role?.name);
    const roleAllowed = allowedRoles && allowedRoles.length > 0
      ? allowedRoles.some((role) => normalizeRoleName(role) === roleName)
      : true;
    
    if (allowedPermissions && allowedPermissions.length > 0) {
      const permissionAllowed = AuthService.hasAnyPermission(allowedPermissions);
      if (!permissionAllowed || (!allowPermissionOverride && !roleAllowed)) {
        return <Navigate to={getDefaultPathForRole(roleName)} replace />;
      }
    } else if (allowedRoles && allowedRoles.length > 0) {
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
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PURCHASE_RECEIVE']} allowPermissionOverride>
                <LazyPage Page={LazyWarehouseReceptionList} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/recepcion/:orderId" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PURCHASE_RECEIVE']} allowPermissionOverride>
                <LazyPage Page={LazyWarehouseReceiveOrder} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/traslado" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['WAREHOUSE_LOCATION', 'INVENTORY_ADJUST', 'PURCHASE_RECEIVE']} allowPermissionOverride>
                <LazyPage Page={LazyWarehouseTransfer} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/productos" element={
              <ProtectedRoute allowedRoles={['BODEGUERO']} allowedPermissions={['INVENTORY_VIEW']} allowPermissionOverride>
                <LazyPage Page={LazyWarehouseProducts} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/conteo" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_COUNT', 'INVENTORY_ADJUST']} allowPermissionOverride>
                <LazyPage Page={LazyWarehouseCountList} />
              </ProtectedRoute>
            } />

            <Route path="/bodega/conteo/:sessionId" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_COUNT', 'INVENTORY_ADJUST']} allowPermissionOverride>
                <LazyPage Page={LazyWarehouseCountSession} />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<RootRoute />} />
            
            <Route path="/inventario" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST']} allowPermissionOverride>
                <LazyPage Page={LazyInventory} />
              </ProtectedRoute>
            } />

            <Route path="/etiquetas" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST', 'INVENTORY_VIEW']} allowPermissionOverride>
                <LazyPage Page={LazyLabels} />
              </ProtectedRoute>
            } />

            <Route path="/lotes" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST', 'BATCH_MANAGE']} allowPermissionOverride>
                <LazyPage Page={LazyBatchManagement} />
              </ProtectedRoute>
            } />

            <Route path="/promociones" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PROMO_MANAGE']} allowPermissionOverride>
                <LazyPage Page={LazyPromotions} />
              </ProtectedRoute>
            } />

            <Route path="/facturas-electronicas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['EINVOICE_VIEW']} allowPermissionOverride>
                <LazyPage Page={LazyElectronicInvoices} />
              </ProtectedRoute>
            } />

            <Route path="/proveedores" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PURCHASE_MANAGE', 'PURCHASE_RECEIVE']} allowPermissionOverride>
                <LazyPage Page={LazySuppliers} />
              </ProtectedRoute>
            } />

            <Route path="/compras" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['PURCHASE_MANAGE', 'PURCHASE_RECEIVE']} allowPermissionOverride>
                <LazyPage Page={LazyPurchases} />
              </ProtectedRoute>
            } />

            <Route path="/categorias" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST']} allowPermissionOverride>
                <LazyPage Page={LazyCategories} />
              </ProtectedRoute>
            } />

            <Route path="/marcas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['INVENTORY_ADJUST']} allowPermissionOverride>
                <LazyPage Page={LazyBrands} />
              </ProtectedRoute>
            } />

            <Route path="/ubicaciones" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'BODEGUERO']} allowedPermissions={['INVENTORY_ADJUST', 'WAREHOUSE_LOCATION']} allowPermissionOverride>
                <LazyPage Page={LazyLocations} />
              </ProtectedRoute>
            } />

            <Route path="/facturacion" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CAJERO']} allowedPermissions={['SALE_CREATE']} allowPermissionOverride>
                <LazyPage Page={LazyBilling} />
              </ProtectedRoute>
            } />

            <Route path="/clientes" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']}>
                <LazyPage Page={LazyCustomers} />
              </ProtectedRoute>
            } />
            
            <Route path="/reportes" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CONSULTOR']} allowedPermissions={['REPORT_VIEW']} allowPermissionOverride>
                <LazyPage Page={LazyReports} />
              </ProtectedRoute>
            } />

            <Route path="/historico" element={
              <ProtectedRoute
                allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CONSULTOR']}
                allowedPermissions={['REPORT_VIEW', 'INVENTORY_VIEW', 'PURCHASE_MANAGE', 'PURCHASE_RECEIVE']}
                allowPermissionOverride
              >
                <LazyPage Page={LazyHistory} />
              </ProtectedRoute>
            } />
            
            <Route path="/usuarios" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['USER_MANAGE']} allowPermissionOverride>
                <LazyPage Page={LazyUsers} />
              </ProtectedRoute>
            } />

            <Route path="/mantenimiento" element={
              <ProtectedRoute allowedRoles={['ADMIN_INGENIERO']} allowedPermissions={['MAINTENANCE_MANAGE']} allowPermissionOverride>
                <LazyPage Page={LazyMaintenance} />
              </ProtectedRoute>
            } />

            <Route path="/auditoria" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['AUDIT_VIEW']} allowPermissionOverride>
                <LazyPage Page={LazyAuditLogs} />
              </ProtectedRoute>
            } />

            <Route path="/configuracion" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['USER_MANAGE']} allowPermissionOverride>
                <LazyPage Page={LazySettings} />
              </ProtectedRoute>
            } />

            <Route path="/configuracion-alertas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['USER_MANAGE']} allowPermissionOverride>
                <LazyPage Page={LazyNotificationRules} />
              </ProtectedRoute>
            } />
            
            <Route path="/configuracion-balanza" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']}>
                <LazyPage Page={LazyScaleConfig} />
              </ProtectedRoute>
            } />

            <Route path="/control-ventas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['SALE_CANCEL']} allowPermissionOverride>
                <LazyPage Page={LazyAdminBillingControl} />
              </ProtectedRoute>
            } />

            <Route path="/finanzas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO']} allowedPermissions={['FINANCE_VIEW', 'FINANCE_MANAGE']} allowPermissionOverride>
                <LazyPage Page={LazyFinance} />
              </ProtectedRoute>
            } />

            <Route path="/control-cajas" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['CASH_OPEN', 'CASH_MOVE', 'CASH_CLOSE']} allowPermissionOverride>
                <LazyPage Page={LazyCashRegisterControl} />
              </ProtectedRoute>
            } />

            <Route path="/cierre-dia" element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['CASH_CLOSE']}>
                <LazyPage Page={LazyDailyClose} />
              </ProtectedRoute>
            } />

            <Route path="/alertas" element={
              <ProtectedRoute allowedRoles={['BODEGUERO', 'ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR']} allowedPermissions={['REPORT_VIEW']} allowPermissionOverride>
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
