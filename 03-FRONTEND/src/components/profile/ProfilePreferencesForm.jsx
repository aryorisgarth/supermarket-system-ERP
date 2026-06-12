import React from 'react';
import { UserCog, Save, Bell, ShieldCheck, ClipboardCheck } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';

const ProfilePreferencesForm = ({
  preferences = {},
  onPreferenceChange,
  onSave,
}) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader
        title="Preferencias personales"
        description="Opciones locales disponibles para el perfil actual."
        icon={UserCog}
        action={
          <Button type="button" size="sm" icon={Save} onClick={onSave}>
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
              onClick={() => onPreferenceChange(item.key)}
              className={`flex min-h-24 items-start gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${
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
  );
};

export default ProfilePreferencesForm;
