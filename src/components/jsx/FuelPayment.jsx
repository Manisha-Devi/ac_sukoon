
import React, { useState } from "react";
import "../FuelPayment.css";

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses }) {
  const [editingEntry, setEditingEntry] = useState(null);
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

    if (editingEntry) {
      // Update existing entry
      const oldTotal = editingEntry.totalAmount;
      const updatedEntries = expenseData.map(entry => 
        entry.id === editingEntry.id 
          ? {
              ...entry,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
              liters: formData.liters,
              rate: formData.rate,
              date: formData.date,
              pumpName: formData.pumpName,
            }
          : entry
      );
      setExpenseData(updatedEntries);
      setTotalExpenses((prev) => prev - oldTotal + totalAmount);
      setEditingEntry(null);
    } else {
      // Create new entry
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
    }
    setFormData({ cashAmount: "", bankAmount: "", liters: "", rate: "", date: "", pumpName: "" });
  };

  const handleDeleteEntry = (entryId) => {
    const entryToDelete = expenseData.find(entry => entry.id === entryId);
    if (entryToDelete && entryToDelete.totalAmount) {
      setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
    }
    setExpenseData(expenseData.filter(entry => entry.id !== entryId));
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setFormData({
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      liters: entry.liters || "",
      rate: entry.rate || "",
      date: entry.date,
      pumpName: entry.pumpName || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({ cashAmount: "", bankAmount: "", liters: "", rate: "", date: "", pumpName: "" });
  };

  // Calculate totals for summary
  const totalCash = expenseData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = expenseData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="fuel-entry-container">
      <div className="container-fluid">
        <div className="fuel-header">
          <h2><i className="bi bi-credit-card"></i> Fuel Payment Entry</h2>
          <p>Record your fuel expenses (Payment)</p>
        </div>

        {/* Summary Cards */}
        {expenseData.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cash-card">
                <div className="card-body">
                  <h6>Cash Expense</h6>
                  <h4>₹{totalCash.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card bank-card">
                <div className="card-body">
                  <h6>Bank Transfer</h6>
                  <h4>₹{totalBank.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card total-card">
                <div className="card-body">
                  <h6>Total Expenses</h6>
                  <h4>₹{grandTotal.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card entries-card">
                <div className="card-body">
                  <h6>Total Entries</h6>
                  <h4>{expenseData.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="fuel-form-card">
          <h4><i className="bi bi-fuel-pump"></i> {editingEntry ? "Edit Fuel Expense" : "Add Fuel Expense"}</h4>
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
                <i className={editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                {editingEntry ? "Update Entry" : "Add Fuel Entry"}
              </button>
              {editingEntry && (
                <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                  <i className="bi bi-x-circle"></i> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Recent Entries */}
        {expenseData.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {expenseData.slice(-6).reverse().map((entry) => (
                <div key={entry.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className="entry-type fuel">
                          Fuel Expense
                        </span>
                        <div className="entry-actions">
                          <button 
                            className="btn btn-sm btn-edit" 
                            onClick={() => handleEditEntry(entry)}
                            title="Edit Entry"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-delete" 
                            onClick={() => handleDeleteEntry(entry.id)}
                            title="Delete Entry"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="entry-date">
                        <small className="text-muted">{entry.date}</small>
                      </div>
                      <div className="entry-content">
                        <p>
                          {entry.pumpName && <><strong>Pump:</strong> {entry.pumpName}<br/></>}
                          {entry.liters && <><strong>Liters:</strong> {entry.liters}<br/></>}
                          {entry.rate && <><strong>Rate:</strong> ₹{entry.rate}/L</>}
                        </p>
                      </div>
                      <div className="entry-amounts">
                        <div className="amount-row">
                          <span>Cash: ₹{entry.cashAmount}</span>
                          <span>Bank: ₹{entry.bankAmount}</span>
                        </div>
                        <div className="total-amount">
                          <strong>Total: ₹{entry.totalAmount}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FuelEntry;
