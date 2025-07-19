
import React from 'react';
import '../css/LoadingScreen.css';

const LoadingScreen = ({ 
  type = 'spinner', 
  isVisible = false, 
  loadingText = 'Loading data...', 
  progress = 0,
  currentAction = '',
  refreshCount = 0
}) => {
  if (!isVisible) return null;

  const renderSpinnerLoader = () => (
    <div className="loading-content spinner-type">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <div className="loading-pulse-ring"></div>
      </div>
      <h3 className="loading-title">Loading Data</h3>
      <p className="loading-subtitle">{loadingText}</p>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );

  const renderProgressLoader = () => (
    <div className="loading-content progress-type">
      <div className="progress-container">
        <div className="progress-circle">
          <div className="progress-bar" style={{ '--progress': `${progress}%` }}>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
      <h3 className="loading-title">Fetching Data from Google Sheets</h3>
      <p className="loading-subtitle">{currentAction || loadingText}</p>
      <div className="loading-steps">
        <div className="step active">
          <i className="bi bi-check-circle-fill"></i>
          <span>Connecting to Database</span>
        </div>
        <div className={`step ${progress > 30 ? 'active' : ''}`}>
          <i className="bi bi-download"></i>
          <span>Downloading Records</span>
        </div>
        <div className={`step ${progress > 70 ? 'active' : ''}`}>
          <i className="bi bi-gear-fill"></i>
          <span>Processing Data</span>
        </div>
        <div className={`step ${progress >= 100 ? 'active' : ''}`}>
          <i className="bi bi-check-circle-fill"></i>
          <span>Complete</span>
        </div>
      </div>
      {refreshCount > 0 && (
        <small className="refresh-count">Refresh #{refreshCount}</small>
      )}
    </div>
  );

  const renderLogoLoader = () => (
    <div className="loading-content logo-type">
      <div className="logo-container">
        <div className="animated-logo">
          <i className="bi bi-speedometer2"></i>
          <div className="logo-pulse"></div>
        </div>
      </div>
      <h2 className="brand-title">AC SUKOON</h2>
      <h4 className="loading-title">Transport Management</h4>
      <p className="loading-subtitle">{loadingText}</p>
      <div className="loading-wave">
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
      </div>
      {currentAction && (
        <div className="current-action">
          <i className="bi bi-arrow-right"></i>
          <span>{currentAction}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="loading-overlay">
      <div className="loading-backdrop"></div>
      {type === 'spinner' && renderSpinnerLoader()}
      {type === 'progress' && renderProgressLoader()}
      {type === 'logo' && renderLogoLoader()}
    </div>
  );
};

export default LoadingScreen;
