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

  /** Consulta el servidor aunque no haya flag en sessionStorage (p. ej. pantalla Mi turno). */
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

  const openSession = useCallback(async (openingBalance) => {
    const data = await CashRegisterService.openSession(openingBalance);
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
    const { value: balance } = await Swal.fire({
      title: 'Apertura de Caja',
      input: 'number',
      inputLabel: 'Monto inicial en efectivo',
      inputPlaceholder: '0.00',
      showCancelButton: true,
      confirmButtonText: 'Abrir Caja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4f46e5',
      inputValidator: (value) => {
        if (value === '' || value === null || Number(value) < 0) {
          return 'Ingresa un monto válido (0 o mayor)';
        }
        return undefined;
      },
    });

    if (balance === undefined || balance === null || balance === '') {
      return null;
    }

    try {
      const newSession = await openSession(parseFloat(balance));
      await Swal.fire({
        icon: 'success',
        title: '¡Caja abierta!',
        text: `Turno iniciado con ${formatMoney(balance)} en efectivo.`,
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

/** Para componentes opcionales (p. ej. sidebar) si el provider no envuelve la ruta. */
export function useCashRegisterOptional() {
  return useContext(CashRegisterContext);
}
