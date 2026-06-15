import React, { useEffect, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import Swal from 'sweetalert2';
import CustomerService from '../../services/CustomerService';

const SalesHistoryModal = ({ customerId, onClose }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const detail = await CustomerService.getById(customerId);
        setCustomerInfo(detail);
        setSales(detail.sales || []);
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el historial de ventas.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [customerId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--app-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} style={{ color: 'var(--app-primary)' }} />
            <div>
              <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--app-text)', display: 'block' }}>Historial de Compras</span>
              {customerInfo && (
                <span style={{ fontSize: '10px', color: 'var(--app-text-muted)', fontWeight: 600 }}>Cliente: {customerInfo.fullName}</span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 22px', maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--app-text-muted)' }}>
              <div className="animate-spin" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--app-border)', borderTopColor: 'var(--app-primary)', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '11px', fontWeight: 700 }}>Cargando ventas...</p>
            </div>
          ) : sales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--app-text-muted)' }}>
              <p style={{ fontSize: '13px', fontWeight: 700 }}>Este cliente no tiene compras registradas aún.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--app-border)', color: 'var(--app-text-muted)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 800, height: '32px' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Factura</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Fecha</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Puntos</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--app-border)', height: '38px', fontWeight: 600 }}>
                    <td style={{ padding: '8px', color: 'var(--app-text)' }}>{sale.invoiceNumber}</td>
                    <td style={{ padding: '8px', color: 'var(--app-text-soft)' }}>{new Date(sale.saleDate).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: 'var(--app-text)' }}>Q{sale.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>+{sale.pointsEarned || 0}</span>
                      {sale.pointsRedeemed > 0 && (
                        <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: '6px' }}>-{sale.pointsRedeemed}</span>
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                        background: sale.status === 'PAID' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: sale.status === 'PAID' ? '#10b981' : '#ef4444'
                      }}>
                        {sale.status === 'PAID' ? 'Pagado' : 'Anulado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryModal;
