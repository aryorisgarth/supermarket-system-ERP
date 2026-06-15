import { useMemo } from 'react';

const PurchaseReceiptLineFields = ({
  line,
  locations = [],
  onChange,
  compact = false,
}) => {
  const labelClass = 'text-[10px] font-bold uppercase text-[var(--app-text-muted)]';
  const gridClass = compact
    ? 'mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'
    : 'mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4';

  const warehouseLocations = locations.filter(loc => !loc.isPisoVenta);

  
  const today = new Date().toISOString().split('T')[0];
  const isExpiredOrImmediate = line.expirationDate && line.expirationDate <= today;
  
  const isNearExpiry = useMemo(() => {
    if (!line.expirationDate) return false;
    const exp = new Date(line.expirationDate);
    const curr = new Date();
    const diffTime = exp - curr;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 15;
  }, [line.expirationDate]);

  return (
    <div className={gridClass}>
      <label className="space-y-1">
        <span className={labelClass}>Cant. aceptada</span>
        <input
          type="number"
          min="0"
          max={line.pending}
          step="1"
          className="ui-input w-full font-bold text-xs"
          value={line.quantityReceived}
          onChange={(event) => onChange('quantityReceived', event.target.value)}
        />
      </label>
      <label className="space-y-1">
        <span className={labelClass}>Cant. rechazada (QC)</span>
        <input
          type="number"
          min="0"
          step="1"
          className="ui-input w-full font-bold text-xs"
          value={line.quantityRejected}
          onChange={(event) => onChange('quantityRejected', event.target.value)}
        />
      </label>
      <label className="space-y-1">
        <span className={labelClass}>
          Código de lote {line.requiresBatch && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </span>
        <input
          className={`ui-input w-full font-mono text-xs font-bold ${line.requiresBatch && !line.batchCode ? 'border-amber-400 focus:border-amber-500' : ''}`}
          placeholder={line.requiresBatch ? 'Lote obligatorio' : 'Lote opcional'}
          value={line.batchCode}
          onChange={(event) => onChange('batchCode', event.target.value)}
        />
      </label>
      <label className="space-y-1 relative pb-3">
        <span className={labelClass}>
          Vencimiento {line.requiresExpiration && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </span>
        <input
          type="date"
          className={`ui-input w-full font-bold text-xs ${line.requiresExpiration && !line.expirationDate ? 'border-amber-400 focus:border-amber-500' : ''} ${isExpiredOrImmediate ? 'border-red-500 focus:border-red-650' : ''} ${isNearExpiry ? 'border-amber-500' : ''}`}
          value={line.expirationDate}
          onChange={(event) => onChange('expirationDate', event.target.value)}
        />
        {isExpiredOrImmediate && (
          <span className="absolute left-0 bottom-0 text-[8px] text-red-500 font-bold leading-none">
            ⚠️ ¡Fecha vencida o inválida!
          </span>
        )}
        {isNearExpiry && !isExpiredOrImmediate && (
          <span className="absolute left-0 bottom-0 text-[8px] text-amber-500 font-bold leading-none">
            ⚠️ Vence pronto (&lt; 15 días)
          </span>
        )}
      </label>
      <label className="space-y-1">
        <span className={labelClass}>Ubicación Bodega</span>
        <select
          className="ui-input w-full ui-select cursor-pointer font-bold text-xs"
          value={line.warehouseZone || ''}
          onChange={(event) => onChange('warehouseZone', event.target.value)}
        >
          <option value="">Seleccione ubicación...</option>
          {warehouseLocations.map(loc => (
            <option key={loc.id} value={loc.locationCode}>
              {loc.locationCode} - {loc.warehouse} ({loc.aisle ? `Pasillo ${loc.aisle}` : 'General'})
            </option>
          ))}
        </select>
      </label>
      <label className={`space-y-1 ${compact ? 'sm:col-span-2 lg:col-span-3' : 'md:col-span-2 xl:col-span-3'}`}>
        <span className={labelClass}>Notas QC</span>
        <div className="flex gap-2">
          <input
            className="ui-input flex-1 font-semibold text-xs"
            placeholder="Observaciones de control de calidad..."
            value={line.qcNotes}
            onChange={(event) => onChange('qcNotes', event.target.value)}
          />
          {line.quantityRejected > 0 && (
            <select
              className="ui-input ui-select cursor-pointer w-40 text-xs font-bold shrink-0"
              onChange={(e) => {
                if (e.target.value) {
                  const currentNotes = line.qcNotes ? line.qcNotes + ", " : "";
                  onChange('qcNotes', currentNotes + e.target.value);
                }
              }}
            >
              <option value="">Motivo de rechazo...</option>
              <option value="Empaque roto / dañado">Empaque roto</option>
              <option value="Fecha vencida">Fecha vencida</option>
              <option value="Mal estado de conservación">Mal estado</option>
              <option value="Diferencia de peso">Diferencia peso</option>
              <option value="Producto incorrecto">Erróneo</option>
            </select>
          )}
        </div>
      </label>
    </div>
  );
};

export default PurchaseReceiptLineFields;
