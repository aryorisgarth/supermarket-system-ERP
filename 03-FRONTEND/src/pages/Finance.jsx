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
        title="Módulo Financiero"
        description="Gestiona métodos de cobro, conciliaciones y el flujo de caja corporativo de forma inteligente."
        actions={
          <Button icon={Plus} onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/30">
            Nueva Cuenta Bancaria
          </Button>
        }
        meta={
          <div className="flex items-center gap-2">
            <Badge tone="blue" className="px-3 shadow-sm">{accounts.length} Cuentas</Badge>
            <Badge tone="blue" className="px-3 shadow-sm">
              {summary.overdueCount > 0 ? `${summary.overdueCount} Atrasos` : 'Al día'}
            </Badge>
          </div>
        }
      />

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {[
          { id: 'overview', label: 'Resumen', icon: Landmark },
          { id: 'accounts', label: 'Cuentas y Bancos', icon: Building2 },
          { id: 'conciliation', label: 'Conciliación', icon: ArrowRightLeft },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all relative outline-none ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'animate-pulse' : ''} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
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
                <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-black">
                      !
                    </span>
                    Hay {summary.overdueCount} transacción(es) pendientes con fecha esperada de liquidación vencida.
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('conciliation')}>Ver Detalles</Button>
                </div>
              )}

              <PaymentGatewaysPanel />
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all duration-500" />
                  <CardHeader icon={Landmark} title="Capital Flotante" description="Neto pendiente de depósito a tus cuentas bancarias." />
                  <div className="p-5 mt-2">
                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tabular-nums tracking-tight">
                      {money(summary.pendingNet)}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      De {summary.pending.length} transacciones procesadas
                    </p>
                  </div>
                </Card>
                <Card className="shadow-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all duration-500" />
                  <CardHeader icon={Wallet} title="Capital Liquidado" description="Dinero que ya ingresó exitosamente a tus cuentas." />
                  <div className="p-5 mt-2">
                    <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {money(summary.settledNet)}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Bruto procesado: {money(summary.gross)}
                    </p>
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
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
                    <Building2 className="mx-auto mb-4 text-slate-400 opacity-50" size={48} />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cuentas Bancarias</h3>
                    <p className="text-xs text-slate-500 mb-6">Vincula las cuentas empresariales a donde las pasarelas o clientes envían fondos.</p>
                    <Button onClick={openCreate} className="mx-auto" icon={Plus}>Vincular Nueva Cuenta</Button>
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
