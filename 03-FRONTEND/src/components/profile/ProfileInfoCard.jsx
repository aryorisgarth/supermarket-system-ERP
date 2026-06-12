import React from 'react';
import { User, Mail } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const ROLE_DESCRIPTIONS = {
  ADMIN_INGENIERO: 'Acceso tecnico completo para mantenimiento, seguridad y configuracion del sistema.',
  ADMINISTRADOR: 'Gestion administrativa del supermercado, usuarios, reportes, ventas y finanzas.',
  SUPERVISOR: 'Supervision operativa de inventario, compras, reportes y caja.',
  CAJERO: 'Operacion de facturacion POS y manejo de caja asignada.',
  CONSULTOR: 'Consulta de dashboard y reportes sin permisos de modificacion.',
};

const formatRole = (roleName) => roleName?.replaceAll('_', ' ') || 'Sin rol';

const getInitials = (fullName = 'Usuario') =>
  fullName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

const ProfileInfoCard = ({ user }) => {
  const roleName = user?.role?.name;
  const initials = getInitials(user.fullName);

  return (
    <div className="space-y-6 animate-fade-in">
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
    </div>
  );
};

export default ProfileInfoCard;
