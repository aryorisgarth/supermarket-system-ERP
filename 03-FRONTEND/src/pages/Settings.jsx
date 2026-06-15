import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  Database,
  Printer,
  Shield,
  Save,
  Globe,
  ReceiptText,
  LayoutDashboard,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SettingsOverview from '../components/settings/SettingsOverview';

import BusinessTab from '../components/settings/BusinessTab';
import LocalizationTab from '../components/settings/LocalizationTab';
import BackupsTab from '../components/settings/BackupsTab';
import HardwareTab from '../components/settings/HardwareTab';
import TicketTab from '../components/settings/TicketTab';
import SecurityTab from '../components/settings/SecurityTab';
import SettingsSidebar from '../components/settings/SettingsSidebar';

import {
  loadSettings,
  loadLogo,
  loadTicketLogo,
  saveSettings,
  resetSettings,
  exportSettingsFile,
  parseImportedSettings,
  DEFAULT_SETTINGS,
  COUNTRY_PRESETS,
} from '../utils/settingsStorage';

const TAB_META = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard, keywords: 'resumen estado general' },
  { id: 'business', label: 'Empresa', icon: Building2, keywords: 'empresa nit iva logo direccion telefono propietario fiscal' },
  { id: 'localization', label: 'Moneda', icon: Globe, keywords: 'pais moneda cordoba dolar cambio bimonetario' },
  { id: 'backups', label: 'Backups', icon: Database, keywords: 'respaldo backup frecuencia hora destino' },
  { id: 'hardware', label: 'Hardware POS', icon: Printer, keywords: 'impresora papel cajon escaner codigo barras' },
  { id: 'ticket', label: 'Ticket', icon: ReceiptText, keywords: 'ticket recibo asfc serie mensaje tipografia' },
  { id: 'security', label: 'Seguridad', icon: Shield, keywords: 'contraseña sesion stock critico seguridad' },
];

const buildPayload = (state) => ({
  companyName: state.companyName,
  ownerName: state.ownerName,
  taxId: state.taxId,
  address: state.address,
  phone: state.phone,
  telefax: state.telefax,
  taxRate: parseFloat(state.taxRate),
  backupFrequency: state.backupFrequency,
  backupTime: state.backupTime,
  backupDest: state.backupDest,
  paperWidth: state.paperWidth,
  openDrawer: state.openDrawer,
  barcodeMode: state.barcodeMode,
  showTicketLogo: state.showTicketLogo,
  ticketHeaderMessage: state.ticketHeaderMessage,
  ticketFooterMessage: state.ticketFooterMessage,
  ticketAsfcCode: state.ticketAsfcCode,
  ticketSeries: state.ticketSeries,
  ticketPaymentLabel: state.ticketPaymentLabel,
  ticketExchangeNote: state.ticketExchangeNote,
  ticketFontFamily: state.ticketFontFamily,
  ticketFontSize: parseInt(state.ticketFontSize, 10),
  ticketShowTaxId: state.ticketShowTaxId,
  passStrength: state.passStrength,
  sessionTimeout: parseInt(state.sessionTimeout, 10),
  stockThreshold: parseInt(state.stockThreshold, 10),
  country: state.country,
  currencySymbol: state.currencySymbol,
  currencyName: state.currencyName,
  enableMultiCurrency: state.enableMultiCurrency,
  exchangeRate: parseFloat(state.exchangeRate),
});

