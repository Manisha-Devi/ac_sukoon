
import React, { useState } from "react";
import "../css/Navbar.css";

function Navbar({ user, onLogout, isRefreshing, setIsRefreshing, lastRefreshTime, setLastRefreshTime, onDataRefresh, onToggleSidebar }) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Toggle user dropdown
  const toggleUserDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showUserDropdown) {
      // Calculate position based on button position
      const rect = e.currentTarget.getBoundingClientRect();
      const isMobile = window.innerWidth < 992;
      
      setDropdownPosition({
        top: rect.bottom + 8,
        right: isMobile ? 10 : window.innerWidth - rect.right
      });
    }
    
    setShowUserDropdown(!showUserDropdown);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
            
            {/* User Dropdown */}
            <div className="user-dropdown-container position-relative">
              <button
                className="btn btn-link text-white p-2 d-flex align-items-center"
                onClick={toggleUserDropdown}
                title="User Menu"
                type="button"
              >
                <i className="bi bi-person-circle me-2 fs-5"></i>
                <span className="me-1">{user?.username}</span>
                <i className={`bi ${showUserDropdown ? 'bi-chevron-up' : 'bi-chevron-down'} small`}></i>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div 
                  className="user-dropdown-menu"
                  style={{
                    position: 'fixed',
                    top: `${dropdownPosition.top}px`,
                    right: `${dropdownPosition.right}px`,
                    zIndex: 9999
                  }}
                >
                  <div className="dropdown-header">
                    <div className="user-avatar">
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user?.fullName || user?.username}</div>
                      <div className="user-role">{user?.userType}</div>
                    </div>
                  </div>
                  
                  <hr className="dropdown-divider" />
                  
                  <div className="dropdown-body">
                    <div className="user-detail">
                      <i className="bi bi-person"></i>
                      <div>
                        <span className="detail-label">Username</span>
                        <span className="detail-value">{user?.username}</span>
                      </div>
                    </div>
                    
                    <div className="user-detail">
                      <i className="bi bi-shield-check"></i>
                      <div>
                        <span className="detail-label">Role</span>
                        <span className="detail-value">{user?.userType}</span>
                      </div>
                    </div>
                    
                    <div className="user-detail">
                      <i className="bi bi-calendar-check"></i>
                      <div>
                        <span className="detail-label">Status</span>
                        <span className="detail-value">{user?.status || 'Active'}</span>
                      </div>
                    </div>

                    {user?.fixedCash && (
                      <div className="user-detail">
                        <i className="bi bi-cash-stack"></i>
                        <div>
                          <span className="detail-label">Fixed Cash</span>
                          <span className="detail-value">₹{user?.fixedCash?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <hr className="dropdown-divider" />
                  
                  <div className="dropdown-footer">
                    <button
                      className="logout-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      type="button"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile User Icon */}
          <div className="d-lg-none">
            <div className="user-dropdown-container position-relative">
              <button
                className="btn btn-link text-white p-2"
                onClick={toggleUserDropdown}
                title="User Menu"
                type="button"
              >
                <i className="bi bi-person-circle fs-5"></i>
              </button>

              {/* Mobile Dropdown Menu */}
              {showUserDropdown && (
                <div 
                  className="user-dropdown-menu mobile-dropdown"
                  style={{
                    position: 'fixed',
                    top: `${dropdownPosition.top}px`,
                    right: `${dropdownPosition.right}px`,
                    zIndex: 9999
                  }}
                >
                  <div className="dropdown-header">
                    <div className="user-avatar">
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user?.fullName || user?.username}</div>
                      <div className="user-role">{user?.userType}</div>
                    </div>
                  </div>
                  
                  <hr className="dropdown-divider" />
                  
                  <div className="dropdown-body">
                    <div className="user-detail">
                      <i className="bi bi-person"></i>
                      <div>
                        <span className="detail-label">Username</span>
                        <span className="detail-value">{user?.username}</span>
                      </div>
                    </div>
                    
                    <div className="user-detail">
                      <i className="bi bi-shield-check"></i>
                      <div>
                        <span className="detail-label">Role</span>
                        <span className="detail-value">{user?.userType}</span>
                      </div>
                    </div>
                    
                    <div className="user-detail">
                      <i className="bi bi-calendar-check"></i>
                      <div>
                        <span className="detail-label">Status</span>
                        <span className="detail-value">{user?.status || 'Active'}</span>
                      </div>
                    </div>

                    {user?.fixedCash && (
                      <div className="user-detail">
                        <i className="bi bi-cash-stack"></i>
                        <div>
                          <span className="detail-label">Fixed Cash</span>
                          <span className="detail-value">₹{user?.fixedCash?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <hr className="dropdown-divider" />
                  
                  <div className="dropdown-footer">
                    <button
                      className="logout-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      type="button"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
