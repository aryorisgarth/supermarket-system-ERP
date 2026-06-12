import React from 'react';
import { ShieldCheck, ClipboardCheck } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';

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

const getPermissionLabel = (permission) =>
  PERMISSION_LABELS[permission] || permission.replaceAll('_', ' ').toLowerCase();

const ProfilePermissionsCard = ({ roleAccess = [], permissions = [] }) => {
  return (
    <div className="space-y-6 animate-fade-in">
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
  );
};

export default ProfilePermissionsCard;
