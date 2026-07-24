import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Tag,
  Search,
  Printer,
  Loader2,
  CheckSquare,
  Square,
  RefreshCw,
  Tags,
  LayoutGrid,
} from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../components/ui/PageHeader';
import ProductService from '../services/ProductService';
import LabelService from '../services/LabelService';
import { normalizeProductList } from '../utils/normalizeProduct';
import { getApiErrorMessage } from '../utils/apiError';
import { formatMoney } from '../utils/formatMoney';
import { generateProductLabelPDF, generateShelfStripPDF } from '../utils/pdf/labelPDF';
import { formatLocationLine } from '../utils/labelPrint';

const TABS = [
  { id: 'shelf', label: 'Flejes de góndola', icon: LayoutGrid },
  { id: 'today', label: 'Precios de hoy', icon: RefreshCw },
  { id: 'unit', label: 'Etiquetas unitarias', icon: Tags },
];

const Labels = () => {
  const [activeTab, setActiveTab] = useState('shelf');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [todayProducts, setTodayProducts] = useState([]);
  const [todayLoading, setTodayLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [unitCopies, setUnitCopies] = useState(1);

  const selectedCount = selectedIds.size;

  const loadTodayPriceChanges = useCallback(async () => {
    setTodayLoading(true);
    try {
      const data = await LabelService.getTodayPriceChanges();
      setTodayProducts(data || []);
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudieron cargar los cambios de precio.'), 'error');
    } finally {
      setTodayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'today') {
      loadTodayPriceChanges();
    }
  }, [activeTab, loadTodayPriceChanges]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await ProductService.search(searchTerm.trim());
        setSearchResults(normalizeProductList(results || []));
      } catch (error) {
        Swal.fire('Error', getApiErrorMessage(error, 'Error al buscar productos.'), 'error');
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleSelection = (product) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        setSelectedProducts((items) => items.filter((item) => item.id !== product.id));
      } else {
        next.add(product.id);
        setSelectedProducts((items) => [...items.filter((item) => item.id !== product.id), product]);
      }
      return next;
    });
  };

  const selectAllToday = () => {
    const ids = new Set(todayProducts.map((item) => item.productId));
    setSelectedIds(ids);
    setSelectedProducts(
      todayProducts.map((item) => ({
        id: item.productId,
        name: item.name,
        barcode: item.barcode,
        salePrice: item.salePrice,
      }))
    );
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedProducts([]);
  };

  const resolveLabelData = async (productIds) => {
    if (!productIds.length) {
      throw new Error('Selecciona al menos un producto.');
    }
    return LabelService.getShelfLabelData(productIds);
  };

  const handlePrintShelf = async (productIds = Array.from(selectedIds)) => {
    setPrinting(true);
    try {
      Swal.fire({
        title: 'Generando flejes...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const data = await resolveLabelData(productIds);
      generateShelfStripPDF(data);
      Swal.fire({
        icon: 'success',
        title: 'PDF generado',
        text: 'Los flejes de góndola están listos para imprimir.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, error.message || 'No se pudo generar el PDF.'), 'error');
    } finally {
      setPrinting(false);
    }
  };

  const handlePrintUnitLabels = async (productIds = Array.from(selectedIds)) => {
    setPrinting(true);
    try {
      Swal.fire({
        title: 'Generando etiquetas...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const data = await resolveLabelData(productIds);
      generateProductLabelPDF(data, unitCopies);
      Swal.fire({
        icon: 'success',
        title: 'PDF generado',
        text: 'Las etiquetas unitarias están listas para imprimir.',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, error.message || 'No se pudo generar el PDF.'), 'error');
    } finally {
      setPrinting(false);
    }
  };

  const visibleProducts = useMemo(() => {
    if (activeTab === 'today') {
      return todayProducts;
    }
    return searchResults;
  }, [activeTab, todayProducts, searchResults]);

  const renderProductRow = (product, useLabelDto = false) => {
    const id = useLabelDto ? product.productId : product.id;
    const isSelected = selectedIds.has(id);

    return (
      <button
        key={id}
        type="button"
        onClick={() =>
          toggleSelection(
            useLabelDto
              ? {
                  id: product.productId,
                  name: product.name,
                  barcode: product.barcode,
                  salePrice: product.salePrice,
                }
              : product
          )
        }
        className={`w-full rounded-2xl border p-4 text-left transition-all ${
          isSelected
            ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)]'
            : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-primary)]/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-[var(--app-primary)]">
            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[var(--app-text)]">{product.name}</p>
            <p className="mt-1 text-[10px] font-mono font-bold uppercase text-[var(--app-text-muted)]">
              {product.barcode}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--app-bg-subtle)] px-2 py-0.5 font-bold text-[var(--app-primary)]">
                {formatMoney(product.salePrice)}
              </span>
              {product.categoryName && (
                <span className="text-[var(--app-text-soft)]">{product.categoryName}</span>
              )}
            </div>
            {useLabelDto && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                {formatLocationLine(product.locations?.[0] || null)}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Tag}
        title="Etiquetas y Flejes"
        description="Impresión de flejes de góndola y etiquetas unitarias en PDF listo para imprimir."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--app-primary)] text-white shadow-lg shadow-primary/20'
                  : 'border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
          {activeTab !== 'today' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o código de barras..."
                className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] py-3 pl-10 pr-4 text-sm font-medium text-[var(--app-text)] outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20"
              />
            </div>
          )}

          {activeTab === 'today' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--app-primary)]/20 bg-[var(--app-primary-soft)] p-4">
              <div>
                <p className="text-sm font-bold text-[var(--app-text)]">Cambios de precio del día</p>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Productos cuyo precio de venta cambió hoy y necesitan nuevo fleje en góndola.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadTodayPriceChanges}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-bold uppercase tracking-wider"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={selectAllToday}
                  className="rounded-xl bg-[var(--app-primary)] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white"
                >
                  Seleccionar todos
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(searchLoading || todayLoading) && (
              <div className="flex items-center justify-center gap-2 py-10 text-[var(--app-text-muted)]">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-bold">Cargando productos...</span>
              </div>
            )}

            {!searchLoading && !todayLoading && visibleProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[var(--app-border)] py-12 text-center text-sm font-bold text-[var(--app-text-muted)]">
                {activeTab === 'today'
                  ? 'No hay cambios de precio registrados hoy.'
                  : 'Busca productos para agregarlos a la cola de impresión.'}
              </div>
            )}

            {!searchLoading &&
              !todayLoading &&
              visibleProducts.map((product) => renderProductRow(product, activeTab === 'today'))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-[var(--app-text)]">Cola de impresión</h3>
            <p className="text-xs text-[var(--app-text-muted)]">
              {selectedCount} producto{selectedCount === 1 ? '' : 's'} seleccionado{selectedCount === 1 ? '' : 's'}
            </p>
          </div>

          {selectedProducts.length > 0 ? (
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-2 text-xs"
                >
                  <p className="font-bold text-[var(--app-text)]">{product.name}</p>
                  <p className="text-[var(--app-text-muted)]">{formatMoney(product.salePrice)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--app-border)] px-4 py-8 text-center text-xs font-bold text-[var(--app-text-muted)]">
              Selecciona productos de la lista para imprimir.
            </div>
          )}

          {activeTab === 'unit' && (
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Copias por producto
              </span>
              <input
                type="number"
                min="1"
                max="500"
                value={unitCopies}
                onChange={(e) => setUnitCopies(e.target.value)}
                className="w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-4 py-3 text-sm font-bold"
              />
            </label>
          )}

          <div className="space-y-2">
            {(activeTab === 'shelf' || activeTab === 'today') && (
              <button
                type="button"
                disabled={printing || selectedCount === 0}
                onClick={() => handlePrintShelf()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--app-primary)] py-3.5 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50"
              >
                {printing ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                Imprimir flejes PDF
              </button>
            )}

            {activeTab === 'unit' && (
              <button
                type="button"
                disabled={printing || selectedCount === 0}
                onClick={() => handlePrintUnitLabels()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--app-primary)] py-3.5 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50"
              >
                {printing ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                Imprimir etiquetas PDF
              </button>
            )}

            <button
              type="button"
              onClick={clearSelection}
              disabled={selectedCount === 0}
              className="w-full rounded-2xl border border-[var(--app-border)] py-3 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] disabled:opacity-50"
            >
              Limpiar selección
            </button>
          </div>

          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 text-[11px] leading-relaxed text-[var(--app-text-soft)]">
            <p className="font-bold uppercase tracking-wide text-[var(--app-text)]">Formato MVP</p>
            <p className="mt-2">
              Flejes: 2×4 por hoja A4 con precio, barcode, ubicación y categoría. Etiquetas unitarias: 4×8 por hoja
              A4 con barcode y precio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Labels;
