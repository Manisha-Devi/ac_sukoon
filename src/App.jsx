
import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/views/Dashboard';
import FareEntry from './components/views/FareEntry';
import FuelEntry from './components/views/FuelEntry';
import AddaFeesEntry from './components/views/AddaFeesEntry';
import ServiceEntry from './components/views/ServiceEntry';
import BonusCalculator from './components/views/BonusCalculator';
import Analytics from './components/views/Analytics';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'fareEntry':
        return <FareEntry />;
      case 'fuelEntry':
        return <FuelEntry />;
      case 'addaFeesEntry':
        return <AddaFeesEntry />;
      case 'serviceEntry':
        return <ServiceEntry />;
      case 'bonusCalculator':
        return <BonusCalculator />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
