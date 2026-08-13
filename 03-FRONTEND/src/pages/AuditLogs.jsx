import React from 'react';
import { Download, RefreshCw, Database, BarChart2, FileText } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';


import useAuditLogs from '../hooks/useAuditLogs';
import {
  actionOptions,
  actionCategoryOptions,
  getActionLabel,
  getActionTone,
  getRisk,
  getModuleLabel,
  formatDateTime,
  parseJson,
} from '../utils/auditLogsHelper';


import AuditStats from '../components/audit/AuditStats';
import AuditFilterForm from '../components/audit/AuditFilterForm';
import AuditLogsTable from '../components/audit/AuditLogsTable';
import AuditAnalytics from '../components/audit/AuditAnalytics';
import AuditDetailModal from '../components/audit/AuditDetailModal';

const AuditLogs = () => {
  const auditState = useAuditLogs();

  const {
    summary,
    operationalSummary,
    filters,
    setFilters,
    applyFilters,
    clearFilters,
    moduleOptions,
    userOptions,
    actionCategoryOptions,
    quickFilter,
    handleQuickFilter,
    loading,
    displayedLogs,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalElements,
    logs,
    activeTab,
    setActiveTab,
    autoRefreshInterval,
    setAutoRefreshInterval,
    countdown,
    selectedLog,
    setSelectedLog,
    modalTab,
    setModalTab,
    showUnchanged,
    setShowUnchanged,
    recentSecurityAlerts,
    chartData,
    handleOpenDetail,
    reload,
    exportToCSV,
    exportToPDF,
    exporting,
  } = auditState;

  const exportActions = (
    <div className="flex flex-wrap items-center gap-2">
      
      <div className="flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 shadow-sm">
        <span className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] tracking-wider">
          {autoRefreshInterval > 0 ? `Refresco en: ${countdown}s` : 'Auto-Refresco'}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setAutoRefreshInterval(0)}
            className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
              autoRefreshInterval === 0 ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'
            }`}
          >
            OFF
          </button>
          <button
            type="button"
            onClick={() => setAutoRefreshInterval(10)}
            className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
              autoRefreshInterval === 10 ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'
            }`}
          >
            10s
          </button>
          <button
            type="button"
            onClick={() => setAutoRefreshInterval(30)}
            className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
              autoRefreshInterval === 30 ? 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'
            }`}
          >
            30s
          </button>
        </div>
      </div>

      <Button icon={Download} variant="secondary" onClick={exportToCSV} disabled={exporting}>
        Exportar CSV
      </Button>
      <Button icon={FileText} variant="secondary" onClick={exportToPDF} disabled={exporting}>
        Exportar PDF
      </Button>
      <Button icon={RefreshCw} variant="secondary" onClick={reload}>
        Actualizar
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Control interno y seguridad"
        title="Auditoría Operacional"
        description="Trazabilidad append-only de ventas, caja, inventario y accesos. Los registros no pueden editarse ni eliminarse."
        actions={exportActions}
        meta={
          <Badge tone="blue" className="px-3">
            {totalElements} eventos registrados
          </Badge>
        }
      />

      
      <AuditStats summary={summary} operationalSummary={operationalSummary} />

      
      <div className="flex gap-1 border-b border-[var(--app-border)]">
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === 'table'
              ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]'
              : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          <Database size={14} /> Bitácora de Auditoría
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]'
              : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          <BarChart2 size={14} /> Dashboard Analítico
        </button>
      </div>

      {activeTab === 'table' ? (
        <div className="space-y-6">
          <AuditFilterForm
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
            clearFilters={clearFilters}
            actionOptions={actionOptions}
            actionCategoryOptions={actionCategoryOptions}
            getActionLabel={getActionLabel}
            moduleOptions={moduleOptions}
            userOptions={userOptions}
          />

          <AuditLogsTable
            quickFilter={quickFilter}
            handleQuickFilter={handleQuickFilter}
            loading={loading}
            displayedLogs={displayedLogs}
            getRisk={getRisk}
            getActionTone={getActionTone}
            getActionLabel={getActionLabel}
            getModuleLabel={getModuleLabel}
            formatDateTime={formatDateTime}
            handleOpenDetail={handleOpenDetail}
            page={page}
            setPage={setPage}
            size={size}
            setSize={setSize}
            totalPages={totalPages}
            totalElements={totalElements}
            logs={logs}
          />
        </div>
      ) : (
        <AuditAnalytics
          logs={logs}
          chartData={chartData}
          operationalSummary={operationalSummary}
          recentSecurityAlerts={recentSecurityAlerts}
          getRisk={getRisk}
          getActionLabel={getActionLabel}
          getModuleLabel={getModuleLabel}
          handleOpenDetail={handleOpenDetail}
        />
      )}

      {selectedLog && (
        <AuditDetailModal
          selectedLog={selectedLog}
          setSelectedLog={setSelectedLog}
          modalTab={modalTab}
          setModalTab={setModalTab}
          showUnchanged={showUnchanged}
          setShowUnchanged={setShowUnchanged}
          formatDateTime={formatDateTime}
          getRisk={getRisk}
          getActionLabel={getActionLabel}
          getModuleLabel={getModuleLabel}
          parseJson={parseJson}
        />
      )}
    </div>
  );
};

export default AuditLogs;
