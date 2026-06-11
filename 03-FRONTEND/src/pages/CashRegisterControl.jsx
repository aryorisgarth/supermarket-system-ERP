import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import CashRegisterService from '../services/CashRegisterService';
import UserService from '../services/UserService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { formatMoney, isoDate } from '../utils/formatMoney';

import CashRegisterKpis from '../components/dailyclose/CashRegisterKpis';
import ActiveSessionsPanel from '../components/dailyclose/ActiveSessionsPanel';
import PeriodReportPanel from '../components/dailyclose/PeriodReportPanel';
import SessionsHistoryTable from '../components/dailyclose/SessionsHistoryTable';
import SessionDetailModal from '../components/dailyclose/SessionDetailModal';

const today = isoDate(new Date());
const weekAgo = isoDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

const statusLabel = {
  OPEN: 'Abierto',
  CLOSED: 'Cerrado',
};

const statusTone = {
  OPEN: 'green',
  CLOSED: 'blue',
};

const diffTone = (value) => {
  const n = Number(value || 0);
  if (n === 0) return 'green';
  if (Math.abs(n) <= 5) return 'amber';
  return 'red';
};

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const CashRegisterControl = () => {
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [cashiers, setCashiers] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    cashierId: '',
    from: weekAgo,
    to: today,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        from: filters.from || undefined,
        to: filters.to || undefined,
        status: filters.status || undefined,
        cashierId: filters.cashierId || undefined,
      };

      const [activeData, historyData, reportData, usersData] = await Promise.all([
        CashRegisterService.getActiveSessions(),
        CashRegisterService.searchSessions(params),
        CashRegisterService.getReport({ from: filters.from || undefined, to: filters.to || undefined }),
        UserService.getActive(),
      ]);

      setActiveSessions(activeData || []);
      setHistory(historyData || []);
      setReport(reportData || null);
      setCashiers((usersData || []).filter((user) => user.role?.name === 'CAJERO'));
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar el control de cajas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openDetail = async (sessionId) => {
    setShowDetail(true);
    setDetailLoading(true);
    setSelectedSummary(null);
    try {
      const summary = await CashRegisterService.getSessionSummary(sessionId);
      setSelectedSummary(summary);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar el detalle del turno.', 'error');
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closedWithDiff = useMemo(
    () => history.filter((session) => session.status === 'CLOSED' && Number(session.difference || 0) !== 0).length,
    [history]
  );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        title="Control de Cajas"
        description="Supervisión de turnos, cuadres, movimientos manuales e historial consolidado."
        actions={
          <Button icon={RefreshCw} variant="secondary" onClick={loadData} disabled={loading}>
            Actualizar
          </Button>
        }
        meta={<Badge tone="blue">{activeSessions.length} turnos activos</Badge>}
      />

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
          <Loader2 className="animate-spin text-[var(--app-primary)]" size={36} />
          <p className="text-xs font-black uppercase tracking-widest">Cargando datos de caja...</p>
        </div>
      ) : (
        <>
          <CashRegisterKpis 
            report={report} 
            activeSessionsCount={activeSessions.length} 
            from={filters.from} 
            to={filters.to} 
            diffTone={diffTone} 
            formatMoney={formatMoney} 
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <ActiveSessionsPanel 
              activeSessions={activeSessions} 
              onOpenDetail={openDetail} 
              formatDateTime={formatDateTime} 
              formatMoney={formatMoney} 
            />

            <PeriodReportPanel 
              report={report} 
              closedWithDiff={closedWithDiff} 
              formatMoney={formatMoney} 
            />
          </div>

          <SessionsHistoryTable 
            history={history} 
            cashiers={cashiers} 
            filters={filters} 
            setFilters={setFilters} 
            onSearch={loadData} 
            onOpenDetail={openDetail} 
            statusTone={statusTone} 
            statusLabel={statusLabel} 
            diffTone={diffTone} 
            formatDateTime={formatDateTime} 
            formatMoney={formatMoney} 
          />
        </>
      )}

      <SessionDetailModal 
        isOpen={showDetail} 
        onClose={() => setShowDetail(false)} 
        loading={detailLoading} 
        summary={selectedSummary} 
        statusLabel={statusLabel} 
        formatDateTime={formatDateTime} 
        formatMoney={formatMoney} 
      />
    </div>
  );
};

export default CashRegisterControl;
