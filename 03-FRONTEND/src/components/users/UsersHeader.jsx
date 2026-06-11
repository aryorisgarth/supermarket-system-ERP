import React from 'react';
import { UserPlus } from 'lucide-react';

const UsersHeader = ({ activeTab, onCreateClick }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-black text-[var(--app-text)] tracking-tight">
          {activeTab === 'employees' ? 'Gestión de Personal' : 'Seguridad y Permisos'}
        </h2>
        <p className="text-[var(--app-text-muted)] text-sm font-medium">
          {activeTab === 'employees'
            ? 'Administra las credenciales, roles y accesos de los empleados'
            : 'Define las políticas de seguridad y privilegios para cada rol operativo global'}
        </p>
      </div>
      {activeTab === 'employees' && (
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-[var(--app-primary)] text-white px-5 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 font-bold hover:scale-105 duration-300 cursor-pointer text-sm"
        >
          <UserPlus size={18} strokeWidth={2.5} /> Crear Empleado
        </button>
      )}
    </div>
  );
};

export default UsersHeader;
