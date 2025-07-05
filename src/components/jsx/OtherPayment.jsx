
import React, { useState, useEffect } from "react";
import "../css/OtherPayment.css";
import { authService } from "../../services/authService";

function OtherPayment({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otherPaymentsData, setOtherPaymentsData] = useState([]);
  const [formData, setFormData] = useState({
    paymentDetails: "",
    cashAmount: "",
    bankAmount: "",
    description: "",
    date: "",
    vendor: "",
  });

  // Load data on component mount
  useEffect(() => {
    loadOtherPayments();
  }, []);

  // Load Other Payments from Google Sheets
  const loadOtherPayments = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getOtherPayments();
      
      if (response.success) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserName = currentUser.fullName || currentUser.username;
        
        // Filter entries for current user
        const userEntries = response.data.filter(entry => 
          entry.submittedBy === currentUserName
        );
        
        setOtherPaymentsData(userEntries);
        console.log('✅ Other payments loaded:', userEntries.length);
      } else {
        console.error('❌ Failed to load other payments:', response.error);
      }
    } catch (error) {
      console.error('❌ Error loading other payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get min date for date inputs (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cashAmount = parseInt(formData.cashAmount) || 0;
    const bankAmount = parseInt(formData.bankAmount) || 0;
    const totalAmount = cashAmount + bankAmount;

    if (totalAmount <= 0) {
      alert('Please enter a valid amount (Cash or Bank)');
      return;
    }

    try {
      setIsLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserName = currentUser.fullName || currentUser.username;

      if (editingEntry) {
        // Update existing entry
        const updateData = {
          entryId: editingEntry.entryId,
          updatedData: {
            date: formData.date,
            paymentDetails: formData.paymentDetails,
            description: formData.description,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            vendor: formData.vendor || "General"
          }
        };

        const response = await authService.updateOtherPayment(updateData);
        
        if (response.success) {
          console.log('✅ Other payment updated successfully');
          await loadOtherPayments(); // Reload data
          setEditingEntry(null);
        } else {
          console.error('❌ Failed to update other payment:', response.error);
          alert('Failed to update other payment: ' + response.error);
          return;
        }
      } else {
        // Create new entry
        const newEntryData = {
          date: formData.date,
          paymentDetails: formData.paymentDetails,
          description: formData.description,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          vendor: formData.vendor || "General",
          submittedBy: currentUserName
        };

        const response = await authService.addOtherPayment(newEntryData);
        
        if (response.success) {
          console.log('✅ Other payment added successfully');
          await loadOtherPayments(); // Reload data
          
          // Update local state for backwards compatibility
          const newEntry = {
            id: Date.now(),
            type: "other",
            paymentDetails: formData.paymentDetails,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            description: formData.description,
            date: formData.date,
            vendor: formData.vendor,
          };
          setExpenseData(prev => [...prev, newEntry]);
          setTotalExpenses(prev => prev + totalAmount);
          
          // Add to cash book - payments go to Cr. side
          if (cashAmount > 0 || bankAmount > 0) {
            const cashBookEntry = {
              id: Date.now() + 1,
              date: formData.date,
              particulars: "Other",
              description: `${formData.paymentDetails}${formData.vendor ? ` - ${formData.vendor}` : ''}`,
              jfNo: `OTHER-${Date.now()}`,
              cashAmount: cashAmount,
              bankAmount: bankAmount,
              type: 'cr',
              timestamp: new Date().toISOString(),
              source: 'other-payment'
            };
            setCashBookEntries(prev => [cashBookEntry, ...prev]);
          }
        } else {
          console.error('❌ Failed to add other payment:', response.error);
          alert('Failed to add other payment: ' + response.error);
          return;
        }
      }
      
      // Reset form
      setFormData({
        paymentDetails: "",
        cashAmount: "",
        bankAmount: "",
        description: "",
        date: "",
        vendor: "",
      });
      
    } catch (error) {
      console.error('❌ Error submitting other payment:', error);
      alert('Error submitting other payment: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId, isGoogleSheetsEntry = false) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setIsLoading(true);

      if (isGoogleSheetsEntry) {
        // Delete from Google Sheets
        const response = await authService.deleteOtherPayment({ entryId });
        
        if (response.success) {
          console.log('✅ Other payment deleted successfully');
          await loadOtherPayments(); // Reload data
        } else {
          console.error('❌ Failed to delete other payment:', response.error);
          alert('Failed to delete other payment: ' + response.error);
        }
      } else {
        // Delete from local state (backwards compatibility)
        const entryToDelete = expenseData.find(entry => entry.id === entryId);
        if (entryToDelete && entryToDelete.totalAmount) {
          setTotalExpenses(prev => prev - entryToDelete.totalAmount);
        }
        setExpenseData(expenseData.filter(entry => entry.id !== entryId));
        
        // Remove corresponding cash book entry
        setCashBookEntries(prev => prev.filter(entry => 
          entry.source === 'other-payment' && !entry.jfNo?.includes(entryId.toString())
        ));
      }
    } catch (error) {
      console.error('❌ Error deleting other payment:', error);
      alert('Error deleting other payment: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEntry = (entry, isGoogleSheetsEntry = false) => {
    setEditingEntry(entry);
    setFormData({
      paymentDetails: entry.paymentDetails || entry.paymentType || "",
      cashAmount: (entry.cashAmount || 0).toString(),
      bankAmount: (entry.bankAmount || 0).toString(),
      description: entry.description || "",
      date: entry.date || "",
      vendor: entry.vendor || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({
      paymentDetails: "",
      cashAmount: "",
      bankAmount: "",
      description: "",
      date: "",
      vendor: "",
    });
  };

  // Filter other payment entries from local state
  const otherEntries = expenseData.filter(entry => entry.type === "other");

  // Combine Google Sheets data with local data
  const allOtherEntries = [...otherPaymentsData, ...otherEntries];

  // Calculate totals for summary
  const totalCash = allOtherEntries.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = allOtherEntries.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="other-entry-container">
      <div className="container-fluid">
        <div className="other-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-credit-card"></i> Other Payment Entry</h2>
              <p>Record your miscellaneous expenses (Payment)</p>
            </div>
            <div className="sync-status">
              <div className={`simple-sync-indicator ${isLoading ? 'syncing' : 'synced'}`}>
                {isLoading ? (
                  <i className="bi bi-arrow-clockwise"></i>
                ) : (
                  <i className="bi bi-check-circle"></i>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {allOtherEntries.length > 0 && (
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
                  <h4>{allOtherEntries.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Payment Form */}
        <div className="other-form-card">
          <h4><i className="bi bi-receipt"></i> Other Payment Details</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Payment Details</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.paymentDetails}
                  onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                  placeholder="Enter payment details"
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
                  placeholder="Enter detailed description of payment"
                  required
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Vendor/Recipient (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Enter vendor or recipient name"
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
              <button type="submit" className="btn other-entry-btn" disabled={isLoading}>
                {isLoading ? (
                  <i className="bi bi-arrow-repeat"></i>
                ) : (
                  <i className={editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i>
                )}
                {editingEntry ? "Update Entry" : "Add Other Payment"}
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
        {allOtherEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {allOtherEntries.slice(-6).reverse().map((entry) => (
                <div key={entry.entryId || entry.id} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className="entry-type other">Other Payment</span>
                        <div className="entry-actions">
                          <button 
                            className="btn btn-sm btn-edit" 
                            onClick={() => handleEditEntry(entry, !!entry.entryId)}
                            title="Edit Entry"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-delete" 
                            onClick={() => handleDeleteEntry(entry.entryId || entry.id, !!entry.entryId)}
                            title="Delete Entry"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="entry-date">
                        <small className="text-muted">{entry.date}</small>
                        {entry.timestamp && (
                          <small className="text-muted d-block">{entry.timestamp}</small>
                        )}
                      </div>
                      <div className="entry-content">
                        <p><strong>{entry.paymentDetails}</strong></p>
                        <p>{entry.description?.substring(0, 60)}...</p>
                        {entry.vendor && <p><small>To: {entry.vendor}</small></p>}
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

export default OtherPayment;
