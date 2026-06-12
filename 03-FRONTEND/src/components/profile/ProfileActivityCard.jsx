import React from 'react';
import { Activity, CalendarClock } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const formatDate = (value) => {
  if (!value) return 'No registrado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No registrado';
  return new Intl.DateTimeFormat('es-NI', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const ProfileActivityCard = ({ user }) => {
  return (
    <Card className="animate-fade-in">
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
            <p className="mt-1 text-xs font-semibold text-[var(--app-text-soft)]">
              {formatDate(user?.lastLogin)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-[var(--app-border)] p-4">
          <CalendarClock size={18} className="mt-0.5 text-[var(--app-primary)]" />
          <div>
            <p className="text-sm font-bold text-[var(--app-text)]">Cuenta creada</p>
            <p className="mt-1 text-xs font-semibold text-[var(--app-text-soft)]">
              {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileActivityCard;
