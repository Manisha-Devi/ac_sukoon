
import React, { useState } from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>AC SUKOON</h2>
        <p>Dashboard</p>
      </div>
      
      <div className="sidebar-menu">
        <div className="menu-section">
          <h4>PAGES</h4>
          <button
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setIsOpen(false);
            }}
          >
            📊 Dashboard
          </button>
        </div>

        <div className="menu-section">
          <h4>ENTRY</h4>
          <button
            className={`menu-item ${activeTab === 'fare-entry' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('fare-entry');
              setIsOpen(false);
            }}
          >
            🎫 Fare Collection
          </button>
          <button
            className={`menu-item ${activeTab === 'fuel-entry' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('fuel-entry');
              setIsOpen(false);
            }}
          >
            ⛽ Fuel Expense
          </button>
          <button
            className={`menu-item ${activeTab === 'adda-fees' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('adda-fees');
              setIsOpen(false);
            }}
          >
            🏢 Adda & Agent Fees
          </button>
          <button
            className={`menu-item ${activeTab === 'service-entry' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('service-entry');
              setIsOpen(false);
            }}
          >
            🔧 Service Expense
          </button>
        </div>

        <div className="menu-section">
          <h4>AUTOMATION</h4>
          <button
            className={`menu-item ${activeTab === 'bonus-calc' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('bonus-calc');
              setIsOpen(false);
            }}
          >
            💰 Bonus Calculator
          </button>
        </div>

        <div className="menu-section">
          <h4>ANALYSIS</h4>
          <button
            className={`menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('analytics');
              setIsOpen(false);
            }}
          >
            📈 Analytics
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
