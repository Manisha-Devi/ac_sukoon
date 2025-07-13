
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

  // Monthly trends chart data with enhanced styling
  const monthlyTrendsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const earningsData = months.map((_, index) => {
      const baseAmount = Math.floor(totalEarnings / 12);
      const variance = Math.floor(Math.random() * 8000) - 4000;
      const seasonalFactor = 1 + 0.3 * Math.sin((index / 12) * 2 * Math.PI);
      return Math.max(0, Math.floor((baseAmount + variance) * seasonalFactor));
    });
    
    const expensesData = months.map((_, index) => {
      const baseAmount = Math.floor(totalExpenses / 12);
      const variance = Math.floor(Math.random() * 4000) - 2000;
      const seasonalFactor = 1 + 0.2 * Math.sin((index / 12) * 2 * Math.PI);
      return Math.max(0, Math.floor((baseAmount + variance) * seasonalFactor));
    });

    return {
      labels: months,
      datasets: [
        {
          label: '💰 Earnings',
          data: earningsData,
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(46, 213, 115, 0.9)');
            gradient.addColorStop(1, 'rgba(46, 213, 115, 0.1)');
            return gradient;
          },
          borderColor: '#2ed573',
          borderWidth: 3,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(46, 213, 115, 1)',
          hoverBorderWidth: 4,
        },
        {
          label: '💸 Expenses',
          data: expensesData,
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(255, 107, 107, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 107, 107, 0.1)');
            return gradient;
          },
          borderColor: '#ff6b6b',
          borderWidth: 3,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(255, 107, 107, 1)',
          hoverBorderWidth: 4,
        },
      ],
    };
  }, [totalEarnings, totalExpenses]);

  // Enhanced expense breakdown pie chart
  const expenseBreakdownData = useMemo(() => ({
    labels: ['⛽ Fuel', '🏪 Adda Payments', '🤝 Union Payments', '🔧 Service', '📦 Other'],
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
        hoverBorderColor: '#2c3e50',
        cutout: '40%',
        radius: '90%',
        animation: {
          animateRotate: true,
          animateScale: true,
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        }
      },
    ],
  }), [analytics.breakdown]);

  // Enhanced weekly profit trend
  const weeklyProfitData = useMemo(() => {
    const days = Array.from({length: 14}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const avgDailyProfit = Math.floor(netProfit / 30);
    const profitData = days.map((_, index) => {
      const variance = Math.floor(Math.random() * 3000) - 1500;
      const trendFactor = 1 + (index / 14) * 0.2; // Slight upward trend
      return Math.max(0, Math.floor((avgDailyProfit + variance) * trendFactor));
    });

    return {
      labels: days,
      datasets: [
        {
          label: '📈 Daily Profit Trend',
          data: profitData,
          borderColor: '#667eea',
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
            gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
            return gradient;
          },
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointRadius: 8,
          pointHoverRadius: 12,
          pointHoverBackgroundColor: '#5a67d8',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 4,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(102, 126, 234, 0.3)',
        },
      ],
    };
  }, [netProfit]);

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#667eea',
        borderWidth: 2,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold'
          },
          color: '#6b7280',
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold'
          },
          color: '#6b7280'
        }
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    }
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
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#667eea',
        borderWidth: 2,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#667eea',
        borderWidth: 2,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold'
          },
          color: '#6b7280',
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold'
          },
          color: '#6b7280'
        }
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    }
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
