import React, { useState, useEffect } from "react";
import "../css/BasicPayment.css";
import authService from '../../services/authService.js';

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

function BasicPayment({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries, currentUser }) {
  const [activeTab, setActiveTab] = useState("fuel");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form data for different payment types
  const [fuelFormData, setFuelFormData] = useState({
    cashAmount: "",
    bankAmount: "",
    liters: "",
    rate: "",
    date: "",
    pumpName: "",
    remarks: ""
  });

  const [addaFormData, setAddaFormData] = useState({
    cashAmount: "",
    bankAmount: "",
    date: "",
    addaName: "",
    remarks: ""
  });

  const [unionFormData, setUnionFormData] = useState({
    cashAmount: "",
    bankAmount: "",
    unionName: "",
    date: "",
    remarks: ""
  });

  // No automatic data loading - use centralized data from props

  // Calculate totals for summary - only for current user
  const calculateSummaryTotals = () => {
    const currentUserName = currentUser?.fullName || currentUser?.username;

    const userExpenseData = expenseData.filter(entry => 
      (entry.type === 'fuel' || entry.type === 'adda' || entry.type === 'union') &&
      entry.submittedBy === currentUserName
    );

    const fuelTotal = userExpenseData.filter(entry => entry.type === 'fuel')
      .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const addaTotal = userExpenseData.filter(entry => entry.type === 'adda')
      .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const unionTotal = userExpenseData.filter(entry => entry.type === 'union')
      .reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);

    const totalCash = userExpenseData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
    const totalBank = userExpenseData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);
    const grandTotal = totalCash + totalBank;

    return { fuelTotal, addaTotal, unionTotal, totalCash, totalBank, grandTotal, totalEntries: userExpenseData.length };
  };

  const { fuelTotal, addaTotal, unionTotal, totalCash, totalBank, grandTotal, totalEntries } = calculateSummaryTotals();

  // Get min date for date inputs (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getCurrentUserPaymentEntries = () => {
    const currentUserName = currentUser?.fullName || currentUser?.username;

    return expenseData.filter(entry => 
      (entry.type === 'fuel' || entry.type === 'adda' || entry.type === 'union') &&
      entry.submittedBy === currentUserName
    ).sort((a, b) => b.entryId - a.entryId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submittedBy = currentUser?.fullName || currentUser?.username || 'Unknown User';
      const now = new Date();
      const timeOnly = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      let formData, cashAmount, bankAmount, totalAmount, dateOnly;

      if (activeTab === 'fuel') {
        formData = fuelFormData;
        cashAmount = parseInt(fuelFormData.cashAmount) || 0;
        bankAmount = parseInt(fuelFormData.bankAmount) || 0;
        totalAmount = cashAmount + bankAmount;
        dateOnly = fuelFormData.date;
      } else if (activeTab === 'adda') {
        formData = addaFormData;
        cashAmount = parseInt(addaFormData.cashAmount) || 0;
        bankAmount = parseInt(addaFormData.bankAmount) || 0;
        totalAmount = cashAmount + bankAmount;
        dateOnly = addaFormData.date;
      } else if (activeTab === 'union') {
        formData = unionFormData;
        cashAmount = parseInt(unionFormData.cashAmount) || 0;
        bankAmount = parseInt(unionFormData.bankAmount) || 0;
        totalAmount = cashAmount + bankAmount;
        dateOnly = unionFormData.date;
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
                ...(activeTab === 'fuel' && {
                  pumpName: fuelFormData.pumpName,
                  liters: fuelFormData.liters,
                  rate: fuelFormData.rate,
                  remarks: fuelFormData.remarks
                }),
                ...(activeTab === 'adda' && {
                  addaName: addaFormData.addaName,
                  remarks: addaFormData.remarks
                }),
                ...(activeTab === 'union' && {
                  unionName: unionFormData.unionName,
                  remarks: unionFormData.remarks
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
            ...(activeTab === 'fuel' && {
              pumpName: fuelFormData.pumpName,
              liters: fuelFormData.liters,
              rate: fuelFormData.rate,
              remarks: fuelFormData.remarks
            }),
            ...(activeTab === 'adda' && {
              addaName: addaFormData.addaName,
              remarks: addaFormData.remarks
            }),
            ...(activeTab === 'union' && {
              unionName: unionFormData.unionName,
              remarks: unionFormData.remarks
            })
          }
        };

        if (activeTab === 'fuel') {
          authService.updateFuelPayment(updateData).catch(error => {
            console.error('Background fuel update sync failed:', error);
          });
        } else if (activeTab === 'adda') {
          authService.updateAddaPayment(updateData).catch(error => {
            console.error('Background adda update sync failed:', error);
          });
        } else if (activeTab === 'union') {
          authService.updateUnionPayment(updateData).catch(error => {
            console.error('Background union update sync failed:', error);
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
          ...(activeTab === 'fuel' && {
            pumpName: fuelFormData.pumpName,
            liters: fuelFormData.liters,
            rate: fuelFormData.rate,
            remarks: fuelFormData.remarks
          }),
          ...(activeTab === 'adda' && {
            addaName: addaFormData.addaName,
            remarks: addaFormData.remarks
          }),
          ...(activeTab === 'union' && {
            unionName: unionFormData.unionName,
            remarks: unionFormData.remarks
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
            particulars: activeTab === 'fuel' ? "Fuel" : activeTab === 'adda' ? "Adda" : "Union Payment",
            description: activeTab === 'fuel' ? 
              `Fuel expense - ${fuelFormData.pumpName || 'Fuel Station'}${fuelFormData.liters ? ` (${fuelFormData.liters}L)` : ''}` :
              activeTab === 'adda' ? 
              `Adda payment - ${addaFormData.addaName || 'Adda Station'}` :
              `Union payment - ${unionFormData.unionName || 'Union'}`,
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
          ...(activeTab === 'fuel' && {
            pumpName: fuelFormData.pumpName,
            liters: fuelFormData.liters,
            rate: fuelFormData.rate,
            remarks: fuelFormData.remarks
          }),
          ...(activeTab === 'adda' && {
            addaName: addaFormData.addaName,
            remarks: addaFormData.remarks
          }),
          ...(activeTab === 'union' && {
            unionName: unionFormData.unionName,
            remarks: unionFormData.remarks
          })
        };

        if (activeTab === 'fuel') {
          authService.addFuelPayment(addData).catch(error => {
            console.error('Background fuel add sync failed:', error);
          });
        } else if (activeTab === 'adda') {
          authService.addAddaPayment(addData).catch(error => {
            console.error('Background adda add sync failed:', error);
          });
        } else if (activeTab === 'union') {
          authService.addUnionPayment(addData).catch(error => {
            console.error('Background union add sync failed:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
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

      console.log('🗑️ Deleting payment entry:', { entryId, type: entryToDelete.type });

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
        if (entryToDelete.type === 'fuel') {
          deleteResult = await authService.deleteFuelPayment({ entryId: entryToDelete.entryId });
        } else if (entryToDelete.type === 'adda') {
          deleteResult = await authService.deleteAddaPayment({ entryId: entryToDelete.entryId });
        } else if (entryToDelete.type === 'union') {
          deleteResult = await authService.deleteUnionPayment({ entryId: entryToDelete.entryId });
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

    if (entry.type === 'fuel') {
      setFuelFormData({
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
        liters: entry.liters || "",
        rate: entry.rate || "",
        date: entry.date,
        pumpName: entry.pumpName || "",
        remarks: entry.remarks || ""
      });
    } else if (entry.type === 'adda') {
      setAddaFormData({
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
        date: entry.date,
        addaName: entry.addaName || "",
        remarks: entry.remarks || ""
      });
    } else if (entry.type === 'union') {
      setUnionFormData({
        cashAmount: entry.cashAmount.toString(),
        bankAmount: entry.bankAmount.toString(),
        unionName: entry.unionName || "",
        date: entry.date,
        remarks: entry.remarks || ""
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    resetForms();
  };

  const resetForms = () => {
    setFuelFormData({ cashAmount: "", bankAmount: "", liters: "", rate: "", date: "", pumpName: "", remarks: "" });
    setAddaFormData({ cashAmount: "", bankAmount: "", date: "", addaName: "", remarks: "" });
    setUnionFormData({ cashAmount: "", bankAmount: "", unionName: "", date: "", remarks: "" });
  };

  const getCurrentFormData = () => {
    if (activeTab === 'fuel') return fuelFormData;
    if (activeTab === 'adda') return addaFormData;
    if (activeTab === 'union') return unionFormData;
    return {};
  };

  const setCurrentFormData = (data) => {
    if (activeTab === 'fuel') setFuelFormData(data);
    if (activeTab === 'adda') setAddaFormData(data);
    if (activeTab === 'union') setUnionFormData(data);
  };

  const allPaymentEntries = getCurrentUserPaymentEntries();

  // Load data function
  const loadData = async () => {
    try {
      console.log('🔄 BasicPayment: Loading payment data...');
      
      const currentUserName = currentUser?.fullName || currentUser?.username;

      // Load all payment types
      const [fuelResult, addaResult, unionResult] = await Promise.all([
        authService.getFuelPayments(),
        authService.getAddaPayments(), 
        authService.getUnionPayments()
      ]);

      const allPayments = [];

      // Process fuel payments
      if (fuelResult.success && fuelResult.data) {
        const userFuelPayments = fuelResult.data
          .filter(entry => entry.submittedBy === currentUserName)
          .map(entry => ({
            ...entry,
            type: 'fuel',
            timestamp: convertToTimeString(entry.timestamp),
            date: convertToDateString(entry.date)
          }));
        allPayments.push(...userFuelPayments);
      }

      // Process adda payments
      if (addaResult.success && addaResult.data) {
        const userAddaPayments = addaResult.data
          .filter(entry => entry.submittedBy === currentUserName)
          .map(entry => ({
            ...entry,
            type: 'adda',
            timestamp: convertToTimeString(entry.timestamp),
            date: convertToDateString(entry.date)
          }));
        allPayments.push(...userAddaPayments);
      }

      // Process union payments
      if (unionResult.success && unionResult.data) {
        const userUnionPayments = unionResult.data
          .filter(entry => entry.submittedBy === currentUserName)
          .map(entry => ({
            ...entry,
            type: 'union',
            timestamp: convertToTimeString(entry.timestamp),
            date: convertToDateString(entry.date)
          }));
        allPayments.push(...userUnionPayments);
      }

      // Update expense data with payments
      const otherExpenses = expenseData.filter(entry => 
        !['fuel', 'adda', 'union'].includes(entry.type)
      );
      setExpenseData([...otherExpenses, ...allPayments]);

      console.log('✅ BasicPayment: Data loaded successfully');

    } catch (error) {
      console.error('❌ BasicPayment: Error loading data:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();

    // Listen for centralized refresh events
    const handleDataRefresh = () => {
      console.log('🔄 BasicPayment: Refreshing data from centralized refresh');
      loadData();
    };

    window.addEventListener('dataRefreshed', handleDataRefresh);

    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefresh);
    };
  }, []);

  return (
    <div className="basic-payment-container">
      <div className="container-fluid">
        <div className="basic-payment-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-credit-card"></i> Basic Payment Entry</h2>
              <p>Record your basic expenses - Fuel, Adda & Union payments</p>
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
                className={`nav-link ${activeTab === 'fuel' ? 'active' : ''}`}
                onClick={() => setActiveTab('fuel')}
              >
                <i className="bi bi-fuel-pump"></i> Fuel
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'adda' ? 'active' : ''}`}
                onClick={() => setActiveTab('adda')}
              >
                <i className="bi bi-building"></i> Adda
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'union' ? 'active' : ''}`}
                onClick={() => setActiveTab('union')}
              >
                <i className="bi bi-people"></i> Union
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          <div className="payment-form-card">
            <h4>
              <i className={`bi ${activeTab === 'fuel' ? 'bi-fuel-pump' : activeTab === 'adda' ? 'bi-building' : 'bi-people'}`}></i> 
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
                    {activeTab === 'fuel' ? 'Pump Name (Optional)' : 
                     activeTab === 'adda' ? 'Adda Name' : 'Union Name'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={activeTab === 'fuel' ? getCurrentFormData().pumpName : 
                           activeTab === 'adda' ? getCurrentFormData().addaName : 
                           getCurrentFormData().unionName}
                    onChange={(e) => {
                      const field = activeTab === 'fuel' ? 'pumpName' : 
                                   activeTab === 'adda' ? 'addaName' : 'unionName';
                      setCurrentFormData({ ...getCurrentFormData(), [field]: e.target.value });
                    }}
                    placeholder={`Enter ${activeTab === 'fuel' ? 'pump name' : 
                                        activeTab === 'adda' ? 'adda name' : 'union name'}`}
                    required={activeTab !== 'fuel'}
                  />
                </div>
              </div>

              {activeTab === 'fuel' && (
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Liters (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={getCurrentFormData().liters}
                      onChange={(e) => setCurrentFormData({ ...getCurrentFormData(), liters: e.target.value })}
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
                      value={getCurrentFormData().rate}
                      onChange={(e) => setCurrentFormData({ ...getCurrentFormData(), rate: e.target.value })}
                      placeholder="Enter rate per liter"
                      min="0"
                    />
                  </div>
                </div>
              )}

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

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Remarks (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={getCurrentFormData().remarks}
                    onChange={(e) => setCurrentFormData({ ...getCurrentFormData(), remarks: e.target.value })}
                    placeholder="Enter remarks"
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
                <button type="submit" className="btn payment-entry-btn" disabled={isLoading}>
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

        {/* Recent Entries - All payment types combined */}
        {allPaymentEntries.length > 0 && (
          <div className="recent-entries mt-4">
            <h4>Recent Entries</h4>
            <div className="row">
              {allPaymentEntries.slice(0, 6).map((entry) => (
                <div key={entry.entryId} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className={`entry-type ${entry.type}`}>
                          {entry.type === 'fuel' ? 'Fuel' : 
                           entry.type === 'adda' ? 'Adda' : 'Union'}
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
                          {entry.type === 'fuel' && (
                            <>
                              {entry.pumpName && <><strong>Pump:</strong> {entry.pumpName}<br/></>}
                              {entry.liters && <><strong>Liters:</strong> {entry.liters}<br/></>}
                              {entry.rate && <><strong>Rate:</strong> ₹{entry.rate}/L</>}
                            </>
                          )}
                          {entry.type === 'adda' && entry.addaName && (
                            <><strong>Adda:</strong> {entry.addaName}<br/></>
                          )}
                          {entry.type === 'union' && entry.unionName && (
                            <><strong>Union:</strong> {entry.unionName}<br/></>
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

export default BasicPayment;