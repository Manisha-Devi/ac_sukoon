
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
import React from 'react';

function StatsGrid() {
  const stats = [
    {
      title: 'Total Earnings',
      value: '₹55,420',
      icon: '💰',
      type: 'earnings',
      trend: '+12%'
    },
    {
      title: 'Total Expenses',
      value: '₹23,650',
      icon: '📊',
      type: 'expenses',
      trend: '-5%'
    },
    {
      title: 'Net Profit',
      value: '₹31,770',
      icon: '📈',
      type: 'profit',
      trend: '+18%'
    },
    {
      title: 'Active Routes',
      value: '8',
      icon: '🚌',
      type: 'routes',
      trend: '+2'
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card ${stat.type}`}>
          <div className="stat-icon">
            {stat.icon}
          </div>
          <div className="stat-info">
            <h3>{stat.title}</h3>
            <p className="stat-value">{stat.value}</p>
            <span className="stat-trend">{stat.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
