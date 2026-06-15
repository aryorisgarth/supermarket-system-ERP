import React from 'react';
import { Lock, CheckCircle2, Edit, Trash } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const PhysicalRegisterRow = ({ reg, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-[var(--app-surface-raised)] transition-colors">
      <td className="py-4 px-4 font-bold text-[var(--app-text)]">
        <div>
          {reg.name}
          <span className="block text-[10px] text-[var(--app-text-muted)]">ID: #{reg.id}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-[var(--app-text-muted)]">
        {reg.description || '—'}
      </td>
      <td className="py-4 px-4">
        <Badge tone={reg.status === 'ACTIVE' ? 'green' : 'amber'}>
          {reg.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
        </Badge>
      </td>
      <td className="py-4 px-4">
        {reg.occupied ? (
          <div className="flex items-center gap-1.5 text-danger font-medium">
            <Lock size={14} className="text-red-500" />
            <span className="text-xs">
              Ocupada por: <strong className="text-slate-800">{reg.activeCashierName}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-success font-medium">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-600">Disponible</span>
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="secondary"
            icon={Edit}
            onClick={() => onEdit(reg)}
            title="Editar"
          />
          {reg.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="danger"
              icon={Trash}
              onClick={() => onDelete(reg)}
              title="Inactivar"
              disabled={reg.occupied}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export default PhysicalRegisterRow;
