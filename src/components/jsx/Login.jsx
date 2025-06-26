
import React, { useState } from "react";
import "../css/Login.css";

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "Admin"
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Pass user data to parent component
      onLogin({
        username: formData.username,
        userType: formData.userType,
        isAuthenticated: true
      });
    }, 1000);
  };

  const userTypeIcons = {
    Admin: "bi-shield-check",
    Manager: "bi-person-gear",
    Conductor: "bi-bus-front"
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100">
          <div className="row w-100 justify-content-center">
            <div className="col-12 col-md-6 col-lg-5 col-xl-4">
              <div className="login-card">
                <div className="login-header">
                  <div className="logo-section">
                    <i className="bi bi-speedometer2 logo-icon"></i>
                    <h2>AC SUKOON</h2>
                    <p>Transport Management System</p>
                  </div>
                </div>

                <div className="login-body">
                  <form onSubmit={handleSubmit}>
                    {/* User Type Selection */}
                    <div className="mb-4">
                      <label className="form-label">Select User Type</label>
                      <div className="user-type-selection">
                        {["Admin", "Manager", "Conductor"].map((type) => (
                          <div
                            key={type}
                            className={`user-type-card ${formData.userType === type ? 'selected' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
                          >
                            <i className={`bi ${userTypeIcons[type]}`}></i>
                            <span>{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Username Input */}
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="bi bi-person me-2"></i>
                        Username
                      </label>
                      <input
                        type="text"
                        className={`form-control login-input ${errors.username ? 'is-invalid' : ''}`}
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter your username"
                        disabled={isLoading}
                      />
                      {errors.username && (
                        <div className="invalid-feedback">{errors.username}</div>
                      )}
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                      <label className="form-label">
                        <i className="bi bi-lock me-2"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        className={`form-control login-input ${errors.password ? 'is-invalid' : ''}`}
                        name="password"
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
                      className="btn login-btn w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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

                  {/* Demo Credentials */}
                  <div className="demo-credentials">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Demo Credentials: admin/1234, manager/1234, conductor/1234
                    </small>
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
