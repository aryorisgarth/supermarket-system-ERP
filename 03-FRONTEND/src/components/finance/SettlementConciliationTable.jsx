import React, { useState, useMemo } from 'react';
import { CreditCard, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const SettlementConciliationTable = ({
  transactions = [],
  accounts = [],
  onSettle,
  onRefresh,
  settlingId,
  money,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [accountFilter, setAccountFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      const provider = String(tx.providerCode || '').toUpperCase();
      const matchesProvider =
        providerFilter === 'ALL' ||
        provider === providerFilter ||
        (providerFilter === 'STRIPE' && String(tx.externalReference || '').startsWith('pi_'));
      const matchesStatus = statusFilter === 'ALL' || tx.settlementStatus === statusFilter;
      const matchesAccount =
        accountFilter === 'ALL' || String(tx.paymentAccountId || '') === String(accountFilter);
      const matchesSearch =
        !term ||
        String(tx.saleId || '').includes(term) ||
        String(tx.externalReference || '').toLowerCase().includes(term) ||
        String(tx.paymentAccountName || '').toLowerCase().includes(term) ||
        provider.toLowerCase().includes(term);
      return matchesProvider && matchesStatus && matchesAccount && matchesSearch;
    });
  }, [transactions, statusFilter, accountFilter, providerFilter, search]);

  return (
    <Card className="overflow-hidden border border-[var(--app-border)] bg-[var(--app-surface)]" padded={false}>
      <div className="border-b border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 p-5 md:p-6">
        <CardHeader
          icon={CreditCard}
          title="Conciliación — pagos con tarjeta / Stripe"
          description="Aquí ves cada cobro de tarjeta del POS (referencia pi_... = Stripe). Marca como liquidado cuando el banco depositó."
          action={
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRefresh}>
              Actualizar
            </Button>
          }
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar venta, pi_..., cuenta..."
              className="ui-input w-full pl-9"
            />
          </div>
          <select className="ui-input ui-select" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
            <option value="ALL">Todas las pasarelas</option>
            <option value="STRIPE">Solo Stripe</option>
            <option value="MOCK">Solo MOCK</option>
            <option value="VISANET">Solo Visanet</option>
          </select>
          <select className="ui-input ui-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="SETTLED">Liquidados</option>
          </select>
          <select className="ui-input ui-select" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
            <option value="ALL">Todas las cuentas</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="ui-table w-full min-w-[960px]">
          <thead>
            <tr>
              <th className="pl-6">Venta / Referencia</th>
              <th>Pasarela</th>
              <th>Cuenta destino</th>
              <th>Fecha</th>
              <th className="text-right">Bruto</th>
              <th className="text-right">Comisión</th>
              <th className="text-right">Neto</th>
              <th className="text-center">Estado</th>
              <th className="pr-6 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[var(--app-bg-subtle)]/40">
                <td className="pl-6 py-3">
                  <p className="text-sm font-bold text-[var(--app-text)]">Venta #{tx.saleId}</p>
                  <p className="font-mono text-[11px] text-[var(--app-text-muted)] break-all">
                    {tx.externalReference || '—'}
                  </p>
                </td>
                <td>
                  <Badge tone="neutral">{tx.providerCode || '—'}</Badge>
                </td>
                <td>
                  <p className="text-sm font-semibold text-[var(--app-text)]">{tx.paymentAccountName || 'Sin cuenta'}</p>
                  <p className="font-mono text-[10px] text-[var(--app-text-muted)]">{tx.paymentAccountMasked || '-'}</p>
                </td>
                <td className="text-sm text-[var(--app-text-soft)]">
                  {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                </td>
                <td className="text-right tabular-nums text-[var(--app-text)]">{money(tx.amount, tx.currency)}</td>
                <td className="text-right tabular-nums text-[var(--app-text-muted)]">
                  -{money(tx.commissionAmount, tx.currency)}
                </td>
                <td className="text-right font-bold tabular-nums text-[var(--app-primary)]">
                  {money(tx.netAmount, tx.currency)}
                </td>
                <td className="text-center">
                  <Badge tone={tx.settlementStatus === 'SETTLED' ? 'blue' : 'amber'}>
                    {tx.settlementStatus === 'SETTLED' ? 'Liquidado' : 'Pendiente'}
                  </Badge>
                </td>
                <td className="pr-6 text-center">
                  {tx.settlementStatus === 'PENDING' ? (
                    <Button size="sm" variant="secondary" icon={CheckCircle2} disabled={settlingId === tx.id} onClick={() => onSettle(tx)}>
                      {settlingId === tx.id ? '...' : 'Liquidar'}
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      <CheckCircle2 size={12} /> OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="9" className="py-16 text-center">
                  <p className="text-sm font-bold text-[var(--app-text-muted)]">No hay transacciones</p>
                  <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                    Cobra una venta con tarjeta en Facturación; luego aparece aquí.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SettlementConciliationTable;
