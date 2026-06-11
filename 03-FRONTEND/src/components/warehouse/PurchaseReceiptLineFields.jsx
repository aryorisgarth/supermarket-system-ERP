const PurchaseReceiptLineFields = ({
  line,
  onChange,
  compact = false,
}) => {
  const labelClass = 'text-[10px] font-black uppercase text-[var(--app-text-muted)]';
  const gridClass = compact
    ? 'mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'
    : 'mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4';

  return (
    <div className={gridClass}>
      <label className="space-y-1">
        <span className={labelClass}>Cant. aceptada</span>
        <input
          type="number"
          min="0"
          max={line.pending}
          step="1"
          className="ui-input w-full"
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
          className="ui-input w-full"
          value={line.quantityRejected}
          onChange={(event) => onChange('quantityRejected', event.target.value)}
        />
      </label>
      <label className="space-y-1">
        <span className={labelClass}>
          Código de lote {line.requiresBatch && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </span>
        <input
          className={`ui-input w-full font-mono text-xs ${line.requiresBatch && !line.batchCode ? 'border-amber-400 focus:border-amber-500' : ''}`}
          placeholder={line.requiresBatch ? 'Lote obligatorio' : 'Lote opcional'}
          value={line.batchCode}
          onChange={(event) => onChange('batchCode', event.target.value)}
        />
      </label>
      <label className="space-y-1">
        <span className={labelClass}>
          Vencimiento {line.requiresExpiration && <span className="text-red-500 font-bold ml-0.5">*</span>}
        </span>
        <input
          type="date"
          className={`ui-input w-full ${line.requiresExpiration && !line.expirationDate ? 'border-amber-400 focus:border-amber-500' : ''}`}
          value={line.expirationDate}
          onChange={(event) => onChange('expirationDate', event.target.value)}
        />
      </label>
      <label className="space-y-1">
        <span className={labelClass}>Zona bodega</span>
        <input
          className="ui-input w-full"
          placeholder="Ej. A-01, Frío-2"
          value={line.warehouseZone}
          onChange={(event) => onChange('warehouseZone', event.target.value)}
        />
      </label>
      <label className={`space-y-1 ${compact ? 'sm:col-span-2 lg:col-span-3' : 'md:col-span-2 xl:col-span-3'}`}>
        <span className={labelClass}>Notas QC</span>
        <input
          className="ui-input w-full"
          placeholder="Empaque dañado, temperatura, observaciones..."
          value={line.qcNotes}
          onChange={(event) => onChange('qcNotes', event.target.value)}
        />
      </label>
    </div>
  );
};

export default PurchaseReceiptLineFields;
