export const SETTINGS_KEY = 'supernova_settings';
export const LOGO_KEY = 'supernova_logo';
export const SETTINGS_UPDATED_EVENT = 'supernova_settings_updated';
export const LOGO_UPDATED_EVENT = 'supernova_logo_updated';

export const DEFAULT_SETTINGS = {
  companyName: 'SuperNova Market',
  ownerName: '',
  taxId: 'NIT 9081231-1',
  address: 'Av. Principal N° 456',
  phone: '',
  telefax: '',
  taxRate: 15,

  backupFrequency: 'DAILY',
  backupTime: '02:00',
  backupDest: 'LOCAL',

  paperWidth: '80mm',
  openDrawer: true,
  barcodeMode: 'AUTO',

  showTicketLogo: true,
  ticketHeaderMessage: 'Gracias por elegir SuperNova',
  ticketFooterMessage: '*** GRACIAS POR SU COMPRA ***',
  ticketAsfcCode: 'ASFC 19/0001/08/2020/5',
  ticketSeries: 'A',
  ticketPaymentLabel: 'PAGO CONTADO',
  ticketExchangeNote: 'POR FAVOR PRESENTAR FACTURA PARA REALIZAR CAMBIOS',
  ticketFontFamily: 'monospace',
  ticketFontSize: 10,
  ticketShowTaxId: true,

  passStrength: 'HIGH',
  sessionTimeout: 30,
  stockThreshold: 10,

  country: 'NI',
  currencySymbol: 'C$',
  currencyName: 'Córdobas',
  enableMultiCurrency: true,
  exchangeRate: 36.85,

  updatedAt: null,
};

export const COUNTRY_PRESETS = {
  NI: { currencySymbol: 'C$', currencyName: 'Córdobas', exchangeRate: 36.85 },
  GT: { currencySymbol: 'Q', currencyName: 'Quetzales', exchangeRate: 7.85 },
  MX: { currencySymbol: '$', currencyName: 'Pesos Mexicanos', exchangeRate: 17.5 },
  USD: { currencySymbol: '$', currencyName: 'Dólares', exchangeRate: 1 },
};

export function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function loadLogo() {
  return localStorage.getItem(LOGO_KEY) || null;
}

export function saveSettings(settings, logo) {
  const payload = {
    ...settings,
    taxRate: Number(settings.taxRate) || 0,
    ticketFontSize: parseInt(settings.ticketFontSize, 10) || DEFAULT_SETTINGS.ticketFontSize,
    sessionTimeout: parseInt(settings.sessionTimeout, 10) || DEFAULT_SETTINGS.sessionTimeout,
    stockThreshold: parseInt(settings.stockThreshold, 10) || DEFAULT_SETTINGS.stockThreshold,
    exchangeRate: parseFloat(settings.exchangeRate) || DEFAULT_SETTINGS.exchangeRate,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
  localStorage.setItem(LOGO_KEY, logo || '');
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  window.dispatchEvent(new Event(LOGO_UPDATED_EVENT));
  return payload;
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(LOGO_KEY);
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  window.dispatchEvent(new Event(LOGO_UPDATED_EVENT));
  return { ...DEFAULT_SETTINGS };
}

export function exportSettingsFile(settings, logo) {
  const blob = new Blob(
    [JSON.stringify({ version: 1, settings, logo }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `supernova_config_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function parseImportedSettings(raw) {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const settings = { ...DEFAULT_SETTINGS, ...(data.settings || data) };
  const logo = data.logo ?? null;
  return { settings, logo };
}

export const BACKUP_FREQUENCY_LABELS = {
  HOURLY: 'Cada hora',
  DAILY: 'Diario',
  WEEKLY: 'Semanal',
  NEVER: 'Desactivado',
};

export const PASS_STRENGTH_LABELS = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
};
