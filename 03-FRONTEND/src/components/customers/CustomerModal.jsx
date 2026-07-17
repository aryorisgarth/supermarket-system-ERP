import React, { useEffect, useRef, useState } from 'react';
import { User, Phone, CreditCard, Mail, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import CustomerService from '../../services/CustomerService';
import ResponsiveModal from '../ui/ResponsiveModal';

const CustomerModal = ({ customer, onClose, onSaved }) => {
  const isEdit = !!customer;
  const [form, setForm] = useState({
    fullName: customer?.fullName || '',
    phone: customer?.phone || '',
    documentId: customer?.documentId || '',
    email: customer?.email || '',
    address: customer?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 120);
  }, []);

  const handle = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre requerido', text: 'Ingresa el nombre del cliente.' });
      return;
    }

    const nameRegex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s.'-]+$/;
    if (!nameRegex.test(form.fullName)) {
      Swal.fire({ icon: 'warning', title: 'Formato inválido', text: 'El nombre solo puede contener letras, espacios, puntos, guiones y apóstrofes.' });
      return;
    }

    if (form.phone && !/^\+?[0-9\s-]+$/.test(form.phone)) {
      Swal.fire({ icon: 'warning', title: 'Teléfono inválido', text: 'El teléfono solo puede contener números, espacios, guiones y un prefijo +.' });
      return;
    }

    if (form.documentId && !/^[A-Za-z0-9-]+$/.test(form.documentId)) {
      Swal.fire({ icon: 'warning', title: 'Documento inválido', text: 'El documento solo puede contener letras, números y guiones.' });
      return;
    }
    setSaving(true);
    try {
      const saved = isEdit
        ? await CustomerService.update(customer.id, form)
        : await CustomerService.create(form);
      onSaved(saved);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Error al guardar';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveModal
      onClose={onClose}
      icon={User}
      title={isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
      subtitle={isEdit ? `Actualizar datos de ${customer.fullName}` : 'Registrar nuevo cliente para fidelización'}
      initialSize="md"
      sizeOptions={['sm', 'md', 'lg']}
    >
      <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {}
          <div>
            <label
              style={{
                fontSize: '9px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--app-text-muted)',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              Nombre Completo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={13}
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--app-text-muted)',
                }}
              />
              <input
                ref={firstRef}
                type="text"
                value={form.fullName}
                onChange={handle('fullName')}
                placeholder="Nombre y apellido del cliente"
                required
                style={{
                  width: '100%',
                  paddingLeft: '34px',
                  paddingRight: '12px',
                  height: '40px',
                  background: 'var(--app-bg)',
                  border: '1px solid var(--app-border)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--app-text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {}
          <div>
            <label
              style={{
                fontSize: '9px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--app-text-muted)',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              Teléfono <span style={{ fontSize: '8px', color: 'var(--app-primary)' }}>← Usado para identificar en caja</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={13}
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--app-text-muted)',
                }}
              />
              <input
                type="tel"
                value={form.phone}
                onChange={handle('phone')}
                placeholder="Ej: 5555-1234"
                style={{
                  width: '100%',
                  paddingLeft: '34px',
                  paddingRight: '12px',
                  height: '40px',
                  background: 'var(--app-bg)',
                  border: '1px solid var(--app-border)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--app-text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--app-text-muted)',
                  display: 'block',
                  marginBottom: '5px',
                }}
              >
                DPI / Cédula
              </label>
              <div style={{ position: 'relative' }}>
                <CreditCard
                  size={13}
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--app-text-muted)',
                  }}
                />
                <input
                  type="text"
                  value={form.documentId}
                  onChange={handle('documentId')}
                  placeholder="Opcional"
                  style={{
                    width: '100%',
                    paddingLeft: '34px',
                    paddingRight: '8px',
                    height: '40px',
                    background: 'var(--app-bg)',
                    border: '1px solid var(--app-border)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--app-text)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--app-text-muted)',
                  display: 'block',
                  marginBottom: '5px',
                }}
              >
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={13}
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--app-text-muted)',
                  }}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={handle('email')}
                  placeholder="Opcional"
                  style={{
                    width: '100%',
                    paddingLeft: '34px',
                    paddingRight: '8px',
                    height: '40px',
                    background: 'var(--app-bg)',
                    border: '1px solid var(--app-border)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--app-text)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {}
          <div>
            <label
              style={{
                fontSize: '9px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--app-text-muted)',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              Dirección
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={13} style={{ position: 'absolute', left: '11px', top: '14px', color: 'var(--app-text-muted)' }} />
              <textarea
                value={form.address}
                onChange={handle('address')}
                placeholder="Opcional"
                rows={2}
                style={{
                  width: '100%',
                  paddingLeft: '34px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  background: 'var(--app-bg)',
                  border: '1px solid var(--app-border)',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--app-text)',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '10px',
                border: '1px solid var(--app-border)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--app-text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                height: '42px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--app-primary)',
                cursor: saving ? 'wait' : 'pointer',
                fontSize: '12px',
                fontWeight: 800,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar Cliente'}
            </button>
          </div>
      </form>
    </ResponsiveModal>
  );
};

export default CustomerModal;
