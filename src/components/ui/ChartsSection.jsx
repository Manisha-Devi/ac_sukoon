
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

function ChartsSection() {
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Earnings',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const doughnutData = {
    labels: ['Fare Collection', 'Fuel Expense', 'Service Cost', 'Other'],
    datasets: [
      {
        data: [60, 25, 10, 5],
        backgroundColor: ['#4CAF50', '#FF5722', '#2196F3', '#FFC107'],
      },
    ],
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Monthly Earnings Trend</h3>
        <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      <div className="chart-card">
        <h3>Expense Breakdown</h3>
        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
}

export default ChartsSection;
