import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  Filter,
  Landmark,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  WalletCards,
} from 'lucide-react';
import Swal from 'sweetalert2';
import BillingService from '../services/BillingService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardHeader } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatMoney, getCurrencyCode } from '../utils/formatMoney';
import { PAYMENT_GATEWAY_OPTIONS, getGatewayOption, getGatewayScopeLabel } from '../utils/paymentGateways';

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

const money = (value, currency) => (currency ? `${currency} ${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}` : formatMoney(value));

const Finance = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [search, setSearch] = useState('');
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

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesStatus = statusFilter === 'ALL' || tx.settlementStatus === statusFilter;
      const matchesAccount = accountFilter === 'ALL' || String(tx.paymentAccountId || '') === String(accountFilter);
      const matchesSearch =
        !term ||
        String(tx.saleId || '').includes(term) ||
        String(tx.externalReference || '').toLowerCase().includes(term) ||
        String(tx.paymentAccountName || '').toLowerCase().includes(term);
      return matchesStatus && matchesAccount && matchesSearch;
    });
  }, [transactions, statusFilter, accountFilter, search]);

  const StatBox = ({ title, value, icon: Icon, tone = 'blue', hint }) => {
    const toneClass = {
      blue: 'bg-[var(--app-primary-soft)] text-[var(--app-primary)]',
      green: 'bg-[var(--app-success-soft)] text-[var(--app-success)]',
      amber: 'bg-[var(--app-warning-soft)] text-[var(--app-warning)]',
      red: 'bg-[var(--app-danger-soft)] text-[var(--app-danger)]',
    }[tone];

    return (
      <Card className="min-h-[118px]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">{title}</p>
            <p className="mt-2 truncate text-2xl font-black text-[var(--app-text)] tabular-nums">{value}</p>
            {hint && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--app-text-muted)]">{hint}</p>}
          </div>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
            <Icon size={20} />
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Gestión de Cuentas y Liquidaciones"
        description="Cuentas destino, pasarelas de pago (nacional/internacional) y liquidaciones T+N."
        actions={<Button icon={Plus} onClick={openCreate}>Vincular Cuenta</Button>}
        meta={<Badge tone="blue" className="px-3">{accounts.length} Entidades Configuradas</Badge>}
      />

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
          <Loader2 className="animate-spin text-[var(--app-primary)]" size={36} />
          <p className="font-bold text-xs uppercase tracking-widest">Sincronizando estados financieros...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatBox title="Pendiente de depósito" value={money(summary.pendingNet)} icon={Landmark} tone="amber" hint={`${summary.pending.length} transacciones`} />
            <StatBox title="Liquidado" value={money(summary.settledNet)} icon={CheckCircle2} tone="green" hint={`${summary.settled.length} depósitos`} />
            <StatBox title="Comisiones" value={money(summary.commissions)} icon={CreditCard} tone="red" hint={`${summary.commissionRate.toFixed(2)}% promedio`} />
            <StatBox title="Volumen procesado" value={money(summary.gross)} icon={Banknote} tone="blue" hint={`${transactions.length} movimientos`} />
          </div>

          {summary.overdueCount > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Hay {summary.overdueCount} transacción(es) pendientes con fecha esperada de liquidación vencida. Revisa conciliación bancaria.
            </div>
          )}

          <Card className="border-[var(--app-primary)]/15 bg-[var(--app-primary-soft)]/20">
            <CardHeader
              icon={WalletCards}
              title="Pasarelas de pago"
              description="El POS autoriza tarjetas con la pasarela activa en application.yml (PAYMENT_GATEWAY_PROVIDER). Las cuentas aquí definen comisión y ciclo de depósito."
            />
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {PAYMENT_GATEWAY_OPTIONS.map((gateway) => (
                <div key={gateway.value} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black uppercase text-[var(--app-text)]">{gateway.label}</p>
                    <Badge tone={gateway.scope === 'NACIONAL' ? 'blue' : gateway.scope === 'INTERNACIONAL' ? 'amber' : 'neutral'}>
                      {getGatewayScopeLabel(gateway.scope)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[var(--app-text-muted)]">{gateway.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
          <div className="space-y-6">
            <Card className="shadow-enterprise-lg border-[var(--app-primary)]/10">
              <CardHeader icon={Landmark} title="Resumen de Liquidación" description="Estado consolidado de las cuentas destino." />
              <div className="grid gap-4">
                <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-5 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--app-text-muted)]">Neto pendiente de depósito</p>
                  <p className="mt-2 text-3xl font-black text-[var(--app-primary)] tabular-nums">{money(summary.pendingNet)}</p>
                  <p className="mt-2 text-xs font-bold text-[var(--app-text-muted)]">
                    Neto total procesado: {money(summary.net)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--app-border)] p-4 bg-white dark:bg-[var(--app-surface-raised)]">
                    <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Cuentas Activas</p>
                    <p className="mt-1 text-2xl font-black">{accounts.filter((a) => a.isActive).length}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--app-border)] p-4 bg-white dark:bg-[var(--app-surface-raised)]">
                    <p className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">Movimientos</p>
                    <p className="mt-1 text-2xl font-black">{transactions.length}</p>
                  </div>
                </div>
              </div>
            </Card>

            {showForm && (
              <Card className="animate-fade-in border-amber-200 dark:border-amber-900/30 shadow-xl">
                <CardHeader icon={WalletCards} title={editing ? 'Editar Parámetros' : 'Vincular Nueva Cuenta'} />
                <form onSubmit={submit} className="grid gap-4 mt-2">
                  {[
                    ['name', 'Alias de Identificación', 'Cuenta Principal BAC'],
                    ['bankName', 'Entidad Bancaria', 'Banco Industrial'],
                    ['accountHolder', 'Titular de la Cuenta', 'SuperNova S.A.'],
                    ['accountNumber', editing ? 'Nº Cuenta (Confirme para cambiar)' : 'Nº de Cuenta Completo', '000123456789'],
                    ['taxId', 'NIT / Registro Tributario', '1234567-8'],
                    ['merchantId', 'Merchant ID (MID)', 'MID-001'],
                    ['terminalId', 'Terminal ID (TID)', 'POS-01'],
                  ].map(([field, label, placeholder]) => (
                    <label key={field} className="ui-field">
                      <span className="ui-label">{label}</span>
                      <input
                        className="ui-input font-bold"
                        required={['name', 'bankName', 'accountHolder'].includes(field) || (!editing && field === 'accountNumber')}
                        placeholder={placeholder}
                        value={form[field]}
                        onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                      />
                    </label>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                    <label className="ui-field col-span-2">
                      <span className="ui-label">Pasarela / Adquirente</span>
                      <select
                        className="ui-input ui-select font-bold"
                        value={form.gatewayProvider}
                        onChange={(e) => setForm({ ...form, gatewayProvider: e.target.value })}
                      >
                        {PAYMENT_GATEWAY_OPTIONS.map((gateway) => (
                          <option key={gateway.value} value={gateway.value}>
                            {gateway.label} ({getGatewayScopeLabel(gateway.scope)})
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[10px] font-medium text-[var(--app-text-muted)]">
                        {getGatewayOption(form.gatewayProvider).description}
                      </p>
                    </label>
                    <label className="ui-field">
                      <span className="ui-label">Tipo Cuenta</span>
                      <select className="ui-input ui-select font-bold" value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
                        <option value="MONETARIA">Monetaria</option>
                        <option value="AHORRO">Ahorro</option>
                        <option value="CORRIENTE">Corriente</option>
                      </select>
                    </label>
                    <label className="ui-field">
                      <span className="ui-label">Divisa</span>
                      <input className="ui-input font-black" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} maxLength={3} />
                    </label>
                    <label className="ui-field">
                      <span className="ui-label">Comisión %</span>
                      <input type="number" step="0.01" className="ui-input font-bold" value={form.commissionPercentage} onChange={(e) => setForm({ ...form, commissionPercentage: e.target.value })} />
                    </label>
                    <label className="ui-field">
                      <span className="ui-label">Días Ciclo (T+)</span>
                      <input type="number" min="0" className="ui-input font-bold" value={form.settlementDays} onChange={(e) => setForm({ ...form, settlementDays: e.target.value })} />
                    </label>
                  </div>

                  <div className="flex gap-6 py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase text-[var(--app-text-soft)]">
                      <input type="checkbox" className="w-4 h-4 rounded" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> 
                      Predeterminada
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase text-[var(--app-text-soft)]">
                      <input type="checkbox" className="w-4 h-4 rounded" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> 
                      Activa
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" icon={Save} className="flex-1" disabled={saving}>{saving ? 'Procesando...' : 'Guardar Parámetros'}</Button>
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-enterprise-lg">
              <CardHeader icon={Building2} title="Cuentas Bancarias Vinculadas" description="Gestión de destinos para abonos de tarjeta y transferencias." />
              <div className="grid gap-4 md:grid-cols-2">
                {accounts.map((account) => (
                  <div key={account.id} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] p-5 group hover:border-[var(--app-primary)]/40 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-black text-[var(--app-text)] text-lg truncate group-hover:text-[var(--app-primary)] transition-colors">{account.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs font-black text-[var(--app-text-soft)] uppercase">{account.bankName}</span>
                           <span className="text-[10px] font-bold text-[var(--app-text-muted)] font-mono bg-[var(--app-bg-subtle)] px-1.5 py-0.5 rounded border border-[var(--app-border)]">{account.accountNumberMasked}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        {account.isDefault && <Badge tone="blue">Principal</Badge>}
                        <Badge tone={account.isActive ? "green" : "red"}>{account.isActive ? 'Activa' : 'Inactiva'}</Badge>
                      </div>
                    </div>
                    
                    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-tight text-[var(--app-text-soft)]">
                      <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
                        <span className="text-[var(--app-text-muted)]">Titular</span>
                        <span className="truncate ml-2">{account.accountHolder}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
                        <span className="text-[var(--app-text-muted)]">Pasarela</span>
                        <span>{getGatewayOption(account.gatewayProvider).label}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
                        <span className="text-[var(--app-text-muted)]">Alcance</span>
                        <span>{getGatewayScopeLabel(getGatewayOption(account.gatewayProvider).scope)}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
                        <span className="text-[var(--app-text-muted)]">Comisión</span>
                        <span>{account.commissionPercentage}%</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--app-border)] pb-1">
                        <span className="text-[var(--app-text-muted)]">Ciclo</span>
                        <span>T+{account.settlementDays}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => openEdit(account)}>Editar</Button>
                      <Button size="sm" variant="ghost" icon={Trash2} className="text-[var(--app-danger)] hover:bg-[var(--app-danger-soft)]" onClick={() => remove(account)} />
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <div className="col-span-full rounded-2xl border-2 border-dashed border-[var(--app-border)] p-12 text-center">
                    <Building2 size={48} className="mx-auto text-[var(--app-text-muted)] opacity-30 mb-4" />
                    <p className="font-bold text-[var(--app-text-muted)] uppercase tracking-widest text-xs">No hay cuentas configuradas</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="shadow-enterprise-lg overflow-hidden">
              <div className="p-6 border-b border-[var(--app-border)]">
                <CardHeader
                  icon={CreditCard}
                  title="Conciliación de Liquidaciones"
                  description="Filtra, revisa comisiones y marca transacciones como depositadas."
                  action={<Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadData}>Actualizar</Button>}
                />
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_220px]">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar venta, referencia o cuenta..."
                      className="ui-input w-full pl-9"
                    />
                  </div>
                  <select className="ui-input ui-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="ALL">Todos</option>
                    <option value="PENDING">Pendientes</option>
                    <option value="SETTLED">Liquidados</option>
                  </select>
                  <select className="ui-input ui-select" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
                    <option value="ALL">Todas las cuentas</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="ui-table w-full min-w-[960px]">
                  <thead>
                    <tr>
                      <th className="pl-6">Venta / Referencia</th>
                      <th>Cuenta Destino</th>
                      <th>Fecha</th>
                      <th className="text-right">Bruto</th>
                      <th className="text-right">Comisión</th>
                      <th className="text-right">Neto a Recibir</th>
                      <th className="text-center">Estado</th>
                      <th className="pr-6 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[var(--app-bg-subtle)]/50 transition-colors">
                        <td className="pl-6 py-4">
                           <p className="font-black text-[var(--app-text)] text-sm">#{tx.saleId}</p>
                           <p className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase tracking-tight">{tx.externalReference}</p>
                        </td>
                        <td>
                          <p className="font-bold text-[var(--app-text-soft)] text-sm">{tx.paymentAccountName || 'Sin cuenta'}</p>
                          <p className="text-[10px] text-[var(--app-text-muted)] font-mono">{tx.paymentAccountMasked || '-'}</p>
                        </td>
                        <td>
                          <p className="text-xs font-bold text-[var(--app-text-soft)]">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</p>
                          <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase">T+ {tx.expectedSettlementDate || 'Sin fecha'}</p>
                        </td>
                        <td className="text-right font-bold text-[var(--app-text-soft)] tabular-nums">{money(tx.amount, tx.currency)}</td>
                        <td className="text-right font-medium text-[var(--app-danger)] tabular-nums">-{money(tx.commissionAmount, tx.currency)}</td>
                        <td className="text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">{money(tx.netAmount, tx.currency)}</td>
                        <td className="text-center">
                          <Badge tone={tx.settlementStatus === 'SETTLED' ? 'green' : 'amber'}>
                            {tx.settlementStatus === 'SETTLED' ? 'Liquidado' : 'Pendiente'}
                          </Badge>
                        </td>
                        <td className="pr-6 text-center">
                          {tx.settlementStatus === 'PENDING' ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={CheckCircle2}
                              disabled={settlingId === tx.id}
                              onClick={() => settleTransaction(tx)}
                            >
                              {settlingId === tx.id ? '...' : 'Liquidar'}
                            </Button>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">Conciliado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr><td colSpan="8" className="py-20 text-center text-[var(--app-text-muted)] font-black uppercase text-xs tracking-widest italic">No hay transacciones para los filtros seleccionados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
