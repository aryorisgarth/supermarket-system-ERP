import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import SaleService from '../services/SaleService';
import BackendPagination from '../components/ui/BackendPagination';
import useBackendList from '../hooks/useBackendList';
import RefundModal from '../components/billing/RefundModal';
import ElectronicInvoiceModal from '../components/billing/ElectronicInvoiceModal';
import ElectronicInvoiceService from '../services/ElectronicInvoiceService';
import Swal from 'sweetalert2';

import AdminBillingHeader from '../components/billing/AdminBillingHeader';
import AdminBillingTable from '../components/billing/AdminBillingTable';
import AdminBillingDetailModal from '../components/billing/AdminBillingDetailModal';

const AdminBillingControl = () => {
  const loadPage = useCallback((params) => SaleService.getPage(params), []);
  const {
    items: sales,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    reload,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
    handleItemsPerPageChange,
  } = useBackendList({ loadPage, sort: 'saleDate,desc' });

  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetails, setSaleDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [refundSale, setRefundSale] = useState(null);
  const [einvoice, setEinvoice] = useState(null);
  const [issuingEI, setIssuingEI] = useState(false);

  const handleOpenDetails = async (sale) => {
    setSelectedSale(sale);
    setShowModal(true);
    setLoadingDetails(true);
    try {
      const details = await SaleService.getById(sale.id);
      setSaleDetails(details);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      Swal.fire('Error', 'No se pudo obtener el desglose de la factura.', 'error');
      setShowModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCancelSale = async (saleId, invoiceNum) => {
    const result = await Swal.fire({
      title: '¿Anular esta Factura?',
      text: `¿Estás seguro de que deseas anular la factura ${invoiceNum}? Esta acción restaurará automáticamente el stock de productos en el inventario y generará una Nota de Crédito en el sistema.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Anular Factura',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Anulando factura...',
          html: 'Calculando devolución fiscal y restaurando stock de almacén.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await SaleService.cancel(saleId);

        Swal.fire({
          icon: 'success',
          title: 'Factura Anulada',
          text: 'La factura ha sido anulada con éxito y el stock fue restablecido.',
          timer: 2000,
          showConfirmButton: false
        });

        reload();
        if (showModal && selectedSale?.id === saleId) {
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error cancelling sale:', error);
        Swal.fire({
          icon: 'error',
          title: 'Fallo de Operación',
          text: error.response?.data?.message || error.message || 'Asegúrate de tener un turno de caja abierto para registrar la anulación.'
        });
      }
    }
  };

  const handleOpenRefund = (sale) => {
    setRefundSale(sale);
  };

  const handleIssueEI = async (saleId) => {
    try {
      setIssuingEI(true);
      const data = await ElectronicInvoiceService.issueWithSale(saleId);
      setEinvoice(data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message || 'No se pudo emitir la factura electrónica.', confirmButtonColor: '#ef4444' });
    } finally {
      setIssuingEI(false);
    }
  };

  const handleRefundDone = () => {
    setRefundSale(null);
    reload();
    if (showModal) setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PAID': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'COMPLETED': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'PENDING': 'bg-slate-50 text-slate-500 border-slate-200',
      'CANCELLED': 'bg-rose-50 text-rose-600 border-rose-200',
      'PARTIALLY_REFUNDED': 'bg-orange-50 text-orange-600 border-orange-200',
      'REFUNDED': 'bg-amber-50 text-amber-600 border-amber-200'
    };
    const labels = {
      'PAID': 'Pagada',
      'COMPLETED': 'Completada',
      'PENDING': 'Pendiente',
      'CANCELLED': 'Anulada',
      'PARTIALLY_REFUNDED': 'Dev. parcial',
      'REFUNDED': 'Reembolsada'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <AdminBillingHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="font-medium">Cargando facturas y ventas...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white/80 border border-slate-100 backdrop-blur-xl p-12 rounded-3xl text-center text-slate-400 font-medium shadow-sm">
          No se registraron facturas que coincidan con la búsqueda.
        </div>
      ) : (
        <AdminBillingTable 
          sales={sales} 
          onOpenDetails={handleOpenDetails} 
          onIssueEI={handleIssueEI} 
          onOpenRefund={handleOpenRefund} 
          onCancelSale={handleCancelSale} 
          issuingEI={issuingEI} 
          getStatusBadge={getStatusBadge} 
        />
      )}

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        label="facturas"
      />

      <AdminBillingDetailModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        sale={selectedSale} 
        details={saleDetails} 
        loading={loadingDetails} 
        onIssueEI={handleIssueEI} 
        onOpenRefund={handleOpenRefund} 
        onCancelSale={handleCancelSale} 
        issuingEI={issuingEI} 
        getStatusBadge={getStatusBadge} 
      />

      {refundSale && (
        <RefundModal
          saleId={refundSale.id}
          invoiceNumber={refundSale.invoiceNumber}
          onClose={() => setRefundSale(null)}
          onDone={handleRefundDone}
        />
      )}

      {einvoice && (
        <ElectronicInvoiceModal 
          invoice={einvoice} 
          onClose={() => setEinvoice(null)} 
        />
      )}
    </div>
  );
};

export default AdminBillingControl;
