
import React, { useState } from 'react';
import "../css/FareEntry.css";

function FareEntry({ fareData, setFareData, setTotalEarnings }) {
  const [formData, setFormData] = useState({
    date: '',
    routeType: 'daily',
    totalFare: '',
    cashAmount: '',
    bankAmount: '',
    bookingDetails: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      ...formData,
      cashAmount: parseFloat(formData.cashAmount) || 0,
      bankAmount: parseFloat(formData.bankAmount) || 0,
      totalFare: parseFloat(formData.totalFare) || 0
    };
    
    setFareData([...fareData, newEntry]);
    setTotalEarnings(prev => prev + newEntry.totalFare);
    
    // Reset form
    setFormData({
      date: '',
      routeType: 'daily',
      totalFare: '',
      cashAmount: '',
      bankAmount: '',
      bookingDetails: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fare-entry">
      <h2 className="mb-4">Fare Collection Entry</h2>
      
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Route Type</label>
              <select
                className="form-select"
                name="routeType"
                value={formData.routeType}
                onChange={handleInputChange}
              >
                <option value="daily">Daily Route</option>
                <option value="booking">Booking</option>
                <option value="off">Off Day</option>
              </select>
            </div>
          </div>

          {formData.routeType === 'daily' && (
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Total Fare</label>
                <input
                  type="number"
                  className="form-control"
                  name="totalFare"
                  value={formData.totalFare}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="col-md-4 mb-3">
                <label className="form-label">Cash Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="cashAmount"
                  value={formData.cashAmount}
                  onChange={handleInputChange}
                  step="0.01"
                />
              </div>
              
              <div className="col-md-4 mb-3">
                <label className="form-label">Bank Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="bankAmount"
                  value={formData.bankAmount}
                  onChange={handleInputChange}
                  step="0.01"
                />
              </div>
            </div>
          )}

          {formData.routeType === 'booking' && (
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Booking Details</label>
                <textarea
                  className="form-control"
                  name="bookingDetails"
                  value={formData.bookingDetails}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter booking details..."
                />
              </div>
              
              <div className="col-md-4 mb-3">
                <label className="form-label">Total Fare</label>
                <input
                  type="number"
                  className="form-control"
                  name="totalFare"
                  value={formData.totalFare}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="col-md-4 mb-3">
                <label className="form-label">Cash Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="cashAmount"
                  value={formData.cashAmount}
                  onChange={handleInputChange}
                  step="0.01"
                />
              </div>
              
              <div className="col-md-4 mb-3">
                <label className="form-label">Bank Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="bankAmount"
                  value={formData.bankAmount}
                  onChange={handleInputChange}
                  step="0.01"
                />
              </div>
            </div>
          )}

          {formData.routeType === 'off' && (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Off day selected - No fare collection entry needed.
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Add Entry
          </button>
        </form>
      </div>

      {/* Display recent entries */}
      <div className="mt-4">
        <h4>Recent Entries</h4>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Total Fare</th>
                <th>Cash</th>
                <th>Bank</th>
              </tr>
            </thead>
            <tbody>
              {fareData.slice(-5).map(entry => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.routeType}</td>
                  <td>₹{entry.totalFare}</td>
                  <td>₹{entry.cashAmount}</td>
                  <td>₹{entry.bankAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FareEntry;
