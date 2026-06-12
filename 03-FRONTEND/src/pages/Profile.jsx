import { useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

import AuthService from '../services/AuthService';
import Badge from '../components/ui/Badge';

import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import ProfilePreferencesForm from '../components/profile/ProfilePreferencesForm';
import ProfileSecurityCard from '../components/profile/ProfileSecurityCard';
import ProfileActivityCard from '../components/profile/ProfileActivityCard';
import ProfilePermissionsCard from '../components/profile/ProfilePermissionsCard';

const formatRole = (roleName) => roleName?.replaceAll('_', ' ') || 'Sin rol';

const Profile = () => {
  const user = AuthService.getCurrentUser() || {};
  const roleName = user?.role?.name;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('supernova_profile_preferences');
    if (!saved) {
      return {
        emailNotifications: true,
        securityAlerts: true,
        denseMode: false,
      };
    }
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error(error);
      return {
        emailNotifications: true,
        securityAlerts: true,
        denseMode: false,
      };
    }
  });

  const roleAccess = [
    { label: 'Datos personales', enabled: true },
    { label: 'Cambio de contrasena', enabled: true },
    { label: 'Ver rol y permisos', enabled: true },
    { label: 'Gestion de usuarios', enabled: AuthService.hasPermission('USER_MANAGE') },
    { label: 'Auditoria del sistema', enabled: AuthService.hasPermission('AUDIT_VIEW') },
    { label: 'Mantenimiento tecnico', enabled: AuthService.hasPermission('MAINTENANCE_MANAGE') },
    { label: 'Finanzas', enabled: AuthService.hasAnyPermission(['FINANCE_VIEW', 'FINANCE_MANAGE']) },
    { label: 'Operaciones de caja', enabled: AuthService.hasAnyPermission(['CASH_OPEN', 'CASH_MOVE', 'CASH_CLOSE']) },
  ];

  const handlePreferenceChange = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem('supernova_profile_preferences', JSON.stringify(preferences));
    Swal.fire({
      icon: 'success',
      title: 'Preferencias guardadas',
      text: 'La configuracion personal fue actualizada en este navegador.',
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const handlePasswordRequest = async () => {
    const result = await Swal.fire({
      title: 'Cambiar contraseña',
      text: 'Serás redirigido al portal de Keycloak para actualizar tu contraseña de forma segura.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      AuthService.changePasswordViaKeycloak();
    }
  };

  return (
    <div className="space-y-6">
      <div className="ui-page-header">
        <div>
          <p className="ui-eyebrow">Cuenta de usuario</p>
          <h2 className="ui-page-title">Mi perfil</h2>
          <p className="ui-page-description">
            Informacion personal, rol asignado, privilegios disponibles y preferencias basicas de la cuenta.
          </p>
          <div className="ui-page-meta">
            <Badge tone={user.isActive === false ? 'red' : 'green'} icon={CheckCircle2}>
              {user.isActive === false ? 'Cuenta inactiva' : 'Cuenta activa'}
            </Badge>
            <Badge tone="blue" icon={ShieldCheck}>{formatRole(roleName)}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="space-y-6">
          <ProfileInfoCard user={user} />

          <ProfilePreferencesForm
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
            onSave={handleSavePreferences}
          />
        </div>

        <div className="space-y-6">
          <ProfileSecurityCard onPasswordRequest={handlePasswordRequest} />

          <ProfileActivityCard user={user} />

          <ProfilePermissionsCard roleAccess={roleAccess} permissions={permissions} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
