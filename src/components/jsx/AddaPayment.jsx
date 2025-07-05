
import React, { useState, useEffect } from "react";
import "../css/AddaPayment.css";
import authService from '../../services/authService.js';

// Helper functions to convert ISO strings to proper format
const convertToTimeString = (timestamp) => {
  if (!timestamp) return '';

  // If it's already in H:MM:SS AM/PM format, return as is
  if (typeof timestamp === 'string' && timestamp.match(/^\d{1,2}:\d{2}:\d{2} (AM|PM)$/)) {
    return timestamp;
  }

  // If it's an ISO string from Google Sheets, convert to IST format
  if (typeof timestamp === 'string' && timestamp.includes('T')) {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      console.warn('Error converting timestamp:', timestamp, error);
      return timestamp.split('T')[1]?.split('.')[0] || timestamp;
    }
  }

  // If it's a Date object, convert to IST time string
  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  }

  // Return as string fallback
  return String(timestamp);
};

const convertToDateString = (date) => {
  if (!date) return '';

  // If it's already in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }

  // If it's an ISO string from Google Sheets, convert to IST date
  if (typeof date === 'string' && date.includes('T')) {
    try {
      const dateObj = new Date(date);
      // Convert to IST and get date part
      const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));
      return istDate.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error converting date:', date, error);
      return date.split('T')[0];
    }
  }

  // If it's a Date object, convert to IST date string
  if (date instanceof Date) {
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
  }

  // Return as string fallback
  return String(date);
};

