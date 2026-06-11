import { createPortal } from 'react-dom';
import { formatMoney } from '../../utils/formatMoney';
import {
  REPORT_SECTION,
  REPORT_SECTION_LABELS,
  resolvePrintSections,
  printDocumentTitle,
} from '../../config/reportPrintSections';

const money = formatMoney;
const num = (v) => Number(v || 0);

const PrintTable = ({ headers, rows, emptyText = 'Sin datos' }) => (
  <table className="report-print-table">
    <thead>
      <tr>
        {headers.map((h) => (
          <th key={h}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={headers.length} className="report-print-empty">
            {emptyText}
          </td>
        </tr>
      ) : (
        rows.map((cells, idx) => (
          <tr key={idx}>
            {cells.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const goalTypeLabel = {
  DAILY: 'Diaria',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
  ANNUAL: 'Anual',
  CUSTOM: 'Personalizada',
};

const movementLabel = {
  ENTRY: 'Entrada',
  SALE: 'Salida',
  ADJUSTMENT: 'Ajuste',
  RETURN: 'Devolución',
  EXPIRED: 'Merma',
};

const paymentLabel = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  MIXED: 'Mixto',
};

const pct = (v) => `${num(v).toFixed(1)}%`;
const fmtChange = (v) => {
  const n = num(v);
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
};

const ReportPrintSheet = ({
  sections = 'ALL',
  periodFrom,
  periodTo,
  kpis,
  comparison,
  weeklySales = [],
  paymentMethods = [],
  productPerformance = [],
  inventoryMovements = [],
  inventoryTurnover = [],
  purchasesVsSales,
  salesByUser = [],
  customerRanking = [],
  stockAlerts = [],
  goals = [],
  entryUnits = 0,
  exitUnits = 0,
  adjustmentUnits = 0,
  entryCost = 0,
  exitCost = 0,
  netStockFlow = 0,
  lowRotationCount = 0,
}) => {
  const activeSections = resolvePrintSections(sections);
  const show = (key) => activeSections.includes(key);

  const issuedAt = new Date().toLocaleString('es-NI', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const docTitle = printDocumentTitle(activeSections);

  const sheet = (
    <div className="report-print-area hidden print:block" aria-hidden="true">
      <header className="report-print-header">
        <div>
          <p className="report-print-brand">SuperNova — Sistema de Supermercado</p>
          <h1>{docTitle}</h1>
          {activeSections.length === 1 && (
            <p className="report-print-subtitle">
              {REPORT_SECTION_LABELS[activeSections[0]]}
            </p>
          )}
          <p className="report-print-meta">
            Periodo: {periodFrom} al {periodTo} · Emitido: {issuedAt}
          </p>
          <p className="report-print-meta">Nicaragua · Moneda: Córdobas (C$)</p>
        </div>
      </header>

      {show(REPORT_SECTION.KPI_GENERAL) && (
        <section className="report-print-section">
          <h2>KPIs generales</h2>
          <p className="report-print-note">Ingresos, utilidad, margen y ticket promedio del periodo.</p>
          <div className="report-print-kpi-grid">
            <div className="report-print-kpi">
              <span>Ingresos totales</span>
              <strong>{money(kpis?.totalSales)}</strong>
              <small>{num(kpis?.salesCount).toLocaleString()} transacciones</small>
            </div>
            <div className="report-print-kpi">
              <span>Utilidad bruta</span>
              <strong>{money(kpis?.grossProfit)}</strong>
            </div>
            <div className="report-print-kpi">
              <span>Margen operativo</span>
              <strong>{pct(kpis?.grossMarginPercentage)}</strong>
            </div>
            <div className="report-print-kpi">
              <span>Ticket promedio</span>
              <strong>{money(kpis?.averageTicket)}</strong>
            </div>
          </div>
        </section>
      )}

      {show(REPORT_SECTION.KPI_COMPARATIVE) && (
        <section className="report-print-section">
          <h2>Comparativo de KPIs</h2>
          <p className="report-print-note">Variación contra el periodo anterior equivalente.</p>
          <PrintTable
            headers={['Indicador', 'Periodo actual', 'Variación']}
            rows={[
              ['Ingresos totales', money(comparison?.current?.totalSales ?? kpis?.totalSales), fmtChange(comparison?.totalSalesChangePercentage)],
              ['Utilidad bruta', money(comparison?.current?.grossProfit ?? kpis?.grossProfit), fmtChange(comparison?.grossProfitChangePercentage)],
              ['Ticket promedio', money(comparison?.current?.averageTicket ?? kpis?.averageTicket), fmtChange(comparison?.averageTicketChangePercentage)],
              ['Transacciones', num(comparison?.current?.salesCount ?? kpis?.salesCount).toLocaleString(), fmtChange(comparison?.salesCountChangePercentage)],
              ['Margen (p.p.)', pct(comparison?.current?.grossMarginPercentage ?? kpis?.grossMarginPercentage), `${num(comparison?.grossMarginPercentagePointChange) >= 0 ? '+' : ''}${num(comparison?.grossMarginPercentagePointChange).toFixed(1)} p.p.`],
            ]}
          />
        </section>
      )}

      {show(REPORT_SECTION.DAILY_SALES) && (
        <section className="report-print-section">
          <h2>Ventas diarias</h2>
          <p className="report-print-note">Flujo semanal de ventas (últimos 7 días).</p>
          <PrintTable
            headers={['Fecha', 'Monto vendido (C$)']}
            rows={weeklySales.map((d) => [
              d.date ? new Date(d.date).toLocaleDateString('es-NI', { weekday: 'short', day: '2-digit', month: 'short' }) : d.date,
              money(d.amount),
            ])}
            emptyText="Sin ventas registradas en la semana"
          />
          <p className="report-print-note">
            Total semanal: {money(weeklySales.reduce((s, d) => s + num(d.amount), 0))}
          </p>
        </section>
      )}

      {show(REPORT_SECTION.PAYMENT_METHODS) && (
        <section className="report-print-section">
          <h2>Métodos de pago</h2>
          <p className="report-print-note">Distribución por efectivo, tarjeta y transferencia.</p>
          <PrintTable
            headers={['Método', 'Transacciones', 'Monto', '% del total']}
            rows={paymentMethods.map((p) => [
              paymentLabel[p.paymentMethod] || p.paymentMethod,
              num(p.paymentCount).toLocaleString(),
              money(p.totalAmount),
              pct(p.percentageOfTotal),
            ])}
            emptyText="Sin datos de métodos de pago"
          />
        </section>
      )}

      {show(REPORT_SECTION.PRODUCT_PERFORMANCE) && (
        <section className="report-print-section">
          <h2>Productos rentables</h2>
          <p className="report-print-note">Utilidad, margen y unidades vendidas en el periodo.</p>
          <PrintTable
            headers={['#', 'Producto', 'Unidades', 'Utilidad', 'Margen']}
            rows={productPerformance.map((p, i) => [
              i + 1,
              p.productName,
              num(p.quantitySold).toLocaleString(),
              money(p.grossProfit),
              pct(p.grossMarginPercentage),
            ])}
            emptyText="Sin ventas en el periodo"
          />
        </section>
      )}

      {show(REPORT_SECTION.INVENTORY_MOVEMENTS) && (
        <section className="report-print-section">
          <h2>Entradas y salidas</h2>
          <p className="report-print-note">
            Entradas: {entryUnits.toLocaleString()} u. ({money(entryCost)}) · Salidas: {exitUnits.toLocaleString()} u. ({money(exitCost)}) ·
            Ajustes: {adjustmentUnits.toLocaleString()} u. · Flujo neto: {netStockFlow >= 0 ? '+' : ''}{netStockFlow.toLocaleString()} u.
          </p>
          <PrintTable
            headers={['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Costo total']}
            rows={inventoryMovements.map((m) => [
              m.createdAt ? new Date(m.createdAt).toLocaleDateString('es-NI') : '—',
              m.productName,
              movementLabel[m.movementType] || m.movementType,
              num(m.quantity).toLocaleString(),
              money(m.totalCost),
            ])}
            emptyText="Sin movimientos de inventario"
          />
        </section>
      )}

      {show(REPORT_SECTION.INVENTORY_TURNOVER) && (
        <section className="report-print-section">
          <h2>Rotación de inventario</h2>
          <p className="report-print-note">
            Días de inventario y productos con baja rotación ({lowRotationCount} detectados).
          </p>
          <PrintTable
            headers={['Producto', 'Vendido', 'Stock', 'Venta/día', 'Días inv.', 'Baja rot.']}
            rows={inventoryTurnover.map((t) => [
              t.productName,
              num(t.quantitySold).toLocaleString(),
              num(t.currentStock).toLocaleString(),
              num(t.averageDailySold).toFixed(2),
              num(t.daysOfInventory).toFixed(0),
              t.lowRotation ? 'Sí' : 'No',
            ])}
            emptyText="Sin datos de rotación"
          />
        </section>
      )}

      {show(REPORT_SECTION.PURCHASES_VS_SALES) && (
        <section className="report-print-section">
          <h2>Compras vs ventas</h2>
          <p className="report-print-note">Relación entre abastecimiento y salida comercial.</p>
          <div className="report-print-kpi-grid report-print-kpi-grid--3">
            <div className="report-print-kpi">
              <span>Ventas</span>
              <strong>{money(purchasesVsSales?.totalSales)}</strong>
            </div>
            <div className="report-print-kpi">
              <span>Compras</span>
              <strong>{money(purchasesVsSales?.totalPurchases)}</strong>
            </div>
            <div className="report-print-kpi">
              <span>Diferencia</span>
              <strong>{money(purchasesVsSales?.netDifference)}</strong>
            </div>
          </div>
          <p className="report-print-note">
            Las compras representan {pct(purchasesVsSales?.purchasesToSalesPercentage)} de las ventas del periodo.
          </p>
        </section>
      )}

      {show(REPORT_SECTION.SALES_BY_USER) && (
        <section className="report-print-section">
          <h2>Ventas por cajero</h2>
          <p className="report-print-note">Ranking operativo por usuario.</p>
          <PrintTable
            headers={['#', 'Cajero', 'Ventas', 'Transacciones']}
            rows={salesByUser.map((u, i) => [
              i + 1,
              u.userFullName || '—',
              money(u.totalSales),
              num(u.salesCount).toLocaleString(),
            ])}
            emptyText="Sin ventas por usuario"
          />
        </section>
      )}

      {show(REPORT_SECTION.CUSTOMER_RANKING) && (
        <section className="report-print-section">
          <h2>Ranking de clientes</h2>
          <p className="report-print-note">Clientes por visitas y monto comprado.</p>
          <PrintTable
            headers={['#', 'Cliente', 'Total comprado', 'Visitas']}
            rows={customerRanking.map((c, i) => [
              i + 1,
              c.customerFullName || 'Consumidor final',
              money(c.totalSpent),
              num(c.visits).toLocaleString(),
            ])}
            emptyText="Sin clientes registrados en el periodo"
          />
        </section>
      )}

      {show(REPORT_SECTION.STOCK_ALERTS) && (
        <section className="report-print-section">
          <h2>Stock crítico</h2>
          <p className="report-print-note">Productos bajo stock mínimo.</p>
          <PrintTable
            headers={['Código', 'Producto', 'Categoría', 'Existencia', 'Mínimo']}
            rows={stockAlerts.map((a) => [
              a.barcode || '—',
              a.productName || '—',
              a.categoryName || '—',
              num(a.currentStock).toLocaleString(),
              num(a.minimumStock).toLocaleString(),
            ])}
            emptyText="Sin alertas de stock"
          />
        </section>
      )}

      {show(REPORT_SECTION.GOALS) && (
        <section className="report-print-section">
          <h2>Metas comerciales</h2>
          <PrintTable
            headers={['Meta', 'Tipo', 'Objetivo', 'Avance', 'Progreso', 'Estado', 'Cierre']}
            rows={goals.map((g) => [
              g.name,
              goalTypeLabel[g.goalType] || g.goalType,
              money(g.targetAmount),
              money(g.actualAmount),
              `${Math.min(num(g.progressPercent), 100).toFixed(1)}%`,
              g.status === 'COMPLETED' ? 'Completada' : g.status === 'FAILED' ? 'Incumplida' : 'Activa',
              g.endDate ? new Date(g.endDate).toLocaleDateString('es-NI') : '—',
            ])}
            emptyText="No hay metas comerciales registradas"
          />
        </section>
      )}

      <footer className="report-print-footer">
        <p>Documento generado por SuperNova · Uso interno operativo</p>
        {activeSections.length > 1 && (
          <p>Incluye {activeSections.length} secciones: {activeSections.map((k) => REPORT_SECTION_LABELS[k]).join(' · ')}</p>
        )}
      </footer>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(sheet, document.body);
};

export default ReportPrintSheet;
