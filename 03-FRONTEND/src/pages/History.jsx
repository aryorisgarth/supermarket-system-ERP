import { useEffect, useMemo, useState } from 'react';
import {
  History as HistoryIcon,
  Package,
  RefreshCw,
  Search,
  Tag,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import BackendPagination from '../components/ui/BackendPagination';
import HistoryService from '../services/HistoryService';
import ProductService from '../services/ProductService';
import SupplierService from '../services/SupplierService';
import AuthService from '../services/AuthService';
import { unwrapPageContent } from '../utils/pageResponse';
import { formatMoney } from '../utils/formatMoney';
import { getApiErrorMessage } from '../utils/apiError';

const COST_REASON_LABELS = {
  PURCHASE_RECEIPT: 'Recepción de compra',
  MANUAL_COST_ADJUSTMENT: 'Ajuste manual',
  INITIAL_LOAD: 'Carga inicial',
  INVENTORY_REVALUATION: 'Revaluación',
};

const PRICE_REASON_LABELS = {
  MANUAL_UPDATE: 'Cambio manual',
  PURCHASE_RECEIPT: 'Recepción de compra',
  PURCHASE_MARGIN_ALERT: 'Alerta de markup',
  MASS_UPDATE: 'Cambio masivo',
  PROMOTION_END: 'Fin de promoción',
};

const HISTORY_TABS = [
  { key: 'costs', label: 'Historial de costos', icon: TrendingUp },
  { key: 'prices', label: 'Historial de precios', icon: Tag },
];

const COST_REASON_OPTIONS = Object.entries(COST_REASON_LABELS).map(([value, label]) => ({ value, label }));
const PRICE_REASON_OPTIONS = Object.entries(PRICE_REASON_LABELS).map(([value, label]) => ({ value, label }));

const emptyFilters = {
  productId: '',
  supplierId: '',
  from: '',
  to: '',
  reason: '',
};

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-NI', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toFixed(2)}%`;
};