const Settings = () => {
  const [form, setForm] = useState(() => loadSettings());
  const [logo, setLogo] = useState(() => loadLogo());
  const [ticketLogo, setTicketLogo] = useState(() => loadTicketLogo());
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const savedRef = useRef(JSON.stringify({ settings: loadSettings(), logo: loadLogo(), ticketLogo: loadTicketLogo() }));

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const applyCountry = (countryCode) => {
    const preset = COUNTRY_PRESETS[countryCode];
    if (!preset) return;
    setForm((current) => ({
      ...current,
      country: countryCode,
      currencySymbol: preset.currencySymbol,
      currencyName: preset.currencyName,
      exchangeRate: preset.exchangeRate,
    }));
  };

  const isDirty = useMemo(
    () => JSON.stringify({ settings: buildPayload(form), logo, ticketLogo }) !== savedRef.current,
    [form, logo, ticketLogo]
  );

  const visibleTabs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TAB_META;
    return TAB_META.filter(
      (tab) =>
        tab.label.toLowerCase().includes(q) ||
        tab.keywords.includes(q) ||
        tab.id.includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab) && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  const handleSave = (e) => {
    e.preventDefault();
    const saved = saveSettings(buildPayload(form), logo, ticketLogo);
    setForm(saved);
    savedRef.current = JSON.stringify({ settings: buildPayload(saved), logo, ticketLogo });
    Swal.fire({
      icon: 'success',
      title: 'Configuración guardada',
      text: 'Los parámetros se aplicaron en este navegador y en el POS.',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: '¿Restablecer valores?',
      text: 'Se perderán los cambios locales y volverán los valores de fábrica.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    resetSettings();
    const defaults = { ...DEFAULT_SETTINGS };
    setForm(defaults);
    setLogo(null);
    setTicketLogo(null);
    savedRef.current = JSON.stringify({ settings: defaults, logo: null, ticketLogo: null });
    Swal.fire({ icon: 'success', title: 'Valores restablecidos', timer: 1500, showConfirmButton: false });
  };

  const handleExport = () => exportSettingsFile(buildPayload(form), logo, ticketLogo);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const { settings, logo: importedLogo, ticketLogo: importedTicketLogo } = parseImportedSettings(text);
        setForm(settings);
        setLogo(importedLogo);
        setTicketLogo(importedTicketLogo);
        Swal.fire({
          icon: 'info',
          title: 'Configuración importada',
          text: 'Revisa los datos y pulsa Guardar para aplicarlos.',
        });
      } catch {
        Swal.fire('Error', 'El archivo JSON no es válido.', 'error');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Administración"
        title="Configuración Global"
        description="Parámetros fiscales, moneda, ticket POS, respaldos y seguridad operativa."
        meta={
          <Badge tone={isDirty ? 'amber' : 'green'}>
            {isDirty ? 'Cambios sin guardar' : 'Sincronizado'}
          </Badge>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" icon={Download} onClick={handleExport}>
              Exportar
            </Button>
            <Button type="button" variant="secondary" size="sm" icon={Upload} onClick={handleImport}>
              Importar
            </Button>
            <Button type="button" variant="secondary" size="sm" icon={RotateCcw} onClick={handleReset}>
              Restablecer
            </Button>
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <SettingsSidebar 
          search={search} 
          setSearch={setSearch} 
          visibleTabs={visibleTabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <div className="flex-1 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-8">
            {activeTab === 'overview' && (
              <SettingsOverview
                settings={form}
                logo={logo}
                ticketLogo={ticketLogo}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'business' && (
              <BusinessTab 
                form={form} 
                setField={setField} 
                logo={logo} 
                setLogo={setLogo} 
              />
            )}

            {activeTab === 'localization' && (
              <LocalizationTab 
                form={form} 
                setField={setField} 
                applyCountry={applyCountry} 
              />
            )}

            {activeTab === 'backups' && (
              <BackupsTab 
                form={form} 
                setField={setField} 
              />
            )}

            {activeTab === 'hardware' && (
              <HardwareTab 
                form={form} 
                setField={setField} 
              />
            )}

            {activeTab === 'ticket' && (
              <TicketTab 
                form={form} 
                setField={setField} 
                logo={ticketLogo} 
                setLogo={setTicketLogo} 
                systemLogo={logo}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab 
                form={form} 
                setField={setField} 
              />
            )}

            {activeTab !== 'overview' && (
              <div className="pt-4 border-t border-[var(--app-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                  Los cambios se guardan en este navegador (localStorage)
                </p>
                <Button type="submit" icon={Save} disabled={!isDirty}>
                  Guardar configuración
                </Button>
              </div>
            )}

            {activeTab === 'overview' && isDirty && (
              <div className="pt-4 border-t border-[var(--app-border)] flex justify-end">
                <Button type="submit" icon={Save}>Guardar cambios pendientes</Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
