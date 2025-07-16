
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

function Analytics({ 
  fareData = [], 
  expenseData = [], 
  totalEarnings = 0, 
  totalExpenses = 0,
  cashBookEntries = [],
  allUsers = [],
  cashDeposit = [],
  dataStatistics = {},
  currentUser = {}
}) {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [entryTypeFilter, setEntryTypeFilter] = useState('all');

  console.log('📊 Analytics Props Received:', {
    fareDataCount: fareData.length,
    expenseDataCount: expenseData.length,
    cashBookEntriesCount: cashBookEntries.length,
    allUsersCount: allUsers.length,
    cashDepositCount: cashDeposit.length,
    dataStatistics,
    currentUser
  });

  // Advanced date filtering function
  const filterDataByDateRange = (data) => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'thisWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(now);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        break;
      case 'last7Days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        break;
      case 'last30Days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = new Date(now);
        break;
      case 'last3Months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        endDate = new Date(now);
        break;
      case 'custom':
        if (customDateFrom && customDateTo) {
          startDate = new Date(customDateFrom);
          endDate = new Date(customDateTo);
        } else {
          return data; // Return all data if custom dates not set
        }
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Filter data by user
  const filterDataByUser = (data) => {
    if (userFilter === 'all') return data;
    return data.filter(item => 
      item.submittedBy === userFilter || 
      item.depositedBy === userFilter
    );
  };

  // Filter data by entry type
  const filterDataByEntryType = (data) => {
    if (entryTypeFilter === 'all') return data;
    return data.filter(item => item.type === entryTypeFilter || item.entryType === entryTypeFilter);
  };

  // Apply all filters
  const applyFilters = (data) => {
    return filterDataByEntryType(filterDataByUser(filterDataByDateRange(data)));
  };

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const filteredFareData = applyFilters(fareData);
    const filteredExpenseData = applyFilters(expenseData);
    const filteredCashDeposit = applyFilters(cashDeposit);

    // Calculate earnings
    const dailyEarnings = filteredFareData
      .filter(entry => entry.type === 'daily')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const bookingEarnings = filteredFareData
      .filter(entry => entry.type === 'booking')
      .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

    const totalFilteredEarnings = dailyEarnings + bookingEarnings;

    // Calculate expenses by type
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

    const totalFilteredExpenses = fuelExpenses + addaExpenses + unionExpenses + serviceExpenses + otherExpenses;

    // Calculate cash vs bank breakdown
    const totalCash = filteredFareData.reduce((sum, item) => sum + (parseFloat(item.cashAmount) || 0), 0);
    const totalBank = filteredFareData.reduce((sum, item) => sum + (parseFloat(item.bankAmount) || 0), 0);
    
    const expenseCash = filteredExpenseData.reduce((sum, item) => sum + (parseFloat(item.cashAmount) || 0), 0);
    const expenseBank = filteredExpenseData.reduce((sum, item) => sum + (parseFloat(item.bankAmount) || 0), 0);

    // Calculate cash deposits total
    const totalCashDeposits = filteredCashDeposit.reduce((sum, item) => sum + (parseFloat(item.cashAmount) || 0), 0);

    const filteredProfit = totalFilteredEarnings - totalFilteredExpenses;

    // User-wise breakdown
    const userBreakdown = {};
    allUsers.forEach(user => {
      const userEarnings = filteredFareData
        .filter(entry => entry.submittedBy === user.name)
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
      
      const userExpenses = filteredExpenseData
        .filter(entry => entry.submittedBy === user.name)
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      userBreakdown[user.name] = {
        earnings: userEarnings,
        expenses: userExpenses,
        profit: userEarnings - userExpenses,
        fixedCash: user.fixedCash || 0
      };
    });

    return {
      earnings: totalFilteredEarnings,
      dailyEarnings,
      bookingEarnings,
      expenses: totalFilteredExpenses,
      profit: filteredProfit,
      profitMargin: totalFilteredEarnings > 0 ? (filteredProfit / totalFilteredEarnings) * 100 : 0,
      breakdown: {
        fuel: fuelExpenses,
        adda: addaExpenses,
        union: unionExpenses,
        service: serviceExpenses,
        other: otherExpenses
      },
      cashVsBank: {
        incomeCash: totalCash,
        incomeBank: totalBank,
        expenseCash,
        expenseBank,
        cashDeposits: totalCashDeposits
      },
      userBreakdown,
      entryStats: {
        totalEntries: filteredFareData.length + filteredExpenseData.length,
        fareEntries: filteredFareData.length,
        expenseEntries: filteredExpenseData.length,
        offDays: filteredFareData.filter(entry => entry.type === 'off').length
      }
    };
  }, [fareData, expenseData, cashDeposit, allUsers, dateRange, customDateFrom, customDateTo, userFilter, entryTypeFilter]);

  // Enhanced charts data
  const expenseBreakdownData = useMemo(() => ({
    labels: ['⛽ Fuel', '🏪 Adda', '🤝 Union', '🔧 Service', '📦 Other'],
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
          '#e74c3c', // Red for fuel
          '#3498db', // Blue for adda
          '#f39c12', // Orange for union
          '#2ecc71', // Green for service
          '#9b59b6'  // Purple for other
        ],
        borderWidth: 4,
        borderColor: '#ffffff',
        hoverBorderWidth: 6,
        hoverOffset: 15,
      },
    ],
  }), [analytics.breakdown]);

  // User-wise performance chart
  const userPerformanceData = useMemo(() => {
    const userNames = Object.keys(analytics.userBreakdown);
    const userEarnings = userNames.map(name => analytics.userBreakdown[name].earnings);
    const userExpenses = userNames.map(name => analytics.userBreakdown[name].expenses);

    return {
      labels: userNames,
      datasets: [
        {
          label: '💰 Earnings',
          data: userEarnings,
          backgroundColor: 'rgba(46, 213, 115, 0.8)',
          borderColor: '#2ed573',
          borderWidth: 2,
        },
        {
          label: '💸 Expenses',
          data: userExpenses,
          backgroundColor: 'rgba(255, 107, 107, 0.8)',
          borderColor: '#ff6b6b',
          borderWidth: 2,
        },
      ],
    };
  }, [analytics.userBreakdown]);

  // Daily trend chart
  const dailyTrendData = useMemo(() => {
    const last14Days = Array.from({length: 14}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyData = last14Days.map(date => {
      const dayEarnings = fareData
        .filter(entry => entry.date === date && entry.type !== 'off')
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
      
      const dayExpenses = expenseData
        .filter(entry => entry.date === date)
        .reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);

      return {
        date,
        earnings: dayEarnings,
        expenses: dayExpenses,
        profit: dayEarnings - dayExpenses
      };
    });

    return {
      labels: dailyData.map(d => new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: '📈 Daily Profit',
          data: dailyData.map(d => d.profit),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [fareData, expenseData]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y?.toLocaleString('en-IN') || context.parsed?.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="fade-in">
      {/* Header with advanced filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-graph-up me-2"></i>
          Advanced Analytics
        </h2>
      </div>

      {/* Advanced Filter Controls */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Date Range</label>
          <select 
            className="form-select" 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="last7Days">Last 7 Days</option>
            <option value="last30Days">Last 30 Days</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateRange === 'custom' && (
          <>
            <div className="col-md-2">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="col-md-3">
          <label className="form-label">User Filter</label>
          <select 
            className="form-select" 
            value={userFilter} 
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            {allUsers.map(user => (
              <option key={user.username} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Entry Type</label>
          <select 
            className="form-select" 
            value={entryTypeFilter} 
            onChange={(e) => setEntryTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="booking">Booking</option>
            <option value="fuel">Fuel</option>
            <option value="adda">Adda</option>
            <option value="union">Union</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Enhanced Key Metrics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-2">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h6 className="card-title text-success">Total Earnings</h6>
              <h4 className="card-text">₹{analytics.earnings.toLocaleString()}</h4>
              <small className="text-muted">
                Daily: ₹{analytics.dailyEarnings.toLocaleString()} | 
                Booking: ₹{analytics.bookingEarnings.toLocaleString()}
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-2">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h6 className="card-title text-danger">Total Expenses</h6>
              <h4 className="card-text">₹{analytics.expenses.toLocaleString()}</h4>
              <small className="text-muted">
                {analytics.entryStats.expenseEntries} entries
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-2">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h6 className="card-title text-primary">Net Profit</h6>
              <h4 className="card-text">₹{analytics.profit.toLocaleString()}</h4>
              <small className={analytics.profit > 0 ? "text-success" : "text-danger"}>
                {analytics.profitMargin.toFixed(1)}% margin
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-2">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h6 className="card-title text-info">Cash vs Bank</h6>
              <h4 className="card-text">₹{analytics.cashVsBank.incomeCash.toLocaleString()}</h4>
              <small className="text-muted">
                Cash Income
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-2">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h6 className="card-title text-warning">Total Entries</h6>
              <h4 className="card-text">{analytics.entryStats.totalEntries}</h4>
              <small className="text-muted">
                {analytics.entryStats.fareEntries} income | {analytics.entryStats.expenseEntries} expense
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-2">
          <div className="analytics-stats-card">
            <div className="card-body text-center">
              <h6 className="card-title text-secondary">Cash Deposits</h6>
              <h4 className="card-text">₹{analytics.cashVsBank.cashDeposits.toLocaleString()}</h4>
              <small className="text-muted">
                Bank deposits
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
              <i className="bi bi-line-chart me-2"></i>
              Daily Profit Trend (Last 14 Days)
            </h5>
            <Line data={dailyTrendData} options={chartOptions} />
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

      {/* User Performance and Detailed Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="analytics-chart-card">
            <h5>
              <i className="bi bi-people me-2"></i>
              User-wise Performance
            </h5>
            <Bar data={userPerformanceData} options={chartOptions} />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="analytics-summary-card">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-clipboard-data me-2"></i>
                Detailed Insights
              </h5>
              <div className="row g-3">
                <div className="col-12">
                  <strong>Entry Statistics:</strong>
                  <div className="ms-2">
                    <div>Fare Entries: {analytics.entryStats.fareEntries}</div>
                    <div>Expense Entries: {analytics.entryStats.expenseEntries}</div>
                    <div>Off Days: {analytics.entryStats.offDays}</div>
                  </div>
                </div>
                <div className="col-12">
                  <strong>Cash Flow:</strong>
                  <div className="ms-2">
                    <div>Income Cash: ₹{analytics.cashVsBank.incomeCash.toLocaleString()}</div>
                    <div>Income Bank: ₹{analytics.cashVsBank.incomeBank.toLocaleString()}</div>
                    <div>Expense Cash: ₹{analytics.cashVsBank.expenseCash.toLocaleString()}</div>
                    <div>Expense Bank: ₹{analytics.cashVsBank.expenseBank.toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-12">
                  <strong>Top Performer:</strong>
                  <div className="ms-2">
                    {Object.entries(analytics.userBreakdown)
                      .sort(([,a], [,b]) => b.profit - a.profit)[0]?.[0] || 'No data'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User-wise Breakdown Table */}
      <div className="row g-4">
        <div className="col-12">
          <div className="analytics-chart-card">
            <h5>
              <i className="bi bi-table me-2"></i>
              User-wise Performance Breakdown
            </h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Earnings</th>
                    <th>Expenses</th>
                    <th>Profit</th>
                    <th>Fixed Cash</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analytics.userBreakdown).map(([userName, data]) => (
                    <tr key={userName}>
                      <td><strong>{userName}</strong></td>
                      <td className="text-success">₹{data.earnings.toLocaleString()}</td>
                      <td className="text-danger">₹{data.expenses.toLocaleString()}</td>
                      <td className={data.profit >= 0 ? 'text-success' : 'text-danger'}>
                        ₹{data.profit.toLocaleString()}
                      </td>
                      <td className="text-info">₹{data.fixedCash.toLocaleString()}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{width: '60px', height: '8px'}}>
                            <div 
                              className={`progress-bar ${data.profit >= 0 ? 'bg-success' : 'bg-danger'}`}
                              style={{width: `${Math.min(100, Math.abs(data.profit) / 1000)}%`}}
                            ></div>
                          </div>
                          <small>{data.profit >= 0 ? 'Profitable' : 'Loss'}</small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
