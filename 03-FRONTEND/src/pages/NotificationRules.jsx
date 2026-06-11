import React, { useState, useEffect, useCallback } from 'react';
import {
  BellRing,
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Users,
  X,
  AlertTriangle,
  Info,
} from 'lucide-react';
import Swal from 'sweetalert2';
import NotificationRuleService from '../services/NotificationRuleService';
import UserService from '../services/UserService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Field } from '../components/ui/Form';

const alertTypeLabels = {
  INVENTORY: 'Inventario',
  CASH_REGISTER: 'Caja',
  PURCHASE: 'Compras',
  FINANCE: 'Finanzas',
  WAREHOUSE: 'Bodega',
};

const severityLabels = {
  CRITICAL: 'Crítica',
  WARNING: 'Advertencia',
  INFO: 'Informativa',
};

const severityTones = {
  CRITICAL: 'red',
  WARNING: 'amber',
  INFO: 'blue',
};

const channelLabels = {
  EMAIL: 'Correo Electrónico',
  INTERNAL: 'Alerta Interna',
  BOTH: 'Ambos (Correo y Sistema)',
};

const NotificationRules = () => {
  const [rules, setRules] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    alertType: 'INVENTORY',
    severity: 'WARNING',
    channel: 'EMAIL',
    roleId: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rulesData, rolesData] = await Promise.all([
        NotificationRuleService.getAll(),
        UserService.getRoles(),
      ]);
      setRules(rulesData || []);
      setRoles(rolesData || []);

      // Default roleId to the first available role if roles list is loaded
      if (rolesData && rolesData.length > 0) {
        setFormData((prev) => ({ ...prev, roleId: rolesData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching rules or roles:', error);
      Swal.fire('Error', 'No se pudieron cargar las reglas de notificación o los roles.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async (rule) => {
    try {
      // Toggle local state immediately for snappy UI feel
      setRules((prevRules) =>
        prevRules.map((r) =>
          r.id === rule.id ? { ...r, isActive: !r.isActive } : r
        )
      );

      await NotificationRuleService.toggle(rule.id);
    } catch (error) {
      console.error('Error toggling rule status:', error);
      // Revert local state on error
      setRules((prevRules) =>
        prevRules.map((r) =>
          r.id === rule.id ? { ...r, isActive: rule.isActive } : r
        )
      );
      Swal.fire('Error', 'No se pudo cambiar el estado de la regla.', 'error');
    }
  };

  const handleDeleteRule = async (rule) => {
    const result = await Swal.fire({
      title: '¿Eliminar regla?',
      text: 'Esta acción desactivará el enrutamiento para este rol y tipo de alerta.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await NotificationRuleService.delete(rule.id);
        Swal.fire({
          icon: 'success',
          title: 'Regla eliminada',
          timer: 1500,
          showConfirmButton: false,
        });
        // Remove from list
        setRules((prevRules) => prevRules.filter((r) => r.id !== rule.id));
      } catch (error) {
        console.error('Error deleting rule:', error);
        Swal.fire('Error', 'No se pudo eliminar la regla.', 'error');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'roleId' ? Number(value) : value,
    }));
  };

  const handleOpenModal = () => {
    setFormData({
      alertType: 'INVENTORY',
      severity: 'WARNING',
      channel: 'EMAIL',
      roleId: roles.length > 0 ? roles[0].id : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roleId) {
      Swal.fire('Rol requerido', 'Debes seleccionar un rol destinatario.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const newRule = await NotificationRuleService.create(formData);
      Swal.fire({
        icon: 'success',
        title: 'Regla creada',
        text: 'La regla de notificación se ha guardado exitosamente.',
        timer: 1500,
        showConfirmButton: false,
      });
      setShowModal(false);
      // Actualizar lista
      setRules((prevRules) => [newRule, ...prevRules]);
    } catch (error) {
      console.error('Error creating rule:', error);
      const serverMsg = error.response?.data?.message || 'Ya existe una regla idéntica configurada para el rol, tipo de alerta y severidad.';
      Swal.fire('Error al crear regla', serverMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getChannelBadge = (channel) => {
    if (channel === 'EMAIL') {
      return (
        <Badge tone="blue" icon={Mail}>
          Correo
        </Badge>
      );
    }
    if (channel === 'INTERNAL') {
      return (
        <Badge tone="neutral" icon={BellRing}>
          Sistema
        </Badge>
      );
    }
    return (
      <div className="flex gap-1">
        <Badge tone="blue" icon={Mail}>
          Correo
        </Badge>
        <Badge tone="neutral" icon={BellRing}>
          Sistema
        </Badge>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Configuración de Sistema"
        title="Reglas de Notificación"
        description="Configura qué roles reciben alertas automáticas por correo electrónico o por el centro de notificaciones según el tipo y severidad."
        actions={
          <Button icon={Plus} onClick={handleOpenModal}>
            Nueva Regla
          </Button>
        }
        meta={
          <Badge tone={rules.length > 0 ? 'blue' : 'neutral'} icon={BellRing}>
            {rules.length} {rules.length === 1 ? 'regla activa' : 'reglas activas'}
          </Badge>
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-[var(--app-border)] p-6">
          <CardHeader
            icon={ShieldAlert}
            title="Matriz de Notificaciones"
            description="Reglas activas para despachar eventos y alertar a los usuarios de la plataforma."
          />
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
            <Loader2 className="animate-spin text-[var(--app-primary)]" size={40} />
            <p className="text-xs font-black uppercase tracking-widest">Cargando reglas...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 size={44} className="mx-auto text-[var(--app-success)]" />
            <p className="mt-4 text-sm font-black uppercase tracking-widest text-[var(--app-text-muted)]">
              No hay reglas de notificación configuradas
            </p>
            <p className="mt-2 text-xs text-[var(--app-text-soft)]">
              Crea una nueva regla para empezar a enrutar las alertas automáticas del sistema.
            </p>
          </div>
        ) : (
          <div className="table-scroll overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[var(--app-bg-subtle)] border-b border-[var(--app-border)]">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
                    Tipo de Alerta
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
                    Severidad Mínima
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
                    Canal de Envío
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
                    Rol Destinatario
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[var(--app-bg-subtle)]/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[var(--app-text)]">
                      {alertTypeLabels[rule.alertType] || rule.alertType}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={severityTones[rule.severity] || 'neutral'}>
                        {severityLabels[rule.severity] || rule.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{getChannelBadge(rule.channel)}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 font-semibold text-[var(--app-text-soft)]">
                        <Users size={14} className="text-[var(--app-text-muted)]" />
                        {rule.roleName?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${rule.isActive ? 'bg-[var(--app-primary)]' : 'bg-gray-200 dark:bg-zinc-700'
                          }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rule.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteRule(rule)}
                        className="p-2 text-[var(--app-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Eliminar regla"
                      >
                        <Trash2 size={15} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Creación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--app-surface)] border border-[var(--app-border)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                  <BellRing size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black text-[var(--app-text)]">Nueva Regla de Alerta</h3>
                  <p className="text-xs text-[var(--app-text-muted)] font-medium">Asigna alertas a un rol específico.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-bg-subtle)] hover:text-[var(--app-text)] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <Field label="Tipo de Alerta" icon={AlertTriangle}>
                  <select
                    name="alertType"
                    value={formData.alertType}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-[var(--app-bg-subtle)] border-t border-[var(--app-border)] flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar Regla'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationRules;
