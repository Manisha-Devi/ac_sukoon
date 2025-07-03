import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/jsx/Login.jsx';
import FareRecipt from './components/jsx/FareRecipt.jsx';
import authService from './services/authService.js';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fareData, setFareData] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [cashBookEntries, setCashBookEntries] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Test connection to Google Sheets
        const testResult = await authService.testConnection();
        console.log('✅ Database connection successful:', testResult);

        // Check if user is already logged in
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('❌ Database connection failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setFareData([]);
    setTotalEarnings(0);
    setCashBookEntries([]);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Connecting to Google Sheets...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#!">
            <i className="bi bi-bus-front"></i> AC Sukoon Transport
          </a>
          <div className="navbar-nav ms-auto">
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        <FareRecipt 
          fareData={fareData}
          setFareData={setFareData}
          setTotalEarnings={setTotalEarnings}
          setCashBookEntries={setCashBookEntries}
        />
      </div>
    </div>
  );
}

export default App;