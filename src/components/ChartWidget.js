import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ChartWidget = ({ type, data, options, title }) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={options} />;
      case 'bar':
        return <Bar data={data} options={options} />;
      default:
        return null;
    }
  };

  return (
    <div className="card h-100 border-0 mb-4 p-2">
      <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
        <h6 className="mb-0 fw-bold text-dark">{title}</h6>
      </div>
      <div className="card-body p-4 w-100" style={{ minHeight: '300px' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartWidget;
