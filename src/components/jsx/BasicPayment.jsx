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

function BasicPayment({ expenseData, setExpenseData, setTotalExpenses, setCashBookEntries }) {
  const [activeTab, setActiveTab] = useState("fuel");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('🚀 Loading payment data from Google Sheets...');

        const [fuelResult, addaResult, unionResult] = await Promise.all([
          authService.getFuelPayments(),
          authService.getAddaPayments(),
          authService.getUnionPayments()
        ]);

        let allPaymentData = [];
        let allCashBookEntries = [];

        // Process fuel payments
        if (fuelResult.success && Array.isArray(fuelResult.data)) {
          const fuelData = fuelResult.data.map(entry => ({
            id: entry.entryId,
            entryId: entry.entryId,
            timestamp: convertToTimeString(entry.timestamp),
            date: convertToDateString(entry.date),
            pumpName: entry.pumpName,
            liters: entry.liters,
            rate: entry.rate,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            totalAmount: entry.totalAmount || 0,
            submittedBy: entry.submittedBy,
            remarks: entry.remarks || "",
            type: 'fuel',
            entryStatus: entry.entryStatus || 'pending',
            approvedBy: entry.approvedBy || ''
          }));
          allPaymentData = [...allPaymentData, ...fuelData];

          // Generate cash book entries for fuel payments
          const fuelCashEntries = fuelData.map(entry => ({
            id: `fuel-${entry.entryId}`,
            date: entry.date,
            particulars: "Fuel",
            description: `Fuel expense - ${entry.pumpName || 'Fuel Station'}${entry.liters ? ` (${entry.liters}L)` : ''}`,
            jfNo: `FUEL-${entry.entryId}`,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            type: 'cr',
            timestamp: entry.timestamp,
            source: 'fuel-payment'
          }));
          allCashBookEntries = [...allCashBookEntries, ...fuelCashEntries];
        }

        // Process adda payments
        if (addaResult.success && Array.isArray(addaResult.data)) {
          const addaData = addaResult.data.map(entry => ({
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
            type: 'adda',
            entryStatus: entry.entryStatus || 'pending',
            approvedBy: entry.approvedBy || ''
          }));
          allPaymentData = [...allPaymentData, ...addaData];

          // Generate cash book entries for adda payments
          const addaCashEntries = addaData.map(entry => ({
            id: `adda-${entry.entryId}`,
            date: entry.date,
            particulars: "Adda",
            description: `Adda payment - ${entry.addaName || 'Adda Station'}`,
            jfNo: `ADDA-${entry.entryId}`,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            type: 'cr',
            timestamp: entry.timestamp,
            source: 'adda-payment'
          }));
          allCashBookEntries = [...allCashBookEntries, ...addaCashEntries];
        }

        // Process union payments
        if (unionResult.success && Array.isArray(unionResult.data)) {
          const unionData = unionResult.data.map(entry => ({
            id: entry.entryId,
            entryId: entry.entryId,
            timestamp: convertToTimeString(entry.timestamp),
            date: convertToDateString(entry.date),
            unionName: entry.unionName,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            totalAmount: entry.totalAmount || 0,
            submittedBy: entry.submittedBy,
            remarks: entry.remarks || "",
            type: 'union',
            entryStatus: entry.entryStatus || 'pending',
            approvedBy: entry.approvedBy || ''
          }));
          allPaymentData = [...allPaymentData, ...unionData];

          // Generate cash book entries for union payments
          const unionCashEntries = unionData.map(entry => ({
            id: `union-${entry.entryId}`,
            date: entry.date,
            particulars: "Union Payment",
            description: `Union payment - ${entry.unionName || 'Union'}`,
            jfNo: `UNION-${entry.entryId}`,
            cashAmount: entry.cashAmount || 0,
            bankAmount: entry.bankAmount || 0,
            type: 'cr',
            timestamp: entry.timestamp,
            source: 'union-payment'
          }));
          allCashBookEntries = [...allCashBookEntries, ...unionCashEntries];
        }

        console.log('✅ Payment data loaded:', allPaymentData.length, 'entries');

        // Update expense data with payment entries
        setExpenseData(prev => {
          const nonPaymentData = prev.filter(entry => 
            !['fuel', 'adda', 'union'].includes(entry.type)
          );
          return [...nonPaymentData, ...allPaymentData];
        });

        // Update total expenses
        const totalPaymentExpenses = allPaymentData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
        setTotalExpenses(prev => {
          const currentPaymentExpenses = expenseData.filter(entry => 
            ['fuel', 'adda', 'union'].includes(entry.type)
          ).reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
          return prev - currentPaymentExpenses + totalPaymentExpenses;
        });

        // Update cash book entries
        setCashBookEntries(prev => {
          const nonPaymentEntries = prev.filter(entry => 
            !['fuel-payment', 'adda-payment', 'union-payment'].includes(entry.source)
          );
          return [...allCashBookEntries, ...nonPaymentEntries];
        });

      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setExpenseData, setTotalExpenses, setCashBookEntries]);

  const formatEntry = (entry) => {
    const date = new Date(entry.date).toLocaleDateString('en-IN');
    const time = entry.timestamp || '';

    // Get current user for permission checks
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';

    // Determine if entry can be edited
    const canEdit = entry.entryStatus === 'pending' && entry.submittedBy === currentUserName;
    const isWaiting = entry.entryStatus === 'waiting';
    const isApproved = entry.entryStatus === 'approved';

    return {
      ...entry,
      displayDate: date,
      displayTime: time,
      canEdit: canEdit,
      isWaiting: isWaiting,
      isApproved: isApproved,
      showToUser: entry.entryStatus !== 'approved' || isAdmin
    };
  };

  // Calculate totals for summary - only for current user
  const calculateSummaryTotals = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

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
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    return expenseData.filter(entry => 
      (entry.type === 'fuel' || entry.type === 'adda' || entry.type === 'union') &&
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
          entryStatus: 'pending',
          approvedBy: '',
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
          entryStatus: 'pending',
          approvedBy: '',
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

  const handleDelete = async (entryId, entryType) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setIsProcessing(true);
      let result;

      if (entryType === 'fuel') {
        result = await authService.deleteFuelPayment({ entryId });
      } else if (entryType === 'adda') {
        result = await authService.deleteAddaPayment({ entryId });
      } else if (entryType === 'union') {
        result = await authService.deleteUnionPayment({ entryId });
      }

      if (result.success) {
        setExpenseData(prev => prev.filter(entry => 
          (entry.entryId || entry.id) !== entryId
        ));
        alert('Entry deleted successfully!');
      } else {
        alert('Error deleting entry: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error deleting entry: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendForApproval = async (entry) => {
    if (!window.confirm('Send this entry for approval? You will not be able to edit it until manager reviews.')) {
      return;
    }

    try {
      setIsProcessing(true);
      let result;

      if (entry.type === 'fuel') {
        result = await authService.sendFuelPaymentForApproval({ entryId: entry.entryId });
      } else if (entry.type === 'adda') {
        result = await authService.sendAddaPaymentForApproval({ entryId: entry.entryId });
      } else if (entry.type === 'union') {
        result = await authService.sendUnionPaymentForApproval({ entryId: entry.entryId });
      }

      if (result.success) {
        // Update local state
        setExpenseData(prev => prev.map(item => 
          (item.entryId || item.id) === (entry.entryId || entry.id)
            ? { ...item, entryStatus: 'waiting' }
            : item
        ));
        alert('Entry sent for approval successfully!');
      } else {
        alert('Error sending for approval: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending for approval:', error);
      alert('Error sending for approval: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (entry) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const approverName = currentUser.fullName || currentUser.username;

    if (!window.confirm(`Approve this entry? This action will be recorded as approved by ${approverName}.`)) {
      return;
    }

    try {
      setIsProcessing(true);
      let result;

      if (entry.type === 'fuel') {
        result = await authService.approveFuelPayment({ 
          entryId: entry.entryId, 
          approvedBy: approverName 
        });
      } else if (entry.type === 'adda') {
        result = await authService.approveAddaPayment({ 
          entryId: entry.entryId, 
          approvedBy: approverName 
        });
      } else if (entry.type === 'union') {
        result = await authService.approveUnionPayment({ 
          entryId: entry.entryId, 
          approvedBy: approverName 
        });
      }

      if (result.success) {
        // Update local state
        setExpenseData(prev => prev.map(item => 
          (item.entryId || item.id) === (entry.entryId || entry.id)
            ? { ...item, entryStatus: 'approved', approvedBy: approverName }
            : item
        ));
        alert('Entry approved successfully!');
      } else {
        alert('Error approving entry: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving entry:', error);
      alert('Error approving entry: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (entry) => {
    if (!window.confirm('Reject and resend this entry back to user for editing?')) {
      return;
    }

    try {
      setIsProcessing(true);
      let result;

      if (entry.type === 'fuel') {
        result = await authService.rejectFuelPayment({ entryId: entry.entryId });
      }else if (entry.type === 'adda') {
        result = await authService.rejectAddaPayment({ entryId: entry.entryId });
      }else if (entry.type === 'union') {
        result = await authService.rejectUnionPayment({ entryId: entry.entryId });
      }

      if (result.success) {
        // Update local state
        setExpenseData(prev => prev.map(item => 
          (item.entryId || item.id) === (entry.entryId || entry.id)
            ? { ...item, entryStatus: 'pending', approvedBy: '' }
            : item
        ));
        alert('Entry rejected and sent back to user for editing!');
      } else {
        alert('Error rejecting entry: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting entry:', error);
      alert('Error rejecting entry: ' + error.message);
    } finally {
      setIsProcessing(false);
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

  // Filter entries based on active tab and user permissions
  const filteredEntries = expenseData
    .filter(entry => entry.type === activeTab)
    .map(formatEntry)
    .filter(entry => entry.showToUser) // Hide approved entries from regular users
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="basic-payment-container">
      <div className="container-fluid">
        <div className="basic-payment-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-credit-card"></i> Basic Payment Entry</h2>
              <p>Record your basic expenses - Fuel, Adda & Union payments</p>
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
                    value={activeTab === 'fuel' ? getCurrentFormData().pumpName : ```text
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
              {filteredEntries.slice(0, 6).map((entry) => (
                <div key={entry.entryId} className="col-md-6 col-lg-4 mb-3">
                  <div className="entry-card">
                    <div className="card-body">
                      <div className="entry-header">
                        <span className={`entry-type ${entry.type}`}>
                          {entry.type === 'fuel' ? 'Fuel' : 
                           entry.type === 'adda' ? 'Adda' : 'Union'}
                        </span>
                        
                        
<div className="entry-actions">
                          {/* Status Display */}
                          <div className="entry-status-indicator me-2">
                            {entry.entryStatus === 'pending' && (
                              <span className="badge bg-warning">
                                <i className="bi bi-clock"></i> Pending
                              </span>
                            )}
                            {entry.entryStatus === 'waiting' && (
                              <span className="badge bg-info">
                                <i className="bi bi-hourglass-split"></i> Waiting Approval
                              </span>
                            )}
                            {entry.entryStatus === 'approved' && (
                              <span className="badge bg-success">
                                <i className="bi bi-check-circle"></i> Approved
                                {entry.approvedBy && <small className="d-block">by {entry.approvedBy}</small>}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {entry.canEdit && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary edit-btn me-1"
                                onClick={() => handleEditEntry(entry)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger delete-btn me-1"
                                onClick={() => handleDeleteEntry(entry.entryId)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              {entry.entryStatus === 'pending' && (
                                <button
                                  className="btn btn-sm btn-success approval-btn"
                                  onClick={() => handleSendForApproval(entry)}
                                >
                                  <i className="bi bi-send"></i>
                                </button>
                              )}
                            </>
                          )}

                          {entry.isWaiting && (
                            <span className="badge bg-secondary">
                              <i className="bi bi-lock"></i> Locked
                            </span>
                          )}

                          {/* Admin Controls */}
                          {(() => {
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                            const isAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';

                            return isAdmin && entry.entryStatus === 'waiting' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success me-1"
                                  onClick={() => handleApprove(entry)}
                                >
                                  <i className="bi bi-check-lg"></i> Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => handleReject(entry)}
                                >
                                  <i className="bi bi-arrow-counterclockwise"></i> Resend
                                </button>
                              </>
                            );
                          })()}
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