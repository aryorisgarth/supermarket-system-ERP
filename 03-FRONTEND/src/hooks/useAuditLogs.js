import { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import AuditLogService from '../services/AuditLogService';
import UserService from '../services/UserService';
import { generateAuditReportPDF } from '../utils/pdf/auditPDF';
import {
  initialFilters,
  toApiDateTime,
  buildLocalSummary,
  buildOperationalSummary,
  getRisk,
  moduleLabels,
  getModuleLabel,
  getActionLabel,
  getActionCategoryLabel,
  formatDateTime,
  actionCategoryOptions,
} from '../utils/auditLogsHelper';

const buildFilterPayload = (appliedFilters) => ({
  search: appliedFilters.search.trim(),
  action: appliedFilters.action,
  actionCategory: appliedFilters.actionCategory,
  affectedTable: appliedFilters.affectedTable.trim(),
  userId: appliedFilters.userId || undefined,
  fromDate: toApiDateTime(appliedFilters.fromDate),
  toDate: toApiDateTime(appliedFilters.toDate, true),
});

const describeFilters = (appliedFilters, userOptions) => {
  const parts = [];
  if (appliedFilters.fromDate || appliedFilters.toDate) {
    parts.push(`Fechas ${appliedFilters.fromDate || '…'} a ${appliedFilters.toDate || '…'}`);
  }
  if (appliedFilters.userId) {
    const user = userOptions.find((item) => String(item.id) === String(appliedFilters.userId));
    parts.push(`Usuario ${user?.fullName || appliedFilters.userId}`);
  }
  if (appliedFilters.actionCategory) {
    parts.push(`Categoría ${getActionCategoryLabel(appliedFilters.actionCategory)}`);
  }
  if (appliedFilters.action) {
    parts.push(`Acción ${getActionLabel(appliedFilters.action)}`);
  }
  if (appliedFilters.affectedTable) {
    parts.push(`Módulo ${getModuleLabel(appliedFilters.affectedTable)}`);
  }
  if (appliedFilters.search) {
    parts.push(`Búsqueda "${appliedFilters.search}"`);
  }
  return parts.join(' · ') || 'Sin filtros';
};

export const useAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [selectedLog, setSelectedLog] = useState(null);
  const [userOptions, setUserOptions] = useState([]);

  const [activeTab, setActiveTab] = useState('table');
  const [quickFilter, setQuickFilter] = useState('ALL');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const [modalTab, setModalTab] = useState('diff');
  const [showUnchanged, setShowUnchanged] = useState(false);

  useEffect(() => {
    UserService.getActive()
      .then((users) => setUserOptions(users || []))
      .catch(() => setUserOptions([]));
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const payload = buildFilterPayload(appliedFilters);
      const logData = await AuditLogService.getAll(page, size, payload);
      const summaryData = await AuditLogService.getSummary().catch(() => null);
      setLogs(logData.content || []);
      setTotalPages(logData.totalPages || 0);
      setTotalElements(logData.totalElements || 0);
      setSummary(summaryData || buildLocalSummary(logData.content || []));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      Swal.fire('Error', 'No se pudieron cargar los registros de auditoría.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, size, appliedFilters]);

  useEffect(() => {
    fetchLogs();
  }, [page, size, appliedFilters, fetchLogs]);

  useEffect(() => {
    if (autoRefreshInterval === 0) {
      setCountdown(0);
      return undefined;
    }
    setCountdown(autoRefreshInterval);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLogs();
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchLogs]);

  const moduleOptions = useMemo(() => {
    const values = [...Object.keys(moduleLabels), ...logs.map((log) => log.affectedTable).filter(Boolean)];
    if (summary?.mostAffectedTable) values.push(summary.mostAffectedTable);
    return Array.from(new Set(values)).sort();
  }, [logs, summary]);

  const operationalSummary = useMemo(() => buildOperationalSummary(logs), [logs]);

  const applyFilters = (event) => {
    if (event) event.preventDefault();
    setPage(0);
    setQuickFilter('CUSTOM');
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setQuickFilter('ALL');
    setPage(0);
  };

  const handleQuickFilter = (type) => {
    setQuickFilter(type);
    setPage(0);
    let newFilters = { ...initialFilters };

    if (type === 'ALL') {
      setFilters(initialFilters);
      setAppliedFilters(initialFilters);
    } else if (type === 'DENIED') {
      newFilters.actionCategory = 'ACCESS';
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else if (type === 'CASH') {
      newFilters.affectedTable = 'cash_register_sessions';
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else if (type === 'INVENTORY') {
      newFilters.affectedTable = 'products';
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else if (type === 'TODAY') {
      const todayStr = new Date().toISOString().split('T')[0];
      newFilters.fromDate = todayStr;
      newFilters.toDate = todayStr;
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    }
  };

  const displayedLogs = useMemo(() => {
    if (quickFilter === 'HIGH_RISK') {
      return logs.filter((log) => ['Alto', 'Crítico'].includes(getRisk(log).label));
    }
    return logs;
  }, [logs, quickFilter]);

  const fetchExportRows = async () => {
    const payload = buildFilterPayload(appliedFilters);
    const data = await AuditLogService.getAll(0, 10000, payload);
    return data.content || [];
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const blob = await AuditLogService.exportCsv(buildFilterPayload(appliedFilters));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo exportar el CSV de auditoría.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const rows = await fetchExportRows();
      if (rows.length === 0) {
        Swal.fire('Sin datos', 'No hay registros para exportar con los filtros actuales.', 'warning');
        return;
      }
      generateAuditReportPDF(rows, describeFilters(appliedFilters, userOptions));
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo exportar el PDF de auditoría.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const chartData = useMemo(() => {
    let bajo = 0;
    let medio = 0;
    let alto = 0;
    let critico = 0;
    const modules = {};
    const users = {};

    logs.forEach((log) => {
      const risk = getRisk(log).label;
      if (risk === 'Crítico') critico += 1;
      else if (risk === 'Alto') alto += 1;
      else if (risk === 'Medio') medio += 1;
      else bajo += 1;

      const mod = getModuleLabel(log.affectedTable);
      modules[mod] = (modules[mod] || 0) + 1;

      const user = log.userFullName || 'Sistema';
      users[user] = (users[user] || 0) + 1;
    });

    const topModules = Object.entries(modules).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topUsers = Object.entries(users).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      risk: {
        labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
        datasets: [{ data: [critico, alto, medio, bajo], backgroundColor: ['#dc2626', '#ef4444', '#f59e0b', '#059669'], borderWidth: 0 }],
      },
      modules: {
        labels: topModules.map((m) => m[0]),
        datasets: [{ label: 'Eventos', data: topModules.map((m) => m[1]), backgroundColor: '#0F4C81', borderRadius: 8 }],
      },
      users: {
        labels: topUsers.map((u) => u[0]),
        datasets: [{ label: 'Acciones', data: topUsers.map((u) => u[1]), backgroundColor: '#6366f1', borderRadius: 8 }],
      },
    };
  }, [logs]);

  const recentSecurityAlerts = useMemo(
    () => logs.filter((log) => ['Alto', 'Crítico'].includes(getRisk(log).label)).slice(0, 6),
    [logs]
  );

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setModalTab('diff');
    setShowUnchanged(false);
  };

  return {
    logs,
    summary,
    loading,
    exporting,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalElements,
    filters,
    setFilters,
    applyFilters,
    clearFilters,
    quickFilter,
    handleQuickFilter,
    displayedLogs,
    exportToCSV,
    exportToPDF,
    autoRefreshInterval,
    setAutoRefreshInterval,
    countdown,
    selectedLog,
    setSelectedLog,
    activeTab,
    setActiveTab,
    modalTab,
    setModalTab,
    showUnchanged,
    setShowUnchanged,
    moduleOptions,
    userOptions,
    actionCategoryOptions,
    operationalSummary,
    chartData,
    recentSecurityAlerts,
    handleOpenDetail,
    reload: fetchLogs,
  };
};

export default useAuditLogs;
