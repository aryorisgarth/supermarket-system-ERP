import React from 'react';
import { BellRing, AlertTriangle, Info, Mail, Users } from 'lucide-react';
import { Field } from '../ui/Form';
import Button from '../ui/Button';
import ResponsiveModal from '../ui/ResponsiveModal';

const NotificationRuleFormModal = ({
  onClose,
  roles = [],
  formData,
  onInputChange,
  onSubmit,
  submitting = false,
}) => {
  return (
    <ResponsiveModal
      onClose={onClose}
      icon={BellRing}
      title="Nueva Regla de Alerta"
      subtitle="Asigna alertas a un rol específico."
      initialSize="md"
      sizeOptions={['sm', 'md', 'lg']}
    >
      <form onSubmit={onSubmit}>
        <div className="p-6 space-y-4">
          <Field label="Tipo de Alerta" icon={AlertTriangle}>
            <select
              name="alertType"
              value={formData.alertType}
              onChange={onInputChange}
              className="ui-input ui-select w-full"
              required
            >
              <option value="INVENTORY">Inventario (Stock bajo, lotes próximos a vencer)</option>
              <option value="CASH_REGISTER">Caja (Apertura, movimiento, arqueo, cierre)</option>
              <option value="PURCHASE">Compras (Recepciones de productos, órdenes de compra)</option>
              <option value="FINANCE">Finanzas (Metas de venta, balance de caja)</option>
              <option value="WAREHOUSE">Bodega (Movimientos internos, conteos cíclicos)</option>
            </select>
          </Field>

          <Field label="Severidad Mínima" icon={Info}>
            <select
              name="severity"
              value={formData.severity}
              onChange={onInputChange}
              className="ui-input ui-select w-full"
              required
            >
              <option value="INFO">Informativa (Registra todo evento)</option>
              <option value="WARNING">Advertencia (Eventos que requieren atención moderada)</option>
              <option value="CRITICAL">Crítica (Errores graves, desfases de caja, vencimientos inmediatos)</option>
            </select>
          </Field>

          <Field label="Canal de Envío" icon={Mail}>
            <select
              name="channel"
              value={formData.channel}
              onChange={onInputChange}
              className="ui-input ui-select w-full"
              required
            >
              <option value="EMAIL">Correo Electrónico únicamente</option>
              <option value="INTERNAL">Centro de Notificaciones interno únicamente</option>
              <option value="BOTH">Ambos canales (Correo y Centro de Notificaciones)</option>
            </select>
          </Field>

          <Field label="Rol Destinatario" icon={Users}>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={onInputChange}
              className="ui-input ui-select w-full"
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name.replace('_', ' ')}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="px-6 py-4 bg-[var(--app-bg-subtle)] border-t border-[var(--app-border)] flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar Regla'}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default NotificationRuleFormModal;
