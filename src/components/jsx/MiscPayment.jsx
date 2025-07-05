
import React, { useState, useEffect } from "react";
import "../css/MiscPayment.css";
import authService from "../../services/authService";

// Helper functions to convert ISO strings to proper format
const convertToTimeString = (timestamp) => {
  if (!timestamp) return '';
  if (typeof timestamp === 'string' && timestamp.match(/^\d{1,2}:\d{2}:\d{2} (AM|PM)$/)) {
    return timestamp;
  }
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
  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  }
  return String(timestamp);
};

const convertToDateString = (date) => {
  if (!date) return '';
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }
  if (typeof date === 'string' && date.includes('T')) {
    try {
      const dateObj = new Date(date);
      const istDate = new Date(dateObj.getTime() + (5.5 * 60 * 60 * 1000));
      return istDate.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Error converting date:', date, error);
      return date.split('T')[0];
    }
  }
  if (date instanceof Date) {
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().split('T')[0];
  }
  return String(date);
};

function MiscPayment({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [activeTab, setActiveTab] = useState("service");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data for different payment types
  const [serviceFormData, setServiceFormData] = useState({
    serviceDetails: "",
    cashAmount: "",
    bankAmount: "",
    description: "",
    date: "",
    mechanic: "",
  });

  const [otherFormData, setOtherFormData] = useState({
    paymentDetails: "",
    cashAmount: "",
    bankAmount: "",
    description: "",
    date: "",
    vendor: "",
  });

  // No automatic data loading - use centralized data from props

  // Calculate totals for summary - only for current user
  const calculateSummaryTotals = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    const userExpenseData = expenseData.filter(entry => 
      (entry.type === 'service' || entry.type === 'other') &&
      entry.submittedBy === currentUserName
    );

    const serviceTotal = userExpenseData.filter(entry => entry.type === 'service')
      .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const otherTotal = userExpenseData.filter(entry => entry.type === 'other')
      .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);

    const totalCash = userExpenseData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
    const totalBank = userExpenseData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
    const grandTotal = totalCash + totalBank;

    return { serviceTotal, otherTotal, totalCash, totalBank, grandTotal, totalEntries: userExpenseData.length };
  };

  const { serviceTotal, otherTotal, totalCash, totalBank, grandTotal, totalEntries } = calculateSummaryTotals();

  // Get min date for date inputs (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getCurrentUserMiscEntries = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    return expenseData.filter(entry => 
      (entry.type === 'service' || entry.type === 'other') &&
      entry.submittedBy === currentUserName
    ).sort((a, b) => b.entryId - a.entryId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';
      const now = new Date();
      const timeOnly = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      let formData, cashAmount, bankAmount, totalAmount, dateOnly;

      if (activeTab === 'service') {
        formData = serviceFormData;
        cashAmount = parseInt(serviceFormData.cashAmount) || 0;
        bankAmount = parseInt(serviceFormData.bankAmount) || 0;
        totalAmount = cashAmount + bankAmount;
        dateOnly = serviceFormData.date;
      } else if (activeTab === 'other') {
        formData = otherFormData;
        cashAmount = parseInt(otherFormData.cashAmount) || 0;
        bankAmount = parseInt(otherFormData.bankAmount) || 0;
        totalAmount = cashAmount + bankAmount;
        dateOnly = otherFormData.date;
      }

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
                ...(activeTab === 'service' && {
                  serviceDetails: serviceFormData.serviceDetails,
                  description: serviceFormData.description,
                  mechanic: serviceFormData.mechanic
                }),
                ...(activeTab === 'other' && {
                  paymentDetails: otherFormData.paymentDetails,
                  description: otherFormData.description,
                  vendor: otherFormData.vendor
                })
              }
            : entry
        );
        setExpenseData(updatedEntries);
        setTotalExpenses((prev) => prev - oldTotal + totalAmount);
        setEditingEntry(null);
        resetForms();
        setIsLoading(false);

        // Then sync to Google Sheets in background
        const updateData = {
          entryId: editingEntry.entryId,
          updatedData: {
            date: dateOnly,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            ...(activeTab === 'service' && {
              serviceType: serviceFormData.serviceDetails,
              serviceDetails: serviceFormData.description
            }),
            ...(activeTab === 'other' && {
              paymentDetails: otherFormData.paymentDetails,
              description: otherFormData.description,
              vendor: otherFormData.vendor || "General"
            })
          }
        };

        if (activeTab === 'service') {
          authService.updateServicePayment(updateData).catch(error => {
            console.error('Background service update sync failed:', error);
          });
        } else if (activeTab === 'other') {
          authService.updateOtherPayment(updateData).catch(error => {
            console.error('Background other update sync failed:', error);
          });
        }

      } else {
        // ADD: First create entry and update React state immediately
        const newEntry = {
          id: Date.now(),
          entryId: Date.now(),
          timestamp: timeOnly,
          type: activeTab,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          date: dateOnly,
          submittedBy: submittedBy,
          ...(activeTab === 'service' && {
            serviceDetails: serviceFormData.serviceDetails,
            description: serviceFormData.description,
            mechanic: serviceFormData.mechanic
          }),
          ...(activeTab === 'other' && {
            paymentDetails: otherFormData.paymentDetails,
            description: otherFormData.description,
            vendor: otherFormData.vendor
          })
        };

        setExpenseData([...expenseData, newEntry]);
        setTotalExpenses((prev) => prev + totalAmount);
        resetForms();
        setIsLoading(false);

        // Add to cash book
        if (cashAmount > 0 || bankAmount > 0) {
          const cashBookEntry = {
            id: Date.now() + 1,
            date: dateOnly,
            particulars: activeTab === 'service' ? "Service Payment" : "Other",
            description: activeTab === 'service' ? 
              `Service expense - ${serviceFormData.serviceDetails}${serviceFormData.mechanic ? ` at ${serviceFormData.mechanic}` : ''}` :
              `${otherFormData.paymentDetails}${otherFormData.vendor ? ` - ${otherFormData.vendor}` : ''}`,
            jfNo: `${activeTab.toUpperCase()}-${newEntry.entryId}`,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            type: 'cr',
            timestamp: timeOnly,
            source: `${activeTab}-payment`
          };
          setCashBookEntries(prev => [cashBookEntry, ...prev]);
        }

        // Then sync to Google Sheets in background
        const addData = {
          entryId: newEntry.entryId,
          timestamp: timeOnly,
          date: dateOnly,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
          ...(activeTab === 'service' && {
            serviceType: serviceFormData.serviceDetails,
            serviceDetails: serviceFormData.description
          }),
          ...(activeTab === 'other' && {
            paymentDetails: otherFormData.paymentDetails,
            description: otherFormData.description,
            vendor: otherFormData.vendor || "General"
          })
        };

        if (activeTab === 'service') {
          authService.addServicePayment(addData).catch(error => {
            console.error('Background service add sync failed:', error);
          });
        } else if (activeTab === 'other') {
          authService.addOtherPayment(addData).catch(error => {
            console.error('Background other add sync failed:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error submitting misc payment:', error);
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

      console.log('🗑️ Deleting misc payment entry:', { entryId, type: entryToDelete.type });

      // DELETE: First update React state immediately for better UX
      const updatedData = expenseData.filter(entry => entry.entryId !== entryId);
      setExpenseData(updatedData);

      if (entryToDelete && entryToDelete.totalAmount) {
        setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
      }

      // Remove corresponding cash book entry
      setCashBookEntries(prev => prev.filter(entry => 
        !(entry.source === `${entryToDelete.type}-payment` && entry.jfNo?.includes(entryId.toString()))
      ));

      console.log('✅ Entry removed from React state immediately');

      // Then sync deletion to Google Sheets in background
      try {
        let deleteResult;
        if (entryToDelete.type === 'service') {
          deleteResult = await authService.deleteServicePayment({ entryId: entryToDelete.entryId });
        } else if (entryToDelete.type === 'other') {
          deleteResult = await authService.deleteOtherPayment({ entryId: entryToDelete.entryId });
        }

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
    setActiveTab(entry.type);
    
    if (entry.type === 'service') {
      setServiceFormData({
        serviceDetails: entry.serviceDetails || "",
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
        description: entry.description || "",
        date: entry.date,
        mechanic: entry.mechanic || "",
      });
    } else if (entry.type === 'other') {
      setOtherFormData({
        paymentDetails: entry.paymentDetails || "",
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
        description: entry.description || "",
        date: entry.date,
        vendor: entry.vendor || "",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    resetForms();
  };

  const resetForms = () => {
    setServiceFormData({ serviceDetails: "", cashAmount: "", bankAmount: "", description: "", date: "", mechanic: "" });
    setOtherFormData({ paymentDetails: "", cashAmount: "", bankAmount: "", description: "", date: "", vendor: "" });
  };

  const getCurrentFormData = () => {
    if (activeTab === 'service') return serviceFormData;
    if (activeTab === 'other') return otherFormData;
    return {};
  };

  const setCurrentFormData = (data) => {
    if (activeTab === 'service') setServiceFormData(data);
    if (activeTab === 'other') setOtherFormData(data);
  };

  const allMiscEntries = getCurrentUserMiscEntries();

  return (
    <div className="misc-payment-container">
      <div className="container-fluid">
        <div className="misc-payment-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-credit-card"></i> Misc Payment Entry</h2>
              <p>Record your miscellaneous expenses - Service & Other payments</p>
            </div>
            
          </div>
        </div>

        {/* Summary Cards - Only show when user has entries */}
        {totalEntries > 0 && (
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
                  <h4>{totalEntries}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation mb-4">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'service' ? 'active' : ''}`}
                onClick={() => setActiveTab('service')}
              >
                <i className="bi bi-tools"></i> Service
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'other' ? 'active' : ''}`}
                onClick={() => setActiveTab('other')}
              >
                <i className="bi bi-credit-card"></i> Other
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          <div className="misc-form-card">
            <h4>
              <i className={`bi ${activeTab === 'service' ? 'bi-tools' : 'bi-credit-card'}`}></i> 
              {editingEntry ? `Edit ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control date-input"
                    value={getCurrentFormData().date}
                    onChange={(e) => setCurrentFormData({ ...getCurrentFormData(), date: e.target.value })}
                    onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                    placeholder="Select date"
                    min={getTodayDate()}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    {activeTab === 'service' ? 'Service Details' : 'Payment Details'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={activeTab === 'service' ? getCurrentFormData().serviceDetails : getCurrentFormData().paymentDetails}
                    onChange={(e) => {
                      const field = activeTab === 'service' ? 'serviceDetails' : 'paymentDetails';
                      setCurrentFormData({ ...getCurrentFormData(), [field]: e.target.value });
                    }}
                    placeholder={`Enter ${activeTab === 'service' ? 'service details' : 'payment details'}`}
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
                    value={getCurrentFormData().description}
                    onChange={(e) => setCurrentFormData({ ...getCurrentFormData(), description: e.target.value })}
                    placeholder={`Enter detailed description of ${activeTab === 'service' ? 'service work' : 'payment'}`}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">
                    {activeTab === 'service' ? 'Mechanic/Service Center (Optional)' : 'Vendor/Recipient (Optional)'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={activeTab === 'service' ? getCurrentFormData().mechanic : getCurrentFormData().vendor}
                    onChange={(e) => {
                      const field = activeTab === 'service' ? 'mechanic' : 'vendor';
                      setCurrentFormData({ ...getCurrentFormData(), [field]: e.target.value });
                    }}
                    placeholder={`Enter ${activeTab === 'service' ? 'mechanic or service center name' : 'vendor or recipient name'}`}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Cash Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={getCurrentFormData().cashAmount}
                    onChange={(e) => setCurrentFormData({ ...getCurrentFormData(), cashAmount: e.target.value })}
                    placeholder="Enter cash amount"
                    min="0"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Bank Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={getCurrentFormData().bankAmount}
                    onChange={(e) => setCurrentFormData({ ...getCurrentFormData(), bankAmount: e.target.value })}
                    placeholder="Enter bank amount"
                    min="0"
                  />
                </div>
              </div>

              <div className="amount-summary mb-3">
                <div className="row">
                  <div className="col-4">
                    <span>Cash: ₹{parseInt(getCurrentFormData().cashAmount) || 0}</span>
                  </div>
                  <div className="col-4">
                    <span>Bank: ₹{parseInt(getCurrentFormData().bankAmount) || 0}</span>
                  </div>
                  <div className="col-4">
                    <strong>Total: ₹{(parseInt(getCurrentFormData().cashAmount) || 0) + (parseInt(getCurrentFormData().bankAmount) || 0)}</strong>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button type="submit" className="btn misc-entry-btn" disabled={isLoading}>
                  <i className={isLoading ? "bi bi-arrow-repeat" : editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle"}></i> 
                  {isLoading ? "Processing..." : editingEntry ? "Update Entry" : "Add Entry"}
                </button>
                {editingEntry && (
                  <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                    <i className="bi bi-x-circle"></i> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Recent Entries - All misc types combined */}
        {allMiscEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {allMiscEntries.slice(0, 6).map((entry) => (
                <div key={entry.entryId} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className={`entry-type ${entry.type}`}>
                          {entry.type === 'service' ? 'Service' : 'Other'}
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
                          {entry.type === 'service' && (
                            <>
                              <strong>{entry.serviceDetails}</strong><br/>
                              {entry.description?.substring(0, 60)}...
                              {entry.mechanic && <><br/><strong>At:</strong> {entry.mechanic}</>}
                            </>
                          )}
                          {entry.type === 'other' && (
                            <>
                              <strong>{entry.paymentDetails}</strong><br/>
                              {entry.description?.substring(0, 60)}...
                              {entry.vendor && <><br/><strong>To:</strong> {entry.vendor}</>}
                            </>
                          )}
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

export default MiscPayment;
