import React from 'react';

const UsersTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-2 border-b border-[var(--app-border)] pb-px">
      <button
        type="button"
        onClick={() => setActiveTab('employees')}
        className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
          activeTab === 'employees'
            ? 'border-[var(--app-primary)] text-[var(--app-primary)] font-black'
            : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-soft)]'
        }`}
      >
        Lista de Empleados
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('permissions')}
        className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
          activeTab === 'permissions'
            ? 'border-[var(--app-primary)] text-[var(--app-primary)] font-black'
            : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-soft)]'
        }`}
      >
        Roles y Permisos
      </button>
    </div>
  );
};

export default UsersTabs;
