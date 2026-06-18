import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';
import SaleService from '../services/SaleService';
import DashboardService from '../services/DashboardService';
import ReportService from '../services/ReportService';

const number = (value) => Number(value || 0);

export const useReportsData = (firstDayOfYearStr, todayStr) => {
  const [sales, setSales] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [productPerformance, setProductPerformance] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [inventoryMovements, setInventoryMovements] = useState([]);
  const [inventoryTurnover, setInventoryTurnover] = useState([]);
  const [purchasesVsSales, setPurchasesVsSales] = useState(null);
  const [salesByUser, setSalesByUser] = useState([]);
  const [customerRanking, setCustomerRanking] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [salesByBrand, setSalesByBrand] = useState([]);
  const [purchasesByBrand, setPurchasesByBrand] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportsData = useCallback(async () => {
    try {
      setLoading(true);
      const previousTo = new Date(firstDayOfYearStr);
      previousTo.setDate(previousTo.getDate() - 1);
      const previousFrom = new Date(previousTo);
      previousFrom.setMonth(previousFrom.getMonth() - 1);
      const previousFromStr = previousFrom.toISOString().split('T')[0];
      const previousToStr = previousTo.toISOString().split('T')[0];

      const [
        weekly,
        status,
        salesData,
        kpiData,
        comparisonData,
        performanceData,
        paymentData,
        movementData,
        turnoverData,
        purchasesSalesData,
        salesByUserData,
        customerData,
        stockAlertData,
        salesBrandData,
        purchasesBrandData,
      ] = await Promise.all([
        DashboardService.getWeeklySales(),
        DashboardService.getInventoryStatus(),
        SaleService.getAll(),
        ReportService.getKpis(firstDayOfYearStr, todayStr),
        ReportService.getComparativeKpis(firstDayOfYearStr, todayStr, previousFromStr, previousToStr),
        ReportService.getProductPerformance(firstDayOfYearStr, todayStr),
        ReportService.getSalesByPaymentMethod(firstDayOfYearStr, todayStr),
        ReportService.getInventoryMovements(firstDayOfYearStr, todayStr),
        ReportService.getInventoryTurnover(firstDayOfYearStr, todayStr),
        ReportService.getPurchasesVsSales(firstDayOfYearStr, todayStr),
        ReportService.getSalesByUser(firstDayOfYearStr, todayStr),
        ReportService.getCustomerRanking(firstDayOfYearStr, todayStr),
        ReportService.getStockAlerts(),
        ReportService.getSalesByBrand(firstDayOfYearStr, todayStr),
        ReportService.getPurchasesByBrand(firstDayOfYearStr, todayStr),
      ]);

      setWeeklySales(weekly || []);
      setInventoryStatus(status);
      setSales(salesData.content || salesData || []);
      setKpis(kpiData);
      setComparison(comparisonData);
      setProductPerformance(performanceData || []);
      setPaymentMethods(paymentData || []);
      setInventoryMovements(movementData || []);
      setInventoryTurnover(turnoverData || []);
      setPurchasesVsSales(purchasesSalesData || null);
      setSalesByUser(salesByUserData || []);
      setCustomerRanking(customerData || []);
      setStockAlerts(stockAlertData || []);
      setSalesByBrand(salesBrandData || []);
      setPurchasesByBrand(purchasesBrandData || []);
    } catch (error) {
      console.error('Error loading reports data:', error);
      Swal.fire('Error', 'No se pudieron cargar las estadísticas reales del servidor.', 'error');
    } finally {
      setLoading(false);
    }
  }, [firstDayOfYearStr, todayStr]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const handleDownloadExcel = async (endpoint, filename) => {
    try {
      Swal.fire({
        title: 'Generando reporte...',
        html: 'Por favor, espera mientras procesamos tu archivo Excel.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await api.get(endpoint, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: '¡Descarga Completa!',
        text: `El reporte se guardó correctamente como ${filename}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Download error:', error);
      Swal.fire('Error', 'No se pudo generar ni descargar el archivo Excel. Verifica tus privilegios.', 'error');
    }
  };

  
  const totalWeeklySales = weeklySales.reduce((acc, s) => acc + s.amount, 0);

  const barData = {
    labels: weeklySales.map((s) => s.date),
    datasets: [
      {
        label: 'Ventas Semanales ($)',
        data: weeklySales.map((s) => s.amount),
        backgroundColor: '#4f46e5',
        borderRadius: 8,
      },
    ],
  };

  const pieData = {
    labels: ['Valor en Inventario ($)', 'Ventas Totales ($)'],
    datasets: [
      {
        data: [inventoryStatus?.totalInventoryValue || 0, totalWeeklySales || 0],
        backgroundColor: ['#10b981', '#4f46e5'],
        borderWidth: 0,
      },
    ],
  };

  const paymentPieData = {
    labels: paymentMethods.map((item) => item.paymentMethod),
    datasets: [
      {
        data: paymentMethods.map((item) => item.totalAmount),
        backgroundColor: ['#10b981', '#4f46e5', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const entryMovements = inventoryMovements.filter((item) => ['ENTRY', 'RETURN'].includes(item.movementType));
  const exitMovements = inventoryMovements.filter((item) => ['SALE', 'EXPIRED'].includes(item.movementType));
  const adjustmentMovements = inventoryMovements.filter((item) => item.movementType === 'ADJUSTMENT');

  const entryUnits = entryMovements.reduce((sum, item) => sum + number(item.quantity), 0);
  const exitUnits = exitMovements.reduce((sum, item) => sum + number(item.quantity), 0);
  const adjustmentUnits = adjustmentMovements.reduce((sum, item) => sum + number(item.quantity), 0);
  const entryCost = entryMovements.reduce((sum, item) => sum + number(item.totalCost), 0);
  const exitCost = exitMovements.reduce((sum, item) => sum + number(item.totalCost), 0);
  const netStockFlow = entryUnits - exitUnits;
  const lowRotationCount = inventoryTurnover.filter((item) => item.lowRotation).length;

  const bestCashier = salesByUser.reduce(
    (best, item) => (number(item.totalSales) > number(best?.totalSales) ? item : best),
    null
  );
  const bestCustomer = customerRanking.reduce(
    (best, item) => (number(item.totalSpent) > number(best?.totalSpent) ? item : best),
    null
  );

  return {
    sales,
    weeklySales,
    inventoryStatus,
    kpis,
    comparison,
    productPerformance,
    paymentMethods,
    inventoryMovements,
    inventoryTurnover,
    purchasesVsSales,
    salesByUser,
    customerRanking,
    stockAlerts,
    salesByBrand,
    purchasesByBrand,
    loading,
    totalWeeklySales,
    barData,
    pieData,
    paymentPieData,
    entryUnits,
    exitUnits,
    adjustmentUnits,
    adjustmentMovements,
    entryCost,
    exitCost,
    netStockFlow,
    lowRotationCount,
    bestCashier,
    bestCustomer,
    handleDownloadExcel,
    reload: fetchReportsData,
  };
};

export default useReportsData;
