import React, { useEffect, useMemo, useState } from 'react';
import { Landmark, Loader2, Plus, Wallet, Building2, FileText, ArrowRightLeft } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('overview'); // overview | accounts | conciliation

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
    setActiveTab('accounts');
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
    setActiveTab('accounts');
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
        title="Módulo financiero"
        description="Cuentas bancarias, pasarelas (Stripe) y conciliación de cobros con tarjeta del POS."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nueva cuenta bancaria
          </Button>
        }
        meta={
          <div className="flex items-center gap-2">
            <Badge tone="blue" className="px-3">{accounts.length} cuentas</Badge>
            <Badge tone={summary.overdueCount > 0 ? 'amber' : 'blue'} className="px-3">
              {summary.overdueCount > 0 ? `${summary.overdueCount} atrasos` : 'Al día'}
            </Badge>
          </div>
        }
      />

      <div className="ui-tabs-scroll flex gap-1 border-b border-[var(--app-border)]">
        {[
          { id: 'overview', label: 'Resumen', icon: Landmark },
          { id: 'accounts', label: 'Cuentas', icon: Building2 },
          { id: 'conciliation', label: 'Conciliación (Stripe)', icon: ArrowRightLeft },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-primary-soft)]/30'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-subtle)]'
            }`}
          >
            <tab.icon size={14} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
          <Loader2 className="animate-spin text-[var(--app-primary)]" size={36} />
          <p className="font-bold text-xs uppercase tracking-widest">Sincronizando estados financieros...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FinanceMetrics summary={summary} transactionsCount={transactions.length} money={money} />
              
              {summary.overdueCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-900">
                  <span>Hay {summary.overdueCount} transacción(es) pendientes con fecha de liquidación vencida.</span>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('conciliation')}>
                    Ver conciliación
                  </Button>
                </div>
              )}

              <PaymentGatewaysPanel />

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border border-[var(--app-border)] bg-[var(--app-surface)]">
                  <CardHeader icon={Landmark} title="Capital flotante" description="Neto pendiente de depósito (incluye Stripe)." />
                  <div className="mt-2 p-2">
                    <p className="text-3xl font-bold tabular-nums text-[var(--app-primary)]">{money(summary.pendingNet)}</p>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">{summary.pending.length} transacciones</p>
                  </div>
                </Card>
                <Card className="border border-[var(--app-border)] bg-[var(--app-surface)]">
                  <CardHeader icon={Wallet} title="Capital liquidado" description="Ya ingresó a tus cuentas bancarias." />
                  <div className="mt-2 p-2">
                    <p className="text-3xl font-bold tabular-nums text-[var(--app-text)]">{money(summary.settledNet)}</p>
                    <p className="mt-1 text-xs text-[var(--app-text-muted)]">Bruto: {money(summary.gross)}</p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="grid gap-6 xl:grid-cols-[400px_1fr] animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                {showForm ? (
                  <PaymentAccountForm
                    form={form}
                    setForm={setForm}
                    onSubmit={submit}
                    onCancel={() => setShowForm(false)}
                    editing={editing}
                    saving={saving}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 p-8 text-center">
                    <Building2 className="mx-auto mb-4 text-[var(--app-text-muted)] opacity-50" size={40} />
                    <h3 className="mb-2 text-sm font-bold text-[var(--app-text)]">Cuentas bancarias</h3>
                    <p className="mb-6 text-xs text-[var(--app-text-muted)]">
                      Vincula las cuentas donde liquidas los cobros de Stripe y otras pasarelas.
                    </p>
                    <Button onClick={openCreate} className="mx-auto" icon={Plus}>
                      Vincular cuenta
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <PaymentAccountsGrid accounts={accounts} onEdit={openEdit} onDelete={remove} />
              </div>
            </div>
          )}

          {/* TAB: CONCILIATION */}
          {activeTab === 'conciliation' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <SettlementConciliationTable
                transactions={transactions}
                accounts={accounts}
                onSettle={settleTransaction}
                onRefresh={loadData}
                settlingId={settlingId}
                money={money}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Finance;
