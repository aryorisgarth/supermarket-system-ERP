import React, { useMemo } from 'react';
import { Terminal, GitCompare, FileJson, Check, User, Target, Globe } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ResponsiveModal from '../ui/ResponsiveModal';
import AuditDiffViewer from './AuditDiffViewer';
import AuthService from '../../services/AuthService';
import {
  getActionCategoryLabel,
  getFieldLabel as defaultGetFieldLabel,
  isOperationalProfile,
} from '../../utils/auditLogsHelper';

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
  const useFriendlyLabels = isOperationalProfile(AuthService.getCurrentUser());
  const getFieldLabel = (key) => defaultGetFieldLabel(key, useFriendlyLabels);

  const actor = selectedLog.actor || {
    id: selectedLog.userId,
    name: selectedLog.userFullName,
    role: null,
  };
  const target = selectedLog.target || {
    entity: selectedLog.affectedTable,
    id: selectedLog.recordId,
    module: selectedLog.affectedTable,
  };
  const context = selectedLog.context || {
    ipAddress: selectedLog.ipAddress,
    userAgent: selectedLog.userAgent,
    module: selectedLog.affectedTable,
  };
  const payload = selectedLog.payload || {
    before: selectedLog.oldValues,
    after: selectedLog.newValues,
  };

  const rawDiff = useMemo(() => {
    const oldObj = parseJson(payload.before);
    const newObj = parseJson(payload.after);
    return { oldObj, newObj };
  }, [payload.before, payload.after, parseJson]);

  const renderRawJson = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Estado anterior</span>
        <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] p-3 text-xs font-mono">
          {rawDiff.oldObj ? JSON.stringify(rawDiff.oldObj, null, 2) : 'N/A'}
        </pre>
      </div>
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Estado posterior</span>
        <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] p-3 text-xs font-mono">
          {rawDiff.newObj ? JSON.stringify(rawDiff.newObj, null, 2) : 'N/A'}
        </pre>
      </div>
    </div>
  );

  return (
    <ResponsiveModal
      isOpen
      onClose={() => setSelectedLog(null)}
      icon={Terminal}
      title={`Detalle de Auditoría #${selectedLog.id}`}
      subtitle={`${getActionLabel(selectedLog.action)} · ${getActionCategoryLabel(selectedLog.actionCategory)} · ${getModuleLabel(selectedLog.affectedTable)}`}
      initialSize="xl"
      sizeOptions={['md', 'lg', 'xl', 'full']}
      headerClassName="bg-gradient-to-r from-[var(--app-primary)] to-indigo-800 text-white"
      footer={
        <div className="flex justify-end px-6 py-4">
          <Button onClick={() => setSelectedLog(null)}>Cerrar Detalle</Button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
              <User size={12} /> Actor
            </p>
            <p className="text-sm font-bold">{actor.name || 'Sistema'}</p>
            <p className="text-xs text-[var(--app-text-muted)]">ID: {actor.id ?? '—'} · Rol: {actor.role || '—'}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
              <Target size={12} /> Objetivo
            </p>
            <p className="text-sm font-bold">{getModuleLabel(target.entity)}</p>
            <p className="text-xs text-[var(--app-text-muted)]">Registro #{target.id ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
              <Globe size={12} /> Contexto
            </p>
            <p className="text-xs font-bold">{formatDateTime(selectedLog.logDate)}</p>
            <p className="text-xs text-[var(--app-text-muted)]">IP: {context.ipAddress || '—'}</p>
            {context.userAgent && (
              <p className="mt-1 truncate text-[10px] text-[var(--app-text-muted)]" title={context.userAgent}>
                {context.userAgent}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Evento</p>
            <p className="mt-1 text-xs font-bold">{getActionLabel(selectedLog.action)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Categoría</p>
            <p className="mt-1 text-xs font-bold">{getActionCategoryLabel(selectedLog.actionCategory)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Riesgo</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold">
              <Check size={14} className="text-[var(--app-success)]" />
              {getRisk(selectedLog).label}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
            <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Módulo</p>
            <p className="mt-1 text-xs font-bold">{getModuleLabel(selectedLog.affectedTable)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModalTab('diff')}
              className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                modalTab === 'diff' ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'
              }`}
            >
              <GitCompare size={14} /> Diff
            </button>
            <button
              type="button"
              onClick={() => setModalTab('raw')}
              className={`flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                modalTab === 'raw' ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'
              }`}
            >
              <FileJson size={14} /> JSON técnico
            </button>
          </div>
          {modalTab === 'diff' && (
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--app-text-soft)]">
              <input
                type="checkbox"
                checked={showUnchanged}
                onChange={(e) => setShowUnchanged(e.target.checked)}
                className="rounded border-[var(--app-border)]"
              />
              Mostrar campos sin cambios
            </label>
          )}
        </div>

        {modalTab === 'raw' ? (
          renderRawJson()
        ) : (
          <AuditDiffViewer
            oldVal={payload.before}
            newVal={payload.after}
            parseJson={parseJson}
            getFieldLabel={getFieldLabel}
            showUnchanged={showUnchanged}
          />
        )}
      </div>
    </ResponsiveModal>
  );
};

export default AuditDetailModal;
