import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import Card, { CardHeader } from '../ui/Card';

const InventoryFlowChartCard = ({ inventoryFlow = [], chartOptions = {} }) => {
  const chartData = {
    labels: inventoryFlow.map((f) => f.date),
    datasets: [
      {
        label: 'Entradas',
        data: inventoryFlow.map((f) => f.inputs),
        backgroundColor: '#22c55e', // green-500
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
      {
        label: 'Salidas',
        data: inventoryFlow.map((f) => Math.abs(f.outputs)), // positive for chart
        backgroundColor: '#ef4444', // red-500
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
    ],
  };

  const customOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#64748b',
          usePointStyle: true,
          boxWidth: 8,
          font: { size: 11, weight: 'bold' }
        }
      },
      tooltip: {
        ...chartOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y} un.`,
        },
      },
    },
  };

  return (
    <Card className="shadow-enterprise-lg animate-fade-in">
      <CardHeader
        icon={ArrowRightLeft}
        title="Flujo de Inventario (Entradas vs Salidas)"
        description="Volumen de productos movidos por día."
      />
      <div className="h-[300px] mt-2">
        <Bar data={chartData} options={customOptions} />
      </div>
    </Card>
  );
};

export default InventoryFlowChartCard;
