import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import Card, { CardHeader } from '../ui/Card';

const SalesChartCard = ({ weeklySales = [], chartOptions = {} }) => {
  const areaChartData = {
    labels: weeklySales.map((sale) => sale.date),
    datasets: [
      {
        label: 'Ingresos',
        data: weeklySales.map((sale) => sale.amount),
        fill: true,
        borderColor: '#0F4C81',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(15, 76, 129, 0.25)');
          gradient.addColorStop(1, 'rgba(15, 76, 129, 0)');
          return gradient;
        },
        borderWidth: 4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0F4C81',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
      },
    ],
  };

  return (
    <Card className="xl:col-span-2 shadow-enterprise-lg animate-fade-in">
      <CardHeader
        icon={BarChart3}
        title="Evolución de Ingresos"
        description="Flujo de caja registrado durante los últimos días."
      />
      <div className="h-[360px] mt-2">
        <Line data={areaChartData} options={chartOptions} />
      </div>
    </Card>
  );
};

export default SalesChartCard;
