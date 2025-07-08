
import React, { useState } from "react";
import "../css/Navbar.css";

function Navbar({ user, onLogout, isRefreshing, setIsRefreshing, lastRefreshTime, setLastRefreshTime, onDataRefresh, onToggleSidebar }) {
  // Centralized refresh function - Navbar में हो रहा है
  const handleCentralizedRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes

    setIsRefreshing(true);
    setLastRefreshTime(null); // Reset tick mark

    try {
      console.log('🔄 Navbar: Starting centralized data refresh...');

      // Call the refresh function passed from App.jsx
      if (onDataRefresh) {
        await onDataRefresh();
      }

      // Set completion time to show tick mark
      setLastRefreshTime(new Date());
      console.log('✅ Navbar: Centralized refresh completed');

      // Auto hide tick mark after 3 seconds
      setTimeout(() => {
        setLastRefreshTime(null);
      }, 3000);

    } catch (error) {
      console.error('❌ Navbar: Centralized refresh failed:', error);
      alert('Unable to refresh data. Please check your internet connection.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        {/* Mobile Menu Button - Left Side */}
        <button 
          className="btn btn-link text-white p-2 d-lg-none" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSidebar && onToggleSidebar();
          }}
          aria-label="Toggle sidebar"
          type="button"
        >
          <i className="bi bi-list fs-4"></i>
        </button>

        {/* Brand - Center on Mobile, Left on Desktop */}
        <a className="navbar-brand mx-auto mx-lg-0" href="#">
          <i className="bi bi-speedometer2 me-2"></i>
          <span className="d-none d-md-inline">AC SUKOON Dashboard System</span>
          <span className="d-md-none">AC SUKOON</span>
        </a>

        {/* Search Bar - Hidden on Small Screens */}
        <div className="navbar-search d-none d-md-block">
          <i className="bi bi-search"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
          />
        </div>

        {/* Right Side Controls */}
        <div className="d-flex align-items-center">
          {/* Centralized Refresh Icon - Navbar में implement किया गया */}
          <button 
            className={`btn btn-link text-white p-2 me-2 ${isRefreshing ? 'disabled' : ''}`}
            onClick={handleCentralizedRefresh}
            disabled={isRefreshing}
            title={
              isRefreshing 
                ? 'Refreshing data...' 
                : lastRefreshTime 
                  ? 'Click to refresh again' 
                  : 'Refresh all data from Google Sheets'
            }
            type="button"
          >
            <i className={`bi ${
              isRefreshing 
                ? 'bi-arrow-clockwise rotating' 
                : lastRefreshTime 
                  ? 'bi-check-circle-fill text-success' 
                  : 'bi-arrow-clockwise'
            } fs-5`}></i>
          </button>

          {/* Desktop Toggle and User Info */}
          <div className="d-none d-lg-flex align-items-center">
            <button 
              className="btn btn-link text-white p-2 me-3" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSidebar && onToggleSidebar();
              }}
              title="Toggle Sidebar"
              type="button"
            >
              <i className="bi bi-layout-sidebar-inset fs-5"></i>
            </button>
            <span className="text-white">
              <i className="bi bi-person-circle me-2"></i>
               {user?.username} ({user?.userType})
            </span>
            <button
                className="btn btn-outline-danger btn-sm ms-2"
                onClick={onLogout}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
          </div>

          {/* Mobile User Icon */}
          <div className="d-lg-none">
            <span className="text-white">
              <i className="bi bi-person-circle fs-5"></i>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
