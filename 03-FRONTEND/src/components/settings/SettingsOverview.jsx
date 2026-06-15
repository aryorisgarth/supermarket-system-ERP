import {
  Building2,
  Globe,
  Database,
  Printer,
  ReceiptText,
  Shield,
  Clock,
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import {
  BACKUP_FREQUENCY_LABELS,
  PASS_STRENGTH_LABELS,
} from '../../utils/settingsStorage';

const formatDate = (iso) => {
  if (!iso) return 'Sin guardar aún';
  try {
    return new Intl.DateTimeFormat('es-NI', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return '—';
  }
};

const SummaryCard = ({ icon: Icon, title, children, tone = 'blue' }) => (
  <Card className="h-full">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">{title}</p>
        <div className="mt-2 space-y-1 text-sm text-[var(--app-text-soft)]">{children}</div>
      </div>
      <Badge tone={tone} className="shrink-0 text-[9px]">Activo</Badge>
    </div>
  </Card>
);

const SettingsOverview = ({ settings, logo, ticketLogo, onNavigateTab }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">Estado de configuración</p>
        <p className="mt-1 text-sm font-bold text-[var(--app-text)]">
          Última actualización: {formatDate(settings.updatedAt)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {['business', 'localization', 'ticket', 'security'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onNavigateTab(tab)}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-soft)] hover:border-[var(--app-primary)] hover:text-[var(--app-primary)] cursor-pointer"
          >
            Editar {tab === 'business' ? 'empresa' : tab === 'localization' ? 'moneda' : tab === 'ticket' ? 'ticket' : 'seguridad'}
          </button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SummaryCard icon={Building2} title="Empresa">
        <p className="font-bold text-[var(--app-text)]">{settings.companyName}</p>
        <p>{settings.taxId} · IVA {settings.taxRate}%</p>
        <p className="truncate">{settings.address}</p>
        {logo && <p className="text-[10px] font-bold text-emerald-600">Logo cargado</p>}
      </SummaryCard>

      <SummaryCard icon={Globe} title="Moneda" tone="green">
        <p className="font-bold text-[var(--app-text)]">
          {settings.currencySymbol} · {settings.currencyName}
        </p>
        <p>País: {settings.country}</p>
        <p>1 USD = {settings.exchangeRate} {settings.currencySymbol}</p>
        <p>{settings.enableMultiCurrency ? 'Bimonetario activo' : 'Solo moneda local'}</p>
      </SummaryCard>

      <SummaryCard icon={Database} title="Respaldos">
        <p>{BACKUP_FREQUENCY_LABELS[settings.backupFrequency] || settings.backupFrequency}</p>
        <p className="flex items-center gap-1">
          <Clock size={12} /> Hora programada: {settings.backupTime}
        </p>
        <p>Destino preferido: {settings.backupDest || 'LOCAL'}</p>
      </SummaryCard>

      <SummaryCard icon={Printer} title="Hardware POS">
        <p>Papel {settings.paperWidth}</p>
        <p>Escáner: {settings.barcodeMode}</p>
        <p>{settings.openDrawer ? 'Cajón automático' : 'Cajón manual'}</p>
      </SummaryCard>

      <SummaryCard icon={ReceiptText} title="Ticket">
        <p className="line-clamp-2">{settings.ticketHeaderMessage}</p>
        <p>Serie {settings.ticketSeries} · {settings.ticketPaymentLabel}</p>
        <p>{settings.showTicketLogo ? (ticketLogo ? 'Logo de Impresión personalizado' : 'Logo Principal en ticket') : 'Sin logo'} · {settings.ticketFontSize}px</p>
      </SummaryCard>

      <SummaryCard icon={Shield} title="Seguridad" tone="amber">
        <p>Contraseñas: {PASS_STRENGTH_LABELS[settings.passStrength]}</p>
        <p>Sesión: {settings.sessionTimeout} min</p>
        <p>Alerta stock &lt; {settings.stockThreshold} u.</p>
      </SummaryCard>
    </div>
  </div>
);

export default SettingsOverview;
