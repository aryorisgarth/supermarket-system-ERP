import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { PieChart as PieIcon, BarChart2, Users, Activity, AlertOctagon, AlertTriangle, Check } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      grid: { color: 'rgba(0,0,0,0.04)' },
      ticks: { font: { weight: 'bold' } },
    },
    x: {
      grid: { display: false },
      ticks: { font: { weight: 'bold' } },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { weight: 'bold', size: 11 } },
    },
  },
};

const AuditAnalytics = ({
  logs,
  chartData,
  operationalSummary,
  recentSecurityAlerts,
  getRisk,
  getActionLabel,
  getModuleLabel,
  handleOpenDetail,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        <Card>
          <CardHeader icon={PieIcon} title="Severidad de Eventos" description="Distribución por nivel de riesgo" />
          <div className="h-64 mt-4 flex items-center justify-center">
            {logs.length > 0 ? (
              <Doughnut data={chartData.risk} options={doughnutOptions} />
            ) : (
              <p className="text-xs font-bold text-[var(--app-text-muted)]">Sin datos para graficar</p>
            )}
          </div>
        </Card>

        
        <Card>
          <CardHeader icon={BarChart2} title="Módulos Críticos" description="Top 5 de módulos con más actividad" />
          <div className="h-64 mt-4">
            {logs.length > 0 ? (
              <Bar data={chartData.modules} options={chartOptions} />
            ) : (
              <p className="text-xs font-bold text-[var(--app-text-muted)]">Sin datos para graficar</p>
            )}
          </div>
        </Card>

        
        <Card>
          <CardHeader icon={Users} title="Top Usuarios" description="Usuarios más activos en auditoría" />
          <div className="h-64 mt-4">
            {logs.length > 0 ? (
              <Bar data={chartData.users} options={chartOptions} />
            ) : (
              <p className="text-xs font-bold text-[var(--app-text-muted)]">Sin datos para graficar</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        
        <Card>
          <CardHeader icon={Activity} title="Análisis de Actividad de Auditoría" description="Análisis ejecutivo basado en el lote cargado." />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60 p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Accesos Denegados</p>
              <p className="mt-2 text-2xl font-bold text-[var(--app-danger)]">{operationalSummary.deniedEvents}</p>
              <p className="text-xs font-bold text-[var(--app-text-soft)] mt-1">Intentos de intrusión / permisos fallidos.</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60 p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Caja y Efectivo</p>
              <p className="mt-2 text-2xl font-bold text-[var(--app-warning)]">{operationalSummary.cashEvents}</p>
              <p className="text-xs font-bold text-[var(--app-text-soft)] mt-1">Eventos en cierres y retiros manuales.</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/60 p-4">
              <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">Kardex e Inventario</p>
              <p className="mt-2 text-2xl font-bold text-[var(--app-primary)]">{operationalSummary.inventoryEvents}</p>
              <p className="text-xs font-bold text-[var(--app-text-soft)] mt-1">Modificaciones directas al stock.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-blue-500/20 bg-[var(--app-primary-soft)]/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--app-primary)]">Recomendaciones de Seguridad</h4>
            <p className="mt-2 text-xs leading-5 text-[var(--app-text-soft)]">
              - Mantenga bajo constante supervisión los eventos de <b>Riesgo Crítico</b> (ej. Venta Anulada o Eliminaciones directas de registros).<br />
              - Si detecta un volumen anómalo de <b>Accesos Denegados</b> en un corto lapso, verifique la IP origen de forma inmediata.<br />
              - Recuerde que los cierres de caja fallidos deben ser debidamente justificados en la bitácora con su respectivo ticket.
            </p>
          </div>
        </Card>

        
        <Card>
          <CardHeader icon={AlertOctagon} title="Alertas Críticas Recientes" description="Últimos eventos de riesgo Alto o Crítico" />
          <div className="mt-4 space-y-3">
            {recentSecurityAlerts.map((log) => {
              const risk = getRisk(log);
              return (
                <div
                  key={log.id}
                  onClick={() => handleOpenDetail(log)}
                  className="flex items-center justify-between p-3 rounded-xl border border-red-500/10 bg-red-500/5 hover:border-red-500/30 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                      <AlertTriangle size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--app-text)] truncate">
                        {getActionLabel(log.action)}
                      </p>
                      <p className="text-[10px] text-[var(--app-text-muted)] font-mono">
                        {getModuleLabel(log.affectedTable)} • By {log.userFullName || 'Sistema'}
                      </p>
                    </div>
                  </div>
                  <Badge tone="red">{risk.label}</Badge>
                </div>
              );
            })}

            {recentSecurityAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--app-text-muted)] border border-dashed border-[var(--app-border)] rounded-2xl">
                <Check size={28} className="text-[var(--app-success)] mb-1" />
                <p className="text-xs font-bold uppercase">Todo en orden</p>
                <p className="text-[10px] mt-0.5">No se reportan eventos críticos en este lote de auditoría.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuditAnalytics;
