import React, { useState, useEffect } from "react";
import "../css/Login.css";
import authService from "../../services/authService";

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "Admin"
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(null);

  // Test database connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      const connected = await authService.testConnection();
      setDbConnected(connected);
    };
    testConnection();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate against Google Sheets database
      const authResult = await authService.authenticateUser(
        formData.username,
        formData.password,
        formData.userType
      );

      setIsLoading(false);

      if (authResult.success) {
        // Create user details object (without password)
        const userDetails = {
          username: authResult.user.username,
          userType: authResult.user.userType,
          fullName: authResult.user.fullName,
          status: authResult.user.status,
          isAuthenticated: true
        };
        console.log('👤 User details for login:', userDetails);
        onLogin(userDetails);
      } else {
        setErrors({
          password: authResult.message || "Invalid username or password for selected user type"
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error('❌ Login error:', error);
      setErrors({
        password: "Authentication service error. Please try again."
      });
    }
  };

  const userTypeInfo = {
    Admin: { 
      icon: "bi-shield-check", 
      color: "danger",
      description: "Full System Access" 
    },
    Manager: { 
      icon: "bi-person-gear", 
      color: "warning",
      description: "Management Operations" 
    },
    Conductor: { 
      icon: "bi-bus-front", 
      color: "success",
      description: "Field Operations" 
    }
  };

  return (
    <div className="login-wrapper">
      <div className="container-fluid vh-100">
        <div className="row h-100 g-0">
          {/* Single Column - Login Section */}
          <div className="col-12">
            <div className="login-section">
              <div className="login-container">
                {/* Brand Header */}
                <div className="brand-header">
                  <i className="bi bi-speedometer2 brand-icon"></i>
                  <h2>AC SUKOON</h2>
                  <p>Transport Management System</p>
                </div>

                <div className="login-card">
                  <div className="card-header text-center">
                    <h4 className="card-title">Welcome Back</h4>
                    <p className="text-muted">Sign in to your account</p>
                  </div>

                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      {/* User Type Selection */}
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Select User Type</label>
                        <div className="user-type-grid">
                          {Object.entries(userTypeInfo).map(([type, info]) => (
                            <div
                              key={type}
                              className={`user-type-option ${formData.userType === type ? 'active' : ''}`}
                              onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
                            >
                              <div className="d-flex align-items-center">
                                <div className={`type-icon bg-${info.color} bg-opacity-10 text-${info.color}`}>
                                  <i className={`bi ${info.icon}`}></i>
                                </div>
                                <div className="type-info">
                                  <div className="type-name">{type}</div>
                                  <small className="type-desc text-muted">{info.description}</small>
                                </div>
                                <div className="type-check">
                                  {formData.userType === type && (
                                    <i className={`bi bi-check-circle-fill text-${info.color}`}></i>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Username Field */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-person me-2"></i>Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          className={`form-control form-control-lg ${errors.username ? 'is-invalid' : ''}`}
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Enter your username"
                          disabled={isLoading}
                        />
                        {errors.username && (
                          <div className="invalid-feedback">{errors.username}</div>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-lock me-2"></i>Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          disabled={isLoading}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                      </div>

                      {/* Login Button */}
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 login-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Signing In...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Sign In as {formData.userType}
                          </>
                        )}
                      </button>
                    </form>

                    {/* Database Connection Status */}
                    <div className="demo-info mt-4">
                      <div className={`alert py-2 ${dbConnected === true ? 'alert-success' : dbConnected === false ? 'alert-danger' : 'alert-warning'}`}>
                        <i className={`bi ${dbConnected === true ? 'bi-check-circle' : dbConnected === false ? 'bi-x-circle' : 'bi-clock'} me-2`}></i>
                        <small>
                          <strong>Database Status:</strong> 
                          {dbConnected === true && ' Connected to Google Sheets'}
                          {dbConnected === false && ' Database connection failed'}
                          {dbConnected === null && ' Connecting to database...'}
                        </small>
                      </div>
                      {dbConnected === false && (
                        <div className="alert alert-warning py-2 mt-2">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          <small>
                            <strong>Note:</strong> Please configure the Google Apps Script Web App URL in authService.js
                          </small>
                        </div>
                      )}
                    </div>
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

export default Login;