import React from 'react';
import { BellRing, X, AlertTriangle, Info, Mail, Users } from 'lucide-react';
import { Field } from '../ui/Form';
import Button from '../ui/Button';

const NotificationRuleFormModal = ({
  onClose,
  roles = [],
  formData,
  onInputChange,
  onSubmit,
  submitting = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--app-surface)] border border-[var(--app-border)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--app-border)]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <BellRing size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-[var(--app-text)]">Nueva Regla de Alerta</h3>
              <p className="text-xs text-[var(--app-text-muted)] font-medium">Asigna alertas a un rol específico.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

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
      </div>
    </div>
  );
};

export default NotificationRuleFormModal;
