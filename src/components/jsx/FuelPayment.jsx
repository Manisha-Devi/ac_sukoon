import React, { useState, useEffect } from "react";
import "../css/FuelPayment.css";
import { addFuelPayment, getFuelPayments } from "../../services/googleSheetsAPI";

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    pumpName: "",
    liters: "",
    ratePerLiter: "",
    cashAmount: "",
    bankAmount: "",
    totalAmount: "",
    remarks: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    loadFuelPayments();
  }, []);

  const loadFuelPayments = async () => {
    try {
      setLoadingEntries(true);
      const result = await getFuelPayments();
      
      if (result.success) {
        setEntries(result.data || []);
        
        // Update expense data
        const currentExpenses = expenseData.filter(expense => expense.category !== 'Fuel');
        const fuelExpenses = (result.data || []).map(entry => ({
          id: entry.id,
          date: entry.date,
          type: 'Fuel Payment',
          amount: parseFloat(entry.totalAmount) || 0,
          category: 'Fuel',
          description: `${entry.pumpName} - ${entry.liters}L @ Rs.${entry.ratePerLiter}`,
          submittedBy: entry.submittedBy
        }));
        
        const updatedExpenses = [...currentExpenses, ...fuelExpenses];
        setExpenseData(updatedExpenses);
        
        const total = updatedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalExpenses(total);
      }
    } catch (error) {
      console.error('Error loading fuel payments:', error);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate total amount
      if (name === 'liters' || name === 'ratePerLiter') {
        const liters = parseFloat(name === 'liters' ? value : updated.liters) || 0;
        const rate = parseFloat(name === 'ratePerLiter' ? value : updated.ratePerLiter) || 0;
        const calculatedTotal = liters * rate;
        updated.totalAmount = calculatedTotal.toString();
        updated.cashAmount = calculatedTotal.toString();
        updated.bankAmount = "0";
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
    
    if (!formData.pumpName || !formData.totalAmount) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const submittedBy = localStorage.getItem('username') || 'Unknown';
      
      const dataToSubmit = {
        ...formData,
        liters: parseFloat(formData.liters) || 0,
        ratePerLiter: parseFloat(formData.ratePerLiter) || 0,
        cashAmount: parseFloat(formData.cashAmount) || 0,
        bankAmount: parseFloat(formData.bankAmount) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        submittedBy: submittedBy
      };

      const result = await addFuelPayment(dataToSubmit);

      if (result.success) {
        setSubmitStatus({ type: 'success', message: 'Fuel payment added successfully!' });
        
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          pumpName: "",
          liters: "",
          ratePerLiter: "",
          cashAmount: "",
          bankAmount: "",
          totalAmount: "",
          remarks: ""
        });

        // Reload entries
        await loadFuelPayments();

        // Add to cash book
        setCashBookEntries(prev => [...prev, {
          id: Date.now(),
          date: formData.date,
          type: 'Expense',
          description: `Fuel Payment - ${formData.pumpName}`,
          cashAmount: dataToSubmit.cashAmount,
          bankAmount: dataToSubmit.bankAmount,
          category: 'Fuel',
          submittedBy: submittedBy
        }]);

      } else {
        setSubmitStatus({ type: 'error', message: result.error || 'Failed to add fuel payment' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Error submitting data: ' + error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fuel-entry">
      <div className="row">
        {/* Form Section */}
        <div className="col-lg-4 col-md-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-fuel-pump me-2"></i>
                Add Fuel Payment
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Pump Name</label>
                  <input
                    type="text"
                    name="pumpName"
                    className="form-control"
                    value={formData.pumpName}
                    onChange={handleInputChange}
                    placeholder="e.g., PSO Station"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Liters</label>
                      <input
                        type="number"
                        name="liters"
                        className="form-control"
                        value={formData.liters}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Rate/Liter</label>
                      <input
                        type="number"
                        name="ratePerLiter"
                        className="form-control"
                        value={formData.ratePerLiter}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Cash Amount</label>
                      <input
                        type="number"
                        name="cashAmount"
                        className="form-control"
                        value={formData.cashAmount}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="mb-3">
                      <label className="form-label">Bank Amount</label>
                      <input
                        type="number"
                        name="bankAmount"
                        className="form-control"
                        value={formData.bankAmount}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Total Amount</label>
                  <input
                    type="number"
                    name="totalAmount"
                    className="form-control"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    name="remarks"
                    className="form-control"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Optional remarks..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Fuel Payment
                    </>
                  )}
                </button>
              </form>

              {submitStatus && (
                <div className={`alert alert-${submitStatus.type === 'success' ? 'success' : 'danger'} mt-3`}>
                  {submitStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="col-lg-8 col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Recent Fuel Payments
              </h5>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={loadFuelPayments}
                disabled={loadingEntries}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
            <div className="card-body">
              {loadingEntries ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading fuel payments...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="text-muted mt-2">No fuel payments found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Pump</th>
                        <th>Liters</th>
                        <th>Rate/L</th>
                        <th>Cash</th>
                        <th>Bank</th>
                        <th>Total</th>
                        <th>By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{new Date(entry.date).toLocaleDateString()}</td>
                          <td>{entry.pumpName}</td>
                          <td>{parseFloat(entry.liters || 0).toFixed(2)}L</td>
                          <td>Rs. {parseFloat(entry.ratePerLiter || 0).toFixed(2)}</td>
                          <td>Rs. {parseFloat(entry.cashAmount || 0).toLocaleString()}</td>
                          <td>Rs. {parseFloat(entry.bankAmount || 0).toLocaleString()}</td>
                          <td className="fw-bold">Rs. {parseFloat(entry.totalAmount || 0).toLocaleString()}</td>
                          <td><small>{entry.submittedBy}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FuelEntry;

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