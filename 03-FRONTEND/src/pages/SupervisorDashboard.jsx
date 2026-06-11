import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
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

const SupervisorDashboard = () => {
  const [weeklySales, setWeeklySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 6);

      const [sales, products, status, periodKpis] = await Promise.all([
        DashboardService.getWeeklySales(),
        DashboardService.getTopProducts(),
        DashboardService.getInventoryStatus(),
        ReportService.getKpis(isoDate(from), isoDate(today)),
      ]);
      setWeeklySales(sales || []);
      setTopProducts(products || []);
      setInventoryStatus(status);
      setKpis(periodKpis);
    } catch (error) {
      console.error('Error cargando panel supervisor:', error);
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
        eyebrow="Operaciones de tienda"
        title="Panel de supervision"
        description="Control operativo de ventas, inventario y compras del dia."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={fetchData}>
            Actualizar
          </Button>
        }
        meta={<Badge tone="green">Turno operativo</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ventas (7 dias)"
          value={formatMoney(kpis?.totalSales ?? weekTotal)}
          icon={DollarSign}
          tone="green"
          note={`${kpis?.salesCount ?? 0} transacciones`}
        />
        <StatCard
          title="Ticket promedio"
          value={formatMoney(kpis?.averageTicket)}
          icon={TrendingUp}
          tone="amber"
        />
        <StatCard
          title="Stock critico"
          value={kpis?.criticalStockProducts ?? inventoryStatus?.lowStockCount ?? 0}
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          title="Valor inventario"
          value={formatMoney(kpis?.inventoryValue ?? inventoryStatus?.totalInventoryValue)}
          icon={Package}
          tone="blue"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            icon={BarChart3}
            title="Ventas diarias"
            description="Seguimiento de ingresos de la semana."
          />
          <WeeklySalesChart weeklySales={weeklySales} />
        </Card>

        <TopProductsList topProducts={topProducts} />
      </div>

      <div className="mt-5">
        <Card>
          <CardHeader
            icon={ClipboardList}
            title="Acciones operativas"
            description="Accesos directos a los modulos de supervision."
          />
          <div className="flex flex-wrap gap-3">
            <Link to="/inventario">
              <Button icon={Package}>Inventario</Button>
            </Link>
            <Link to="/compras">
              <Button variant="secondary" icon={ClipboardList}>
                Compras
              </Button>
            </Link>
            <Link to="/facturacion">
              <Button variant="secondary" icon={ShoppingCart}>
                Punto de venta
              </Button>
            </Link>
            <Link to="/reportes">
              <Button variant="secondary" icon={BarChart3}>
                Reportes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
