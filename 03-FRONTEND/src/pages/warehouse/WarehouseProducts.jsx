import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import BarcodeScanInput from '../../components/warehouse/BarcodeScanInput';
import useBarcodeScan from '../../hooks/useBarcodeScan';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const WarehouseProducts = () => {
  const [manualQuery, setManualQuery] = useState('');

  const {
    scanValue,
    setScanValue,
    scanning,
    lastScanned,
    handleScanKeyDown,
    lookupBarcode,
  } = useBarcodeScan({
    onNotFound: (code) => {
      Swal.fire({
        icon: 'info',
        title: 'No encontrado',
        text: `No hay producto con código "${code}".`,
        timer: 1800,
        showConfirmButton: false,
      });
    },
  });

  const searchManual = async (event) => {
    event.preventDefault();
    if (!manualQuery.trim()) return;
    await lookupBarcode(manualQuery.trim());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Bodega"
        title="Consulta de productos"
        description="Busca por código de barras o nombre. Solo lectura para verificación en bodega."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader icon={Package} title="Escaneo" description="Lector USB: escanee y presione Enter." />
          <div className="mt-4">
            <BarcodeScanInput
              value={scanValue}
              onChange={(event) => setScanValue(event.target.value)}
              onKeyDown={handleScanKeyDown}
              disabled={scanning}
            />
          </div>
        </Card>

        <Card>
          <CardHeader icon={Search} title="Búsqueda manual" description="Nombre o código parcial." />
          <form onSubmit={searchManual} className="mt-4 flex gap-2">
            <input
              className="ui-input flex-1"
              placeholder="Buscar producto..."
              value={manualQuery}
              onChange={(event) => setManualQuery(event.target.value)}
            />
            <button type="submit" className="ui-btn ui-btn-primary px-4">Buscar</button>
          </form>
        </Card>
      </div>

      {lastScanned && (
        <Card>
          <CardHeader icon={Package} title="Detalle del producto" />
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Nombre</p>
              <p className="font-bold text-[var(--app-text)]">{lastScanned.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Código</p>
              <p className="font-mono text-sm">{lastScanned.barcode}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Stock actual</p>
              <p className="font-bold text-[var(--app-primary)]">{lastScanned.currentStock}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Precio compra</p>
              <p className="font-bold">{money(lastScanned.purchasePrice)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Categoría</p>
              <p className="text-sm">{lastScanned.category?.name || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Proveedor</p>
              <p className="text-sm">{lastScanned.supplier?.companyName || lastScanned.supplier?.name || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Stock mínimo</p>
              <p className="text-sm">{lastScanned.minimumStock}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Estado</p>
              <p className="text-sm">{lastScanned.isActive !== false ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WarehouseProducts;
