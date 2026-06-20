import React, { useEffect, useRef, useState } from 'react';
import {
  ClipboardList,
  Loader2,
  Minus,
  MoreHorizontal,
  Plus,
  PowerOff,
} from 'lucide-react';
import CashRegisterService from '../services/CashRegisterService';
import AuthService from '../services/AuthService';
import Swal from 'sweetalert2';
import { useCashRegisterOptional } from '../context/CashRegisterContext';
import { formatMoney } from '../utils/formatMoney';

const money = formatMoney;

const CashRegisterStatus = ({ compact = false, className = '' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const cashRegister = useCashRegisterOptional();
  const {
    enabled = false,
    session = null,
    loading = false,
    promptAndOpenSession,
    closeSessionDetailed,
  } = cashRegister || {};

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const handleOpen = async () => {
    await promptAndOpenSession?.();
  };

  const handleMovement = async (type) => {
    setMenuOpen(false);
    const label = type === 'CASH_IN' ? 'Ingreso de efectivo' : 'Retiro de efectivo';
    const { value } = await Swal.fire({
      title: label,
      html:
        '<input id="cash-movement-amount" class="swal2-input" placeholder="Monto">' +
        '<textarea id="cash-movement-reason" class="swal2-textarea" placeholder="Motivo"></textarea>',
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const amount = document.getElementById('cash-movement-amount').value;
        const reason = document.getElementById('cash-movement-reason').value;
        const parsedAmount = parseFloat(String(amount).replace(/,/g, ''));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          Swal.showValidationMessage('Ingresa un monto mayor que cero');
          return false;
        }
        if (!reason.trim()) {
          Swal.showValidationMessage('Indica el motivo');
          return false;
        }
        return { amount: parsedAmount, reason };
      },
    });

    if (!value) return;

    try {
      await CashRegisterService.createMovement({ type, amount: value.amount, reason: value.reason });
      Swal.fire({ icon: 'success', title: 'Movimiento registrado', timer: 1200, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo registrar el movimiento', 'error');
    }
  };

  const handleSummary = async () => {
    setMenuOpen(false);
    try {
      const summary = await CashRegisterService.getCurrentSummary();
      await Swal.fire({
        title: 'Resumen de Caja',
        html: `
          <div style="text-align:left;font-size:13px;line-height:1.7">
            <b>Efectivo esperado:</b> ${money(summary.expectedCash)}<br/>
            <b>Tarjeta esperado:</b> ${money(summary.expectedCard)}<br/>
            <b>Transferencia esperado:</b> ${money(summary.expectedTransfer)}<br/>
            <hr/>
            <b>Ventas efectivo:</b> ${money(summary.cashSales)}<br/>
            <b>Cambio entregado:</b> ${money(summary.changeAmount)}<br/>
            <b>Devoluciones:</b> ${money(summary.refunds)}<br/>
            <b>Ingresos manuales:</b> ${money(summary.manualCashIn)}<br/>
            <b>Retiros manuales:</b> ${money(summary.manualCashOut)}<br/>
            <hr/>
            <b>Movimientos manuales:</b> ${(summary.movements || []).length}
          </div>
        `,
        confirmButtonText: 'Cerrar',
      });
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo cargar el resumen', 'error');
    }
  };

  const handleClose = async () => {
    setMenuOpen(false);
    let summary = null;
    try {
      summary = await CashRegisterService.getCurrentSummary();
    } catch (error) {
      console.error(error);
    }

    const { value: formValues } = await Swal.fire({
      title: 'Cierre de Caja',
      html:
        `<div style="text-align:left;font-size:12px;margin-bottom:8px">
          <b>Esperado efectivo:</b> ${money(summary?.expectedCash)}<br/>
          <b>Esperado tarjeta:</b> ${money(summary?.expectedCard)}<br/>
          <b>Esperado transferencia:</b> ${money(summary?.expectedTransfer)}
        </div>` +
        '<input id="swal-cash" class="swal2-input" placeholder="Efectivo contado">' +
        '<input id="swal-card" class="swal2-input" placeholder="Tarjeta contado / reporte POS">' +
        '<input id="swal-transfer" class="swal2-input" placeholder="Transferencia contada">' +
        '<textarea id="swal-notes" class="swal2-textarea" placeholder="Notas/Observaciones"></textarea>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cerrar Caja',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const actualClosingBalance = document.getElementById('swal-cash').value;
        const countedCard = document.getElementById('swal-card').value || 0;
        const countedTransfer = document.getElementById('swal-transfer').value || 0;
        const notes = document.getElementById('swal-notes').value;
        const parsedCash = parseFloat(String(actualClosingBalance).replace(/,/g, ''));
        const parsedCard = parseFloat(String(countedCard).replace(/,/g, ''));
        const parsedTransfer = parseFloat(String(countedTransfer).replace(/,/g, ''));

        if (isNaN(parsedCash) || parsedCash < 0) {
          Swal.showValidationMessage('Debes ingresar el efectivo contado válido');
          return false;
        }
        if (isNaN(parsedCard) || parsedCard < 0 || isNaN(parsedTransfer) || parsedTransfer < 0) {
          Swal.showValidationMessage('Los montos contados no pueden ser negativos ni inválidos');
          return false;
        }

        const diff = Math.abs(parsedCash - (summary?.expectedCash || 0));
        if (diff > 1.00 && !notes.trim()) {
          Swal.showValidationMessage('Se requiere una nota justificando la diferencia (mayor a $1.00)');
          return false;
        }

        return {
          actualClosingBalance: parsedCash,
          countedCard: parsedCard,
          countedTransfer: parsedTransfer,
          notes,
        };
      },
    });

    if (!formValues) return;

    try {
      const closedSession = await closeSessionDetailed(formValues);

      const diff = Number(closedSession.difference || 0);
      Swal.fire({
        icon: diff === 0 ? 'success' : 'warning',
        title: 'Turno finalizado',
        text: diff === 0 ? 'Cierre perfecto, caja cuadrada.' : `Diferencia efectivo: ${money(diff)}`,
      });
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo cerrar la caja', 'error');
    }
  };

  if (!enabled) {
    return null;
  }

  if (loading) {
    return (
      <div className={`app-cash-register app-cash-register--loading ${className}`}>
        <Loader2 className="animate-spin text-[var(--app-text-muted)]" size={16} />
      </div>
    );
  }

  const isOpen = Boolean(session);

  return (
    <div
      className={`app-cash-register ${isOpen ? 'app-cash-register--open' : 'app-cash-register--closed'} ${
        compact ? 'app-cash-register--compact' : ''
      } ${className}`}
    >
      <div className="app-cash-register-status">
        <span className={`app-cash-register-dot ${isOpen ? 'app-cash-register-dot--on' : ''}`} />
        <div className="app-cash-register-text min-w-0">
          <p className="app-cash-register-label">{isOpen ? 'Caja abierta' : 'Caja cerrada'}</p>
          <p className="app-cash-register-amount">
            {isOpen ? money(session.openingBalance) : 'Sin turno'}
          </p>
        </div>
      </div>

      {isOpen ? (
        <div className="app-cash-register-actions">
          <div className="app-cash-register-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="app-cash-register-icon-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Más acciones de caja"
              title="Más acciones"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="app-cash-register-menu">
                <button type="button" onClick={handleSummary}>
                  <ClipboardList size={14} />
                  Resumen
                </button>
                {AuthService.hasPermission('CASH_MOVE') && (
                  <>
                    <button type="button" onClick={() => handleMovement('CASH_IN')}>
                      <Plus size={14} />
                      Ingreso efectivo
                    </button>
                    <button type="button" onClick={() => handleMovement('CASH_OUT')}>
                      <Minus size={14} />
                      Retiro efectivo
                    </button>
                  </>
                )}
                {AuthService.hasPermission('CASH_CLOSE') && (
                  <button type="button" onClick={handleClose}>
                    <PowerOff size={14} />
                    Cerrar caja
                  </button>
                )}
              </div>
            )}
          </div>
          {AuthService.hasPermission('CASH_CLOSE') && (
            <button type="button" className="app-cash-register-close-btn" onClick={handleClose}>
              Cerrar caja
            </button>
          )}
        </div>
      ) : (
        AuthService.hasPermission('CASH_OPEN') && (
          <button type="button" className="app-cash-register-open-btn" onClick={handleOpen}>
            Abrir caja
          </button>
        )
      )}
    </div>
  );
};

export default CashRegisterStatus;
