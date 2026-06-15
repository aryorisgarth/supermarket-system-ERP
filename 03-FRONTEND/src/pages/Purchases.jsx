import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, Search, FileText, FileSpreadsheet } from 'lucide-react';
import Swal from 'sweetalert2';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import BackendPagination from '../components/ui/BackendPagination';

import PurchaseOrderService from '../services/PurchaseOrderService';
import ProductService from '../services/ProductService';
import SupplierService from '../services/SupplierService';
import AuthService from '../services/AuthService';

import useBackendList from '../hooks/useBackendList';
import { normalizeProductList } from '../utils/normalizeProduct';
import { formatMoney } from '../utils/formatMoney';
import { getApiErrorMessage } from '../utils/apiError';
import { PURCHASE_STATUS_LABELS } from '../utils/purchaseReceipt';
import { generatePurchaseListPDF } from '../utils/pdfGenerator';
import { exportPurchasesToCSV } from '../utils/exportCSV';

import PurchaseMetrics from '../components/purchase/PurchaseMetrics';
import PurchaseOrderTable from '../components/purchase/PurchaseOrderTable';
import PurchaseDetailModal from '../components/purchase/PurchaseDetailModal';
import PurchaseFormModal from '../components/purchase/PurchaseFormModal';
import PurchaseFilters from '../components/purchase/PurchaseFilters';
import { usePurchaseForm } from '../hooks/usePurchaseForm';
import { usePurchaseList } from '../hooks/usePurchaseList';

const money = formatMoney;

const Purchases = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');

  const buildParams = useCallback(() => ({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    supplierId: supplierFilter === 'ALL' ? undefined : Number(supplierFilter),
  }), [statusFilter, supplierFilter]);

  const loadPage = useCallback((params) => PurchaseOrderService.getPage(params), []);
  const {
    items: orders,
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
  } = useBackendList({
    loadPage,
    buildParams,
    filterDeps: [statusFilter, supplierFilter],
    sort: 'createdAt,desc',
  });

  const {
    allOrders,
    suppliers,
    metaLoading,
    selectedOrder,
    setSelectedOrder,
    summary,
    handleSelectOrder,
    runAction,
    refreshAll,
  } = usePurchaseList({ reload });

  const {
    showModal,
    setShowModal,
    openCreate,
    formProps
  } = usePurchaseForm({ onSuccess: refreshAll });

  const canManagePurchases = AuthService.hasPermission('PURCHASE_MANAGE');
  const canReceivePurchases = AuthService.hasPermission('PURCHASE_RECEIVE');

  const openWarehouseReceive = (order) => {
    navigate(`/bodega/recepcion/${order.id}`, { state: { from: 'purchases' } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Compras"
        title="Ordenes de compra"
        description="Ordenes al proveedor por empaque (caja/cajilla). La recepcion fisica con escaneo se hace en bodega."
        actions={
          canManagePurchases && (
            <div className="flex gap-2">
              <Button
                onClick={() => exportPurchasesToCSV(allOrders)}
                variant="secondary"
                icon={FileSpreadsheet}
                title="Exportar Excel/CSV"
              />
              <Button
                onClick={() => generatePurchaseListPDF(allOrders)}
                variant="secondary"
                icon={FileText}
                title="Exportar PDF"
              />
              <Button type="button" icon={Plus} onClick={() => openCreate(suppliers[0]?.id)}>
                Nueva compra
              </Button>
            </div>
          )
        }
        meta={<Badge tone="blue" className="px-3">{totalItems} ordenes</Badge>}
      />

      <PurchaseMetrics summary={summary} allOrdersCount={allOrders.length} money={money} />

      <PurchaseFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        suppliers={suppliers}
      />

      <PurchaseOrderTable
        orders={orders}
        loading={loading}
        metaLoading={metaLoading}
        money={money}
        canManagePurchases={canManagePurchases}
        canReceivePurchases={canReceivePurchases}
        onSelectOrder={handleSelectOrder}
        onRunAction={runAction}
        onReceiveOrder={openWarehouseReceive}
      />

      <BackendPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        label="ordenes"
      />

      {selectedOrder && (
        <PurchaseDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          money={money}
        />
      )}

      {showModal && (
        <PurchaseFormModal
          onClose={() => setShowModal(false)}
          suppliers={suppliers}
          money={money}
          {...formProps}
        />
      )}
    </div>
  );
};

export default Purchases;
