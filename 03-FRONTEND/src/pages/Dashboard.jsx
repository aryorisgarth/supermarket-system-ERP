import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Activity, Clock } from 'lucide-react';
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

import DashboardService from '../services/DashboardService';
import ReportService from '../services/ReportService';
import SupplierService from '../services/SupplierService';
import CategoryService from '../services/CategoryService';
import SaleService from '../services/SaleService';

import { SkeletonDashboard } from '../components/SkeletonLoader';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

import { formatMoney, formatCompactMoney } from '../utils/formatMoney';

import DashboardMetricsGrid from '../components/dashboard/DashboardMetricsGrid';
import SalesChartCard from '../components/dashboard/SalesChartCard';
import RecentSalesCard from '../components/dashboard/RecentSalesCard';
import TopProductsCard from '../components/dashboard/TopProductsCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const money = formatMoney;
const compactMoney = formatCompactMoney;

const isoDate = (date) => date.toISOString().split('T')[0];

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
        SaleService.getAll({ size: 5 }),
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
            <Badge tone="green" icon={Activity}>
              Sistema en Línea
            </Badge>
            <Badge tone="blue" icon={Clock}>
              Última actualización: {new Date().toLocaleTimeString()}
            </Badge>
          </>
        }
      />

      <DashboardMetricsGrid
        kpis={kpis}
        inventoryStatus={inventoryStatus}
        comparativeKpis={comparativeKpis}
        suppliersCount={suppliersCount}
        categoriesCount={categoriesCount}
        totalWeeklySales={totalWeeklySales}
        compactMoney={compactMoney}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SalesChartCard weeklySales={weeklySales} chartOptions={chartOptions} />

        <div className="space-y-6">
          <RecentSalesCard recentSales={recentSales} money={money} />

          <TopProductsCard topProducts={topProducts} chartOptions={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
