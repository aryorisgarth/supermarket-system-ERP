import { useState } from 'react';
import {
  Activity,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  User,
  UserCog,
} from 'lucide-react';
import Swal from 'sweetalert2';
import AuthService from '../services/AuthService';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';

const ROLE_DESCRIPTIONS = {
  ADMIN_INGENIERO: 'Acceso tecnico completo para mantenimiento, seguridad y configuracion del sistema.',
  ADMINISTRADOR: 'Gestion administrativa del supermercado, usuarios, reportes, ventas y finanzas.',
  SUPERVISOR: 'Supervision operativa de inventario, compras, reportes y caja.',
  CAJERO: 'Operacion de facturacion POS y manejo de caja asignada.',
  CONSULTOR: 'Consulta de dashboard y reportes sin permisos de modificacion.',
};

const PERMISSION_LABELS = {
  AUDIT_VIEW: 'Ver auditoria',
  CASH_CLOSE: 'Cerrar caja',
  CASH_MOVE: 'Movimientos de caja',
  CASH_OPEN: 'Abrir caja',
  FINANCE_MANAGE: 'Gestionar finanzas',
  FINANCE_VIEW: 'Ver finanzas',
  MAINTENANCE_MANAGE: 'Mantenimiento',
  PURCHASE_MANAGE: 'Gestionar compras',
  PURCHASE_RECEIVE: 'Recibir compras',
  REPORT_VIEW: 'Ver reportes',
  SALE_CANCEL: 'Anular ventas',
  SALE_CREATE: 'Registrar ventas',
  SALE_DISCOUNT: 'Aplicar descuentos',
  USER_MANAGE: 'Gestionar usuarios',
};

const formatRole = (roleName) => roleName?.replaceAll('_', ' ') || 'Sin rol';

const formatDate = (value) => {
  if (!value) return 'No registrado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No registrado';
  return new Intl.DateTimeFormat('es-NI', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getInitials = (fullName = 'Usuario') =>
  fullName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

const getPermissionLabel = (permission) =>
  PERMISSION_LABELS[permission] || permission.replaceAll('_', ' ').toLowerCase();

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

  const initials = getInitials(user.fullName);
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
          <Card>
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-primary)] text-2xl font-bold text-white shadow-[0_12px_26px_rgba(47,111,237,0.22)]">
                {initials || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-xl font-bold text-[var(--app-text)]">{user.fullName || 'Usuario'}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[var(--app-text-soft)]">
                  <Mail size={16} className="shrink-0" />
                  <span className="truncate">{user.email || 'Correo no registrado'}</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--app-text-soft)]">
                  {ROLE_DESCRIPTIONS[roleName] || 'Perfil autenticado con permisos definidos por el administrador.'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Datos de la cuenta"
              description="Informacion visible para el usuario autenticado."
              icon={User}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="ui-field">
                <span className="ui-label">Nombre completo</span>
                <input className="ui-input" value={user.fullName || ''} readOnly />
              </label>
              <label className="ui-field">
                <span className="ui-label">Correo electronico</span>
                <input className="ui-input" value={user.email || ''} readOnly />
              </label>
              <label className="ui-field">
                <span className="ui-label">Rol asignado</span>
                <input className="ui-input" value={formatRole(roleName)} readOnly />
              </label>
              <label className="ui-field">
                <span className="ui-label">Estado</span>
                <input className="ui-input" value={user.isActive === false ? 'Inactivo' : 'Activo'} readOnly />
              </label>
            </div>
            <p className="ui-hint mt-4">
              Estos datos vienen de la sesion. La edicion directa debe validarse desde backend para proteger identidad,
              rol y credenciales.
            </p>
          </Card>

          <Card>
            <CardHeader
              title="Preferencias personales"
              description="Opciones locales disponibles para el perfil actual."
              icon={UserCog}
              action={
                <Button type="button" size="sm" icon={Save} onClick={handleSavePreferences}>
                  Guardar
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { key: 'emailNotifications', label: 'Notificaciones por correo', icon: Bell },
                { key: 'securityAlerts', label: 'Alertas de seguridad', icon: ShieldCheck },
                { key: 'denseMode', label: 'Modo compacto', icon: ClipboardCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePreferenceChange(item.key)}
                    className={`flex min-h-24 items-start gap-3 rounded-xl border p-4 text-left transition ${
                      preferences[item.key]
                        ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]'
                        : 'border-[var(--app-border)] bg-[var(--app-surface-raised)] text-[var(--app-text-soft)] hover:bg-[var(--app-bg-subtle)]'
                    }`}
                  >
                    <Icon size={18} className="mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="mt-1 block text-xs font-semibold opacity-80">
                        {preferences[item.key] ? 'Activado' : 'Desactivado'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Seguridad"
              description="Configuraciones sensibles de acceso."
              icon={KeyRound}
            />
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
                <p className="text-sm font-bold text-[var(--app-text)]">Contrasena de acceso</p>
                <p className="mt-1 text-xs leading-5 text-[var(--app-text-soft)]">
                  El cambio de contrasena debe confirmar la identidad del usuario y actualizarse desde el servidor.
                </p>
              </div>
              <Button type="button" variant="secondary" icon={KeyRound} onClick={handlePasswordRequest}>
                Cambiar contraseña
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Actividad"
              description="Registro basico de la cuenta."
              icon={Activity}
            />
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-[var(--app-border)] p-4">
                <CalendarClock size={18} className="mt-0.5 text-[var(--app-primary)]" />
                <div>
                  <p className="text-sm font-bold text-[var(--app-text)]">Ultimo acceso</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--app-text-soft)]">{formatDate(user.lastLogin)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[var(--app-border)] p-4">
                <CalendarClock size={18} className="mt-0.5 text-[var(--app-primary)]" />
                <div>
                  <p className="text-sm font-bold text-[var(--app-text)]">Cuenta creada</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--app-text-soft)]">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Privilegios"
              description="Funciones visibles segun rol y permisos."
              icon={ShieldCheck}
            />
            <div className="space-y-3">
              {roleAccess.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[var(--app-text-soft)]">{item.label}</span>
                  <Badge tone={item.enabled ? 'green' : 'neutral'}>
                    {item.enabled ? 'Permitido' : 'Sin acceso'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Permisos tecnicos"
              description={`${permissions.length} permiso(s) asignado(s).`}
              icon={ClipboardCheck}
            />
            {permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <Badge key={permission} tone="blue">
                    {getPermissionLabel(permission)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="ui-hint">Este usuario no tiene permisos tecnicos adicionales registrados.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
