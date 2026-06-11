import { loadSettings, DEFAULT_SETTINGS } from './settingsStorage';

export const getCurrencySettings = () => loadSettings();

export const getCurrencyCode = () => {
  const settings = getCurrencySettings();
  if (settings.country === 'GT') return 'GTQ';
  if (settings.country === 'NI') return 'NIO';
  if (settings.country === 'MX') return 'MXN';
  return 'USD';
};

export const getNumberLocale = () => {
  const settings = getCurrencySettings();
  if (settings.country === 'NI') return 'es-NI';
  if (settings.country === 'GT') return 'es-GT';
  if (settings.country === 'MX') return 'es-MX';
  return 'en-US';
};

export const formatMoney = (value, options = {}) => {
  const settings = getCurrencySettings();
  const symbol = options.symbol ?? settings.currencySymbol ?? DEFAULT_SETTINGS.currencySymbol;
  return `${symbol}${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCompactMoney = (value, options = {}) => {
  const settings = getCurrencySettings();
  const symbol = options.symbol ?? settings.currencySymbol ?? DEFAULT_SETTINGS.currencySymbol;
  const num = Number(value || 0);
  if (num >= 1000000) {
    return `${symbol}${(num / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  }
  if (num >= 100000) {
    return `${symbol}${(num / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`;
  }
  if (num >= 10000) {
    return `${symbol}${(num / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
  }
  return formatMoney(value, options);
};

export const formatUsdEquivalent = (localValue) => {
  const settings = getCurrencySettings();
  const rate = Number(settings.exchangeRate || 0);
  if (!settings.enableMultiCurrency || settings.country === 'USD' || rate <= 0) return null;
  return `$${(Number(localValue || 0) / rate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const isoDate = (date) => date.toISOString().split('T')[0];
