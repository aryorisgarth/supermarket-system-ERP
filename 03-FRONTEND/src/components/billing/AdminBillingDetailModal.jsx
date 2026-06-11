import React from 'react';
import { Receipt, X, Loader2, FileText, Undo2, XCircle } from 'lucide-react';

const AdminBillingDetailModal = ({
  isOpen,
  onClose,
  sale,
  details,
  loading,
  onIssueEI,
  onOpenRefund,
  onCancelSale,
  issuingEI,
  getStatusBadge
}) => {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-150 max-w-2xl w-full overflow-hidden scale-in duration-300">
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Receipt size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Desglose - Factura {sale.invoiceNumber}</h3>
              <p className="text-white/80 text-xs mt-1">
                Cajero: {sale.seller?.fullName || 'Sistema'} | Fecha: {new Date(sale.saleDate).toLocaleString()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 uppercase bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400">Cliente</span>
              <span className="text-slate-750 mt-1 block">{sale.customer?.fullName || 'Consumidor Final'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Estado de Pago</span>
              <span className="mt-1 block">{getStatusBadge(sale.status)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Productos Adquiridos</span>
            
            {loading ? (
              <div className="py-12 flex justify-center text-slate-400 gap-2">
                <Loader2 className="animate-spin text-primary" size={24} />
                <span className="font-semibold text-sm">Cargando desglose de productos...</span>
              </div>
            ) : details ? (
              <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-4 bg-slate-50/80 p-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150">
                  <span className="col-span-2">Producto</span>
                  <span className="text-center">Cant x Precio</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto bg-white">
                  {details.lines?.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-4 p-3.5 text-sm font-medium text-slate-600 items-center">
                      <span className="col-span-2 font-bold text-slate-700">{line.productName || 'Producto'}</span>
                      <span className="text-center font-mono text-xs">{line.quantity} x ${parseFloat(line.unitPrice).toFixed(2)}</span>
                      <span className="text-right font-bold text-slate-700">${(line.quantity * line.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-6">No se pudo cargar el desglose.</p>
            )}
          </div>

          {details && (
            <div className="border-t border-slate-150 pt-4 flex flex-col items-end space-y-2">
              <div className="w-64 text-sm font-medium text-slate-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-700">${parseFloat(details.subtotalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos (IVA)</span>
                  <span className="font-bold text-slate-700">${parseFloat(details.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-100">
                  <span>Total Neto</span>
                  <span className="text-primary">${parseFloat(details.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onIssueEI(sale.id); }}
              disabled={issuingEI}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-700 hover:text-white text-slate-600 px-4 py-3 rounded-2xl transition-all font-bold hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
            >
              <FileText size={15} /> {issuingEI ? 'Emitiendo…' : 'Factura Electrónica'}
            </button>
            {sale.status !== 'CANCELLED' && sale.status !== 'REFUNDED' ? (
              <>
                <button
                  onClick={() => onOpenRefund(sale)}
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-600 px-5 py-3 rounded-2xl transition-all font-bold hover:scale-105 duration-300 cursor-pointer text-sm"
                >
                  <Undo2 size={16} /> Devolver
                </button>
                <button 
                  onClick={() => onCancelSale(sale.id, sale.invoiceNumber)}
                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-500 px-5 py-3 rounded-2xl transition-all font-bold hover:scale-105 duration-300 cursor-pointer text-sm"
                >
                  <XCircle size={16} /> Anular e Inventariar
                </button>
              </>
            ) : (
              <span className="text-xs text-rose-500 font-extrabold flex items-center gap-1 uppercase tracking-wider bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                <XCircle size={14} /> Factura ya Anulada
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 font-bold rounded-2xl transition-all hover:scale-105 cursor-pointer text-sm"
          >
            Cerrar Desglose
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBillingDetailModal;
