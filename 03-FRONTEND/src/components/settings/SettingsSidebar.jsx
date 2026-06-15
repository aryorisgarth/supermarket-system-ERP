import React from 'react';
import { Search } from 'lucide-react';

const SettingsSidebar = ({ search, setSearch, visibleTabs, activeTab, setActiveTab }) => {
  return (
    <aside className="w-full lg:w-72 space-y-3">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar sección..."
          className="ui-input w-full pl-9 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all font-bold text-xs uppercase tracking-wider cursor-pointer ${
                isActive
                  ? 'bg-[var(--app-primary)] text-white border-transparent shadow-lg shadow-primary/20'
                  : 'bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-soft)] hover:border-[var(--app-primary)] hover:text-[var(--app-primary)]'
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
        {visibleTabs.length === 0 && (
          <p className="px-2 text-xs font-bold text-[var(--app-text-muted)]">Sin secciones para esa búsqueda.</p>
        )}
      </div>
    </aside>
  );
};

export default SettingsSidebar;
