import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, ExternalLink, Filter, Loader2, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SystemAlertService from '../services/SystemAlertService';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';

const severityTone = {
  CRITICAL: 'red',
  WARNING: 'amber',
  INFO: 'blue',
};

const severityLabel = {
  CRITICAL: 'Crítica',
  WARNING: 'Advertencia',
  INFO: 'Informativa',
};

const typeLabel = {
  INVENTORY: 'Inventario',
  CASH_REGISTER: 'Caja',
  PURCHASE: 'Compras',
  FINANCE: 'Finanzas',
  WAREHOUSE: 'Bodega',
};

const Stat = ({ title, value, tone = 'blue' }) => (
  <Card>
    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
    <p className={`mt-2 text-2xl font-black ${tone === 'red' ? 'text-[var(--app-danger)]' : tone === 'amber' ? 'text-amber-500' : 'text-[var(--app-text)]'}`}>
      {value}
    </p>
  </Card>
);

const SystemAlerts = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('ACTIVE');
  const [type, setType] = useState('ALL');
  const [generating, setGenerating] = useState(false);

  const buildParams = useCallback(() => ({
    status: status === 'ALL' ? undefined : status,
    type: type === 'ALL' ? undefined : type,
  }), [status, type]);

  const loadPage = useCallback((params) => SystemAlertService.getPage(params), []);
  const {
    items: alerts,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    reload,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
    handleItemsPerPageChange,
  } = useBackendList({
    loadPage,
    buildParams,
    filterDeps: [status, type],
    sort: 'createdAt,desc',
  });

  const filteredAlerts = alerts;

  const [stats, setStats] = useState({ active: 0, critical: 0, warning: 0, resolved: 0 });

  const loadStats = useCallback(async () => {
    try {
      const [activePage, resolvedPage] = await Promise.all([
        SystemAlertService.getPage({ status: 'ACTIVE', size: 500, sort: 'createdAt,desc' }),
        SystemAlertService.getPage({ status: 'RESOLVED', size: 1, sort: 'createdAt,desc' }),
      ]);
      const activeItems = activePage?.content || [];
      setStats({
        active: activePage?.totalElements ?? 0,
        critical: activeItems.filter((a) => a.severity === 'CRITICAL').length,
        warning: activeItems.filter((a) => a.severity === 'WARNING').length,
        resolved: resolvedPage?.totalElements ?? 0,
      });
    } catch {
      setStats({ active: 0, critical: 0, warning: 0, resolved: 0 });
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats, alerts]);

  const generateAlerts = async () => {
    try {
      setGenerating(true);
      await SystemAlertService.generate();
      setStatus('ACTIVE');
      await reload();
      Swal.fire({ icon: 'success', title: 'Escaneo completado', timer: 1200, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', error?.message || 'No se pudieron generar alertas.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const resolveAlert = async (alert) => {
    const result = await Swal.fire({
      title: 'Resolver alerta',
      text: alert.title,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Marcar resuelta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
    });
    if (!result.isConfirmed) return;

    try {
      await SystemAlertService.resolve(alert.id);
      await reload();
    } catch (error) {
      Swal.fire('Error', error?.message || 'No se pudo resolver la alerta.', 'error');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Supervisión"
        title="Alertas Inteligentes"
        description="Alertas persistentes generadas desde inventario, caja, compras y finanzas."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={RefreshCw} onClick={() => { reload(); loadStats(); }}>Actualizar</Button>
            <Button icon={generating ? Loader2 : BellRing} onClick={generateAlerts} disabled={generating}>
              {generating ? 'Escaneando...' : 'Escanear sistema'}
            </Button>
          </div>
        }
        meta={<Badge tone={stats.active ? 'amber' : 'green'} icon={stats.active ? AlertTriangle : CheckCircle2}>{stats.active} activas</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat title="Activas" value={stats.active} tone="amber" />
        <Stat title="Críticas" value={stats.critical} tone="red" />
        <Stat title="Advertencias" value={stats.warning} tone="amber" />
        <Stat title="Resueltas" value={stats.resolved} />
      </div>

      <Card>
        <CardHeader icon={Filter} title="Filtros" description="Separa alertas activas, resueltas y por módulo de origen." />
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_220px]">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
            <input
              className="ui-input w-full pl-9"
              placeholder="Buscar por título o mensaje..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <select className="ui-input ui-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ACTIVE">Activas</option>
            <option value="RESOLVED">Resueltas</option>
            <option value="ALL">Todas</option>
          </select>
          <select className="ui-input ui-select" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="ALL">Todos los módulos</option>
            <option value="INVENTORY">Inventario</option>
            <option value="CASH_REGISTER">Caja</option>
            <option value="PURCHASE">Compras</option>
            <option value="FINANCE">Finanzas</option>
          </select>
        </div>
      </Card>

      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-[var(--app-border)] p-6">
          <CardHeader icon={ShieldAlert} title="Bandeja de alertas" description="Cada alerta queda registrada hasta que un responsable la resuelva." />
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
            <Loader2 className="animate-spin text-[var(--app-primary)]" size={40} />
            <p className="text-xs font-black uppercase tracking-widest">Cargando alertas...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 size={44} className="mx-auto text-[var(--app-success)]" />
            <p className="mt-4 text-sm font-black uppercase tracking-widest text-[var(--app-text-muted)]">Sin alertas para el filtro seleccionado</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--app-border)]">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={severityTone[alert.severity] || 'neutral'}>{severityLabel[alert.severity] || alert.severity}</Badge>
                    <Badge tone="blue">{typeLabel[alert.type] || alert.sourceModule || alert.type}</Badge>
                    <Badge tone={alert.status === 'ACTIVE' ? 'amber' : 'green'}>{alert.status === 'ACTIVE' ? 'Activa' : 'Resuelta'}</Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-[var(--app-text)]">{alert.title}</h3>
                  <p className="mt-1 text-sm font-bold text-[var(--app-text-soft)]">{alert.message}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--app-text-muted)]">
                    Actualizada: {alert.updatedAt ? new Date(alert.updatedAt).toLocaleString() : '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-center">
                  {alert.actionPath && (
                    <Button size="sm" variant="secondary" icon={ExternalLink} onClick={() => navigate(alert.actionPath)}>
                      Ir
                    </Button>
                  )}
                  {alert.status === 'ACTIVE' && (
                    <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => resolveAlert(alert)}>
                      Resolver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        label="alertas"
      />
    </div>
  );
};

export default SystemAlerts;
