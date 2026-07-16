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
    <Card className="shadow-xl shadow-slate-200/50 dark:shadow-none border-0 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 overflow-hidden" padded={false}>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <CardHeader
          icon={CreditCard}
          title="Conciliación de Liquidaciones"
          description="Filtra, revisa comisiones y marca transacciones como depositadas en el banco."
          action={
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRefresh} className="shadow-sm">
              Sincronizar
            </Button>
          }
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar venta, referencia o cuenta..."
              className="w-full pl-10 h-10 rounded-full border border-slate-200 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            <select 
              className="h-10 px-4 rounded-full border border-slate-200 bg-white dark:bg-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm cursor-pointer" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">🟣 Todos los estados</option>
              <option value="PENDING">🟠 Pendientes</option>
              <option value="SETTLED">🟢 Liquidados</option>
            </select>
            <select 
              className="h-10 px-4 rounded-full border border-slate-200 bg-white dark:bg-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm cursor-pointer" 
              value={accountFilter} 
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              <option value="ALL">🏛️ Todas las cuentas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                <td className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs shadow-sm">
                      #{tx.saleId}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Referencia</p>
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                        {tx.externalReference}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{tx.paymentAccountName || 'Sin cuenta'}</p>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest">{tx.paymentAccountMasked || '-'}</p>
                </td>
                <td>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    T+ {tx.expectedSettlementDate || 'Sin fecha'}
                  </p>
                </td>
                <td className="text-right font-medium text-slate-600 dark:text-slate-400 tabular-nums">{money(tx.amount, tx.currency)}</td>
                <td className="text-right font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  -{money(tx.commissionAmount, tx.currency)}
                </td>
                <td className="text-right font-black text-blue-600 dark:text-blue-400 tabular-nums text-[15px]">
                  {money(tx.netAmount, tx.currency)}
                </td>
                <td className="text-center">
                  <Badge tone="blue" className="shadow-sm">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm bg-white"
                    >
                      {settlingId === tx.id ? '...' : 'Liquidar'}
                    </Button>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center justify-center gap-1">
                      <CheckCircle2 size={12} /> OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="py-24 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                    <Search className="text-slate-300" size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-400">No hay transacciones</p>
                  <p className="text-xs text-slate-500 mt-1">Ajusta los filtros para encontrar lo que buscas.</p>
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
