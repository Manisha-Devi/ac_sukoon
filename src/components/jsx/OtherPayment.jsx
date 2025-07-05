
import React, { useState, useEffect } from "react";
import "../css/OtherPayment.css";
import authService from "../../services/authService";

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

function OtherPayment({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('🚀 Loading other payments from Google Sheets...');

        const result = await authService.getOtherPayments();

        if (result.success && Array.isArray(result.data)) {
          const otherData = result.data.map(entry => ({
            id: entry.entryId,
            entryId: entry.entryId,
            timestamp: convertToTimeString(entry.timestamp),
            date: convertToDateString(entry.date),
            paymentDetails: entry.paymentDetails,
            description: entry.description,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            totalAmount: entry.totalAmount || 0,
            vendor: entry.vendor,
            submittedBy: entry.submittedBy,
            type: 'other'
          }));

          console.log('✅ Other payments loaded:', otherData.length, 'entries');

          // Update expense data with other entries
          setExpenseData(prev => {
            const nonOtherData = prev.filter(entry => entry.type !== 'other');
            return [...nonOtherData, ...otherData];
          });

          // Update total expenses
          const totalOtherExpenses = otherData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
          setTotalExpenses(prev => {
            const currentOtherExpenses = expenseData.filter(entry => entry.type === 'other')
              .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
            return prev - currentOtherExpenses + totalOtherExpenses;
          });

          // Generate cash book entries for other payments
          const cashBookEntries = otherData.map(entry => ({
            id: `other-${entry.entryId}`,
            date: entry.date,
            particulars: "Other",
            description: `${entry.paymentDetails}${entry.vendor ? ` - ${entry.vendor}` : ''}`,
            jfNo: `OTHER-${entry.entryId}`,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            type: 'cr', // Payments go to Cr. side
            timestamp: entry.timestamp,
            source: 'other-payment'
          }));

          setCashBookEntries(prev => {
            const nonOtherEntries = prev.filter(entry => entry.source !== 'other-payment');
            return [...cashBookEntries, ...nonOtherEntries];
          });

        } else {
          console.warn('No other payment data found or error loading data:', result.message || 'Unknown error');
          // Set empty array to prevent errors
          setExpenseData(prev => {
            const nonOtherData = prev.filter(entry => entry.type !== 'other');
            return nonOtherData;
          });
        }

      } catch (error) {
        console.error('Error loading other payments:', error);
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
                paymentDetails: formData.paymentDetails,
                description: formData.description,
                date: dateOnly,
                vendor: formData.vendor,
              }
            : entry
        );
        setExpenseData(updatedEntries);
        setTotalExpenses((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        setFormData({ paymentDetails: "", cashAmount: "", bankAmount: "", description: "", date: "", vendor: "" });
        setIsLoading(false);

        // Then sync to Google Sheets in background
        authService.updateOtherPayment({
          entryId: editingEntry.entryId,
          updatedData: {
            date: dateOnly,
            paymentDetails: formData.paymentDetails,
            description: formData.description,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            vendor: formData.vendor || "General"
          }
        }).catch(error => {
          console.error('Background other payment update sync failed:', error);
        });

      } else {
        // ADD: First create entry and update React state immediately
        const newEntry = {
          id: Date.now(),
          entryId: Date.now(),
          timestamp: timeOnly,
          type: "other",
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          paymentDetails: formData.paymentDetails,
          description: formData.description,
          date: dateOnly,
          vendor: formData.vendor,
          submittedBy: submittedBy,
        };

        setExpenseData([...expenseData, newEntry]);
        setTotalExpenses((prev) => prev + totalAmount);
        setFormData({ paymentDetails: "", cashAmount: "", bankAmount: "", description: "", date: "", vendor: "" });
        setIsLoading(false);

        // Add to cash book - payments go to Cr. side
        if (cashAmount > 0 || bankAmount > 0) {
          const cashBookEntry = {
            id: Date.now() + 1,
            date: dateOnly,
            particulars: "Other",
            description: `${formData.paymentDetails}${formData.vendor ? ` - ${formData.vendor}` : ''}`,
            jfNo: `OTHER-${newEntry.entryId}`,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            type: 'cr', // Payments go to Cr. side
            timestamp: timeOnly,
            source: 'other-payment'
          };
          setCashBookEntries(prev => [cashBookEntry, ...prev]);
        }

        // Then sync to Google Sheets in background
        authService.addOtherPayment({
          entryId: newEntry.entryId,
          timestamp: timeOnly,
          date: dateOnly,
          paymentDetails: formData.paymentDetails,
          description: formData.description,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          vendor: formData.vendor || "General",
          submittedBy: submittedBy,
        }).catch(error => {
          console.error('Background other payment add sync failed:', error);
        });
      }
    } catch (error) {
      console.error('Error submitting other payment:', error);
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

      console.log('🗑️ Deleting other payment entry:', { entryId, type: entryToDelete.type });

      // DELETE: First update React state immediately for better UX
      const updatedData = expenseData.filter(entry => entry.entryId !== entryId);
      setExpenseData(updatedData);

      if (entryToDelete && entryToDelete.totalAmount) {
        setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
      }

      // Remove corresponding cash book entry
      setCashBookEntries(prev => prev.filter(entry => 
        !(entry.source === 'other-payment' && entry.jfNo?.includes(entryId.toString()))
      ));

      console.log('✅ Entry removed from React state immediately');

      // Then sync deletion to Google Sheets in background
      try {
        const deleteResult = await authService.deleteOtherPayment({ entryId: entryToDelete.entryId });
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
      paymentDetails: entry.paymentDetails || "",
      cashAmount: entry.cashAmount.toString(),
      bankAmount: entry.bankAmount.toString(),
      description: entry.description || "",
      date: entry.date,
      vendor: entry.vendor || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({ paymentDetails: "", cashAmount: "", bankAmount: "", description: "", date: "", vendor: "" });
  };

  // Filter other entries and calculate totals for summary - only for current user
  const getCurrentUserOtherEntries = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    return expenseData.filter(entry => 
      entry.type === "other" && entry.submittedBy === currentUserName
    );
  };

  const otherEntries = getCurrentUserOtherEntries();
  const totalCash = otherEntries.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = otherEntries.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
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

        {/* Summary Cards - Only show when user has entries */}
        {otherEntries.length > 0 && (
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
                  <h4>{otherEntries.length}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="other-form-card">
          <h4><i className="bi bi-receipt"></i> {editingEntry ? "Edit Other Expense" : "Add Other Expense"}</h4>
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
              <div className="col-md-12 mb-3">
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
                <i className={isLoading ? "bi bi-arrow-repeat" : editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                {isLoading ? "Processing..." : editingEntry ? "Update Entry" : "Add Other Entry"}
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
        {otherEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {otherEntries.slice(0, 6).map((entry) => (
                <div key={entry.entryId} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className="entry-type other">
                          Other Expense
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
                          <strong>{entry.paymentDetails}</strong><br/>
                          {entry.description?.substring(0, 60)}...
                          {entry.vendor && <><br/><strong>To:</strong> {entry.vendor}</>}
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

export default OtherPayment;
