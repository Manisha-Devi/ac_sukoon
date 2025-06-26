
import React, { useState } from "react";
import "../css/FuelEntry.css";

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses }) {
  const [formData, setFormData] = useState({
    cashAmount: "",
    bankAmount: "",
    liters: "",
    rate: "",
    date: "",
    pumpName: "",
  });

  // Function to get min date for date inputs (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cashAmount = parseInt(formData.cashAmount) || 0;
    const bankAmount = parseInt(formData.bankAmount) || 0;
    const totalAmount = cashAmount + bankAmount;

    const newEntry = {
      id: Date.now(),
      type: "fuel",
      cashAmount: cashAmount,
      bankAmount: bankAmount,
      totalAmount: totalAmount,
      liters: formData.liters,
      rate: formData.rate,
      date: formData.date,
      pumpName: formData.pumpName,
    };
    
    setExpenseData([...expenseData, newEntry]);
    setTotalExpenses((prev) => prev + totalAmount);
    setFormData({ cashAmount: "", bankAmount: "", liters: "", rate: "", date: "", pumpName: "" });
  };

  return (
    <div className="fuel-entry-container">
      <div className="container-fluid">
        <div className="fuel-header">
          <h2><i className="bi bi-fuel-pump"></i> Fuel Entry</h2>
          <p>Record your fuel expenses</p>
        </div>

        <div className="fuel-form-card">
          <h4><i className="bi bi-fuel-pump"></i> Add Fuel Expense</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control date-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                  placeholder="Select date"
                  min={getTodayDate()}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Pump Name (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.pumpName}
                  onChange={(e) => setFormData({ ...formData, pumpName: e.target.value })}
                  placeholder="Enter pump name"
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Liters (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.liters}
                  onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                  placeholder="Enter liters"
                  min="0"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Rate per Liter (₹) (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="Enter rate per liter"
                  min="0"
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Cash Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.cashAmount}
                  onChange={(e) => setFormData({ ...formData, cashAmount: e.target.value })}
                  placeholder="Enter cash amount"
                  min="0"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Bank Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.bankAmount}
                  onChange={(e) => setFormData({ ...formData, bankAmount: e.target.value })}
                  placeholder="Enter bank amount"
                  min="0"
                />
              </div>
            </div>
            
            <div className="amount-summary mb-3">
              <div className="row">
                <div className="col-4">
                  <span>Cash: ₹{parseInt(formData.cashAmount) || 0}</span>
                </div>
                <div className="col-4">
                  <span>Bank: ₹{parseInt(formData.bankAmount) || 0}</span>
                </div>
                <div className="col-4">
                  <strong>Total: ₹{(parseInt(formData.cashAmount) || 0) + (parseInt(formData.bankAmount) || 0)}</strong>
                </div>
              </div>
            </div>
            
            <div className="button-group">
              <button type="submit" className="btn fuel-entry-btn">
                <i className="bi bi-plus-circle"></i> Add Fuel Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FuelEntry;
