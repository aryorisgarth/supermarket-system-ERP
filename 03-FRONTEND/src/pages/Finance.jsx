import React, { useEffect, useMemo, useState } from 'react';
import { Landmark, Loader2, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

import BillingService from '../services/BillingService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card, { CardHeader } from '../components/ui/Card';

import { formatMoney, getCurrencyCode } from '../utils/formatMoney';

import FinanceMetrics from '../components/finance/FinanceMetrics';
import PaymentGatewaysPanel from '../components/finance/PaymentGatewaysPanel';
import PaymentAccountsGrid from '../components/finance/PaymentAccountsGrid';
import PaymentAccountForm from '../components/finance/PaymentAccountForm';
import SettlementConciliationTable from '../components/finance/SettlementConciliationTable';

const emptyForm = {
  name: '',
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  accountType: 'MONETARIA',
  currency: getCurrencyCode(),
  taxId: '',
  gatewayProvider: 'MOCK',
  merchantId: '',
  terminalId: '',
  commissionPercentage: 3.5,
  settlementDays: 2,
  isDefault: true,
  isActive: true,
};

const money = (value, currency) =>
  currency
    ? `${currency} ${Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : formatMoney(value);

const Finance = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [settlingId, setSettlingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountData, transactionData] = await Promise.all([
        BillingService.getPaymentAccounts(),
        BillingService.getPaymentTransactions(),
      ]);
      setAccounts(accountData || []);
      setTransactions(transactionData || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar finanzas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, isDefault: accounts.length === 0 });
    setShowForm(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setForm({
      ...emptyForm,
      name: account.name || '',
      bankName: account.bankName || '',
      accountHolder: account.accountHolder || '',
      accountNumber: '',
      accountType: account.accountType || 'MONETARIA',
      currency: account.currency || getCurrencyCode(),
      taxId: account.taxId || '',
      gatewayProvider: account.gatewayProvider || 'MOCK',
      merchantId: account.merchantId || '',
      terminalId: account.terminalId || '',
      commissionPercentage: account.commissionPercentage ?? 0,
      settlementDays: account.settlementDays ?? 2,
      isDefault: account.isDefault,
      isActive: account.isActive,
    });
    setShowForm(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        commissionPercentage: Number(form.commissionPercentage || 0),
        settlementDays: Number(form.settlementDays || 0),
        accountNumber: form.accountNumber || '',
      };
      if (editing) {
        await BillingService.updatePaymentAccount(editing.id, payload);
      } else {
        await BillingService.createPaymentAccount(payload);
      }
      setShowForm(false);
      await loadData();
      Swal.fire({ icon: 'success', title: 'Cuenta guardada', timer: 1400, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', error?.message || 'No se pudo guardar la cuenta.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (account) => {
    const result = await Swal.fire({
      title: 'Eliminar cuenta',
      text: `Se eliminará ${account.name}. Si tiene transacciones asociadas, la base de datos puede impedirlo.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d14343',
    });
    if (!result.isConfirmed) return;
    try {
      await BillingService.deletePaymentAccount(account.id);
      await loadData();
    } catch {
      Swal.fire('No se pudo eliminar', 'La cuenta puede tener transacciones asociadas. Desactívala en su lugar.', 'error');
    }
  };

  const settleTransaction = async (tx) => {
    const result = await Swal.fire({
      title: 'Marcar como liquidada',
      html: `<p>Se registrará el depósito neto de <b>${money(tx.netAmount, tx.currency)}</b> para la venta <b>#${tx.saleId}</b>.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Liquidar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
    });
    if (!result.isConfirmed) return;

    try {
      setSettlingId(tx.id);
      await BillingService.settlePaymentTransaction(tx.id);
      await loadData();
      Swal.fire({ icon: 'success', title: 'Transacción liquidada', timer: 1400, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', error?.message || 'No se pudo liquidar la transacción.', 'error');
    } finally {
      setSettlingId(null);
    }
  };

  const summary = useMemo(() => {
    const pending = transactions.filter((tx) => tx.settlementStatus === 'PENDING');
    const settled = transactions.filter((tx) => tx.settlementStatus === 'SETTLED');
    const gross = transactions.reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
    const commissions = transactions.reduce((acc, tx) => acc + Number(tx.commissionAmount || 0), 0);
    const net = transactions.reduce((acc, tx) => acc + Number(tx.netAmount || tx.amount || 0), 0);
    const pendingNet = pending.reduce((acc, tx) => acc + Number(tx.netAmount || tx.amount || 0), 0);
    const settledNet = settled.reduce((acc, tx) => acc + Number(tx.netAmount || tx.amount || 0), 0);
    const overdue = pending.filter((tx) => {
      if (!tx.expectedSettlementDate) return false;
      return new Date(`${tx.expectedSettlementDate}T23:59:59`) < new Date();
    });

    return {
      pending,
      settled,
      gross,
      commissions,
      net,
      pendingNet,
      settledNet,
      overdueCount: overdue.length,
      commissionRate: gross > 0 ? (commissions / gross) * 100 : 0,
    };
  }, [transactions]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Gestión de Cuentas y Liquidaciones"
        description="Cuentas destino, pasarelas de pago (nacional/internacional) y liquidaciones T+N."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Vincular Cuenta
          </Button>
        }
        meta={<Badge tone="blue" className="px-3">{accounts.length} Entidades Configuradas</Badge>}
      />

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
          <Loader2 className="animate-spin text-[var(--app-primary)]" size={36} />
          <p className="font-bold text-xs uppercase tracking-widest">Sincronizando estados financieros...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <FinanceMetrics summary={summary} transactionsCount={transactions.length} money={money} />

          {summary.overdueCount > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Hay {summary.overdueCount} transacción(es) pendientes con fecha esperada de liquidación vencida. Revisa
              conciliación bancaria.
            </div>
          )}

          <PaymentGatewaysPanel />

          <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
            <div className="space-y-6">
              <Card className="shadow-enterprise-lg border-[var(--app-primary)]/10">
                <CardHeader icon={Landmark} title="Resumen de Liquidación" description="Estado consolidado de las cuentas destino." />
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-5 shadow-inner">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--app-text-muted)]">
                      Neto pendiente de depósito
                    </p>
                    <p className="mt-2 text-3xl font-bold text-[var(--app-primary)] tabular-nums">
                      {money(summary.pendingNet)}
                    </p>
                    <p className="mt-2 text-xs font-bold text-[var(--app-text-muted)]">
                      Neto total procesado: {money(summary.net)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-[var(--app-border)] p-4 bg-white dark:bg-[var(--app-surface-raised)]">
                      <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Cuentas Activas</p>
                      <p className="mt-1 text-2xl font-bold">{accounts.filter((a) => a.isActive).length}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--app-border)] p-4 bg-white dark:bg-[var(--app-surface-raised)]">
                      <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Movimientos</p>
                      <p className="mt-1 text-2xl font-bold">{transactions.length}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {showForm && (
                <PaymentAccountForm
                  form={form}
                  setForm={setForm}
                  onSubmit={submit}
                  onCancel={() => setShowForm(false)}
                  editing={editing}
                  saving={saving}
                />
              )}
            </div>

            <div className="space-y-8">
              <PaymentAccountsGrid accounts={accounts} onEdit={openEdit} onDelete={remove} />

              <SettlementConciliationTable
                transactions={transactions}
                accounts={accounts}
                onSettle={settleTransaction}
                onRefresh={loadData}
                settlingId={settlingId}
                money={money}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
