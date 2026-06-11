import { useState, useEffect, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import AuditLogService from '../services/AuditLogService';
import {
  initialFilters,
  toApiDateTime,
  buildLocalSummary,
  buildOperationalSummary,
  getRisk,
  moduleLabels,
  getModuleLabel,
  getActionLabel,
  formatDateTime,
  criticalActions,
  highRiskActions,
  mediumRiskActions,
} from '../utils/auditLogsHelper';

export const useAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [selectedLog, setSelectedLog] = useState(null);

  // Estados agregados para diseño premium y analíticos
  const [activeTab, setActiveTab] = useState('table'); // 'table' o 'analytics'
  const [quickFilter, setQuickFilter] = useState('ALL');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // 0 (desactivado), 10, 30, 60 segundos
  const [countdown, setCountdown] = useState(0);

  // Estados agregados para el visor de diferencias JSON
  const [modalTab, setModalTab] = useState('diff'); // 'diff' o 'raw'
  const [showUnchanged, setShowUnchanged] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        search: appliedFilters.search.trim(),
        action: appliedFilters.action,
        affectedTable: appliedFilters.affectedTable.trim(),
        fromDate: toApiDateTime(appliedFilters.fromDate),
        toDate: toApiDateTime(appliedFilters.toDate, true),
      };
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

  // Manejo de Auto-Refresco
  useEffect(() => {
    if (autoRefreshInterval === 0) {
      setCountdown(0);
      return;
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

  const tableOptions = useMemo(() => {
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
      newFilters.action = 'ACCESS_DENIED';
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else if (type === 'CASH') {
      newFilters.search = 'cash_register';
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else if (type === 'INVENTORY') {
      newFilters.search = 'product';
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

  const exportToCSV = () => {
    if (displayedLogs.length === 0) {
      Swal.fire('Sin Datos', 'No hay registros en la vista actual para exportar.', 'warning');
      return;
    }

    const headers = ['Fecha y Hora', 'Usuario', 'Evento', 'Riesgo', 'Módulo', 'Registro ID', 'IP'];
    const rows = displayedLogs.map((log) => [
      formatDateTime(log.logDate),
      log.userFullName || 'Sistema',
      getActionLabel(log.action),
      getRisk(log).label,
      getModuleLabel(log.affectedTable),
      log.recordId || '-',
      log.ipAddress || '127.0.0.1',
    ]);

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += headers.join(',') + '\n';
    rows.forEach((row) => {
      const escapedRow = row.map((val) => {
        const text = String(val).replace(/"/g, '""');
        return `"${text}"`;
      });
      csvContent += escapedRow.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `auditoria_operacional_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      if (risk === 'Crítico') critico++;
      else if (risk === 'Alto') alto++;
      else if (risk === 'Medio') medio++;
      else bajo++;

      const mod = getModuleLabel(log.affectedTable);
      modules[mod] = (modules[mod] || 0) + 1;

      const user = log.userFullName || 'Sistema';
      users[user] = (users[user] || 0) + 1;
    });

    const topModules = Object.entries(modules)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topUsers = Object.entries(users)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      risk: {
        labels: ['Crítico', 'Alto', 'Medio', 'Bajo'],
        datasets: [
          {
            data: [critico, alto, medio, bajo],
            backgroundColor: ['#dc2626', '#ef4444', '#f59e0b', '#059669'],
            borderWidth: 0,
          },
        ],
      },
      modules: {
        labels: topModules.map((m) => m[0]),
        datasets: [
          {
            label: 'Eventos',
            data: topModules.map((m) => m[1]),
            backgroundColor: '#1e40af',
            borderRadius: 8,
          },
        ],
      },
      users: {
        labels: topUsers.map((u) => u[0]),
        datasets: [
          {
            label: 'Acciones',
            data: topUsers.map((u) => u[1]),
            backgroundColor: '#6366f1',
            borderRadius: 8,
          },
        ],
      },
    };
  }, [logs]);

  const recentSecurityAlerts = useMemo(() => {
    return logs
      .filter((log) => ['Alto', 'Crítico'].includes(getRisk(log).label))
      .slice(0, 6);
  }, [logs]);

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setModalTab('diff');
    setShowUnchanged(false);
  };

  return {
    logs,
    summary,
    loading,
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
    tableOptions,
    operationalSummary,
    chartData,
    recentSecurityAlerts,
    handleOpenDetail,
    reload: fetchLogs,
  };
};

export default useAuditLogs;
