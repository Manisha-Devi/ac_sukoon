
import React from 'react';

function StatsGrid({ totalEarnings, totalExpenses, profit, profitPercentage }) {
  return (
    <div className="stats-grid">
      <div className="stat-card earnings">
        <div className="stat-icon">💰</div>
        <div className="stat-info">
          <h3>₹{totalEarnings.toLocaleString()}</h3>
          <p>Total Earnings</p>
          <div className="stat-change positive">+10% from last month</div>
        </div>
      </div>

      <div className="stat-card expenses">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
          <h3>₹{totalExpenses.toLocaleString()}</h3>
          <p>Total Expenses</p>
          <div className="stat-change negative">+5% from last month</div>
        </div>
      </div>

      <div className="stat-card profit">
        <div className="stat-icon">📈</div>
        <div className="stat-info">
          <h3>₹{profit.toLocaleString()}</h3>
          <p>Net Profit</p>
          <div className="stat-change positive">+{profitPercentage}% profit margin</div>
        </div>
      </div>

      <div className="stat-card routes">
        <div className="stat-icon">🚌</div>
        <div className="stat-info">
          <h3>12</h3>
          <p>Active Routes</p>
          <div className="stat-change">Daily operations</div>
        </div>
      </div>
    </div>
  );
}

export default StatsGrid;
