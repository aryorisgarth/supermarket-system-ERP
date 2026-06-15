import React from 'react';

const BatchKpis = ({ kpiCards, activeFilter, onFilterSelect, toneClasses }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card) => {
        const Icon = card.icon;
        const active = activeFilter === card.key;
        return (
          <button
            key={card.key}
            onClick={() => onFilterSelect(card.key)}
            className={`text-left rounded-2xl border p-4 transition-all hover:scale-[1.01] cursor-pointer ${toneClasses[card.tone]} ${active ? 'ring-2 ring-offset-2 ring-offset-[var(--app-bg)] ring-current' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">{card.label}</span>
              <Icon size={18} className="opacity-80" />
            </div>
            <p className="text-3xl font-bold mt-2 leading-none">{card.value}</p>
            <p className="text-[10px] font-semibold opacity-70 mt-1.5">{card.hint}</p>
          </button>
        );
      })}
    </div>
  );
};

export default BatchKpis;
