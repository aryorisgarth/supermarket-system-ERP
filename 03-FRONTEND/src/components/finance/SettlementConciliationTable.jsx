import React, { useState, useMemo } from 'react';
import { CreditCard, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import { CardHeader } from '../ui/Card';
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

  return (
    <Card className="shadow-enterprise-lg overflow-hidden">
      <div className="p-6 border-b border-[var(--app-border)]">
        <CardHeader
          icon={CreditCard}
          title="Conciliación de Liquidaciones"
          description="Filtra, revisa comisiones y marca transacciones como depositadas."
          action={
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRefresh}>
              Actualizar
            </Button>
          }
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
                  <p className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase tracking-tight">
                    {tx.externalReference}
                  </p>
                </td>
                <td>
                  <p className="font-bold text-[var(--app-text-soft)] text-sm">{tx.paymentAccountName || 'Sin cuenta'}</p>
                  <p className="text-[10px] text-[var(--app-text-muted)] font-mono">{tx.paymentAccountMasked || '-'}</p>
                </td>
                <td>
                  <p className="text-xs font-bold text-[var(--app-text-soft)]">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}
                  </p>
                  <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase">
                    T+ {tx.expectedSettlementDate || 'Sin fecha'}
                  </p>
                </td>
                <td className="text-right font-bold text-[var(--app-text-soft)] tabular-nums">{money(tx.amount, tx.currency)}</td>
                <td className="text-right font-medium text-[var(--app-danger)] tabular-nums">
                  -{money(tx.commissionAmount, tx.currency)}
                </td>
                <td className="text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
                  {money(tx.netAmount, tx.currency)}
                </td>
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
                      onClick={() => onSettle(tx)}
                    >
                      {settlingId === tx.id ? '...' : 'Liquidar'}
                    </Button>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)]">
                      Conciliado
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="py-20 text-center text-[var(--app-text-muted)] font-black uppercase text-xs tracking-widest italic"
                >
                  No hay transacciones para los filtros seleccionados.
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
