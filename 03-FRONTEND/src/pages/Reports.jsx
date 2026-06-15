import React, { useState, useCallback } from 'react';
import { BarChart, Printer, Download, Loader2, Target, Plus, Boxes, ShoppingBag, AlertCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import ReportMetricCard from '../components/reports/ReportMetricCard';
import ReportPrintSheet from '../components/reports/ReportPrintSheet';
import { printReportDeferred } from '../utils/printReport';
import { REPORT_SECTION } from '../config/reportPrintSections';
import { formatMoney } from '../utils/formatMoney';


import { useReportsData } from '../hooks/useReportsData';
import { useCommercialGoals } from '../hooks/useCommercialGoals';


import AvailableReports from '../components/reports/AvailableReports';
import InventoryFlowAnalysis from '../components/reports/InventoryFlowAnalysis';
import PurchasesVsSalesAnalysis from '../components/reports/PurchasesVsSalesAnalysis';
import TransactionAuditTable from '../components/reports/TransactionAuditTable';
import ReportsChartsSection from '../components/reports/ReportsChartsSection';
import CommercialGoalsTab from '../components/reports/CommercialGoalsTab';

const money = formatMoney;
const movementLabel = {
  ENTRY: 'Entrada',
  SALE: 'Salida por venta',
  ADJUSTMENT: 'Ajuste',
  RETURN: 'Devolución',
  EXPIRED: 'Merma / vencido',
};

const getReportCatalog = (reportsData) => [
  { key: REPORT_SECTION.KPI_GENERAL, name: 'KPIs generales', description: 'Ingresos, utilidad, margen y ticket promedio.', count: reportsData.kpis ? 1 : 0, icon: Target },
  { key: REPORT_SECTION.KPI_COMPARATIVE, name: 'Comparativo de KPIs', description: 'Variación contra el periodo anterior.', count: reportsData.comparison ? 1 : 0, icon: BarChart },
  { key: REPORT_SECTION.DAILY_SALES, name: 'Ventas diarias', description: 'Flujo semanal de ventas.', count: reportsData.weeklySales.length, icon: BarChart },
  { key: REPORT_SECTION.PAYMENT_METHODS, name: 'Métodos de pago', description: 'Distribución por efectivo, tarjeta y transferencia.', count: reportsData.paymentMethods.length, icon: Target },
  { key: REPORT_SECTION.PRODUCT_PERFORMANCE, name: 'Productos rentables', description: 'Utilidad, margen y unidades vendidas.', count: reportsData.productPerformance.length, icon: Target },
  { key: REPORT_SECTION.INVENTORY_MOVEMENTS, name: 'Entradas y salidas', description: 'Movimientos de inventario por tipo.', count: reportsData.inventoryMovements.length, icon: Boxes },
  { key: REPORT_SECTION.INVENTORY_TURNOVER, name: 'Rotación de inventario', description: 'Días de inventario y baja rotación.', count: reportsData.inventoryTurnover.length, icon: Target },
  { key: REPORT_SECTION.PURCHASES_VS_SALES, name: 'Compras vs ventas', description: 'Relación entre abastecimiento y salida comercial.', count: reportsData.purchasesVsSales ? 1 : 0, icon: ShoppingBag },
  { key: REPORT_SECTION.SALES_BY_USER, name: 'Ventas por cajero', description: 'Ranking operativo por usuario.', count: reportsData.salesByUser.length, icon: Target },
  { key: REPORT_SECTION.CUSTOMER_RANKING, name: 'Ranking de clientes', description: 'Clientes por visitas y monto comprado.', count: reportsData.customerRanking.length, icon: Target },
  { key: REPORT_SECTION.STOCK_ALERTS, name: 'Stock crítico', description: 'Productos bajo mínimo.', count: reportsData.stockAlerts.length, icon: AlertCircle },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('METRICS'); 
  const [printSections, setPrintSections] = useState('ALL');

  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfYearStr = `${new Date().getFullYear()}-01-01`;

  
  const reportsData = useReportsData(firstDayOfYearStr, todayStr);
  const goalsData = useCommercialGoals(activeTab);

  const handlePrintReport = useCallback((sections) => {
    setPrintSections(sections);
    printReportDeferred();
  }, []);

  const reportCatalog = getReportCatalog(reportsData);

  if (reportsData.loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
        <Loader2 className="animate-spin text-[var(--app-primary)]" size={40} />
        <p className="font-medium">Cargando estadísticas e informes...</p>
      </div>
    );
  }

  const exportActions =
    activeTab === 'METRICS' ? (
      <>
        <Button variant="secondary" size="sm" icon={Printer} onClick={() => handlePrintReport('ALL')}>
          Informe completo
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={() =>
            reportsData.handleDownloadExcel(
              `/reports/inventory-kardex/excel?from=${firstDayOfYearStr}&to=${todayStr}`,
              'kardex_inventario.xlsx'
            )
          }
        >
          Kardex
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={() => reportsData.handleDownloadExcel('/reports/stock-alerts/excel', 'alertas_stock_critico.xlsx')}
        >
          Stock crítico
        </Button>
        <Button
          size="sm"
          icon={Download}
          onClick={() =>
            reportsData.handleDownloadExcel(
              `/reports/sales-by-user/excel?from=${firstDayOfYearStr}&to=${todayStr}`,
              'ventas_por_cajero.xlsx'
            )
          }
        >
          Ventas cajeros
        </Button>
      </>
    ) : (
      <>
        <Button variant="secondary" size="sm" icon={Printer} onClick={() => handlePrintReport('GOALS')}>
          Imprimir metas
        </Button>
        <Button size="sm" icon={Plus} onClick={() => goalsData.setShowGoalForm(!goalsData.showGoalForm)}>
          {goalsData.showGoalForm ? 'Cerrar' : 'Nueva meta'}
        </Button>
      </>
    );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Inteligencia de Negocios"
        title="Análisis Operativo"
        description="Seguimiento de rendimiento comercial, métricas financieras y cumplimiento de metas."
        actions={exportActions}
      />

      
      <div className="ui-tabs-scroll flex gap-1 border-b border-[var(--app-border)]">
        <button
          type="button"
          onClick={() => setActiveTab('METRICS')}
          className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap px-6 py-3.5 border-b-2 text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'METRICS'
              ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]/30'
              : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          <BarChart size={14} strokeWidth={2.5} /> Reportes Dinámicos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('GOALS')}
          className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap px-6 py-3.5 border-b-2 text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'GOALS'
              ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]/30'
              : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
          }`}
        >
          <Target size={14} strokeWidth={2.5} /> Metas Comerciales
        </button>
      </div>

      {activeTab === 'METRICS' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportMetricCard
              title="Ingresos Totales"
              value={money(reportsData.kpis?.totalSales ?? reportsData.totalWeeklySales)}
              change={Number(reportsData.comparison?.totalSalesChangePercentage || 0).toFixed(1)}
              isPositive={Number(reportsData.comparison?.totalSalesChangePercentage || 0) >= 0}
            />
            <ReportMetricCard
              title="Utilidad Bruta"
              value={money(reportsData.kpis?.grossProfit)}
              change={Number(reportsData.comparison?.grossProfitChangePercentage || 0).toFixed(1)}
              isPositive={Number(reportsData.comparison?.grossProfitChangePercentage || 0) >= 0}
            />
            <ReportMetricCard title="Margen Operativo" value={`${Number(reportsData.kpis?.grossMarginPercentage || 0).toFixed(1)}%`} />
            <ReportMetricCard
              title="Ticket Promedio"
              value={money(reportsData.kpis?.averageTicket)}
              change={Number(reportsData.comparison?.averageTicketChangePercentage || 0).toFixed(1)}
              isPositive={Number(reportsData.comparison?.averageTicketChangePercentage || 0) >= 0}
            />
          </div>

          <AvailableReports reportCatalog={reportCatalog} onPrintReport={handlePrintReport} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <InventoryFlowAnalysis {...reportsData} movementLabel={movementLabel} money={money} />
            <PurchasesVsSalesAnalysis {...reportsData} money={money} />
          </div>

          <ReportsChartsSection {...reportsData} money={money} />

          <TransactionAuditTable sales={reportsData.sales} money={money} />
        </div>
      ) : (
        <CommercialGoalsTab {...goalsData} money={money} />
      )}

      <ReportPrintSheet
        sections={printSections}
        periodFrom={firstDayOfYearStr}
        periodTo={todayStr}
        {...reportsData}
        goals={goalsData.goals}
      />
    </div>
  );
};

export default Reports;
