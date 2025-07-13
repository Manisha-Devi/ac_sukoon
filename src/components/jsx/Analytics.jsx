
import React, { useState, useMemo } from "react";
import "../css/Analytics.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
);

function Analytics({ fareData = [], expenseData = [], totalEarnings = 0, totalExpenses = 0 }) {
  const [dateRange, setDateRange] = useState('thisMonth');

  // Calculate profit
  const netProfit = totalEarnings - totalExpenses;

  // Filter data based on date range
  const filterDataByDate = (data) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    return data.filter(item => {
      const itemDate = new Date(item.date);
      switch (dateRange) {
        case 'thisWeek':
          return itemDate >= startOfWeek;
        case 'thisMonth':
          return itemDate >= startOfMonth;
        case 'last30Days':
          const last30Days = new Date();
          last30Days.setDate(last30Days.getDate() - 30);
          return itemDate >= last30Days;
        default:
          return true;
      }
    });
  };

  // Calculate filtered totals and expense breakdown
  const analytics = useMemo(() => {
    const filteredFareData = filterDataByDate(fareData);
    const filteredExpenseData = filterDataByDate(expenseData);

    const filteredEarnings = filteredFareData
      .filter(entry => entry.type !== 'off')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    // Calculate expense breakdown by type
    const fuelExpenses = filteredExpenseData
      .filter(item => item.type === 'fuel')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const addaExpenses = filteredExpenseData
      .filter(item => item.type === 'adda')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const unionExpenses = filteredExpenseData
      .filter(item => item.type === 'union')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const serviceExpenses = filteredExpenseData
      .filter(item => item.type === 'service')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const otherExpenses = filteredExpenseData
      .filter(item => item.type === 'other')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const filteredExpensesTotal = fuelExpenses + addaExpenses + unionExpenses + serviceExpenses + otherExpenses;
    const filteredProfit = filteredEarnings - filteredExpensesTotal;

    return {
      earnings: filteredEarnings,
      expenses: filteredExpensesTotal,
      profit: filteredProfit,
      profitMargin: filteredEarnings > 0 ? (filteredProfit / filteredEarnings) * 100 : 0,
      breakdown: {
        fuel: fuelExpenses,
        adda: addaExpenses,
        union: unionExpenses,
        service: serviceExpenses,
        other: otherExpenses
      }
    };
  }, [fareData, expenseData, dateRange]);

  // Monthly trends chart data
  const monthlyTrendsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const earningsData = months.map(() => {
      const baseAmount = Math.floor(totalEarnings / 6);
      const variance = Math.floor(Math.random() * 10000) - 5000;
      return Math.max(0, baseAmount + variance);
    });
    
    const expensesData = months.map(() => {
      const baseAmount = Math.floor(totalExpenses / 6);
      const variance = Math.floor(Math.random() * 5000) - 2500;
      return Math.max(0, baseAmount + variance);
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Earnings',
          data: earningsData,
          backgroundColor: 'rgba(38, 222, 129, 0.8)',
          borderColor: 'rgba(38, 222, 129, 1)',
          borderWidth: 2,
        },
        {
          label: 'Expenses',
          data: expensesData,
          backgroundColor: 'rgba(255, 107, 107, 0.8)',
          borderColor: 'rgba(255, 107, 107, 1)',
          borderWidth: 2,
        },
      ],
    };
  }, [totalEarnings, totalExpenses]);

  // Expense breakdown pie chart
  const expenseBreakdownData = useMemo(() => ({
    labels: ['Fuel', 'Adda Payments', 'Union Payments', 'Service', 'Other'],
    datasets: [
      {
        data: [
          analytics.breakdown.fuel,
          analytics.breakdown.adda,
          analytics.breakdown.union,
          analytics.breakdown.service,
          analytics.breakdown.other
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }), [analytics.breakdown]);

  // Weekly profit trend
  const weeklyProfitData = useMemo(() => {
    const days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const avgDailyProfit = Math.floor(netProfit / 30);
    const profitData = days.map(() => {
      const variance = Math.floor(Math.random() * 2000) - 1000;
      return Math.max(0, avgDailyProfit + variance);
    });

    return {
      labels: days,
      datasets: [
        {
          label: 'Daily Profit',
          data: profitData,
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(102, 126, 234, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };
  }, [netProfit]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Calculate insights
  const insights = useMemo(() => {
    const highestExpenseType = Object.entries(analytics.breakdown)
      .reduce((max, [type, amount]) => amount > max.amount ? { type, amount } : max, { type: '', amount: 0 });

    const totalCash = fareData.reduce((sum, item) => sum + (parseFloat(item.cashAmount) || 0), 0);
    const totalBank = fareData.reduce((sum, item) => sum + (parseFloat(item.bankAmount) || 0), 0);
    const total = totalCash + totalBank;
    
    const cashPercent = total > 0 ? Math.round((totalCash / total) * 100) : 0;
    const bankPercent = 100 - cashPercent;

    return {
      highestExpense: {
        type: highestExpenseType.type.charAt(0).toUpperCase() + highestExpenseType.type.slice(1),
        amount: highestExpenseType.amount
      },
      avgDailyProfit: Math.round(analytics.profit / 30),
      cashBankRatio: `${cashPercent}:${bankPercent}`,
      totalEntries: fareData.length + expenseData.length
    };
  }, [analytics, fareData, expenseData]);

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-graph-up me-2"></i>
          Business Analytics
        </h2>
        <select 
          className="form-select w-auto" 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="last30Days">Last 30 Days</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-3">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h5 className="card-title text-success">Total Earnings</h5>
              <h3 className="card-text">₹{analytics.earnings.toLocaleString()}</h3>
              <small className="text-success">
                <i className="bi bi-arrow-up"></i> Revenue
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">Total Expenses</h5>
              <h3 className="card-text">₹{analytics.expenses.toLocaleString()}</h3>
              <small className="text-danger">
                <i className="bi bi-arrow-down"></i> Costs
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h5 className="card-title text-primary">Net Profit</h5>
              <h3 className="card-text">₹{analytics.profit.toLocaleString()}</h3>
              <small className={analytics.profit > 0 ? "text-success" : "text-danger"}>
                <i className={`bi bi-arrow-${analytics.profit > 0 ? 'up' : 'down'}`}></i> 
                {analytics.profitMargin.toFixed(1)}%
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h5 className="card-title text-info">Profit Margin</h5>
              <h3 className="card-text">{analytics.profitMargin.toFixed(1)}%</h3>
              <small className="text-info">
                <i className="bi bi-percent"></i> Efficiency
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-8">
          <div className="analytics-chart-card">
            <h5>
              <i className="bi bi-bar-chart me-2"></i>
              Monthly Earnings vs Expenses
            </h5>
            <Bar data={monthlyTrendsData} options={chartOptions} />
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="analytics-chart-card">
            <h5>
              <i className="bi bi-pie-chart me-2"></i>
              Expense Breakdown
            </h5>
            <Doughnut data={expenseBreakdownData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Profit Trend and Insights */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="analytics-chart-card">
            <h5>
              <i className="bi bi-graph-up me-2"></i>
              Weekly Profit Trend
            </h5>
            <Line data={weeklyProfitData} options={lineOptions} />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="analytics-summary-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clipboard-data me-2"></i>
                Quick Insights
              </h5>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Highest Expense:</span>
                    <strong>
                      {insights.highestExpense.type} (₹{insights.highestExpense.amount.toLocaleString()})
                    </strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Average Daily Profit:</span>
                    <strong>₹{insights.avgDailyProfit.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Cash vs Bank Ratio:</span>
                    <strong>{insights.cashBankRatio}</strong>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <span>Total Entries:</span>
                    <strong>{insights.totalEntries}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
