export const parseClosureAlerts = (alertsJson, fallback = []) => {
  if (!alertsJson) return fallback;
  try {
    const parsed = JSON.parse(alertsJson);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};


export const buildClosurePrintSnapshot = ({
  date,
  officialClosure,
  summary,
  cashReport,
  kpis,
  paymentMethods,
  alerts,
  closureNotes,
  stockAlertsCount = 0,
}) => {
  if (officialClosure) {
    return {
      closureDate: officialClosure.closureDate || date,
      isOfficial: true,
      closedAt: officialClosure.closedAt,
      closedByName: officialClosure.closedBy?.fullName,
      totalSales: officialClosure.totalSales,
      salesCount: officialClosure.salesCount,
      grossProfit: officialClosure.grossProfit,
      grossMarginPercentage: officialClosure.grossMarginPercentage,
      totalCashSales: officialClosure.totalCashSales,
      totalCardSales: officialClosure.totalCardSales,
      totalTransferSales: officialClosure.totalTransferSales,
      totalCashDifference: officialClosure.totalCashDifference,
      totalCardDifference: officialClosure.totalCardDifference,
      totalTransferDifference: officialClosure.totalTransferDifference,
      totalDifference: officialClosure.totalDifference,
      openSessionsCount: officialClosure.openSessionsCount,
      closedSessionsCount: officialClosure.closedSessionsCount,
      receivedPurchasesAmount: officialClosure.receivedPurchasesAmount,
      pendingPurchasesCount: officialClosure.pendingPurchasesCount,
      partialPurchasesCount: officialClosure.partialPurchasesCount,
      pendingSettlementsCount: officialClosure.pendingSettlementsCount,
      pendingSettlementsAmount: officialClosure.pendingSettlementsAmount,
      stockAlertsCount: officialClosure.stockAlertsCount,
      alerts: parseClosureAlerts(officialClosure.alertsJson, []),
      notes: officialClosure.notes || '',
      paymentMethods: paymentMethods || [],
    };
  }

  return {
    closureDate: date,
    isOfficial: false,
    closedAt: null,
    closedByName: null,
    totalSales: summary?.salesTotal,
    salesCount: kpis?.salesCount,
    grossProfit: summary?.grossProfit,
    grossMarginPercentage: summary?.margin,
    totalCashSales: cashReport?.totalCashSales,
    totalCardSales: cashReport?.totalCardSales,
    totalTransferSales: cashReport?.totalTransferSales,
    totalCashDifference: cashReport?.totalCashDifference,
    totalCardDifference: cashReport?.totalCardDifference,
    totalTransferDifference: cashReport?.totalTransferDifference,
    totalDifference: summary?.totalDifference,
    openSessionsCount: cashReport?.openSessionsCount,
    closedSessionsCount: cashReport?.closedSessionsCount,
    receivedPurchasesAmount: summary?.receivedPurchaseAmount,
    pendingPurchasesCount: summary?.pendingPurchases?.length,
    partialPurchasesCount: summary?.partialPurchases?.length,
    pendingSettlementsCount: summary?.pendingSettlements?.length,
    pendingSettlementsAmount: summary?.pendingSettlementNet,
    stockAlertsCount: stockAlertsCount,
    alerts: alerts || [],
    notes: closureNotes || '',
    paymentMethods: paymentMethods || [],
  };
};

export const closureToPrintSnapshot = (closure, paymentMethods = []) => ({
  closureDate: closure.closureDate,
  isOfficial: true,
  closedAt: closure.closedAt,
  closedByName: closure.closedBy?.fullName,
  totalSales: closure.totalSales,
  salesCount: closure.salesCount,
  grossProfit: closure.grossProfit,
  grossMarginPercentage: closure.grossMarginPercentage,
  totalCashSales: closure.totalCashSales,
  totalCardSales: closure.totalCardSales,
  totalTransferSales: closure.totalTransferSales,
  totalCashDifference: closure.totalCashDifference,
  totalCardDifference: closure.totalCardDifference,
  totalTransferDifference: closure.totalTransferDifference,
  totalDifference: closure.totalDifference,
  openSessionsCount: closure.openSessionsCount,
  closedSessionsCount: closure.closedSessionsCount,
  receivedPurchasesAmount: closure.receivedPurchasesAmount,
  pendingPurchasesCount: closure.pendingPurchasesCount,
  partialPurchasesCount: closure.partialPurchasesCount,
  pendingSettlementsCount: closure.pendingSettlementsCount,
  pendingSettlementsAmount: closure.pendingSettlementsAmount,
  stockAlertsCount: closure.stockAlertsCount,
  alerts: parseClosureAlerts(closure.alertsJson, []),
  notes: closure.notes || '',
  paymentMethods,
});
