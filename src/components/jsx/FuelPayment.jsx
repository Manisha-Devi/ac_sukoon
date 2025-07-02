import React, { useState, useEffect } from "react";
import "../css/FuelPayment.css";
import { addFuelPayment, getFuelPayments } from "../../services/googleSheetsAPI";

const FuelPayment = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    pumpName: '',
    liters: '',
    ratePerLiter: '',
    cashAmount: '',
    bankAmount: '',
    totalAmount: '',
    remarks: ''
  });
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await getFuelPayments();
      if (response.success) {
        setPayments(response.data || []);
      } else {
        setError(response.error || 'Failed to load fuel payments');
      }
    } catch (error) {
      setError('Error loading payments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto calculate amounts
      if (name === 'liters' || name === 'ratePerLiter') {
        const liters = parseFloat(name === 'liters' ? value : updated.liters) || 0;
        const rate = parseFloat(name === 'ratePerLiter' ? value : updated.ratePerLiter) || 0;
        const calculatedTotal = liters * rate;
        updated.totalAmount = calculatedTotal.toString();
        
        // If no manual cash/bank split, put all in cash
        if (!updated.cashAmount && !updated.bankAmount) {
          updated.cashAmount = calculatedTotal.toString();
          updated.bankAmount = '0';
        }
      }
      
      if (name === 'cashAmount' || name === 'bankAmount') {
        const cash = parseFloat(name === 'cashAmount' ? value : updated.cashAmount) || 0;
        const bank = parseFloat(name === 'bankAmount' ? value : updated.bankAmount) || 0;
        updated.totalAmount = (cash + bank).toString();
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        liters: parseFloat(formData.liters) || 0,
        ratePerLiter: parseFloat(formData.ratePerLiter) || 0,
        cashAmount: parseFloat(formData.cashAmount) || 0,
        bankAmount: parseFloat(formData.bankAmount) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        submittedBy: currentUser.fullName || 'Unknown User'
      };

      const response = await addFuelPayment(submitData);
      
      if (response.success) {
        setSuccess('Fuel payment added successfully!');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          pumpName: '',
          liters: '',
          ratePerLiter: '',
          cashAmount: '',
          bankAmount: '',
          totalAmount: '',
          remarks: ''
        });
        loadPayments();
      } else {
        setError(response.error || 'Failed to add fuel payment');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fuel-payment-container">
      <div className="header">
        <h2><i className="bi bi-fuel-pump"></i> Fuel Payment Management</h2>
      </div>

      {/* Add Payment Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5><i className="bi bi-plus-circle"></i> Add New Fuel Payment</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
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
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Pump Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="pumpName"
                    value={formData.pumpName}
                    onChange={handleInputChange}
                    placeholder="Enter petrol pump name"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Liters</label>
                  <input
                    type="number"
                    className="form-control"
                    name="liters"
                    value={formData.liters}
                    onChange={handleInputChange}
                    placeholder="Enter liters"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Rate per Liter</label>
                  <input
                    type="number"
                    className="form-control"
                    name="ratePerLiter"
                    value={formData.ratePerLiter}
                    onChange={handleInputChange}
                    placeholder="Enter rate"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Cash Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cashAmount"
                    value={formData.cashAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Bank Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="bankAmount"
                    value={formData.bankAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Total Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    readOnly
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-control"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter any remarks"
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Adding...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Payment
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Payments List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5><i className="bi bi-list"></i> Recent Fuel Payments</h5>
          <button className="btn btn-outline-primary btn-sm" onClick={loadPayments}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="card-body">
          {loading && <div className="text-center">Loading...</div>}
          
          {payments.length === 0 && !loading ? (
            <div className="text-center text-muted">No fuel payments found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Pump Name</th>
                    <th>Liters</th>
                    <th>Rate/L</th>
                    <th>Cash</th>
                    <th>Bank</th>
                    <th>Total</th>
                    <th>Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={payment.id || index}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>{payment.pumpName}</td>
                      <td>{payment.liters}L</td>
                      <td>₹{payment.ratePerLiter}</td>
                      <td>₹{payment.cashAmount}</td>
                      <td>₹{payment.bankAmount}</td>
                      <td><strong>₹{payment.totalAmount}</strong></td>
                      <td>{payment.submittedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuelPayment;
import { addFuelPayment, getFuelPayments } from "../../services/googleSheetsAPI";

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
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

  const handleSubmit = async (e) => {
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

      // Add to cash book - payments go to Cr. side
      if (cashAmount > 0 || bankAmount > 0) {
        const cashBookEntry = {
          id: Date.now() + 1,
          date: formData.date,
          particulars: "Fuel",
          description: `Fuel expense - ${formData.pumpName || 'Fuel Station'}${formData.liters ? ` (${formData.liters}L)` : ''}`,
          jfNo: `FUEL-${Date.now()}`,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          type: 'cr', // Payments go to Cr. side
          timestamp: new Date().toISOString(),
          source: 'fuel-payment'
        };
        setCashBookEntries(prev => [cashBookEntry, ...prev]);
      }

        // Integrate with Google Sheets
        await addFuelPayment(newEntry);
    }
    setFormData({ cashAmount: "", bankAmount: "", liters: "", rate: "", date: "", pumpName: "" });
  };

  const handleDeleteEntry = (entryId) => {
    const entryToDelete = expenseData.find(entry => entry.id === entryId);
    if (entryToDelete && entryToDelete.totalAmount) {
      setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
    }
    setExpenseData(expenseData.filter(entry => entry.id !== entryId));

    // Remove corresponding cash book entry
    setCashBookEntries(prev => prev.filter(entry => entry.source === 'fuel-payment' && !entry.jfNo?.includes(entryId.toString())));
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

  // Filter fuel entries and calculate totals for summary
  const fuelEntries = expenseData.filter(entry => entry.type === "fuel");
  const totalCash = fuelEntries.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = fuelEntries.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="fuel-entry-container">
      <div className="container-fluid">
        <div className="fuel-header">
          <h2><i className="bi bi-credit-card"></i> Fuel Payment Entry</h2>
          <p>Record your fuel expenses (Payment)</p>
        </div>

        {/* Summary Cards */}
        {fuelEntries.length > 0 && (
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
                  <h4>{fuelEntries.length}</h4>
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
        {fuelEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {fuelEntries.slice(-6).reverse().map((entry) => (
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