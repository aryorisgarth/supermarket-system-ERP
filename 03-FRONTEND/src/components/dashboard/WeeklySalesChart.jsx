import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatMoney } from '../../utils/formatMoney';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      displayColors: false,
      callbacks: {
        label: (context) => `Monto: ${formatMoney(context.parsed.y)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
      ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
    },
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
    },
  },
};

const WeeklySalesChart = ({ weeklySales, heightClass = 'h-[280px]' }) => {
  const chartData = {
    labels: (weeklySales || []).map((sale) => sale.date),
    datasets: [
      {
        label: 'Ventas',
        data: (weeklySales || []).map((sale) => sale.amount),
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className={heightClass}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default WeeklySalesChart;
