import React from 'react';
import { KeyRound } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';

const ProfileSecurityCard = ({ onPasswordRequest }) => {
  return (
    <Card className="animate-fade-in">
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
        <Button type="button" variant="secondary" icon={KeyRound} onClick={onPasswordRequest}>
          Cambiar contraseña
        </Button>
      </div>
    </Card>
  );
};

export default ProfileSecurityCard;
