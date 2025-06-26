
import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/views/Dashboard';
import FareEntry from './components/views/FareEntry';
import FuelEntry from './components/views/FuelEntry';
import AddaFeesEntry from './components/views/AddaFeesEntry';
import ServiceEntry from './components/views/ServiceEntry';
import BonusCalculator from './components/views/BonusCalculator';
import Analytics from './components/views/Analytics';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'fare-entry':
        return <FareEntry />;
      case 'fuel-entry':
        return <FuelEntry />;
      case 'adda-fees':
        return <AddaFeesEntry />;
      case 'service-entry':
        return <ServiceEntry />;
      case 'bonus-calc':
        return <BonusCalculator />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
