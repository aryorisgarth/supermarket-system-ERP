import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, RefreshCw, Send, Loader2, Edit } from 'lucide-react';
import LocationService from '../../services/LocationService';
import Swal from 'sweetalert2';

const ProductLocationsSection = ({ product, onStockChanged }) => {
  const [locStocks, setLocStocks] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const [fromLocId, setFromLocId] = useState('');
  const [toLocId, setToLocId] = useState('');
  const [qty, setQty] = useState('');

  const loadData = useCallback(async () => {
    if (!product?.id) return;
    setLoading(true);
    try {
      const [stocks, locs] = await Promise.all([
        LocationService.getProductLocations(product.id),
        LocationService.getAll()
      ]);
      setLocStocks(stocks || []);
      setAllLocations(locs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!fromLocId || !toLocId || !qty || parseFloat(qty) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor complete todos los campos correctamente.', confirmButtonColor: '#ef4444' });
      return;
    }
    setTransferring(true);
    try {
      await LocationService.transferStock(product.id, fromLocId, toLocId, parseFloat(qty));
      setShowTransferForm(false);
      setQty('');
      await loadData();
      if (onStockChanged) onStockChanged();
      Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true }).fire({
        icon: 'success',
        title: 'Traspaso realizado con éxito'
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'No se pudo realizar el traspaso.', confirmButtonColor: '#ef4444' });
    } finally {
      setTransferring(false);
    }
  };

  const handleUpdateDirectStock = async (locStock) => {
    const { value: newStock } = await Swal.fire({
      title: 'Ajustar stock de ubicación',
      text: `Ingresa el nuevo stock para la ubicación: ${locStock.locationCode}`,
      input: 'number',
      inputLabel: 'Cantidad de stock',
      inputValue: locStock.stock,
      showCancelButton: true,
      confirmButtonColor: '#0F4C81',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || isNaN(value)) {
          return 'Debes ingresar un número válido';
        }
      }
    });

    if (newStock !== undefined) {
      try {
        await LocationService.updateProductLocationStock(product.id, locStock.locationId, parseFloat(newStock));
        await loadData();
        if (onStockChanged) onStockChanged();
        Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true }).fire({
          icon: 'success',
          title: 'Stock ajustado con éxito'
        });
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo ajustar el stock.', confirmButtonColor: '#ef4444' });
      }
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-1">
            <MapPin size={12} /> Stock por Ubicación Física
          </h4>
          <p className="text-[9px] font-medium text-[var(--app-text-muted)]">Control de existencias distribuidas en góndolas o almacenes.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            className="p-1.5 hover:bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-lg text-[var(--app-text-soft)]"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setShowTransferForm(!showTransferForm)}
            className="text-[10px] font-black uppercase text-[var(--app-primary)] flex items-center gap-1 px-2.5 py-1.5 border border-[var(--app-primary)]/20 hover:bg-[var(--app-primary-soft)]/20 rounded-xl transition-all"
          >
            <Send size={10} /> Traspasar
          </button>
        </div>
      </div>

      {showTransferForm && (
        <form onSubmit={handleTransfer} className="p-3 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-[8px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mb-1">Origen</label>
              <select
                value={fromLocId}
                onChange={(e) => setFromLocId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs font-bold text-[var(--app-text)]"
                required
              >
                <option value="">Seleccione origen</option>
                {locStocks.map(l => (
                  <option key={l.locationId} value={l.locationId}>{l.locationCode} ({l.stock} u.)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mb-1">Destino</label>
              <select
                value={toLocId}
                onChange={(e) => setToLocId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs font-bold text-[var(--app-text)]"
                required
              >
                <option value="">Seleccione destino</option>
                {allLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.locationCode} ({l.isPisoVenta ? 'Exhibición' : 'Bodega'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mb-1">Cantidad</label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Cantidad"
                className="w-full px-2.5 py-1.5 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-lg text-xs font-bold text-[var(--app-text)]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowTransferForm(false)}
              className="px-2.5 py-1 bg-[var(--app-surface)] text-[var(--app-text-soft)] border border-[var(--app-border)] rounded-lg text-[10px] font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={transferring}
              className="px-3 py-1 bg-[var(--app-primary)] text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
            >
              {transferring ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
              Confirmar
            </button>
          </div>
        </form>
      )}

      <div className="bg-[var(--app-surface)] rounded-xl border border-[var(--app-border)] overflow-hidden">
        <table className="w-full text-left text-[10px]">
          <thead>
            <tr className="bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] font-bold border-b border-[var(--app-border)] uppercase">
              <th className="px-3 py-2">Ubicación</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Detalle físico</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--app-border)] font-medium text-[var(--app-text)]">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-3 py-4 text-center text-[var(--app-text-muted)]">
                  Cargando ubicaciones...
                </td>
              </tr>
            ) : locStocks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-3 py-4 text-center text-[var(--app-text-muted)]">
                  No hay stock asignado a ninguna ubicación física.
                </td>
              </tr>
            ) : (
              locStocks.map(ls => (
                <tr key={ls.id} className="hover:bg-[var(--app-bg-subtle)]/30">
                  <td className="px-3 py-2 font-bold">{ls.locationCode}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${ls.isPisoVenta ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                      {ls.isPisoVenta ? 'Exhibición' : 'Bodega'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[9px] text-[var(--app-text-muted)]">
                    {ls.warehouse}{ls.aisle ? ` / P. ${ls.aisle}` : ''}{ls.shelf ? ` / E. ${ls.shelf}` : ''}{ls.level ? ` / N. ${ls.level}` : ''}
                  </td>
                  <td className="px-3 py-2 font-black">{ls.stock}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleUpdateDirectStock(ls)}
                      className="p-1 hover:bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded text-[var(--app-text-soft)] hover:text-[var(--app-primary)]"
                    >
                      <Edit size={10} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductLocationsSection;
