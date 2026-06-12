import React from 'react';
import { Loader2, CheckCircle2, Users, Trash2, Mail, BellRing } from 'lucide-react';
import Badge from '../ui/Badge';

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
    <div className="flex gap-1 animate-fade-in">
      <Badge tone="blue" icon={Mail}>
        Correo
      </Badge>
      <Badge tone="neutral" icon={BellRing}>
        Sistema
      </Badge>
    </div>
  );
};

const NotificationRulesTable = ({
  rules = [],
  loading = false,
  onToggleActive,
  onDeleteRule,
}) => {
  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)] animate-fade-in">
        <Loader2 className="animate-spin text-[var(--app-primary)]" size={40} />
        <p className="text-xs font-black uppercase tracking-widest">Cargando reglas...</p>
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="p-16 text-center animate-fade-in">
        <CheckCircle2 size={44} className="mx-auto text-[var(--app-success)] animate-pulse" />
        <p className="mt-4 text-sm font-black uppercase tracking-widest text-[var(--app-text-muted)]">
          No hay reglas de notificación configuradas
        </p>
        <p className="mt-2 text-xs text-[var(--app-text-soft)]">
          Crea una nueva regla para empezar a enrutar las alertas automáticas del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="table-scroll overflow-x-auto animate-fade-in">
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
                  onClick={() => onToggleActive(rule)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    rule.isActive ? 'bg-[var(--app-primary)]' : 'bg-gray-200 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      rule.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onDeleteRule(rule)}
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
  );
};

export default NotificationRulesTable;
