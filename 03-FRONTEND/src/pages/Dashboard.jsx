import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Activity, Clock, CreditCard, AlertTriangle } from 'lucide-react';
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
import ProductService from '../services/ProductService';

import { SkeletonDashboard } from '../components/SkeletonLoader';
import Card, { CardHeader } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

import { formatMoney, formatCompactMoney } from '../utils/formatMoney';

import DashboardMetricsGrid from '../components/dashboard/DashboardMetricsGrid';
import SalesChartCard from '../components/dashboard/SalesChartCard';
import RecentSalesCard from '../components/dashboard/RecentSalesCard';
import TopProductsCard from '../components/dashboard/TopProductsCard';
import InventoryFlowChartCard from '../components/dashboard/InventoryFlowChartCard';
import TopBrandsCard from '../components/dashboard/TopBrandsCard';

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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [inventoryFlow, setInventoryFlow] = useState([]);
  const [salesByBrand, setSalesByBrand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30days');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const end = new Date();
      let start = new Date(end);

      if (dateFilter === 'today') {
        start.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        const day = end.getDay();
        const diff = end.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(end.getFullYear(), end.getMonth(), diff);
        start.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'month') {
        start = new Date(end.getFullYear(), end.getMonth(), 1);
      } else {
        start.setDate(end.getDate() - 29);
      }

      const msDiff = end.getTime() - start.getTime() || 86400000;
      const previousTo = new Date(start.getTime() - 86400000);
      const previousFrom = new Date(previousTo.getTime() - msDiff);

      const [sales, products, status, suppliers, categories, currentKpis, comparison, salesHistory, paymentData, lowStockData, flowData, brandSalesData] = await Promise.all([
        DashboardService.getWeeklySales(),
        DashboardService.getTopProducts(),
        DashboardService.getInventoryStatus(),
        SupplierService.getAll(),
        CategoryService.getAll(),
        ReportService.getKpis(isoDate(start), isoDate(end)),
        ReportService.getComparativeKpis(isoDate(start), isoDate(end), isoDate(previousFrom), isoDate(previousTo)),
        SaleService.getAll({ size: 5 }),
        ReportService.getSalesByPaymentMethod(isoDate(start), isoDate(end)),
        ProductService.getLowStock(),
        ReportService.getInventoryFlowVolume(isoDate(start), isoDate(end)),
        ReportService.getSalesByBrand(isoDate(start), isoDate(end)),
      ]);
      setWeeklySales(sales || []);
      setTopProducts(products || []);
      setInventoryStatus(status);
      setKpis(currentKpis);
      setComparativeKpis(comparison);
      setSuppliersCount(suppliers?.length || 0);
      setCategoriesCount(categories?.length || 0);
      setRecentSales(salesHistory?.content || []);
      
      const totalAmount = (paymentData || []).reduce((acc, p) => acc + Number(p.totalSales || 0), 0);
      setPaymentMethods((paymentData || []).map(p => ({
        ...p,
        percentage: totalAmount > 0 ? (Number(p.totalSales) / totalAmount) * 100 : 0
      })));
      setLowStockProducts(lowStockData || []);
      setInventoryFlow(flowData || []);
      setSalesByBrand(brandSalesData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

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
          <div className="flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl focus:outline-none focus:border-primary text-xs font-bold text-[var(--app-text)] cursor-pointer"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="30days">Últimos 30 Días</option>
            </select>
            <Button variant="secondary" icon={RefreshCw} onClick={fetchDashboardData}>
              Refrescar
            </Button>
          </div>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <InventoryFlowChartCard inventoryFlow={inventoryFlow} chartOptions={chartOptions} />
        <TopBrandsCard salesByBrand={salesByBrand} money={money} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader icon={Activity} title="Margen Financiero" description="Análisis de rentabilidad acumulada del periodo" />
          <div className="mt-4 flex flex-col justify-center items-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                <circle cx="48" cy="48" r="38" stroke="#4f46e5" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - (kpis?.grossMarginPercentage || 0) / 100)} />
              </svg>
              <span className="absolute text-lg font-bold text-slate-800 dark:text-white">{(kpis?.grossMarginPercentage || 0).toFixed(1)}%</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 w-full text-center text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block font-semibold text-slate-500">Ventas</span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{money(kpis?.totalSales || 0)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block font-semibold text-slate-500">Utilidad Bruta</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{money(kpis?.grossProfit || 0)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader icon={CreditCard} title="Distribución de Ventas" description="Ventas agrupadas por método de pago" />
          <div className="mt-4 space-y-4">
            {paymentMethods.map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[var(--app-text)]">
                  <span>{pm.method === 'CASH' ? 'Efectivo' : pm.method === 'CARD' ? 'Tarjeta' : pm.method === 'TRANSFER' ? 'Transferencia' : pm.method}</span>
                  <span>{money(pm.totalSales)} ({pm.percentage?.toFixed(1) || '0'}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pm.percentage || 0}%` }}></div>
                </div>
              </div>
            ))}
            {paymentMethods.length === 0 && (
              <p className="py-4 text-center text-xs italic text-slate-400">Sin transacciones registradas.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader icon={AlertTriangle} title="Stock Crítico" description="Productos que requieren reposición inmediata" />
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
            {lowStockProducts.slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2.5 text-xs">
                <span className="font-semibold text-slate-800 dark:text-white truncate pr-2">{p.name}</span>
                <Badge tone="red">{p.currentStock} disp.</Badge>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="py-4 text-center text-xs italic text-slate-400">Todo el stock está al día.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
