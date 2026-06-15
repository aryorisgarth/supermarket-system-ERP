import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  CreditCard,
  Power,
  RefreshCw,
  ShoppingCart,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useCashRegister } from '../context/CashRegisterContext';
import CashRegisterService from '../services/CashRegisterService';
import Card, { CardHeader } from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AuthService from '../services/AuthService';
import { formatMoney } from '../utils/formatMoney';

const money = formatMoney;

const StatCard = ({ title, value, icon: Icon, tone = 'blue' }) => {
  const toneClass = {
    blue: 'text-[var(--app-primary)] bg-[var(--app-primary-soft)]',
    green: 'text-[var(--app-success)] bg-[var(--app-success-soft)]',
    amber: 'text-[var(--app-warning)] bg-[var(--app-warning-soft)]',
  }[tone];

  return (
    <Card className="min-h-[120px]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="ui-eyebrow mb-2 text-[var(--app-text-muted)]">{title}</p>
          <h3 className="truncate text-2xl font-bold text-[var(--app-text)]">{value}</h3>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={21} />
        </span>
      </div>
    </Card>
  );
};

const CashierDashboard = () => {
  const user = AuthService.getCurrentUser();
  const {
    isOpen,
    loading,
    session,
    syncSessionFromServer,
    promptAndOpenSession,
  } = useCashRegister();

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!isOpen) {
      setSummary(null);
      return;
    }
    setSummaryLoading(true);
    try {
      const data = await CashRegisterService.getCurrentSummary();
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    syncSessionFromServer();
  }, [syncSessionFromServer]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary, isOpen, session?.id]);

  const handleCloseShift = async () => {
    let preview = null;
    try {
      preview = await CashRegisterService.getCurrentSummary();
    } catch (error) {
      console.error(error);
    }

    const { value: formValues } = await Swal.fire({
      title: 'Cierre de turno',
      html:
        `<div style="text-align:left;font-size:12px;margin-bottom:8px">
          <b>Efectivo esperado:</b> ${money(preview?.expectedCash)}<br/>
          <b>Tarjeta esperada:</b> ${money(preview?.expectedCard)}<br/>
          <b>Transferencia esperada:</b> ${money(preview?.expectedTransfer)}
        </div>` +
        '<input id="swal-cash" class="swal2-input" placeholder="Efectivo contado">' +
        '<input id="swal-card" class="swal2-input" placeholder="Tarjeta contada">' +
        '<input id="swal-transfer" class="swal2-input" placeholder="Transferencia contada">' +
        '<textarea id="swal-notes" class="swal2-textarea" placeholder="Notas del turno"></textarea>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cerrar caja',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const actualClosingBalance = document.getElementById('swal-cash').value;
        const countedCard = document.getElementById('swal-card').value || 0;
        const countedTransfer = document.getElementById('swal-transfer').value || 0;
        const notes = document.getElementById('swal-notes').value;
        if (actualClosingBalance === '' || Number(actualClosingBalance) < 0) {
          Swal.showValidationMessage('Ingresa el efectivo contado');
          return false;
        }
        return {
          actualClosingBalance: parseFloat(actualClosingBalance),
          countedCard: parseFloat(countedCard),
          countedTransfer: parseFloat(countedTransfer),
          notes,
        };
      },
    });

    if (!formValues) return;

    try {
      const closed = await CashRegisterService.closeSessionDetailed(formValues);
      await syncSessionFromServer();
      setSummary(null);
      const diff = Number(closed.difference || 0);
      await Swal.fire({
        icon: diff === 0 ? 'success' : 'warning',
        title: 'Turno cerrado',
        text: diff === 0 ? 'Caja cuadrada.' : `Diferencia en efectivo: ${money(diff)}`,
      });
    } catch (error) {
      Swal.fire('Error', error?.response?.data?.message || error?.message || 'No se pudo cerrar la caja', 'error');
    }
  };

  const handleRefresh = async () => {
    await syncSessionFromServer();
    await loadSummary();
  };

  const busy = loading || summaryLoading;

  const isStaleSession = session?.openedAt ? (() => {
    const openedDate = new Date(session.openedAt);
    openedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return openedDate < today;
  })() : false;

  return (
    <div>
      <PageHeader
        eyebrow="Punto de venta"
        title={`Hola, ${user?.fullName || 'Cajero'}`}
        description="Gestiona tu turno de caja antes de facturar."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={handleRefresh} disabled={busy}>
            Actualizar
          </Button>
        }
        meta={
          <Badge tone={isOpen ? 'green' : 'amber'}>{isOpen ? 'Turno abierto' : 'Sin turno activo'}</Badge>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] animate-pulse rounded-2xl bg-[var(--app-bg-subtle)]" />
          ))}
        </div>
      ) : !isOpen ? (
        <Card className="max-w-xl mx-auto text-center py-12">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-warning-soft)] text-[var(--app-warning)]">
            <Power size={28} />
          </div>
          <h2 className="text-xl font-bold text-[var(--app-text)]">Caja cerrada</h2>
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            Abre tu turno con el fondo inicial en efectivo para habilitar la facturación.
          </p>
          <Button className="mt-6" icon={Wallet} onClick={promptAndOpenSession}>
            Abrir turno de caja
          </Button>
        </Card>
      ) : (
        <>
          {isStaleSession && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-4 items-start">
              <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-red-800">Cierre de Caja Pendiente</h3>
                <p className="text-sm text-red-700 mt-1">
                  Tu turno actual fue abierto en un día anterior al actual y <strong>no puedes facturar</strong> hasta que lo cierres. Por favor, verifica el efectivo físico con el resumen mostrado y cierra este turno inmediatamente.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Fondo inicial"
              value={money(session?.openingBalance)}
              icon={Wallet}
              tone="blue"
            />
            <StatCard
              title="Ventas en efectivo"
              value={money(summary?.cashSales)}
              icon={Banknote}
              tone="green"
            />
            <StatCard
              title="Ventas con tarjeta"
              value={money(summary?.cardSales)}
              icon={CreditCard}
              tone="amber"
            />
            <StatCard
              title="Efectivo esperado en caja"
              value={money(summary?.expectedCash)}
              icon={Banknote}
              tone="green"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                icon={ShoppingCart}
                title="Acciones del turno"
                description="Cuando tu caja esté abierta, puedes registrar ventas en el terminal POS."
              />
              <div className="flex flex-wrap gap-3">
                {!isStaleSession && (
                  <Link to="/facturacion">
                    <Button icon={ShoppingCart}>Ir a facturar</Button>
                  </Link>
                )}
                <Button variant={isStaleSession ? "primary" : "secondary"} icon={Power} onClick={handleCloseShift}>
                  Cerrar turno
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader
                icon={Banknote}
                title="Resumen rápido"
                description="Movimientos del turno actual."
              />
              <ul className="space-y-2 text-sm text-[var(--app-text-soft)]">
                <li className="flex justify-between">
                  <span>Transferencias</span>
                  <span className="font-bold">{money(summary?.transferSales)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Cambio entregado</span>
                  <span className="font-bold">{money(summary?.changeAmount)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Devoluciones</span>
                  <span className="font-bold">{money(summary?.refunds)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Ingresos manuales</span>
                  <span className="font-bold">{money(summary?.manualCashIn)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Retiros manuales</span>
                  <span className="font-bold">{money(summary?.manualCashOut)}</span>
                </li>
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default CashierDashboard;
