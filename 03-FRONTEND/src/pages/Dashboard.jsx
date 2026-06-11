import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  Building2,
  DollarSign,
  Package,
  RefreshCw,
  Tag,
  TrendingUp,
  TrendingDown,
  Activity,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import DashboardService from '../services/DashboardService';
import ReportService from '../services/ReportService';
import SupplierService from '../services/SupplierService';
import CategoryService from '../services/CategoryService';
import SaleService from '../services/SaleService';
import { SkeletonDashboard } from '../components/SkeletonLoader';
import Card, { CardHeader } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { formatMoney, formatCompactMoney } from '../utils/formatMoney';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const money = formatMoney;
const compactMoney = formatCompactMoney;

const isoDate = (date) => date.toISOString().split('T')[0];

const StatCard = ({ title, value, icon: Icon, tone = 'blue', trend, note }) => {
  const toneClass = {
    blue: 'text-[var(--app-primary)] bg-[var(--app-primary-soft)] border-[var(--app-primary)]/10',
    green: 'text-[var(--app-success)] bg-[var(--app-success-soft)] border-[var(--app-success)]/10',
    amber: 'text-[var(--app-warning)] bg-[var(--app-warning-soft)] border-[var(--app-warning)]/10',
    red: 'text-[var(--app-danger)] bg-[var(--app-danger-soft)] border-[var(--app-danger)]/10',
  }[tone];

  const isLong = typeof value === 'string' && value.length > 9;
  const valueClass = isLong
    ? 'text-lg sm:text-xl font-black tracking-tight text-[var(--app-text)]'
    : 'text-xl sm:text-2xl font-black tracking-tighter text-[var(--app-text)]';

  return (
    <Card className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
          <h3 className={`${valueClass} truncate`}>{value}</h3>
          
          {(trend !== undefined || note) && (
            <div className="flex items-center gap-2 mt-2">
              {trend !== undefined && (
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                  {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(trend).toFixed(1)}%
                </span>
              )}
              {note && <p className="text-[10px] font-bold text-[var(--app-text-muted)] truncate">{note}</p>}
            </div>
          )}
        </div>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${toneClass}`}>
          <Icon size={24} />
        </span>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const [weeklySales, setWeeklySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [comparativeKpis, setComparativeKpis] = useState(null);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() - 29);
      const previousTo = new Date(from);
      previousTo.setDate(from.getDate() - 1);
      const previousFrom = new Date(previousTo);
      previousFrom.setDate(previousTo.getDate() - 29);

      const [sales, products, status, suppliers, categories, currentKpis, comparison, salesHistory] = await Promise.all([
        DashboardService.getWeeklySales(),
        DashboardService.getTopProducts(),
        DashboardService.getInventoryStatus(),
        SupplierService.getAll(),
        CategoryService.getAll(),
        ReportService.getKpis(isoDate(from), isoDate(today)),
        ReportService.getComparativeKpis(isoDate(from), isoDate(today), isoDate(previousFrom), isoDate(previousTo)),
        SaleService.getAll({ size: 5 })
      ]);
      setWeeklySales(sales || []);
      setTopProducts(products || []);
      setInventoryStatus(status);
      setKpis(currentKpis);
      setComparativeKpis(comparison);
      setSuppliersCount(suppliers?.length || 0);
      setCategoriesCount(categories?.length || 0);
      setRecentSales(salesHistory?.content || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalWeeklySales = useMemo(
    () => weeklySales.reduce((acc, sale) => acc + Number(sale.amount || 0), 0),
    [weeklySales]
  );

  const areaChartData = {
    labels: weeklySales.map((sale) => sale.date),
    datasets: [
      {
        label: 'Ingresos',
        data: weeklySales.map((sale) => sale.amount),
        fill: true,
        borderColor: '#0F4C81',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(15, 76, 129, 0.25)');
          gradient.addColorStop(1, 'rgba(15, 76, 129, 0)');
          return gradient;
        },
        borderWidth: 4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0F4C81',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: topProducts.slice(0, 5).map(p => p.name),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: topProducts.slice(0, 5).map(p => p.quantity),
        backgroundColor: '#0F4C81',
        borderRadius: 8,
        barThickness: 32,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 20,
        right: 0,
        top: 10,
        bottom: 0,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 14,
        titleFont: { size: 13, weight: '900' },
        bodyFont: { size: 12, weight: '700' },
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Total: ${money(context.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.08)', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
        offset: false,
      },
    },
  };

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control Central"
        title="Panel Administrativo"
        description="Vista estratégica del rendimiento operativo y financiero del sistema."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={fetchDashboardData}>
            Refrescar Datos
          </Button>
        }
        meta={
          <>
            <Badge tone="green" icon={Activity}>Sistema en Línea</Badge>
            <Badge tone="blue" icon={Clock}>Última actualización: {new Date().toLocaleTimeString()}</Badge>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard 
          title="Ingresos (30d)" 
          value={compactMoney(kpis?.totalSales ?? totalWeeklySales)} 
          icon={DollarSign} 
          tone="green" 
          trend={comparativeKpis?.totalSalesChangePercentage}
        />
        <StatCard 
          title="Valor Stock" 
          value={compactMoney(kpis?.inventoryValue ?? inventoryStatus?.totalInventoryValue)} 
          icon={Package} 
          tone="blue" 
        />
        <StatCard 
          title="Stock Crítico" 
          value={kpis?.criticalStockProducts ?? inventoryStatus?.lowStockCount ?? 0} 
          icon={AlertTriangle} 
          tone="red" 
          note="Acción requerida"
        />
        <StatCard 
          title="Ticket Medio" 
          value={compactMoney(kpis?.averageTicket ?? 0)} 
          icon={TrendingUp} 
          tone="amber" 
          trend={comparativeKpis?.averageTicketChangePercentage}
        />
        <StatCard title="Proveedores" value={suppliersCount} icon={Building2} tone="blue" />
        <StatCard title="Categorías" value={categoriesCount} icon={Tag} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 shadow-enterprise-lg">
          <CardHeader
            icon={BarChart3}
            title="Evolución de Ingresos"
            description="Flujo de caja registrado durante los últimos 7 días."
          />
          <div className="h-[360px] mt-2">
            <Line data={areaChartData} options={chartOptions} />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={Activity}
              title="Ventas Recientes"
              description="Últimos movimientos registrados en caja."
              action={
                <Link to="/control-ventas" className="text-[10px] font-black uppercase text-[var(--app-primary)] hover:underline">
                  Ver Todo
                </Link>
              }
            />
            <div className="space-y-3">
              {recentSales.length === 0 ? (
                <p className="py-6 text-center text-xs font-bold text-[var(--app-text-muted)] italic">No hay ventas hoy</p>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--app-bg-subtle)] border border-[var(--app-border)] group hover:border-[var(--app-primary)]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-white shadow-sm border border-[var(--app-border)] text-[var(--app-primary)]">
                        <DollarSign size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-normal text-[var(--app-text-soft)] truncate font-mono">{sale.invoiceNumber}</p>
                        <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase">Por: {sale.userFullName || 'Sistema'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-[var(--app-success)]">{money(sale.totalAmount)}</p>
                      <p className="text-[9px] font-bold text-[var(--app-text-muted)]">{new Date(sale.saleDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={Award}
              title="Top 5 Productos"
              description="Ranking por volumen de ventas."
            />
            <div className="h-[180px]">
              <Bar 
                data={barChartData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  scales: {
                    x: { display: false },
                    y: { grid: { display: false }, ticks: { color: '#475569', font: { weight: 'bold' } } }
                  }
                }} 
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
