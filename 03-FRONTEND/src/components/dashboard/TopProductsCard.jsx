import React from 'react';
import { Award } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import Card, { CardHeader } from '../ui/Card';

const TopProductsCard = ({ topProducts = [], chartOptions = {} }) => {
  const barChartData = {
    labels: topProducts.slice(0, 5).map((p) => p.name),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: topProducts.slice(0, 5).map((p) => p.quantity),
        backgroundColor: '#0F4C81',
        borderRadius: 8,
        barThickness: 16,
      },
    ],
  };

  const horizontalOptions = {
    ...chartOptions,
    indexAxis: 'y',
    scales: {
      x: { display: false },
      y: {
        grid: { display: false },
        ticks: { color: '#475569', font: { weight: 'bold' } },
      },
    },
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader
        icon={Award}
        title="Top 5 Productos"
        description="Ranking por volumen de ventas."
      />
      <div className="h-[180px] mt-2">
        <Bar data={barChartData} options={horizontalOptions} />
      </div>
    </Card>
  );
};

export default TopProductsCard;
