import React, { useState, useEffect, useCallback } from 'react';
import { BellRing, Plus, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

import NotificationRuleService from '../services/NotificationRuleService';
import UserService from '../services/UserService';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

import NotificationRulesTable from '../components/notifications/NotificationRulesTable';
import NotificationRuleFormModal from '../components/notifications/NotificationRuleFormModal';

const NotificationRules = () => {
  const [rules, setRules] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setRules((prevRules) =>
        prevRules.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r))
      );
      await NotificationRuleService.toggle(rule.id);
    } catch (error) {
      console.error('Error toggling rule status:', error);
      setRules((prevRules) =>
        prevRules.map((r) => (r.id === rule.id ? { ...r, isActive: rule.isActive } : r))
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
      setRules((prevRules) => [newRule, ...prevRules]);
    } catch (error) {
      console.error('Error creating rule:', error);
      const serverMsg =
        error.response?.data?.message ||
        'Ya existe una regla idéntica configurada para el rol, tipo de alerta y severidad.';
      Swal.fire('Error al crear regla', serverMsg, 'error');
    } finally {
      setSubmitting(false);
    }
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

        <NotificationRulesTable
          rules={rules}
          loading={loading}
          onToggleActive={handleToggleActive}
          onDeleteRule={handleDeleteRule}
        />
      </Card>

      {showModal && (
        <NotificationRuleFormModal
          onClose={() => setShowModal(false)}
          roles={roles}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default NotificationRules;
