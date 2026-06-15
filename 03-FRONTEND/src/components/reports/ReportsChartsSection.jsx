import React from 'react';
import { BarChart, PieChart as PieChartIcon, Award } from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Card, { CardHeader } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportsChartsSection = ({
  barData,
  pieData,
  paymentMethods,
  paymentPieData,
  productPerformance,
  money,
}) => {
  return (
    <>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader icon={BarChart} title="Flujo de Ventas Diarias" description="Rendimiento de los últimos 7 días." />
          <div className="chart-box h-72 sm:h-80 mt-4">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { weight: 'bold' } } },
                  x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } },
                },
              }}
            />
          </div>
        </Card>

        <Card>
          <CardHeader icon={PieChartIcon} title="Distribución de Activos" description="Relación entre stock y liquidez." />
          <div className="chart-box h-72 sm:h-80 mt-4 flex justify-center">
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold', size: 11 } } } },
              }}
            />
          </div>
        </Card>
      </div>

      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader icon={PieChartIcon} title="Ingresos por Medio de Pago" description="Preferencia de los clientes." />
          <div className="chart-box h-64 sm:h-72 mt-4 flex justify-center">
            {paymentMethods.length > 0 ? (
              <Pie
                data={paymentPieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold', size: 11 } } } },
                }}
              />
            ) : (
              <div className="flex items-center text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
                Sin datos registrados
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader icon={Award} title="Top 5 Productos Rentables" description="Basado en margen de utilidad bruta." />
          <div className="space-y-3 mt-4">
            {productPerformance.slice(0, 5).map((item, index) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 group hover:border-[var(--app-primary)]/30 transition-all"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-[var(--app-surface-raised)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-primary)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--app-text)]">{item.productName}</p>
                    <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-tight">
                      {Number(item.quantitySold || 0).toLocaleString()} unidades movidas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{money(item.grossProfit)}</p>
                  <p className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase">
                    {Number(item.grossMarginPercentage || 0).toFixed(1)}% margen
                  </p>
                </div>
              </div>
            ))}
            {productPerformance.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-[var(--app-border)] py-12 text-center text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
                Sin ventas en este periodo
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default ReportsChartsSection;
