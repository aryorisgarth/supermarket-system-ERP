import { useEffect, useMemo, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import Card from '../components/ui/Card';
import DailyClosurePrintSheet from '../components/dailyclose/DailyClosurePrintSheet';
import CashRegisterService from '../services/CashRegisterService';
import ReportService from '../services/ReportService';
import PurchaseOrderService from '../services/PurchaseOrderService';
import BillingService from '../services/BillingService';
import DailyClosureService from '../services/DailyClosureService';
import { formatMoney } from '../utils/formatMoney';
import AuthService from '../services/AuthService';
import { getDefaultPathForRole } from '../utils/authRoutes';
import { printReportDeferred } from '../utils/printReport';
import { buildClosurePrintSnapshot, closureToPrintSnapshot } from '../utils/dailyClosurePrint';
import {
  canViewCashRegisterReport,
  canViewFinance,
  canViewPurchases,
  canViewReports,
  canViewDailyClose,
} from '../utils/accessControl';

import DailyCloseHeader from '../components/dailyclose/DailyCloseHeader';
import DailyCloseKpis from '../components/dailyclose/DailyCloseKpis';
import DailyCloseSummaryGrid from '../components/dailyclose/DailyCloseSummaryGrid';
import DailyCloseValidationGrid from '../components/dailyclose/DailyCloseValidationGrid';
import DailyCloseDetailModal from '../components/dailyclose/DailyCloseDetailModal';

const money = formatMoney;

const todayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sameDay = (value, date) => {
  if (!value) return false;
  return String(value).slice(0, 10) === date;
};

const DailyClose = () => {
  const roleName = AuthService.getCurrentUser()?.role?.name;

  if (!canViewDailyClose()) {
    return <Navigate to={getDefaultPathForRole(roleName)} replace />;
  }

  const [date, setDate] = useState(todayInputValue());
  const [loading, setLoading] = useState(true);
  const [cashReport, setCashReport] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [officialClosure, setOfficialClosure] = useState(null);
  const [closureHistory, setClosureHistory] = useState([]);
  const [closing, setClosing] = useState(false);
  const [closureNotes, setClosureNotes] = useState('');
  const [printSnapshot, setPrintSnapshot] = useState(null);
  const [viewClosure, setViewClosure] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        cashResult,
        kpiResult,
        paymentResult,
        purchaseResult,
        transactionResult,
        stockResult,
        savedClosureResult,
        historyResult,
      ] = await Promise.allSettled([
        canViewCashRegisterReport()
          ? CashRegisterService.getReport({ from: date, to: date })
          : Promise.resolve(null),
        canViewReports()
          ? ReportService.getKpis(date, date)
          : Promise.resolve(null),
        canViewReports()
          ? ReportService.getSalesByPaymentMethod(date, date)
          : Promise.resolve([]),
        canViewPurchases()
          ? PurchaseOrderService.getAll()
          : Promise.resolve([]),
        canViewFinance()
          ? BillingService.getPaymentTransactions()
          : Promise.resolve([]),
        canViewReports()
          ? ReportService.getStockAlerts()
          : Promise.resolve([]),
        DailyClosureService.getByDate(date),
        DailyClosureService.getAll(),
      ]);

      const unwrap = (result, fallback = null) =>
        result.status === 'fulfilled' ? result.value : fallback;

      setCashReport(unwrap(cashResult));
      setKpis(unwrap(kpiResult));
      setPaymentMethods(unwrap(paymentResult, []));
      setPurchases(unwrap(purchaseResult, []));
      setTransactions(unwrap(transactionResult, []));
      setStockAlerts(unwrap(stockResult, []));
      setOfficialClosure(unwrap(savedClosureResult));
      setClosureHistory(unwrap(historyResult, []));
      setClosureNotes(unwrap(savedClosureResult)?.notes || '');

      const failed = [
        cashResult,
        kpiResult,
        paymentResult,
        purchaseResult,
        transactionResult,
        stockResult,
        savedClosureResult,
        historyResult,
      ].filter((result) => result.status === 'rejected');

      if (failed.length > 0) {
        console.warn('Cierre del día: algunos datos no pudieron cargarse.', failed);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar el cierre operativo del día.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const summary = useMemo(() => {
    const receivedPurchases = purchases.filter((order) => order.status === 'RECEIVED' && sameDay(order.receivedAt, date));
    const partialPurchases = purchases.filter((order) => order.status === 'PARTIALLY_RECEIVED');
    const pendingPurchases = purchases.filter((order) => ['DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(order.status));
    const todayTransactions = transactions.filter((tx) => sameDay(tx.createdAt, date));
    const pendingSettlements = todayTransactions.filter((tx) => tx.settlementStatus === 'PENDING');
    const settledToday = transactions.filter((tx) => tx.settlementStatus === 'SETTLED' && sameDay(tx.createdAt, date));
    const pendingSettlementNet = pendingSettlements.reduce((sum, tx) => sum + Number(tx.netAmount || tx.amount || 0), 0);
    const receivedPurchaseAmount = receivedPurchases.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);
    const totalDifference =
      Number(cashReport?.totalCashDifference || 0) +
      Number(cashReport?.totalCardDifference || 0) +
      Number(cashReport?.totalTransferDifference || 0);
    const salesTotal = Number(kpis?.totalSales || cashReport?.totalSalesVolume || 0);
    const grossProfit = Number(kpis?.grossProfit || 0);
    const margin = salesTotal > 0 ? (grossProfit / salesTotal) * 100 : 0;

    return {
      receivedPurchases,
      partialPurchases,
      pendingPurchases,
      pendingSettlements,
      settledToday,
      pendingSettlementNet,
      receivedPurchaseAmount,
      totalDifference,
      salesTotal,
      grossProfit,
      margin,
    };
  }, [cashReport, date, kpis, purchases, transactions]);

  const alerts = useMemo(() => {
    const items = [];
    if (Number(cashReport?.openSessionsCount || 0) > 0) {
      items.push({ tone: 'amber', title: 'Cajas abiertas', text: `${cashReport.openSessionsCount} caja(s) siguen abiertas. No conviene cerrar el día administrativo todavía.` });
    }
    if (Math.abs(summary.totalDifference) > 0.009) {
      items.push({ tone: 'red', title: 'Diferencia de caja', text: `Diferencia consolidada detectada: ${money(summary.totalDifference)}.` });
    }
    if (summary.pendingSettlements.length > 0) {
      items.push({ tone: 'amber', title: 'Liquidaciones pendientes', text: `${summary.pendingSettlements.length} transacción(es) electrónicas pendientes por ${money(summary.pendingSettlementNet)}.` });
    }
    if (summary.partialPurchases.length > 0) {
      items.push({ tone: 'amber', title: 'Compras parciales', text: `${summary.partialPurchases.length} orden(es) con recepción parcial requieren seguimiento.` });
    }
    if (stockAlerts.length > 0) {
      items.push({ tone: 'red', title: 'Stock crítico', text: `${stockAlerts.length} producto(s) están bajo mínimo.` });
    }
    if (items.length === 0) {
      items.push({ tone: 'green', title: 'Cierre limpio', text: 'No se detectaron alertas críticas para el día seleccionado.' });
    }
    return items;
  }, [cashReport, stockAlerts.length, summary]);

  const getCurrentPrintSnapshot = useCallback(() => buildClosurePrintSnapshot({
    date,
    officialClosure,
    summary,
    cashReport,
    kpis,
    paymentMethods,
    alerts,
    closureNotes,
    stockAlertsCount: stockAlerts.length,
  }), [date, officialClosure, summary, cashReport, kpis, paymentMethods, alerts, closureNotes, stockAlerts.length]);

  const printSnapshotData = useCallback((snapshot) => {
    setPrintSnapshot(snapshot);
    printReportDeferred(() => setPrintSnapshot(null));
  }, []);

  const printReport = () => {
    if (loading) {
      Swal.fire('Espere', 'Los datos del cierre aún se están cargando.', 'info');
      return;
    }
    printSnapshotData(getCurrentPrintSnapshot());
  };

  const printHistoryClosure = (closure) => {
    printSnapshotData(closureToPrintSnapshot(closure));
  };

  const openHistoryClosure = (closure) => {
    setViewClosure(closure);
    setDate(closure.closureDate);
  };

  const buildClosurePayload = () => ({
    closureDate: date,
    totalSales: summary.salesTotal,
    salesCount: Number(kpis?.salesCount || 0),
    grossProfit: summary.grossProfit,
    grossMarginPercentage: summary.margin,
    totalCashSales: Number(cashReport?.totalCashSales || 0),
    totalCardSales: Number(cashReport?.totalCardSales || 0),
    totalTransferSales: Number(cashReport?.totalTransferSales || 0),
    totalCashDifference: Number(cashReport?.totalCashDifference || 0),
    totalCardDifference: Number(cashReport?.totalCardDifference || 0),
    totalTransferDifference: Number(cashReport?.totalTransferDifference || 0),
    totalDifference: summary.totalDifference,
    openSessionsCount: Number(cashReport?.openSessionsCount || 0),
    closedSessionsCount: Number(cashReport?.closedSessionsCount || 0),
    receivedPurchasesAmount: summary.receivedPurchaseAmount,
    pendingPurchasesCount: summary.pendingPurchases.length,
    partialPurchasesCount: summary.partialPurchases.length,
    pendingSettlementsCount: summary.pendingSettlements.length,
    pendingSettlementsAmount: summary.pendingSettlementNet,
    stockAlertsCount: stockAlerts.length,
    alertsJson: JSON.stringify(alerts),
    notes: closureNotes,
  });

  const closeOfficially = async () => {
    if (officialClosure) {
      Swal.fire('Ya cerrado', 'Este día ya tiene un cierre oficial guardado.', 'info');
      return;
    }
    if (Number(cashReport?.openSessionsCount || 0) > 0) {
      Swal.fire('Cajas abiertas', 'No se puede cerrar oficialmente mientras existan cajas abiertas.', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Cerrar día oficialmente',
      text: `Se guardará un snapshot administrativo definitivo para ${date}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Guardar cierre',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
    });
    if (!result.isConfirmed) return;

    try {
      setClosing(true);
      const saved = await DailyClosureService.create(buildClosurePayload());
      setOfficialClosure(saved);
      const historyData = await DailyClosureService.getAll();
      setClosureHistory(historyData || []);
      Swal.fire({ icon: 'success', title: 'Día cerrado oficialmente', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', error?.message || 'No se pudo guardar el cierre oficial.', 'error');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 no-print">
      <DailyCloseHeader 
        date={date} 
        officialClosure={officialClosure} 
        closing={closing} 
        onRefresh={loadData} 
        onCloseOfficially={closeOfficially} 
        onPrint={printReport} 
      />

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="ui-field max-w-xs">
            <span className="ui-label">Fecha de cierre</span>
            <input type="date" className="ui-input" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <div className="flex-1 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-4 py-3 text-xs font-bold text-[var(--app-text-muted)]">
            {officialClosure ? (
              <span>
                Cierre oficial guardado el {new Date(officialClosure.closedAt).toLocaleString()} por {officialClosure.closedBy?.fullName || 'usuario'}.
              </span>
            ) : (
              <span>Este cierre aún es preliminar. Revisa alertas, agrega notas y guarda el cierre oficial.</span>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
          <Loader2 className="animate-spin text-[var(--app-primary)]" size={42} />
          <p className="text-xs font-black uppercase tracking-widest">Consolidando cierre diario...</p>
        </div>
      ) : (
        <>
          <DailyCloseKpis 
            summary={summary} 
            kpis={kpis} 
            cashReport={cashReport} 
            formatMoney={money} 
          />

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <DailyCloseSummaryGrid 
              summary={summary} 
              cashReport={cashReport} 
              paymentMethods={paymentMethods} 
              stockAlertsCount={stockAlerts.length} 
              formatMoney={money} 
            />

            <DailyCloseValidationGrid 
              alerts={alerts} 
              officialClosure={officialClosure} 
              closing={closing} 
              closureNotes={closureNotes} 
              setClosureNotes={setClosureNotes} 
              onCloseOfficially={closeOfficially} 
              closureHistory={closureHistory} 
              onOpenHistory={openHistoryClosure} 
              onPrintHistory={printHistoryClosure} 
              formatMoney={money} 
              date={date} 
            />
          </div>
        </>
      )}

      <DailyCloseDetailModal 
        isOpen={Boolean(viewClosure)} 
        onClose={() => setViewClosure(null)} 
        closure={viewClosure} 
        onPrintHistory={printHistoryClosure} 
        formatMoney={money} 
      />

      <DailyClosurePrintSheet snapshot={printSnapshot} />
    </div>
  );
};

export default DailyClose;
