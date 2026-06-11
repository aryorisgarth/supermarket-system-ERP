import React from 'react';
import { Eye, FileText, Undo2, XCircle } from 'lucide-react';

const AdminBillingTable = ({
  sales,
  onOpenDetails,
  onIssueEI,
  onOpenRefund,
  onCancelSale,
  issuingEI,
  getStatusBadge
}) => {
  return (
    <div className="bg-white/80 border border-slate-150 backdrop-blur-xl rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-150 bg-slate-50/30">
              <th className="p-4 pl-6">N° Factura</th>
              <th className="p-4">Fecha y Hora</th>
              <th className="p-4">Cajero</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Total Cobrado</th>
              <th className="p-4">Estado</th>
              <th className="p-4 pr-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="text-sm hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors group">
                <td className="p-4 pl-6 font-mono font-bold text-slate-700">{sale.invoiceNumber}</td>
                <td className="p-4 text-slate-500 font-medium">
                  {new Date(sale.saleDate).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="p-4 font-semibold text-slate-600">{sale.seller?.fullName || 'Sistema'}</td>
                <td className="p-4 text-slate-500 font-medium">{sale.customer?.fullName || 'Consumidor Final'}</td>
                <td className="p-4 font-bold text-slate-700">${parseFloat(sale.totalAmount).toFixed(2)}</td>
                <td className="p-4">{getStatusBadge(sale.status)}</td>
                <td className="p-4 pr-6 text-center flex items-center justify-center gap-2">
                  <button
                    onClick={() => onOpenDetails(sale)}
                    className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-primary hover:text-white text-primary px-3 py-2 rounded-xl transition-all font-bold hover:scale-105 duration-300 cursor-pointer"
                    title="Ver Desglose de Productos"
                  >
                    <Eye size={14} /> Detalle
                  </button>
                  <button
                    onClick={() => onIssueEI(sale.id)}
                    disabled={issuingEI}
                    className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-700 hover:text-white text-slate-600 px-3 py-2 rounded-xl transition-all font-bold hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Emitir / ver Factura Electrónica"
                  >
                    <FileText size={14} /> FE
                  </button>
                  {sale.status !== 'CANCELLED' && sale.status !== 'REFUNDED' && (
                    <>
                      <button
                        onClick={() => onOpenRefund(sale)}
                        className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-600 px-3 py-2 rounded-xl transition-all font-bold hover:scale-105 duration-300 cursor-pointer"
                        title="Devolución parcial / total (Nota de Crédito)"
                      >
                        <Undo2 size={14} /> Devolver
                      </button>
                      <button
                        onClick={() => onCancelSale(sale.id, sale.invoiceNumber)}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-500 px-3 py-2 rounded-xl transition-all font-bold hover:scale-105 duration-300 cursor-pointer"
                        title="Anular Factura completa"
                      >
                        <XCircle size={14} /> Anular
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBillingTable;
