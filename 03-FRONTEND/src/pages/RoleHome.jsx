import { Navigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { getDefaultPathForRole } from '../utils/authRoutes';
import Dashboard from './Dashboard';
import ConsultantDashboard from './ConsultantDashboard';
import SupervisorDashboard from './SupervisorDashboard';

/**
 * Pantalla de inicio segun rol: cada perfil ve su panel, no el dashboard administrativo generico.
 */
const RoleHome = () => {
  const roleName = AuthService.getCurrentUser()?.role?.name;

  switch (roleName) {
    case 'CONSULTOR':
      return <ConsultantDashboard />;
    case 'SUPERVISOR':
      return <SupervisorDashboard />;
    case 'ADMINISTRADOR':
    case 'ADMIN_INGENIERO':
      return <Dashboard />;
    default:
      return <Navigate to={getDefaultPathForRole(roleName)} replace />;
  }
};

export default RoleHome;
