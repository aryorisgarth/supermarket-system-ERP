import React from 'react';
import { Boxes, ArrowDownToLine, ArrowUpFromLine, AlertCircle } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';

const num = (value) => Number(value || 0);

const InventoryFlowAnalysis = ({
  entryUnits,
  entryCost,
  exitUnits,
  exitCost,
  adjustmentUnits,
  adjustmentMovements = [],
  netStockFlow,
  stockAlerts,
  lowRotationCount,
  inventoryMovements,
  movementLabel,
  money,
}) => {
  return (
    <Card>
      <CardHeader
        icon={Boxes}
        title="Análisis de Entradas y Salidas"
        description="Control de flujo de inventario: compras, ventas, devoluciones, ajustes y mermas."
      />
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <ArrowDownToLine size={18} />
            <p className="text-[10px] font-black uppercase tracking-wider">Entradas</p>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{entryUnits.toLocaleString()}</p>
          <p className="text-xs font-bold text-emerald-600">{money(entryCost)} costo estimado</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-rose-700">
            <ArrowUpFromLine size={18} />
            <p className="text-[10px] font-black uppercase tracking-wider">Salidas</p>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-700">{exitUnits.toLocaleString()}</p>
          <p className="text-xs font-bold text-rose-600">{money(exitCost)} costo estimado</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle size={18} />
            <p className="text-[10px] font-black uppercase tracking-wider">Ajustes</p>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-700">{adjustmentUnits.toLocaleString()}</p>
          <p className="text-xs font-bold text-amber-600">{adjustmentMovements.length} movimientos</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4">
        <h4 className="text-sm font-black text-[var(--app-text)]">Lectura ejecutiva</h4>
        <p className="mt-2 text-sm leading-6 text-[var(--app-text-soft)]">
          {netStockFlow >= 0
            ? `El inventario tuvo un flujo neto positivo de ${netStockFlow.toLocaleString()} unidades; se está reponiendo más de lo que sale.`
            : `El inventario tuvo un flujo neto negativo de ${Math.abs(netStockFlow).toLocaleString()} unidades; las salidas superan a las entradas y conviene revisar reposición.`}
          {' '}Se detectan {stockAlerts.length} productos en stock crítico y {lowRotationCount} productos con baja rotación.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="ui-table w-full min-w-[640px]">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th className="text-right">Cantidad</th>
              <th className="text-right">Costo total</th>
            </tr>
          </thead>
          <tbody>
            {inventoryMovements.slice(0, 8).map((movement, index) => (
              <tr key={`${movement.productName}-${movement.createdAt}-${index}`}>
                <td className="text-xs text-[var(--app-text-muted)]">{new Date(movement.createdAt).toLocaleDateString()}</td>
                <td className="font-bold text-[var(--app-text-soft)]">{movement.productName}</td>
                <td>
                  <span className="rounded-lg bg-[var(--app-primary-soft)] px-2 py-1 text-[10px] font-black uppercase text-[var(--app-primary)]">
                    {movementLabel[movement.movementType] || movement.movementType}
                  </span>
                </td>
                <td className="text-right font-black tabular-nums">{num(movement.quantity).toLocaleString()}</td>
                <td className="text-right font-bold tabular-nums">{money(movement.totalCost)}</td>
              </tr>
            ))}
            {inventoryMovements.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-xs font-black uppercase text-[var(--app-text-muted)]">
                  Sin movimientos de inventario
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default InventoryFlowAnalysis;
