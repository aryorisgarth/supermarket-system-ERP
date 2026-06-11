import { createPortal } from 'react-dom';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;
const num = (v) => Number(v || 0);

const Row = ({ label, value, strong }) => (
  <tr>
    <td>{label}</td>
    <td className={strong ? 'report-print-strong' : ''}>{value}</td>
  </tr>
);

const DailyClosurePrintSheet = ({ snapshot }) => {
  if (!snapshot) return null;

  const issuedAt = new Date().toLocaleString('es-NI', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const closedAtLabel = snapshot.closedAt
    ? new Date(snapshot.closedAt).toLocaleString('es-NI')
    : '—';

  const sheet = (
    <div className="report-print-area" aria-hidden="true">
      <header className="report-print-header">
        <div>
          <p className="report-print-brand">SuperNova — Sistema de Supermercado</p>
          <h1>Acta de cierre del día</h1>
          <p className="report-print-subtitle">
            {snapshot.isOfficial ? 'Cierre oficial guardado' : 'Cierre preliminar (sin guardar)'}
          </p>
          <p className="report-print-meta">Fecha operativa: {snapshot.closureDate}</p>
          <p className="report-print-meta">
            Emitido: {issuedAt}
            {snapshot.isOfficial && (
              <> · Cerrado por {snapshot.closedByName || '—'} el {closedAtLabel}</>
            )}
          </p>
          <p className="report-print-meta">Nicaragua · Moneda: Córdobas (C$)</p>
        </div>
      </header>

      <section className="report-print-section">
        <h2>Resumen comercial</h2>
        <div className="report-print-kpi-grid">
          <div className="report-print-kpi">
            <span>Ventas del día</span>
            <strong>{money(snapshot.totalSales)}</strong>
            <small>{num(snapshot.salesCount).toLocaleString()} ventas</small>
          </div>
          <div className="report-print-kpi">
            <span>Utilidad bruta</span>
            <strong>{money(snapshot.grossProfit)}</strong>
          </div>
          <div className="report-print-kpi">
            <span>Margen</span>
            <strong>{num(snapshot.grossMarginPercentage).toFixed(2)}%</strong>
          </div>
          <div className="report-print-kpi">
            <span>Diferencia total cajas</span>
            <strong>{money(snapshot.totalDifference)}</strong>
          </div>
        </div>
      </section>

      <section className="report-print-section">
        <h2>Caja y sesiones</h2>
        <table className="report-print-table">
          <tbody>
            <Row label="Sesiones cerradas" value={num(snapshot.closedSessionsCount)} />
            <Row label="Sesiones abiertas" value={num(snapshot.openSessionsCount)} />
            <Row label="Ventas en efectivo" value={money(snapshot.totalCashSales)} strong />
            <Row label="Diferencia efectivo" value={money(snapshot.totalCashDifference)} />
            <Row label="Ventas tarjeta" value={money(snapshot.totalCardSales)} />
            <Row label="Diferencia tarjeta" value={money(snapshot.totalCardDifference)} />
            <Row label="Ventas transferencia" value={money(snapshot.totalTransferSales)} />
            <Row label="Diferencia transferencia" value={money(snapshot.totalTransferDifference)} />
          </tbody>
        </table>
      </section>

      <section className="report-print-section">
        <h2>Compras, liquidaciones e inventario</h2>
        <table className="report-print-table">
          <tbody>
            <Row label="Compras recibidas (monto)" value={money(snapshot.receivedPurchasesAmount)} strong />
            <Row label="Compras pendientes" value={num(snapshot.pendingPurchasesCount)} />
            <Row label="Recepciones parciales" value={num(snapshot.partialPurchasesCount)} />
            <Row label="Liquidaciones pendientes" value={num(snapshot.pendingSettlementsCount)} />
            <Row label="Monto pendiente por liquidar" value={money(snapshot.pendingSettlementsAmount)} />
            <Row label="Productos en stock crítico" value={num(snapshot.stockAlertsCount)} />
          </tbody>
        </table>
      </section>

      {Array.isArray(snapshot.paymentMethods) && snapshot.paymentMethods.length > 0 && (
        <section className="report-print-section">
          <h2>Ventas por método de pago</h2>
          <table className="report-print-table">
            <thead>
              <tr>
                <th>Método</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.paymentMethods.map((item) => (
                <tr key={item.paymentMethod || item.method}>
                  <td>{item.paymentMethod || item.method}</td>
                  <td>{item.paymentCount || item.count || 0}</td>
                  <td>{money(item.totalAmount || item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="report-print-section">
        <h2>Alertas del cierre</h2>
        {(snapshot.alerts || []).length === 0 ? (
          <p className="report-print-note">Sin alertas registradas.</p>
        ) : (
          <ul className="report-print-list">
            {(snapshot.alerts || []).map((alert, index) => (
              <li key={`${alert.title}-${index}`}>
                <strong>{alert.title}:</strong> {alert.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      {snapshot.notes && (
        <section className="report-print-section">
          <h2>Notas oficiales</h2>
          <p className="report-print-note report-print-notes-block">{snapshot.notes}</p>
        </section>
      )}

      <section className="report-print-section">
        <h2>Firmas</h2>
        <div className="report-print-signatures">
          <div>
            <p>Responsable de cierre</p>
            <div className="report-print-sign-line" />
          </div>
          <div>
            <p>Supervisor / administración</p>
            <div className="report-print-sign-line" />
          </div>
        </div>
      </section>

      <footer className="report-print-footer">
        <p>Acta de cierre diario · SuperNova · Uso interno administrativo</p>
      </footer>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(sheet, document.body);
};

export default DailyClosurePrintSheet;
