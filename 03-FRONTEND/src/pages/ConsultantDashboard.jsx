import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  FileText,
  Package,
  RefreshCw,
} from 'lucide-react';
import DashboardService from '../services/DashboardService';
import ReportService from '../services/ReportService';
import { SkeletonDashboard } from '../components/SkeletonLoader';
import Card, { CardHeader } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/dashboard/StatCard';
import WeeklySalesChart from '../components/dashboard/WeeklySalesChart';
import TopProductsList from '../components/dashboard/TopProductsList';
import { formatMoney, isoDate } from '../utils/formatMoney';

const ConsultantDashboard = () => {
  const [weeklySales, setWeeklySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 6);

      const [sales, products, status, movements] = await Promise.all([
        DashboardService.getWeeklySales(),
        DashboardService.getTopProducts(),
        DashboardService.getInventoryStatus(),
        ReportService.getInventoryMovements(isoDate(from), isoDate(today)).catch(() => []),
      ]);
      setWeeklySales(sales || []);
      setTopProducts(products || []);
      setInventoryStatus(status);
      setRecentMovements(Array.isArray(movements) ? movements.slice(0, 8) : []);
    } catch (error) {
      console.error('Error cargando panel consultor:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const weekTotal = useMemo(
    () => (weeklySales || []).reduce((acc, row) => acc + Number(row.amount || 0), 0),
    [weeklySales]
  );

  if (loading) return <SkeletonDashboard />;

  return (
    <div>
      <PageHeader
        eyebrow="Auditoria y analitica"
        title="Panel de consulta"
        description="Vista de solo lectura para revisar ventas, inventario y movimientos sin modificar datos."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={fetchData}>
            Actualizar
          </Button>
        }
        meta={
          <>
            <Badge tone="blue">Solo lectura</Badge>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ventas ultimos 7 dias"
          value={formatMoney(weekTotal)}
          icon={BarChart3}
          tone="green"
        />
        <StatCard
          title="Productos stock bajo"
          value={inventoryStatus?.lowStockCount ?? 0}
          icon={AlertTriangle}
          tone="red"
          note="Requieren revision"
        />
        <StatCard
          title="Valor inventario"
          value={formatMoney(inventoryStatus?.totalInventoryValue)}
          icon={Package}
          tone="blue"
        />
        <StatCard
          title="Movimientos recientes"
          value={recentMovements.length}
          icon={FileText}
          tone="amber"
          note="Ultimos 7 dias"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            icon={BarChart3}
            title="Tendencia de ventas"
            description="Ingresos diarios de la ultima semana (datos agregados)."
          />
          <WeeklySalesChart weeklySales={weeklySales} />
        </Card>

        <TopProductsList topProducts={topProducts} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={FileText}
            title="Ultimos movimientos de inventario"
            description="Entradas, salidas y ajustes registrados."
          />
          {recentMovements.length === 0 ? (
            <p className="text-sm font-semibold text-[var(--app-text-muted)]">Sin movimientos en el periodo.</p>
          ) : (
            <ul className="space-y-2">
              {recentMovements.map((m, idx) => (
                <li
                  key={`${m.productName}-${m.createdAt}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--app-border)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[var(--app-text)]">{m.productName}</p>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      {m.movementType} · {m.userFullName || 'Sistema'}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold text-[var(--app-primary)]">{m.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            icon={FileText}
            title="Accesos rapidos"
            description="Modulos disponibles para tu perfil."
          />
          <div className="flex flex-wrap gap-3">
            <Link to="/reportes">
              <Button icon={FileText}>Ver reportes completos</Button>
            </Link>
            <Link to="/mi-perfil">
              <Button variant="secondary">Mi perfil</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
