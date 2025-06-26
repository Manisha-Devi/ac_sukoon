
import React, { useState } from "react";
import "../css/ServiceEntry.css";

function ServiceEntry({ expenseData, setExpenseData, setTotalExpenses }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    serviceDetails: "",
    cashAmount: "",
    bankAmount: "",
    description: "",
    date: "",
    mechanic: "",
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
              serviceDetails: formData.serviceDetails,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              totalAmount: totalAmount,
              description: formData.description,
              date: formData.date,
              mechanic: formData.mechanic,
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
        type: "service",
        serviceDetails: formData.serviceDetails,
        cashAmount: cashAmount,
        bankAmount: bankAmount,
        totalAmount: totalAmount,
        description: formData.description,
        date: formData.date,
        mechanic: formData.mechanic,
      };
      setExpenseData([...expenseData, newEntry]);
      setTotalExpenses((prev) => prev + totalAmount);
    }
    
    setFormData({
      serviceDetails: "",
      cashAmount: "",
      bankAmount: "",
      description: "",
      date: "",
      mechanic: "",
    });
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
      serviceDetails: entry.serviceDetails,
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      description: entry.description,
      date: entry.date,
      mechanic: entry.mechanic || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({
      serviceDetails: "",
      cashAmount: "",
      bankAmount: "",
      description: "",
      date: "",
      mechanic: "",
    });
  };

  // Filter service entries
  const serviceEntries = expenseData.filter(entry => entry.type === "service");

  // Calculate totals for summary
  const totalCash = serviceEntries.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = serviceEntries.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="service-entry-container">
      <div className="container-fluid">
        <div className="service-header">
          <h2><i className="bi bi-tools"></i> Service Entry</h2>
          <p>Record your vehicle service and maintenance expenses</p>
        </div>

        {/* Summary Cards */}
        {serviceEntries.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cash-card">
                <div className="card-body">
                  <h6>Cash Expenses</h6>
                  <h4>₹{totalCash.toLocaleString('en-IN')}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card bank-card">
                <div className="card-body">
                  <h6>Bank Expenses</h6>
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
                  <h4>{serviceEntries.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Entry Form */}
        <div className="service-form-card">
          <h4><i className="bi bi-tools"></i> Service Details</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Service Details</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.serviceDetails}
                  onChange={(e) => setFormData({ ...formData, serviceDetails: e.target.value })}
                  placeholder="Enter service details"
                  required
                />
              </div>
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
            </div>
            
            <div className="row">
              <div className="col-12 mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed description of service work"
                  required
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Mechanic/Service Center (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.mechanic}
                  onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                  placeholder="Enter mechanic or service center name"
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
              <button type="submit" className="btn service-entry-btn">
                <i className={editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                {editingEntry ? "Update Entry" : "Add Service Entry"}
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
        {serviceEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {serviceEntries.slice(-6).reverse().map((entry) => (
                <div key={entry.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className="entry-type service">Service</span>
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
                        <p><strong>{entry.serviceDetails}</strong></p>
                        <p>{entry.description?.substring(0, 60)}...</p>
                        {entry.mechanic && <p><small>At: {entry.mechanic}</small></p>}
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

export default ServiceEntry;
