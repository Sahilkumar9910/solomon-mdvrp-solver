import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Metrics = ({ metrics, chartData }) => {
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#94a3b8', maxTicksLimit: 8 }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#94a3b8' },
        beginAtZero: false
      }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    animation: false
  }), []);

  const data = useMemo(() => ({
    labels: chartData.labels,
    datasets: [
      {
        fill: true,
        label: 'Best Global Cost',
        data: chartData.data,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3
      }
    ]
  }), [chartData]);

  return (
    <aside className="sidebar right-sidebar glass">
      <section className="metrics-container">
        <h3>Current Metrics</h3>
        <div className="metric-card">
          <div className="icon-wrap"><i className="fa-solid fa-route"></i></div>
          <div className="metric-info">
            <span className="metric-label">Total Distance</span>
            <span className="metric-value">{metrics.dist}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="icon-wrap"><i className="fa-solid fa-truck"></i></div>
          <div className="metric-info">
            <span className="metric-label">Vehicles Used</span>
            <span className="metric-value">{metrics.vehicles}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="icon-wrap"><i className="fa-solid fa-triangle-exclamation"></i></div>
          <div className="metric-info">
            <span className="metric-label">Violations</span>
            <span className={`metric-value ${metrics.violations > 0 ? 'error' : ''}`}>
              {metrics.violations}
            </span>
          </div>
        </div>
      </section>

      <section className="chart-container">
        <h3>Convergence Curve</h3>
        <div className="chart-wrapper">
          <Line options={options} data={data} />
        </div>
      </section>
    </aside>
  );
};

export default Metrics;
