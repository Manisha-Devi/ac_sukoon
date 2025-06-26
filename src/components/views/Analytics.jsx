
import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Analytics() {
  const profitData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Profit',
        data: [5000, 8000, 6000, 12000, 9000, 15000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
      {
        label: 'Loss',
        data: [2000, 1500, 3000, 1000, 2500, 800],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="analytics-section">
      <h2>Profit & Loss Analysis</h2>
      
      <div className="analytics-grid">
        <div className="chart-card large">
          <h3>Monthly Profit vs Loss</h3>
          <Bar data={profitData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>

        <div className="analytics-summary">
          <div className="summary-card profit">
            <h4>Total Profit</h4>
            <p>₹55,000</p>
            <span className="trend positive">↗ 12% from last period</span>
          </div>

          <div className="summary-card loss">
            <h4>Total Loss</h4>
            <p>₹10,800</p>
            <span className="trend negative">↘ 5% from last period</span>
          </div>

          <div className="summary-card net">
            <h4>Net Profit</h4>
            <p>₹44,200</p>
            <span className="trend positive">↗ 18% from last period</span>
          </div>
        </div>
      </div>

      <div className="detailed-analysis">
        <h3>Detailed Analysis</h3>
        <div className="analysis-metrics">
          <div className="metric">
            <span className="metric-label">Best Performing Route:</span>
            <span className="metric-value">Ghuraka to Bhaderwah</span>
          </div>
          <div className="metric">
            <span className="metric-label">Average Daily Profit:</span>
            <span className="metric-value">₹1,473</span>
          </div>
          <div className="metric">
            <span className="metric-label">Fuel Efficiency:</span>
            <span className="metric-value">12.5 km/L</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
