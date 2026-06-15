import React from 'react';
import { Terminal, X, GitCompare, FileJson, AlertOctagon, Check } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const AuditDetailModal = ({
  selectedLog,
  setSelectedLog,
  modalTab,
  setModalTab,
  showUnchanged,
  setShowUnchanged,
  formatDateTime,
  getRisk,
  getActionLabel,
  getModuleLabel,
  parseJson,
}) => {
  const renderEnhancedJsonDiff = (oldVal, newVal) => {
    const oldObj = parseJson(oldVal);
    const newObj = parseJson(newVal);

    if (!oldObj && !newObj) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--app-text-muted)] border border-dashed border-[var(--app-border)] rounded-2xl bg-[var(--app-bg-subtle)]/30">
          <AlertOctagon size={36} className="text-[var(--app-text-muted)] mb-2" />
          <p className="text-sm font-bold uppercase tracking-wider">Sin valores registrados</p>
          <p className="text-xs mt-1">Este evento no contiene registros de valores previos o nuevos para comparar.</p>
        </div>
      );
    }

    if (modalTab === 'raw') {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mb-2 flex items-center gap-1.5">
              <FileJson size={12} /> Estado Anterior (JSON Raw)
            </span>
            <pre className="max-h-80 overflow-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] p-3 text-xs font-mono text-[var(--app-text-soft)]">
              {oldObj ? JSON.stringify(oldObj, null, 2) : 'N/A (Registro Nuevo)'}
            </pre>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mb-2 flex items-center gap-1.5">
              <FileJson size={12} /> Estado Posterior (JSON Raw)
            </span>
            <pre className="max-h-80 overflow-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] p-3 text-xs font-mono text-[var(--app-text-soft)]">
              {newObj ? JSON.stringify(newObj, null, 2) : 'N/A (Registro Eliminado)'}
            </pre>
          </div>
        </div>
      );
    }

    
    const keys = Array.from(new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]));

    const fields = keys.map((key) => {
      const oldValRaw = oldObj?.[key];
      const newValRaw = newObj?.[key];
      const oldStr = oldValRaw !== undefined ? String(oldValRaw) : '';
      const newStr = newValRaw !== undefined ? String(newValRaw) : '';
      const isChanged = oldStr !== newStr;

      let type = 'equal';
      if (oldValRaw === undefined && newValRaw !== undefined) type = 'added';
      else if (oldValRaw !== undefined && newValRaw === undefined) type = 'deleted';
      else if (isChanged) type = 'modified';

      return { key, oldStr, newStr, type, isChanged };
    });

    const sortedFields = [...fields].sort((a, b) => {
      const score = { added: 1, modified: 2, deleted: 3, equal: 4 };
      return score[a.type] - score[b.type];
    });

    const filteredFields = showUnchanged ? sortedFields : sortedFields.filter((f) => f.type !== 'equal');

    if (filteredFields.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--app-text-muted)] border border-dashed border-[var(--app-border)] rounded-2xl bg-[var(--app-bg-subtle)]/35">
          <Check size={32} className="text-[var(--app-success)] mb-2" />
          <p className="text-sm font-bold uppercase tracking-wider text-[var(--app-text)]">Sin diferencias detectadas</p>
          <p className="text-xs mt-1">Todos los campos del registro están idénticos.</p>
          <Button size="sm" variant="secondary" className="mt-4" onClick={() => setShowUnchanged(true)}>
            Mostrar todos los campos
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold text-[var(--app-text-soft)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(e) => setShowUnchanged(e.target.checked)}
              className="rounded border-[var(--app-border)] text-[var(--app-primary)] focus:ring-[var(--app-primary)]/20"
            />
            Mostrar campos sin cambios ({fields.filter((f) => f.type === 'equal').length})
          </label>
          <span className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] tracking-wider">
            Exhibiendo {filteredFields.length} campos
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)]">
          <div className="grid grid-cols-[180px_1fr_1fr_100px] border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-3 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
            <span>Campo</span>
            <span>Antes</span>
            <span>Después</span>
            <span className="text-right">Diferencia</span>
          </div>
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[var(--app-border)] bg-[var(--app-surface-raised)]">
            {filteredFields.map(({ key, oldStr, newStr, type }) => {
              let rowBg = '';
              let badgeTone = 'neutral';
              let badgeLabel = 'Igual';

              if (type === 'added') {
                rowBg = 'bg-emerald-500/5 dark:bg-emerald-500/10';
                badgeTone = 'green';
                badgeLabel = '+ Creado';
              } else if (type === 'deleted') {
                rowBg = 'bg-rose-500/5 dark:bg-rose-500/10';
                badgeTone = 'red';
                badgeLabel = '- Borrado';
              } else if (type === 'modified') {
                rowBg = 'bg-amber-500/5 dark:bg-amber-500/10';
                badgeTone = 'amber';
                badgeLabel = '≈ Cambio';
              }

              return (
                <div key={key} className={`grid grid-cols-[180px_1fr_1fr_100px] gap-3 p-3 text-xs items-center ${rowBg}`}>
                  <span className="font-bold text-[var(--app-text)] truncate" title={key}>
                    {key}
                  </span>
                  <span className="font-mono text-[var(--app-text-muted)] truncate" title={oldStr}>
                    {oldStr || '-'}
                  </span>
                  <span
                    className={`font-mono truncate font-bold ${
                      type === 'modified'
                        ? 'text-[var(--app-primary)]'
                        : type === 'added'
                        ? 'text-[var(--app-success)]'
                        : 'text-[var(--app-text-soft)]'
                    }`}
                    title={newStr}
                  >
                    {newStr || '-'}
                  </span>
                  <div className="text-right">
                    <Badge tone={badgeTone}>{badgeLabel}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm animate-fade-in">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl animate-scale-up">
        
        <div className="flex items-start justify-between gap-4 border-b border-[var(--app-border)] bg-gradient-to-r from-[var(--app-primary)] to-indigo-800 p-6 text-white">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-white/10 p-3">
              <Terminal size={22} />
            </span>
            <div>
              <h3 className="text-lg font-bold">Detalle de Auditoría #{selectedLog.id}</h3>
              <p className="mt-1 text-xs font-bold text-white/80">
                {getActionLabel(selectedLog.action)} en {getModuleLabel(selectedLog.affectedTable)} por{' '}
                {selectedLog.userFullName || 'Sistema'}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedLog(null)}
            className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        
        <div className="max-h-[calc(92vh-190px)] overflow-y-auto p-6">
          
          <div className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-4">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Fecha y Hora</p>
              <p className="mt-1 text-xs font-bold">{formatDateTime(selectedLog.logDate)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Registro Afectado</p>
              <p className="mt-1 font-mono text-xs font-bold">#{selectedLog.recordId || '-'}</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Dirección IP</p>
              <p className="mt-1 font-mono text-xs font-bold">{selectedLog.ipAddress || '127.0.0.1'}</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Clasificación de Riesgo</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold">
                <Check size={14} className="text-[var(--app-success)]" />
                {getRisk(selectedLog).label}
              </p>
            </div>
          </div>

          
          <div className="flex gap-2 mb-4 border-b border-[var(--app-border)] pb-2">
            <button
              onClick={() => setModalTab('diff')}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                modalTab === 'diff'
                  ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              <GitCompare size={14} /> Diferencia de Campos
            </button>
            <button
              onClick={() => setModalTab('raw')}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                modalTab === 'raw'
                  ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              <FileJson size={14} /> Ver Datos JSON Raw
            </button>
          </div>

          
          {renderEnhancedJsonDiff(selectedLog.oldValues, selectedLog.newValues)}
        </div>

        
        <div className="border-t border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 p-4 flex justify-end">
          <Button onClick={() => setSelectedLog(null)}>Cerrar Detalle</Button>
        </div>
      </div>
    </div>
  );
};

export default AuditDetailModal;
