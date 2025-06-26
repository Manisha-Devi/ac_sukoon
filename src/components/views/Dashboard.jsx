
import React from 'react';
import StatsGrid from '../ui/StatsGrid';
import ChartsSection from '../ui/ChartsSection';
import RecentActivity from '../ui/RecentActivity';

function Dashboard({ totalEarnings, totalExpenses, profit, profitPercentage }) {
  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <StatsGrid 
        totalEarnings={totalEarnings}
        totalExpenses={totalExpenses}
        profit={profit}
        profitPercentage={profitPercentage}
      />

      <ChartsSection />

      <RecentActivity />
    </div>
  );
}

export default Dashboard;
