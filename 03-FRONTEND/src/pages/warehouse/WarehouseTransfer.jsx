import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Loader2, Package, Search, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import WarehouseFlowStrip from '../../components/warehouse/WarehouseFlowStrip';
import ProductService from '../../services/ProductService';
import LocationService from '../../services/LocationService';
import { getApiErrorMessage } from '../../utils/apiError';
import { isScaleEanBarcode, sanitizeScanCode } from '../../utils/pluProductUtils';
import { resolveProductByScanCode } from '../../utils/resolveProductScan';

const WarehouseTransfer = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [product, setProduct] = useState(null);
  const [locStocks, setLocStocks] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [loadingLocs, setLoadingLocs] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [fromLocId, setFromLocId] = useState('');
  const [toLocId, setToLocId] = useState('');
  const [qty, setQty] = useState('');

  const warehouseStocks = useMemo(
    () => locStocks.filter((l) => !l.isPisoVenta && Number(l.stock) > 0),
    [locStocks],
  );
  const floorLocations = useMemo(
    () => allLocations.filter((l) => l.isPisoVenta),
    [allLocations],
  );

  const loadProductLocations = useCallback(async (selected) => {
    if (!selected?.id) return;
    setLoadingLocs(true);
    try {
      const [stocks, locs] = await Promise.all([
        LocationService.getProductLocations(selected.id),
        LocationService.getAll(),
      ]);
      setLocStocks(stocks || []);
      setAllLocations(locs || []);
      setFromLocId('');
      setToLocId('');
      setQty('');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudieron cargar las ubicaciones.'), 'error');
    } finally {
      setLoadingLocs(false);
    }
  }, []);

  const handleSearch = async (event) => {
    event?.preventDefault?.();
    const term = sanitizeScanCode(query.trim());
    if (!term) return;

    setSearching(true);
    try {
      const isScaleLabel = isScaleEanBarcode(term) || /^20\d{11}$/.test(term);
      const { product: scannedProduct, scaleParsed, scannedCode } = await resolveProductByScanCode(term);

      let found = [];
      if (scannedProduct) {
        found = [scannedProduct];
      } else if (!isScaleLabel) {
        const data = await ProductService.search(term);
        found = Array.isArray(data) ? data : data?.content || [];
      }

      setResults(found.slice(0, 12));
      if (found.length === 1) {
        setProduct(found[0]);
        if (scaleParsed?.weight != null) {
          setQty(String(scaleParsed.weight));
        }
        await loadProductLocations(found[0]);
      } else {
        setProduct(null);
        setLocStocks([]);
        if (found.length === 0) {
          const shown = scannedCode || term;
          const detail = scaleParsed
            ? `Etiqueta de balanza (${shown}): PLU ${scaleParsed.plu}, peso ${scaleParsed.weight}. No hay producto activo con ese PLU en el servidor.`
            : isScaleLabel
              ? `Código de balanza (${shown}) detectado, pero no se pudo leer el PLU. Revise Configuración de Balanza (prefijo 20, PLU 5, peso 5).`
              : `No se encontró producto por código o nombre para "${shown}".`;
          Swal.fire({ icon: 'warning', title: 'No Encontrado', text: detail });
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo buscar el producto.'), 'error');
    } finally {
      setSearching(false);
    }
  };

  const selectProduct = async (item) => {
    setProduct(item);
    setResults([]);
    setQuery(item.name || item.barcode || '');
    await loadProductLocations(item);
  };

  useEffect(() => {
    if (!fromLocId && warehouseStocks.length === 1) {
      setFromLocId(String(warehouseStocks[0].locationId));
    }
  }, [fromLocId, warehouseStocks]);

  useEffect(() => {
    if (!toLocId && floorLocations.length === 1) {
      setToLocId(String(floorLocations[0].id));
    }
  }, [toLocId, floorLocations]);

  const handleTransfer = async (event) => {
    event.preventDefault();
    if (!product?.id || !fromLocId || !toLocId || !qty || Number(qty) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Selecciona origen (bodega), destino (piso) y una cantidad válida.',
      });
      return;
    }
    if (String(fromLocId) === String(toLocId)) {
      Swal.fire({ icon: 'warning', title: 'Origen y destino iguales', text: 'Elige ubicaciones distintas.' });
      return;
    }

    setTransferring(true);
    try {
      await LocationService.transferStock(product.id, fromLocId, toLocId, Number(qty));
      await loadProductLocations(product);
      setQty('');
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
      }).fire({
        icon: 'success',
        title: 'Mercadería trasladada a piso de venta',
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo realizar el traslado.'), 'error');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Bodega"
        title="Traslado a piso de venta"
        description="Mueve mercadería de ubicaciones de bodega hacia exhibición. El stock total no cambia: solo cambia dónde está disponible para el POS."
        meta={<Badge tone="blue">Bodega → Piso</Badge>}
      />

      <WarehouseFlowStrip activeStep={3} />

      <Card>
        <CardHeader
          icon={Search}
          title="Buscar producto"
          description="Escanea el código de barras o escribe el nombre."
        />
        <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Código o nombre del producto..."
            className="ui-input flex-1 text-sm font-semibold"
          />
          <Button type="submit" icon={Search} loading={searching}>
            Buscar
          </Button>
        </form>

        {results.length > 1 && (
          <div className="mt-3 space-y-1.5">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectProduct(item)}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-left hover:border-[var(--app-primary)]/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-[var(--app-text)]">{item.name}</span>
                  <span className="font-mono text-[10px] text-[var(--app-text-muted)]">{item.barcode}</span>
                </span>
                <span className="text-[10px] font-bold text-[var(--app-text-muted)]">
                  Stock {item.currentStock ?? '—'}
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {product && (
        <Card>
          <CardHeader
            icon={Package}
            title={product.name}
            description={`Código: ${product.barcode || 'N/A'} · Stock total: ${product.currentStock ?? '—'}`}
          />

          {loadingLocs ? (
            <div className="py-10 text-center text-xs font-bold text-[var(--app-text-muted)]">
              <Loader2 className="mr-2 inline animate-spin" size={16} /> Cargando ubicaciones...
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">En bodega</p>
                  {warehouseStocks.length === 0 ? (
                    <p className="mt-2 text-xs font-semibold text-[var(--app-text-muted)]">Sin stock en ubicaciones de bodega.</p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {warehouseStocks.map((l) => (
                        <li key={l.locationId} className="flex justify-between text-xs font-bold">
                          <span>{l.locationCode}</span>
                          <span className="text-[var(--app-primary)]">{l.stock} u</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 p-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">En piso / exhibición</p>
                  {locStocks.filter((l) => l.isPisoVenta).length === 0 ? (
                    <p className="mt-2 text-xs font-semibold text-[var(--app-text-muted)]">Aún no hay stock en piso.</p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {locStocks.filter((l) => l.isPisoVenta).map((l) => (
                        <li key={l.locationId} className="flex justify-between text-xs font-bold">
                          <span>{l.locationCode}</span>
                          <span className="text-emerald-600">{l.stock} u</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <form onSubmit={handleTransfer} className="mt-5 space-y-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                  <ArrowRightLeft size={14} /> Nuevo traslado
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      Origen (bodega)
                    </label>
                    <select
                      value={fromLocId}
                      onChange={(e) => setFromLocId(e.target.value)}
                      className="ui-input ui-select w-full text-xs font-bold"
                      required
                    >
                      <option value="">Seleccione origen</option>
                      {warehouseStocks.map((l) => (
                        <option key={l.locationId} value={l.locationId}>
                          {l.locationCode} ({l.stock} u.)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      Destino (piso)
                    </label>
                    <select
                      value={toLocId}
                      onChange={(e) => setToLocId(e.target.value)}
                      className="ui-input ui-select w-full text-xs font-bold"
                      required
                    >
                      <option value="">Seleccione destino</option>
                      {floorLocations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.locationCode} — Exhibición
                        </option>
                      ))}
                    </select>
                    {floorLocations.length === 0 && (
                      <p className="mt-1 text-[10px] font-semibold text-amber-600">
                        No hay ubicaciones de piso. Créalas en Ubicaciones (isPisoVenta).
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="0.0001"
                      step="0.0001"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="ui-input w-full text-xs font-bold"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" icon={Send} loading={transferring} disabled={warehouseStocks.length === 0 || floorLocations.length === 0}>
                    Trasladar a piso
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default WarehouseTransfer;
