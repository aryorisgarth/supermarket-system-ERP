import React, { useState } from 'react';
import { Award, X } from 'lucide-react';
import Swal from 'sweetalert2';
import CustomerService from '../../services/CustomerService';

const PointsModal = ({ customer, onClose, onSaved }) => {
  const [points, setPoints] = useState(customer?.points || 0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await CustomerService.adjustPoints(customer.id, points);
      onSaved(saved);
      onClose();
      Swal.fire({ icon: 'success', title: 'Puntos ajustados', text: 'Se actualizaron los puntos del cliente.', timer: 1500, showConfirmButton: false });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Error al ajustar puntos';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={18} style={{ color: 'var(--app-primary)' }} />
            <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--app-text)' }}>Ajustar Puntos</span>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '12px', color: 'var(--app-text-muted)', fontWeight: 600 }}>
            Ajustar los puntos acumulados para <strong>{customer.fullName}</strong>.
          </p>
          <div>
            <label style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--app-text-muted)', display: 'block', marginBottom: '5px' }}>
              Puntos Nuevos
            </label>
            <input
              type="number"
              min="0"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              style={{
                width: '100%', height: '40px', padding: '0 12px',
                background: 'var(--app-bg)', border: '1px solid var(--app-border)',
                borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: 'var(--app-text)',
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: '42px', borderRadius: '10px', border: '1px solid var(--app-border)', background: 'transparent', color: 'var(--app-text-muted)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ flex: 1, height: '42px', borderRadius: '10px', border: 'none', background: 'var(--app-primary)', color: '#fff', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
              {saving ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PointsModal;
