
import React, { useState, useEffect } from 'react';
import './App.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fareData, setFareData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(30200);
  const [totalExpenses, setTotalExpenses] = useState(15600);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate profit/loss
  const profit = totalEarnings - totalExpenses;
  const profitPercentage = ((profit / totalExpenses) * 100).toFixed(1);

  // Handle overlay click to close sidebar on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}
      
      <button 
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>
      
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="header-content">
            <h2>AC SUKOON</h2>
            <p>Dashboard</p>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        
        <div className="sidebar-menu">
          <div className="menu-section">
            <h4>PAGES</h4>
            <button
              className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              data-tooltip="Dashboard"
            >
              📊 {sidebarOpen && 'Dashboard'}
            </button>
          </div>

          <div className="menu-section">
            <h4>ENTRY</h4>
            <button
              className={`menu-item ${activeTab === 'fare-entry' ? 'active' : ''}`}
              onClick={() => setActiveTab('fare-entry')}
              data-tooltip="Fare Collection"
            >
              🎫 {sidebarOpen && 'Fare Collection'}
            </button>
            <button
              className={`menu-item ${activeTab === 'fuel-entry' ? 'active' : ''}`}
              onClick={() => setActiveTab('fuel-entry')}
              data-tooltip="Fuel Expense"
            >
              ⛽ {sidebarOpen && 'Fuel Expense'}
            </button>
            <button
              className={`menu-item ${activeTab === 'adda-fees' ? 'active' : ''}`}
              onClick={() => setActiveTab('adda-fees')}
              data-tooltip="Adda & Agent Fees"
            >
              🏢 {sidebarOpen && 'Adda & Agent Fees'}
            </button>
            <button
              className={`menu-item ${activeTab === 'service-entry' ? 'active' : ''}`}
              onClick={() => setActiveTab('service-entry')}
              data-tooltip="Service Expense"
            >
              🔧 {sidebarOpen && 'Service Expense'}
            </button>
          </div>

          <div className="menu-section">
            <h4>AUTOMATION</h4>
            <button
              className={`menu-item ${activeTab === 'bonus-calc' ? 'active' : ''}`}
              onClick={() => setActiveTab('bonus-calc')}
              data-tooltip="Bonus Calculator"
            >
              💰 {sidebarOpen && 'Bonus Calculator'}
            </button>
          </div>

          <div className="menu-section">
            <h4>ANALYSIS</h4>
            <button
              className={`menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
              data-tooltip="Analytics"
            >
              📈 {sidebarOpen && 'Analytics'}
            </button>
          </div>
        </div>
      </div>

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {activeTab === 'dashboard' && <Dashboard totalEarnings={totalEarnings} totalExpenses={totalExpenses} profit={profit} profitPercentage={profitPercentage} />}
        {activeTab === 'fare-entry' && <FareEntry fareData={fareData} setFareData={setFareData} setTotalEarnings={setTotalEarnings} />}
        {activeTab === 'fuel-entry' && <FuelEntry expenseData={expenseData} setExpenseData={setExpenseData} setTotalExpenses={setTotalExpenses} />}
        {activeTab === 'adda-fees' && <AddaFeesEntry />}
        {activeTab === 'service-entry' && <ServiceEntry />}
        {activeTab === 'bonus-calc' && <BonusCalculator />}
        {activeTab === 'analytics' && <Analytics />}
      </div>
    </div>
  );
}

function Dashboard({ totalEarnings, totalExpenses, profit, profitPercentage }) {
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
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
      </div>

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

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">🎫</span>
            <div className="activity-details">
              <p>Fare collected: Ghuraka to Bhaderwah - ₹2,500</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">⛽</span>
            <div className="activity-details">
              <p>Fuel expense added - ₹3,200</p>
              <small>4 hours ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FareEntry({ fareData, setFareData, setTotalEarnings }) {
  const [formData, setFormData] = useState({
    route: '',
    fare: '',
    passengers: '',
    date: '',
    time: ''
  });

  const routes = [
    'Ghuraka to Bhaderwah',
    'Bhaderwah to Pul Doda',
    'Pul Doda to Thatri',
    'Thatri to Pul Doda',
    'Pul Doda to Bhaderwah',
    'Bhaderwah to Ghuraka'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      ...formData,
      totalAmount: parseInt(formData.fare) * parseInt(formData.passengers)
    };
    setFareData([...fareData, newEntry]);
    setTotalEarnings(prev => prev + newEntry.totalAmount);
    setFormData({ route: '', fare: '', passengers: '', date: '', time: '' });
  };

  return (
    <div className="entry-section">
      <h2>Route-wise Fare Collection</h2>
      
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label>Route</label>
          <select
            value={formData.route}
            onChange={(e) => setFormData({...formData, route: e.target.value})}
            required
          >
            <option value="">Select Route</option>
            {routes.map(route => (
              <option key={route} value={route}>{route}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fare per Passenger (₹)</label>
            <input
              type="number"
              value={formData.fare}
              onChange={(e) => setFormData({...formData, fare: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Number of Passengers</label>
            <input
              type="number"
              value={formData.passengers}
              onChange={(e) => setFormData({...formData, passengers: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-btn">Add Fare Entry</button>
      </form>

      <div className="entries-table">
        <h3>Recent Fare Entries</h3>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Fare</th>
              <th>Passengers</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {fareData.map(entry => (
              <tr key={entry.id}>
                <td>{entry.route}</td>
                <td>₹{entry.fare}</td>
                <td>{entry.passengers}</td>
                <td>₹{entry.totalAmount}</td>
                <td>{entry.date}</td>
                <td>{entry.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses }) {
  const [formData, setFormData] = useState({
    amount: '',
    liters: '',
    rate: '',
    date: '',
    pumpName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: 'fuel',
      ...formData
    };
    setExpenseData([...expenseData, newEntry]);
    setTotalExpenses(prev => prev + parseInt(formData.amount));
    setFormData({ amount: '', liters: '', rate: '', date: '', pumpName: '' });
  };

  return (
    <div className="entry-section">
      <h2>Fuel Expense Entry</h2>
      
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Liters</label>
            <input
              type="number"
              step="0.01"
              value={formData.liters}
              onChange={(e) => setFormData({...formData, liters: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Rate per Liter (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({...formData, rate: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Pump Name</label>
            <input
              type="text"
              value={formData.pumpName}
              onChange={(e) => setFormData({...formData, pumpName: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Fuel Entry</button>
      </form>
    </div>
  );
}

function AddaFeesEntry() {
  const [formData, setFormData] = useState({
    type: 'adda',
    amount: '',
    description: '',
    date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Adda/Agent fees:', formData);
    setFormData({ type: 'adda', amount: '', description: '', date: '' });
  };

  return (
    <div className="entry-section">
      <h2>Adda & Agent Fees</h2>
      
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            required
          >
            <option value="adda">Adda Fees</option>
            <option value="agent">Agent Fees</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Entry</button>
      </form>
    </div>
  );
}

function ServiceEntry() {
  const [formData, setFormData] = useState({
    serviceType: '',
    amount: '',
    description: '',
    date: '',
    mechanic: ''
  });

  const serviceTypes = [
    'Engine Service',
    'Brake Service',
    'Tire Change',
    'Oil Change',
    'General Maintenance',
    'Repair Work'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Service entry:', formData);
    setFormData({ serviceType: '', amount: '', description: '', date: '', mechanic: '' });
  };

  return (
    <div className="entry-section">
      <h2>Service Expense Entry</h2>
      
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label>Service Type</label>
          <select
            value={formData.serviceType}
            onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
            required
          >
            <option value="">Select Service Type</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Mechanic/Service Center</label>
          <input
            type="text"
            value={formData.mechanic}
            onChange={(e) => setFormData({...formData, mechanic: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Service Entry</button>
      </form>
    </div>
  );
}

function BonusCalculator() {
  const [period, setPeriod] = useState('weekly');
  const [driverName, setDriverName] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [bonusPercentage, setBonusPercentage] = useState('');
  const [calculatedBonus, setCalculatedBonus] = useState(0);

  const calculateBonus = () => {
    const base = parseFloat(baseSalary);
    const percentage = parseFloat(bonusPercentage);
    const bonus = (base * percentage) / 100;
    setCalculatedBonus(bonus);
  };

  return (
    <div className="entry-section">
      <h2>Bonus Calculator</h2>
      
      <div className="bonus-calculator">
        <div className="form-group">
          <label>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Driver Name</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Base Salary (₹)</label>
            <input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bonus Percentage (%)</label>
          <input
            type="number"
            value={bonusPercentage}
            onChange={(e) => setBonusPercentage(e.target.value)}
          />
        </div>

        <button onClick={calculateBonus} className="calculate-btn">
          Calculate Bonus
        </button>

        {calculatedBonus > 0 && (
          <div className="bonus-result">
            <h3>Calculated Bonus: ₹{calculatedBonus.toFixed(2)}</h3>
            <p>Period: {period}</p>
            <p>Driver: {driverName}</p>
          </div>
        )}
      </div>
    </div>
  );
}

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

export default App;
