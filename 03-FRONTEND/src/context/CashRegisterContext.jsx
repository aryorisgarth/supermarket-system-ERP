import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import CashRegisterService from '../services/CashRegisterService';
import AuthService from '../services/AuthService';
import {
  markCashRegisterClosed,
  markCashRegisterOpen,
  roleUsesCashRegister,
} from '../utils/cashRegisterStorage';
import { formatMoney } from '../utils/formatMoney';

const CashRegisterContext = createContext(null);

export function CashRegisterProvider({ children }) {
  const roleName = AuthService.getCurrentUser()?.role?.name;
  const enabled = roleUsesCashRegister(roleName);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [isOpen, setIsOpen] = useState(false);

  const applyClosed = useCallback(() => {
    setSession(null);
    setIsOpen(false);
    markCashRegisterClosed();
  }, []);

  const refreshSession = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const data = await CashRegisterService.getCurrentSession();
      if (data) {
        setSession(data);
        setIsOpen(true);
        markCashRegisterOpen();
        return data;
      }
      applyClosed();
      return null;
    } catch {
      applyClosed();
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, applyClosed]);

  
  const syncSessionFromServer = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const data = await CashRegisterService.getCurrentSession();
      if (data) {
        setSession(data);
        setIsOpen(true);
        markCashRegisterOpen();
        return data;
      }
      applyClosed();
      return null;
    } catch {
      applyClosed();
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, applyClosed]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    refreshSession();
  }, [enabled, refreshSession]);

  const openSession = useCallback(async (openingBalance, cashRegisterId) => {
    const data = await CashRegisterService.openSession(openingBalance, cashRegisterId);
    setSession(data);
    setIsOpen(true);
    markCashRegisterOpen();
    return data;
  }, []);

  const closeSession = useCallback(async (actualClosingBalance, notes) => {
    const data = await CashRegisterService.closeSession(actualClosingBalance, notes);
    applyClosed();
    return data;
  }, [applyClosed]);

  const closeSessionDetailed = useCallback(async (payload) => {
    const data = await CashRegisterService.closeSessionDetailed(payload);
    applyClosed();
    return data;
  }, [applyClosed]);

  const promptAndOpenSession = useCallback(async () => {
    try {
      const activeRegisters = await CashRegisterService.getActivePhysicalRegisters();
      if (!activeRegisters || activeRegisters.length === 0) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay cajas físicas activas registradas en el sistema.',
        });
        return null;
      }

      const optionsHtml = activeRegisters
        .map((r) => `<option value="${r.id}">${r.name} (${r.description || 'Sin descripción'})</option>`)
        .join('');

      const { value: formValues } = await Swal.fire({
        title: 'Apertura de Caja',
        html: `
          <div style="margin-bottom: 1rem; text-align: left;">
            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Caja Registradora Física</label>
            <select id="swal-input-register" style="width: 100%; px: 0.75rem; py: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; outline: none; font-size: 0.875rem;">
              ${optionsHtml}
            </select>
          </div>
          <div style="text-align: left;">
            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Monto inicial en efectivo</label>
            <input id="swal-input-balance" type="number" step="0.01" min="0" placeholder="0.00" style="width: 100%; px: 0.75rem; py: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; outline: none; font-size: 0.875rem;" />
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Abrir Caja',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#4f46e5',
        preConfirm: () => {
          const registerId = document.getElementById('swal-input-register').value;
          const balance = document.getElementById('swal-input-balance').value;
          if (!registerId) {
            Swal.showValidationMessage('Debes seleccionar una caja registradora');
            return false;
          }
          if (balance === '' || Number(balance) < 0) {
            Swal.showValidationMessage('Ingresa un monto inicial válido (0 o mayor)');
            return false;
          }
          return {
            registerId: parseInt(registerId, 10),
            balance: parseFloat(balance),
          };
        },
      });

      if (!formValues) {
        return null;
      }

      const newSession = await openSession(formValues.balance, formValues.registerId);
      await Swal.fire({
        icon: 'success',
        title: '¡Caja abierta!',
        text: `Turno iniciado en la caja física con ${formatMoney(formValues.balance)} en efectivo.`,
        timer: 2000,
        showConfirmButton: false,
      });
      return newSession;
    } catch (error) {
      await Swal.fire(
        'Error',
        typeof error === 'string' ? error : error?.message || 'No se pudo abrir la caja',
        'error'
      );
      return null;
    }
  }, [openSession]);

  const value = useMemo(
    () => ({
      enabled,
      session,
      isOpen,
      loading,
      refreshSession,
      syncSessionFromServer,
      openSession,
      closeSession,
      closeSessionDetailed,
      promptAndOpenSession,
    }),
    [
      enabled,
      session,
      isOpen,
      loading,
      refreshSession,
      syncSessionFromServer,
      openSession,
      closeSession,
      closeSessionDetailed,
      promptAndOpenSession,
    ]
  );

  return (
    <CashRegisterContext.Provider value={value}>{children}</CashRegisterContext.Provider>
  );
}

export function useCashRegister() {
  const ctx = useContext(CashRegisterContext);
  if (!ctx) {
    throw new Error('useCashRegister debe usarse dentro de CashRegisterProvider');
  }
  return ctx;
}


export function useCashRegisterOptional() {
  return useContext(CashRegisterContext);
}
