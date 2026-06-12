import React from 'react';
import { WalletCards, Save } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { PAYMENT_GATEWAY_OPTIONS, getGatewayScopeLabel, getGatewayOption } from '../../utils/paymentGateways';

const PaymentAccountForm = ({ 
  form, 
  setForm, 
  onSubmit, 
  onCancel, 
  editing, 
  saving 
}) => {
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="animate-fade-in border-amber-200 dark:border-amber-900/30 shadow-xl">
      <CardHeader icon={WalletCards} title={editing ? 'Editar Parámetros' : 'Vincular Nueva Cuenta'} />
      <form onSubmit={onSubmit} className="grid gap-4 mt-2">
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
              value={form[field] || ''}
              onChange={(event) => handleChange(field, event.target.value)}
            />
          </label>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <label className="ui-field col-span-2">
            <span className="ui-label">Pasarela / Adquirente</span>
            <select
              className="ui-input ui-select font-bold"
              value={form.gatewayProvider}
              onChange={(e) => handleChange('gatewayProvider', e.target.value)}
            >
              {PAYMENT_GATEWAY_OPTIONS.map((gateway) => (
                <option key={gateway.value} value={gateway.value}>
                  {gateway.label} ({getGatewayScopeLabel(gateway.scope)})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] font-medium text-[var(--app-text-muted)]">
              {getGatewayOption(form.gatewayProvider || 'MOCK').description}
            </p>
          </label>
          <label className="ui-field">
            <span className="ui-label">Tipo Cuenta</span>
            <select 
              className="ui-input ui-select font-bold" 
              value={form.accountType} 
              onChange={(e) => handleChange('accountType', e.target.value)}
            >
              <option value="MONETARIA">Monetaria</option>
              <option value="AHORRO">Ahorro</option>
              <option value="CORRIENTE">Corriente</option>
            </select>
          </label>
          <label className="ui-field">
            <span className="ui-label">Divisa</span>
            <input 
              className="ui-input font-black" 
              value={form.currency || ''} 
              onChange={(e) => handleChange('currency', e.target.value.toUpperCase())} 
              maxLength={3} 
            />
          </label>
          <label className="ui-field">
            <span className="ui-label">Comisión %</span>
            <input 
              type="number" 
              step="0.01" 
              className="ui-input font-bold" 
              value={form.commissionPercentage} 
              onChange={(e) => handleChange('commissionPercentage', e.target.value)} 
            />
          </label>
          <label className="ui-field">
            <span className="ui-label">Días Ciclo (T+)</span>
            <input 
              type="number" 
              min="0" 
              className="ui-input font-bold" 
              value={form.settlementDays} 
              onChange={(e) => handleChange('settlementDays', e.target.value)} 
            />
          </label>
        </div>

        <div className="flex gap-6 py-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase text-[var(--app-text-soft)]">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded" 
              checked={!!form.isDefault} 
              onChange={(e) => handleChange('isDefault', e.target.checked)} 
            /> 
            Predeterminada
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase text-[var(--app-text-soft)]">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded" 
              checked={!!form.isActive} 
              onChange={(e) => handleChange('isActive', e.target.checked)} 
            /> 
            Activa
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" icon={Save} className="flex-1" disabled={saving}>
            {saving ? 'Procesando...' : 'Guardar Parámetros'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PaymentAccountForm;
