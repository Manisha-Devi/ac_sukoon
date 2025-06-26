
import React, { useState } from 'react';
import "../css/FuelEntry.css";

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses }) {
  const [formData, setFormData] = useState({
    date: '',
    fuelType: 'petrol',
    liters: '',
    pricePerLiter: '',
    totalAmount: '',
    station: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      ...formData,
      liters: parseFloat(formData.liters) || 0,
      pricePerLiter: parseFloat(formData.pricePerLiter) || 0,
      totalAmount: parseFloat(formData.totalAmount) || 0
    };
    
    setExpenseData([...expenseData, newEntry]);
    setTotalExpenses(prev => prev + newEntry.totalAmount);
    
    // Reset form
    setFormData({
      date: '',
      fuelType: 'petrol',
      liters: '',
      pricePerLiter: '',
      totalAmount: '',
      station: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto calculate total amount
    if (name === 'liters' || name === 'pricePerLiter') {
      const liters = name === 'liters' ? parseFloat(value) : parseFloat(formData.liters);
      const price = name === 'pricePerLiter' ? parseFloat(value) : parseFloat(formData.pricePerLiter);
      
      if (liters && price) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          totalAmount: (liters * price).toFixed(2)
        }));
      }
    }
  };

  return (
    <div className="fuel-entry">
      <h2 className="mb-4">Fuel Expense Entry</h2>
      
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
              <label className="form-label">Fuel Type</label>
              <select
                className="form-select"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Liters</label>
              <input
                type="number"
                className="form-control"
                name="liters"
                value={formData.liters}
                onChange={handleInputChange}
                step="0.01"
                required
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <label className="form-label">Price per Liter</label>
              <input
                type="number"
                className="form-control"
                name="pricePerLiter"
                value={formData.pricePerLiter}
                onChange={handleInputChange}
                step="0.01"
                required
              />
            </div>
            
            <div className="col-md-4 mb-3">
              <label className="form-label">Total Amount</label>
              <input
                type="number"
                className="form-control"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                step="0.01"
                required
                readOnly
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Fuel Station</label>
              <input
                type="text"
                className="form-control"
                name="station"
                value={formData.station}
                onChange={handleInputChange}
                placeholder="Enter fuel station name"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Add Fuel Entry
          </button>
        </form>
      </div>

      {/* Display recent entries */}
      <div className="mt-4">
        <h4>Recent Fuel Entries</h4>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fuel Type</th>
                <th>Liters</th>
                <th>Price/L</th>
                <th>Total</th>
                <th>Station</th>
              </tr>
            </thead>
            <tbody>
              {expenseData.slice(-5).map(entry => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td className="text-capitalize">{entry.fuelType}</td>
                  <td>{entry.liters}L</td>
                  <td>₹{entry.pricePerLiter}</td>
                  <td>₹{entry.totalAmount}</td>
                  <td>{entry.station}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FuelEntry;