function AddaPayment({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cashAmount: "",
    bankAmount: "",
    date: "",
    addaName: "",
    remarks: ""
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('🚀 Loading adda payments from Google Sheets...');

        const result = await authService.getAddaPayments();

        if (result.success && Array.isArray(result.data)) {
          const addaData = result.data.map(entry => ({
            id: entry.entryId,
            entryId: entry.entryId,
            timestamp: convertToTimeString(entry.timestamp),
            date: convertToDateString(entry.date),
            addaName: entry.addaName,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            totalAmount: entry.totalAmount || 0,
            submittedBy: entry.submittedBy,
            remarks: entry.remarks || "",
            type: 'adda'
          }));

          console.log('✅ Adda payments loaded:', addaData.length, 'entries');

          // Update expense data with adda entries
          setExpenseData(prev => {
            const nonAddaData = prev.filter(entry => entry.type !== 'adda');
            return [...nonAddaData, ...addaData];
          });

          // Update total expenses
          const totalAddaExpenses = addaData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
          setTotalExpenses(prev => {
            const currentAddaExpenses = expenseData.filter(entry => entry.type === 'adda')
              .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
            return prev - currentAddaExpenses + totalAddaExpenses;
          });

          // Generate cash book entries for adda payments
          const cashBookEntries = addaData.map(entry => ({
            id: `adda-${entry.entryId}`,
            date: entry.date,
            particulars: "Adda",
            description: `Adda payment - ${entry.addaName || 'Adda Station'}`,
            jfNo: `ADDA-${entry.entryId}`,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            type: 'cr', // Payments go to Cr. side
            timestamp: entry.timestamp,
            source: 'adda-payment'
          }));

          setCashBookEntries(prev => {
            const nonAddaEntries = prev.filter(entry => entry.source !== 'adda-payment');
            return [...cashBookEntries, ...nonAddaEntries];
          });

        } else {
          console.warn('No adda payment data found or error loading data:', result.message || 'Unknown error');
          // Set empty array to prevent errors
          setExpenseData(prev => {
            const nonAddaData = prev.filter(entry => entry.type !== 'adda');
            return nonAddaData;
          });
        }

      } catch (error) {
        console.error('Error loading adda payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setExpenseData, setTotalExpenses, setCashBookEntries]);

  // Function to get min date for date inputs (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cashAmount = parseInt(formData.cashAmount) || 0;
      const bankAmount = parseInt(formData.bankAmount) || 0;
      const totalAmount = cashAmount + bankAmount;
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';
      const now = new Date();
      const timeOnly = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      const dateOnly = formData.date;

      if (editingEntry) {
        // UPDATE: First update React state immediately
        const oldTotal = editingEntry.totalAmount;
        const updatedEntries = expenseData.map(entry => 
          entry.entryId === editingEntry.entryId 
            ? {
                ...entry,
                cashAmount: cashAmount,
                bankAmount: bankAmount,
                totalAmount: totalAmount,
                date: dateOnly,
                addaName: formData.addaName,
                remarks: formData.remarks,
              }
            : entry
        );
        setExpenseData(updatedEntries);
        setTotalExpenses((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setFormData({ cashAmount: "", bankAmount: "", date: "", addaName: "", remarks: "" });
        setIsLoading(false);

        // Then sync to Google Sheets in background
        authService.updateAddaPayment({
          entryId: editingEntry.entryId,
          updatedData: {
            date: dateOnly,
            addaName: formData.addaName,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            remarks: formData.remarks,
          }
        }).catch(error => {
          console.error('Background adda update sync failed:', error);
        });

      } else {
        // ADD: First create entry and update React state immediately
        const newEntry = {
          id: Date.now(),
          entryId: Date.now(),
          timestamp: timeOnly,
          type: "adda",
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          date: dateOnly,
          addaName: formData.addaName,
          submittedBy: submittedBy,
          remarks: formData.remarks,
        };

        setExpenseData([...expenseData, newEntry]);
        setTotalExpenses((prev) => prev + totalAmount);
        setFormData({ cashAmount: "", bankAmount: "", date: "", addaName: "", remarks: "" });
        setIsLoading(false);

        // Add to cash book - payments go to Cr. side
        if (cashAmount > 0 || bankAmount > 0) {
          const cashBookEntry = {
            id: Date.now() + 1,
            date: dateOnly,
            particulars: "Adda",
            description: `Adda payment - ${formData.addaName || 'Adda Station'}`,
            jfNo: `ADDA-${newEntry.entryId}`,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            type: 'cr', // Payments go to Cr. side
            timestamp: timeOnly,
            source: 'adda-payment'
          };
          setCashBookEntries(prev => [cashBookEntry, ...prev]);
        }

        // Then sync to Google Sheets in background
        authService.addAddaPayment({
          entryId: newEntry.entryId,
          timestamp: timeOnly,
          date: dateOnly,
          addaName: formData.addaName,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
          remarks: formData.remarks,
        }).catch(error => {
          console.error('Background adda add sync failed:', error);
        });
      }
    } catch (error) {
      console.error('Error submitting adda payment:', error);
      setIsLoading(false);
      alert(`❌ Error saving data: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const entryToDelete = expenseData.find(entry => entry.entryId === entryId);

      if (!entryToDelete) {
        alert('Entry not found!');
        return;
      }

      console.log('🗑️ Deleting adda entry:', { entryId, type: entryToDelete.type });

      // DELETE: First update React state immediately for better UX
      const updatedData = expenseData.filter(entry => entry.entryId !== entryId);
      setExpenseData(updatedData);

      if (entryToDelete && entryToDelete.totalAmount) {
        setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
      }

      // Remove corresponding cash book entry
      setCashBookEntries(prev => prev.filter(entry => 
        !(entry.source === 'adda-payment' && entry.jfNo?.includes(entryId.toString()))
      ));

      console.log('✅ Entry removed from React state immediately');

      // Then sync deletion to Google Sheets in background
      try {
        const deleteResult = await authService.deleteAddaPayment({ entryId: entryToDelete.entryId });
        if (deleteResult.success) {
          console.log('✅ Entry successfully deleted from Google Sheets');
        } else {
          console.warn('⚠️ Delete from Google Sheets failed but entry removed locally:', deleteResult.error);
        }
      } catch (syncError) {
        console.warn('⚠️ Background delete sync failed but entry removed locally:', syncError.message);
      }

    } catch (error) {
      console.error('❌ Error in delete process:', error);
      alert('Error deleting entry. Please try again.');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setFormData({
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      date: entry.date,
      addaName: entry.addaName || "",
      remarks: entry.remarks || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({ cashAmount: "", bankAmount: "", date: "", addaName: "", remarks: "" });
  };

  // Filter adda entries and calculate totals for summary - only for current user
  const getCurrentUserAddaEntries = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    return expenseData.filter(entry => 
      entry.type === "adda" && entry.submittedBy === currentUserName
    );
  };

  const addaEntries = getCurrentUserAddaEntries();
  const totalCash = addaEntries.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = addaEntries.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="adda-entry-container">
      <div className="container-fluid">
        <div className="adda-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-building"></i> Adda Payment Entry</h2>
              <p>Record your adda expenses (Payment)</p>
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

        {/* Summary Cards - Only show when user has entries */}
        {addaEntries.length > 0 && (
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
                  <h4>{addaEntries.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="adda-form-card">
          <h4><i className="bi bi-building"></i> {editingEntry ? "Edit Adda Expense" : "Add Adda Expense"}</h4>
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
                <label className="form-label">Adda Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.addaName}
                  onChange={(e) => setFormData({ ...formData, addaName: e.target.value })}
                  placeholder="Enter adda name"
                  required
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

            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Remarks (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter remarks"
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
              <button type="submit" className="btn adda-entry-btn" disabled={isLoading}>
                <i className={isLoading ? "bi bi-arrow-repeat" : editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                {isLoading ? "Processing..." : editingEntry ? "Update Entry" : "Add Adda Entry"}
              </button>
              {editingEntry && (
                <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                  <i className="bi bi-x-circle"></i> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Recent Entries - Only show user's own entries */}
        {addaEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {addaEntries.slice(0, 6).map((entry) => (
                <div key={entry.entryId} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className="entry-type adda">
                          Adda Expense
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
                            onClick={() => handleDeleteEntry(entry.entryId)}
                            title="Delete Entry"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="entry-date">
                        <small className="text-muted">
                          <div>{entry.date}</div>
                          <div className="timestamp">{entry.timestamp || ''}</div>
                        </small>
                      </div>
                      <div className="entry-content">
                        <p>
                          {entry.addaName && <><strong>Adda:</strong> {entry.addaName}<br/></>}
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
                       {entry.remarks && (
                          <div className="entry-remarks">
                            <strong>Remarks:</strong> {entry.remarks}
                          </div>
                        )}
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

export default AddaPayment;
