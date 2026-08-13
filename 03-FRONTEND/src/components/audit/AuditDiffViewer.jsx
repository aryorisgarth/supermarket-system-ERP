import React, { useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import Badge from '../ui/Badge';
import { buildDiffEntries } from '../../utils/auditLogsHelper';

const typeMeta = {
  added: { badge: '+ Nuevo', tone: 'green' },
  modified: { badge: '~ Cambio', tone: 'amber' },
  deleted: { badge: '- Eliminado', tone: 'red' },
  equal: { badge: 'Igual', tone: 'neutral' },
};

const AuditDiffViewer = ({
  oldVal,
  newVal,
  parseJson,
  getFieldLabel,
  showUnchanged = false,
}) => {
  const entries = useMemo(
    () => buildDiffEntries(oldVal, newVal, parseJson).map((entry) => ({
      ...entry,
      label: getFieldLabel ? getFieldLabel(entry.key) : entry.key,
    })),
    [oldVal, newVal, parseJson, getFieldLabel]
  );

  const visible = showUnchanged ? entries : entries.filter((entry) => entry.type !== 'equal');

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 p-10 text-center text-sm text-[var(--app-text-muted)]">
        No hay diferencias para mostrar con los filtros actuales.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] font-mono text-xs">
      <div className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
        Vista diff (estilo control de versiones)
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {visible.map(({ key, label, oldStr, newStr, type }) => {
          const meta = typeMeta[type] || typeMeta.equal;
          return (
            <div key={key} className="border-b border-[var(--app-border)] last:border-b-0">
              <div className="flex items-center justify-between bg-[var(--app-surface-raised)] px-4 py-2">
                <span className="font-sans text-xs font-bold text-[var(--app-text)]">{label}</span>
                <Badge tone={meta.tone}>{meta.badge}</Badge>
              </div>
              {type !== 'added' && (
                <div className="flex gap-2 bg-rose-500/10 px-4 py-2 text-rose-700 dark:text-rose-300">
                  <Minus size={14} className="mt-0.5 shrink-0" />
                  <span className="whitespace-pre-wrap break-all">{oldStr}</span>
                </div>
              )}
              {type !== 'deleted' && (
                <div className="flex gap-2 bg-emerald-500/10 px-4 py-2 text-emerald-700 dark:text-emerald-300">
                  <Plus size={14} className="mt-0.5 shrink-0" />
                  <span className="whitespace-pre-wrap break-all">{newStr}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditDiffViewer;