const History = () => {
  const [activeTab, setActiveTab] = useState('costs');
  const [filters, setFilters] = useState(emptyFilters);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bootLoading, setBootLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);

  const canUseReports = AuthService.hasAnyPermission(['REPORT_VIEW']);
  const canUseSuppliers = AuthService.hasAnyPermission(['PURCHASE_MANAGE', 'PURCHASE_RECEIVE']);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      ProductService.getAll({ page: 0, size: 500, sort: 'name,asc' }),
      SupplierService.getAll(),
    ])
      .then(([productsPage, supplierRows]) => {
        if (cancelled) return;
        setProducts(unwrapPageContent(productsPage));
        setSuppliers(supplierRows || []);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(getApiErrorMessage(error, 'No se pudieron cargar los filtros del histórico.'));
      })
      .finally(() => {
        if (!cancelled) setBootLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage('');

    const params = {
      page: Math.max(page - 1, 0),
      size,
      sort: 'createdAt,desc',
      productId: filters.productId || undefined,
      supplierId: activeTab === 'costs' ? filters.supplierId || undefined : undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      reason: filters.reason || undefined,
    };

    const request = activeTab === 'costs'
      ? HistoryService.getCostHistory(params)
      : HistoryService.getSalePriceHistory(params);

    Promise.resolve(request)
      .then((data) => {
        if (cancelled) return;
        setRows(data?.content || []);
        setTotalPages(Number(data?.totalPages || 0));
        setTotalElements(Number(data?.totalElements || 0));
      })
      .catch((error) => {
        if (cancelled) return;
        setRows([]);
        setTotalPages(0);
        setTotalElements(0);
        setErrorMessage(getApiErrorMessage(error, 'No se pudo cargar el histórico solicitado.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, filters, page, size, refreshTick]);

  const summary = useMemo(() => {
    const marginAlerts = rows.filter((row) => {
      if (activeTab !== 'costs') return false;
      return row.newAverageCost && row.newLastCost && Number(row.newAverageCost) > Number(row.newLastCost);
    }).length;

    return {
      totalRows: totalElements,
      visibleRows: rows.length,
      marginAlerts,
    };
  }, [activeTab, rows, totalElements]);

  const reasonOptions = activeTab === 'costs' ? COST_REASON_OPTIONS : PRICE_REASON_OPTIONS;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters(emptyFilters);
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
    setFilters((prev) => ({ ...prev, reason: '', supplierId: prev.supplierId }));
  };

  const pageLabel = activeTab === 'costs' ? 'cambios de costo' : 'cambios de precio';
  const indexOfFirstItem = totalElements === 0 ? 0 : (page - 1) * size;
  const indexOfLastItem = Math.min(page * size, totalElements);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Trazabilidad comercial"
        title="Histórico"
        description="Consulta cómo han cambiado los costos y precios de venta de los productos a lo largo del tiempo."
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={RefreshCw} onClick={() => setRefreshTick((value) => value + 1)}>
              Actualizar
            </Button>
          </div>
        )}
        meta={(
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{totalElements} registros</Badge>
            {!canUseReports && <Badge tone="amber">Vista operativa</Badge>}
          </div>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader icon={HistoryIcon} title="Registros" description="Movimientos históricos del módulo activo." />
          <p className="mt-3 text-2xl font-black text-[var(--app-text)]">{summary.totalRows}</p>
        </Card>
        <Card>
          <CardHeader icon={Package} title="Resultados visibles" description="Filas mostradas en esta página." />
          <p className="mt-3 text-2xl font-black text-[var(--app-text)]">{summary.visibleRows}</p>
        </Card>
        <Card>
          <CardHeader icon={TrendingUp} title="Fuente de verdad" description="Compras actualiza costo; productos conserva estado vigente." />
          <p className="mt-3 text-sm font-bold text-[var(--app-text-soft)]">
            El módulo muestra cambios capturados por recepciones y ajustes manuales auditados.
          </p>
        </Card>
      </div>

      <div className="flex gap-1 border-b border-[var(--app-border)] overflow-x-auto">
        {HISTORY_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabChange(key)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
              activeTab === key
                ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader
          icon={Search}
          title="Filtros"
          description="Refina la consulta por producto, fecha, motivo y proveedor cuando aplique."
          action={(
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        />

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Producto</label>
            <select
              name="productId"
              value={filters.productId}
              onChange={handleFilterChange}
              disabled={bootLoading}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todos los productos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Proveedor</label>
            <select
              name="supplierId"
              value={filters.supplierId}
              onChange={handleFilterChange}
              disabled={bootLoading || activeTab !== 'costs' || !canUseSuppliers}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            >
              <option value="">Todos los proveedores</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Desde</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Hasta</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Motivo</label>
            <select
              name="reason"
              value={filters.reason}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-semibold text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todos los motivos</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="border-b border-[var(--app-border)] px-5 py-4">
          <h3 className="text-sm font-black text-[var(--app-text)]">
            {activeTab === 'costs' ? 'Historial de costos' : 'Historial de precios de venta'}
          </h3>
          <p className="mt-1 text-xs font-medium text-[var(--app-text-muted)]">
            {activeTab === 'costs'
              ? 'Cada recepción o ajuste manual queda trazado con costo anterior, nuevo y costo promedio.'
              : 'Cada cambio de precio registra márgenes antes y después, con su motivo y usuario.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {errorMessage}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--app-bg-subtle)] text-[10px] uppercase tracking-wider text-[var(--app-text-muted)]">
              {activeTab === 'costs' ? (
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Proveedor</th>
                  <th className="px-4 py-3 text-right">Costo anterior</th>
                  <th className="px-4 py-3 text-right">Costo nuevo</th>
                  <th className="px-4 py-3 text-right">Promedio nuevo</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-left">Motivo</th>
                  <th className="px-4 py-3 text-left">Usuario</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-right">Precio anterior</th>
                  <th className="px-4 py-3 text-right">Precio nuevo</th>
                  <th className="px-4 py-3 text-right">Markup antes</th>
                  <th className="px-4 py-3 text-right">Markup después</th>
                  <th className="px-4 py-3 text-left">Motivo</th>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Notas</th>
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'costs' ? 9 : 9} className="px-4 py-10 text-center text-sm font-semibold text-[var(--app-text-muted)]">
                    Cargando histórico...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'costs' ? 9 : 9} className="px-4 py-10 text-center text-sm font-semibold text-[var(--app-text-muted)]">
                    No hay registros para los filtros seleccionados.
                  </td>
                </tr>
              ) : activeTab === 'costs' ? (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]/35">
                    <td className="px-4 py-3 font-semibold text-[var(--app-text-soft)]">{formatDateTime(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[var(--app-text)]">{row.productName}</div>
                      <div className="text-xs text-[var(--app-text-muted)]">#{row.productId}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--app-text-soft)]">{row.supplierName || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMoney(row.previousLastCost)}</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--app-text)]">{formatMoney(row.newLastCost)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[var(--app-primary)]">{formatMoney(row.newAverageCost)}</td>
                    <td className="px-4 py-3 text-right text-[var(--app-text-soft)]">{Number(row.quantityReceived || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={row.reason === 'PURCHASE_RECEIPT' ? 'green' : 'blue'}>
                        {COST_REASON_LABELS[row.reason] || row.reason}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--app-text-soft)]">{row.userName || 'Sistema'}</td>
                  </tr>
                ))
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--app-border)] hover:bg-[var(--app-bg-subtle)]/35">
                    <td className="px-4 py-3 font-semibold text-[var(--app-text-soft)]">{formatDateTime(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[var(--app-text)]">{row.productName}</div>
                      <div className="text-xs text-[var(--app-text-muted)]">#{row.productId}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMoney(row.previousSalePrice)}</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--app-text)]">{formatMoney(row.newSalePrice)}</td>
                    <td className="px-4 py-3 text-right text-[var(--app-text-soft)]">{formatPercent(row.marginBeforePercent)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[var(--app-primary)]">{formatPercent(row.marginAfterPercent)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={row.reason === 'PURCHASE_MARGIN_ALERT' ? 'amber' : 'blue'}>
                        {PRICE_REASON_LABELS[row.reason] || row.reason}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--app-text-soft)]">{row.userName || 'Sistema'}</td>
                    <td className="px-4 py-3 text-[var(--app-text-soft)]">{row.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <BackendPagination
        currentPage={page}
        totalPages={totalPages}
        itemsPerPage={size}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalItems={totalElements}
        onPageChange={setPage}
        onItemsPerPageChange={(event) => {
          setSize(Number(event.target.value));
          setPage(1);
        }}
        label={pageLabel}
      />
    </div>
  );
};

export default History;
