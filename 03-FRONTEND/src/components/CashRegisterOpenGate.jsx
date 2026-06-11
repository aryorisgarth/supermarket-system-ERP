import React from 'react';
import { Wallet, Power, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCashRegister } from '../context/CashRegisterContext';

/**
 * Bloquea el POS hasta que exista un turno de caja abierto.
 * No llama a /current mientras la caja esté marcada como cerrada en sesión.
 */
const CashRegisterOpenGate = ({ children }) => {
  const { enabled, isOpen, loading, promptAndOpenSession } = useCashRegister();

  if (!enabled) {
    return children;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-3 text-slate-500">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="animate-spin text-primary" size={40} />
        </motion.div>
        <motion.p 
          className="text-sm font-semibold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Verificando turno de caja…
        </motion.p>
      </div>
    );
  }

  if (isOpen) {
    return children;
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="pointer-events-none select-none opacity-30 blur-[1px] max-h-[70vh] overflow-hidden">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-900/5 backdrop-blur-sm rounded-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-md w-full bg-white rounded-lg shadow-enterprise border border-border-light p-8 text-center space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, type: 'spring' }}
            className="mx-auto w-14 h-14 rounded-lg bg-danger text-white flex items-center justify-center"
          >
            <Power size={28} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-text-primary">Caja Cerrada</h2>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">
              Debes abrir tu turno de caja antes de facturar. No se consultará el servidor hasta que
              inicies el turno.
            </p>
          </motion.div>
          <motion.button
            type="button"
            onClick={promptAndOpenSession}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-6 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors"
          >
            <Wallet size={18} />
            Abrir Caja
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default CashRegisterOpenGate;
