
import React, { useState, useEffect } from "react";
import "../css/ServicePayment.css";
import authService from "../../services/authService";

// Helper functions for date/time conversion
const convertToTimeString = (timestamp) => {
  if (!timestamp) return '';
  try {
    if (typeof timestamp === 'string' && timestamp.includes(':')) {
      return timestamp; // Already in time format
    }
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return '';
  }
};

const convertToDateString = (dateInput) => {
  if (!dateInput) return '';
  try {
    if (typeof dateInput === 'string' && dateInput.includes('-')) {
      return dateInput; // Already in YYYY-MM-DD format
    }
    const date = new Date(dateInput);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error converting date:', error);
    return '';
  }
};

function ServiceEntry({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceDetails: "",
    cashAmount: "",
    bankAmount: "",
    description: "",
    date: "",
    mechanic: "",
  });

  // Load data on component mount and periodically refresh
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('🚀 Loading service payments from Google Sheets...');

        const result = await authService.getServicePayments();

        if (result.success && Array.isArray(result.data)) {
          const serviceData = result.data.map(entry => ({
            id: entry.entryId,
            entryId: entry.entryId,
            timestamp: convertToTimeString(entry.timestamp),
            date: convertToDateString(entry.date),
            serviceDetails: entry.serviceDetails || entry.serviceType || '',
            serviceType: entry.serviceType || '',
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            totalAmount: entry.totalAmount || 0,
            submittedBy: entry.submittedBy,
            description: entry.serviceDetails || "",
            mechanic: "",
            type: 'service'
          }));

          console.log('✅ Service payments loaded:', serviceData.length, 'entries');

          // Update expense data with loaded entries
          const currentServiceData = expenseData.filter(entry => entry.type !== 'service');
          const updatedExpenseData = [...currentServiceData, ...serviceData];
          setExpenseData(updatedExpenseData);

          // Update total expenses
          const serviceTotalAmount = serviceData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
          setTotalExpenses(prev => {
            const currentServiceTotal = expenseData
              .filter(entry => entry.type === 'service')
              .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
            return prev - currentServiceTotal + serviceTotalAmount;
          });

          console.log('💰 Service payments total amount:', serviceTotalAmount);
        } else {
          console.log('ℹ️ No service payment data found or invalid response:', result);
        }
      } catch (error) {
        console.error('❌ Error loading service payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadData();

    // Set up periodic refresh every 30 seconds to get real-time updates
    const refreshInterval = setInterval(() => {
      console.log('🔄 Refreshing service payments data...');
      loadData();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, []); // Run once on component mount

  // Function to get min date for date inputs (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;

    try {
      setIsLoading(true);

      const cashAmount = parseInt(formData.cashAmount) || 0;
      const bankAmount = parseInt(formData.bankAmount) || 0;
      const totalAmount = cashAmount + bankAmount;

      if (totalAmount === 0) {
        alert('Please enter at least one amount (Cash or Bank)');
        setIsLoading(false);
        return;
      }

      if (editingEntry) {
        // UPDATE: Update existing entry
        console.log('📝 Updating service entry:', { entryId: editingEntry.entryId, formData });

        // First update React state immediately for better UX
        const oldTotal = editingEntry.totalAmount;
        const updatedEntries = expenseData.map(entry => 
          entry.entryId === editingEntry.entryId 
            ? {
                ...entry,
                serviceDetails: formData.serviceDetails,
                serviceType: formData.serviceDetails,
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

        // Then sync to Google Sheets in background
        authService.updateServicePayment({
          entryId: editingEntry.entryId,
          updatedData: {
            serviceType: formData.serviceDetails,
            serviceDetails: formData.description,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            totalAmount: totalAmount,
            date: formData.date
          }
        }).catch(error => {
          console.error('Background service update sync failed:', error);
        });

      } else {
        // CREATE: Add new entry
        const currentDate = new Date();
        const entryId = currentDate.getTime().toString();
        const timeOnly = currentDate.toLocaleTimeString('en-US', { 
          hour12: true, 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        const dateOnly = formData.date;
        // Get current logged-in user's full name
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const submittedBy = currentUser.fullName || currentUser.username || 'driver';

        console.log('📝 Creating new service entry:', { entryId, timeOnly, dateOnly });

        // First update React state immediately for better UX
        const newEntry = {
          id: entryId,
          entryId: entryId,
          type: "service",
          serviceDetails: formData.serviceDetails,
          serviceType: formData.serviceDetails,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          description: formData.description,
          date: formData.date,
          mechanic: formData.mechanic,
          timestamp: timeOnly,
          submittedBy: submittedBy
        };

        setExpenseData(prev => [newEntry, ...prev]);
        setTotalExpenses((prev) => prev + totalAmount);
        
        // Add to cash book - payments go to Cr. side
        if (cashAmount > 0 || bankAmount > 0) {
          const cashBookEntry = {
            id: `service-${entryId}`,
            date: formData.date,
            particulars: "Service Payment",
            description: `Service expense - ${formData.serviceDetails}${formData.mechanic ? ` at ${formData.mechanic}` : ''}`,
            jfNo: `SERVICE-${entryId}`,
            cashAmount: cashAmount,
            bankAmount: bankAmount,
            type: 'cr', // Payments go to Cr. side
            timestamp: timeOnly,
            source: 'service-payment'
          };
          setCashBookEntries(prev => [cashBookEntry, ...prev]);
        }

        // Then sync to Google Sheets in background
        authService.addServicePayment({
          entryId: entryId,
          timestamp: timeOnly,
          date: dateOnly,
          serviceType: formData.serviceDetails,
          serviceDetails: formData.description,
          cashAmount: cashAmount,
          bankAmount: bankAmount,
          totalAmount: totalAmount,
          submittedBy: submittedBy,
        }).catch(error => {
          console.error('Background service add sync failed:', error);
        });
      }

      // Reset form
      setFormData({
        serviceDetails: "",
        cashAmount: "",
        bankAmount: "",
        description: "",
        date: "",
        mechanic: "",
      });

    } catch (error) {
      console.error('Error submitting service payment:', error);
      alert(`❌ Error saving data: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const entryToDelete = expenseData.find(entry => entry.entryId === entryId);

      if (!entryToDelete) {
        alert('Entry not found!');
        return;
      }

      console.log('🗑️ Deleting service entry:', { entryId, type: entryToDelete.type });

      // DELETE: First update React state immediately for better UX
      const updatedData = expenseData.filter(entry => entry.entryId !== entryId);
      setExpenseData(updatedData);

      if (entryToDelete && entryToDelete.totalAmount) {
        setTotalExpenses((prev) => prev - entryToDelete.totalAmount);
      }
      
      // Remove corresponding cash book entry
      setCashBookEntries(prev => prev.filter(entry => 
        !(entry.source === 'service-payment' && entry.jfNo?.includes(entryId.toString()))
      ));

      // Then sync deletion to Google Sheets in background
      authService.deleteServicePayment({
        entryId: entryId
      }).catch(error => {
        console.error('Background service delete sync failed:', error);
      });

    } catch (error) {
      console.error('Error deleting service entry:', error);
      alert('Error deleting entry. Please try again.');
    }
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

  // Filter service entries for current user only - like FuelPayment
  const getCurrentUserServiceEntries = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    return expenseData.filter(entry => 
      entry.type === "service" && entry.submittedBy === currentUserName
    );
  };

  const serviceEntries = getCurrentUserServiceEntries();

  // Calculate totals for summary
  const totalCash = serviceEntries.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
  const totalBank = serviceEntries.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
  const grandTotal = totalCash + totalBank;

  return (
    <div className="service-entry-container">
      <div className="container-fluid">
        <div className="service-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-credit-card"></i> Service Payment Entry</h2>
              <p>Record your vehicle service and maintenance expenses (Payment)</p>
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
              <button type="submit" className="btn service-entry-btn" disabled={isLoading}>
                <i className={isLoading ? "bi bi-arrow-repeat" : (editingEntry ? "bi bi-check-circle" : "bi bi-plus-circle")}></i> 
                {isLoading ? "Processing..." : (editingEntry ? "Update Entry" : "Add Service Entry")}
              </button>
              {editingEntry && (
                <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                  <i className="bi bi-x-circle"></i> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Recent Entries - Only show when user has entries */}
        {serviceEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {serviceEntries.slice(-6).reverse().map((entry) => {
                // Current user's entries - can always edit/delete
                const canEdit = true;

                return (
                  <div key={entry.id} className="col-md-6 col-lg-4 mb-3">
                    <div className="entry-card">
                      <div className="card-body">
                        <div className="entry-header">
                          <span className="entry-type service">Service</span>
                          <div className="entry-actions">
                            {canEdit && (
                              <>
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
                              </>
                            )}
                          </div>
                        </div>
                        <div className="entry-date">
                          <small className="text-muted">
                            <div>{entry.date}</div>
                            <div className="timestamp">{entry.timestamp || ''}</div>
                          </small>
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
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceEntry;
