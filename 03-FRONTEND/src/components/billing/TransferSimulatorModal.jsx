import React from 'react';
import { Check, Landmark } from 'lucide-react';
import { formatMoney } from '../../utils/formatMoney';
import ResponsiveModal from '../ui/ResponsiveModal';

const MockQrCode = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-white p-2 rounded-lg border border-slate-200">
    <rect x="10" y="10" width="30" height="30" stroke="black" strokeWidth="4"/>
    <rect x="15" y="15" width="20" height="20" fill="black"/>
    
    <rect x="100" y="10" width="30" height="30" stroke="black" strokeWidth="4"/>
    <rect x="105" y="15" width="20" height="20" fill="black"/>
    
    <rect x="10" y="100" width="30" height="30" stroke="black" strokeWidth="4"/>
    <rect x="15" y="105" width="20" height="20" fill="black"/>
    
    <rect x="50" y="20" width="10" height="10" fill="black"/>
    <rect x="70" y="10" width="20" height="10" fill="black"/>
    <rect x="60" y="30" width="10" height="20" fill="black"/>
    <rect x="80" y="30" width="10" height="10" fill="black"/>
    
    <rect x="20" y="50" width="10" height="20" fill="black"/>
    <rect x="10" y="80" width="20" height="10" fill="black"/>
    
    <rect x="50" y="60" width="20" height="20" fill="black"/>
    <rect x="80" y="60" width="10" height="10" fill="black"/>
    <rect x="90" y="50" width="20" height="15" fill="black"/>
    
    <rect x="50" y="90" width="15" height="10" fill="black"/>
    <rect x="75" y="90" width="15" height="15" fill="black"/>
    <rect x="50" y="110" width="30" height="10" fill="black"/>
    <rect x="90" y="100" width="10" height="20" fill="black"/>
    <rect x="110" y="90" width="20" height="10" fill="black"/>
    
    <rect x="110" y="50" width="10" height="30" fill="black"/>
  </svg>
);

const TransferSimulatorModal = ({ show, onClose, onSuccess, amount, bankName }) => {
  if (!show) return null;

  const handleSimulate = () => {
    const randomRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    onSuccess(randomRef);
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={show}
      onClose={onClose}
      icon={Landmark}
      title="Simulador de Transferencia"
      subtitle={bankName}
      initialSize="md"
      sizeOptions={['sm', 'md']}
      resizable={false}
    >
      <div className="p-6">
        <div className="my-1 flex flex-col items-center gap-4 text-center">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 w-full text-left space-y-2.5">
            <div>
              <span className="block text-[9px] font-bold uppercase text-slate-450">Banco Receptor</span>
              <span className="text-xs font-bold text-slate-850">{bankName}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold uppercase text-slate-450">Cuenta Clabe</span>
              <span className="text-xs font-mono font-bold text-slate-850">1002-3984-7291-8472</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold uppercase text-slate-450">Beneficiario</span>
              <span className="text-xs font-bold text-slate-850">SUPERMERCADO EL CENTRO S.A.</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold uppercase text-slate-450">Monto a Transferir</span>
              <span className="text-lg font-bold text-black">{formatMoney(amount)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500">Escanee el código QR desde la App del banco</span>
            <MockQrCode />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-250 bg-white hover:bg-slate-50 py-2.5 text-xs font-bold uppercase text-slate-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSimulate}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-350 bg-slate-200 hover:bg-slate-300 py-2.5 text-xs font-bold uppercase text-slate-800 transition-colors cursor-pointer"
          >
            <Check size={14} />
            Confirmar
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default TransferSimulatorModal;
