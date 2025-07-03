import React, { useState, useEffect } from "react";
import "../css/DataSummary.css";
import hybridDataService from '../../services/hybridDataService.js';

function DataSummary({ fareData, expenseData, cashBookEntries }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [settlementData, setSettlementData] = useState({
    cashSettlement: "",
    bankSettlement: "",
    settlementWith: "",
    remarks: ""
  });

  // Force re-calculation when data updates
  useEffect(() => {
    console.log('📊 Data Summary - Data updated:', {
      fareEntries: fareData.length,
      expenseEntries: expenseData.length,
      cashBookEntries: cashBookEntries.length
    });
  }, [fareData, expenseData, cashBookEntries]);

  // Calculate totals from fareData and expenseData directly - only for current user
  const calculateTotals = () => {
    // Get current user info for filtering
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserName = currentUser.fullName || currentUser.username;

    // Filter data by current user only
    const userFareData = fareData.filter(entry => 
      entry.submittedBy === currentUserName || 
      (!entry.submittedBy && entry.type) // Handle old entries without submittedBy
    );

    const userExpenseData = expenseData.filter(entry => 
      entry.submittedBy === currentUserName || 
      (!entry.submittedBy && entry.type) // Handle old entries without submittedBy
    );

    // Calculate from filtered fare data (receipts)
    let totalCashReceipts = userFareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
    let totalBankReceipts = userFareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

    // Calculate from filtered expense data (payments)
    let totalCashPayments = userExpenseData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0);
    let totalBankPayments = userExpenseData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0);

    // Also calculate from cash book entries as backup
    let cbCashReceipts = 0;
    let cbCashPayments = 0;
    let cbBankReceipts = 0;
    let cbBankPayments = 0;

    cashBookEntries.forEach(entry => {
      if (entry.type === 'dr') {
        cbCashReceipts += entry.cashAmount || 0;
        cbBankReceipts += entry.bankAmount || 0;
      } else if (entry.type === 'cr') {
        cbCashPayments += entry.cashAmount || 0;
        cbBankPayments += entry.bankAmount || 0;
      }
    });

    // Use direct data if available, otherwise use cash book data
    const finalCashReceipts = totalCashReceipts > 0 ? totalCashReceipts : cbCashReceipts;
    const finalBankReceipts = totalBankReceipts > 0 ? totalBankReceipts : cbBankReceipts;
    const finalCashPayments = totalCashPayments > 0 ? totalCashPayments : cbCashPayments;
    const finalBankPayments = totalBankPayments > 0 ? totalBankPayments : cbBankPayments;

    const cashBalance = finalCashReceipts - finalCashPayments;
    const bankBalance = finalBankReceipts - finalBankPayments;

    return {
      totalCashReceipts: finalCashReceipts,
      totalCashPayments: finalCashPayments,
      totalBankReceipts: finalBankReceipts,
      totalBankPayments: finalBankPayments,
      cashBalance,
      bankBalance
    };
  };

  const totals = calculateTotals();

  const handleSendForApproval = () => {
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!settlementData.settlementWith.trim()) {
      alert("Please enter manager name");
      return;
    }

    // Calculate summary data for current user only
    const calculateSummary = () => {
      // Get current user info for filtering
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserName = currentUser.fullName || currentUser.username;

      // Filter data by current user
      const userFareData = fareData.filter(entry => 
        entry.submittedBy === currentUserName ||
        (!entry.submittedBy && entry.type) // Handle old entries without submittedBy
      );

      const userExpenseData = expenseData.filter(entry => 
        entry.submittedBy === currentUserName ||
        (!entry.submittedBy && entry.type) // Handle old entries without submittedBy
      );

      return {
        fareReceipts: {
          totalEntries: userFareData.length,
          cashCollection: userFareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankCollection: userFareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalIncome: userFareData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        fuelPayments: {
          totalEntries: userExpenseData.filter(entry => entry.type === 'fuel').length,
          cashExpense: userExpenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: userExpenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: userExpenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        addaPayments: {
          totalEntries: userExpenseData.filter(entry => entry.type === 'fees').length,
          cashExpense: userExpenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: userExpenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: userExpenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        servicePayments: {
          totalEntries: userExpenseData.filter(entry => entry.type === 'service').length,
          cashExpense: userExpenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: userExpenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: userExpenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        unionPayments: {
          totalEntries: userExpenseData.filter(entry => entry.type === 'union').length,
          cashExpense: userExpenseData.filter(entry => entry.type === 'union').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: userExpenseData.filter(entry => entry.type === 'union').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: userExpenseData.filter(entry => entry.type === 'union').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        otherPayments: {
          totalEntries: userExpenseData.filter(entry => entry.type === 'other').length,
          cashExpense: userExpenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: userExpenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: userExpenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        }
      };
    };

    const summaryData = calculateSummary();

    const submissionData = {
      timestamp: new Date().toISOString(),
      totals,
      settlementData,
      summaryData
    };

    // Here you can handle the approval submission
    console.log("Approval submitted:", submissionData);

    let successMessage = "Data sent for approval successfully!";
    if (settlementData.cashSettlement && parseFloat(settlementData.cashSettlement) > 0) {
      successMessage += `\n\nCash Handover: ₹${parseFloat(settlementData.cashSettlement).toLocaleString()} to ${settlementData.settlementWith}`;
    }

    alert(successMessage);

    setShowApprovalModal(false);
    setSettlementData({
      cashSettlement: "",
      bankSettlement: "",
      settlementWith: "",
      remarks: ""
    });
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setSettlementData({
      cashSettlement: "",
      bankSettlement: "",
      settlementWith: "",
      remarks: ""
    });
  };

  return (
    <div className="approval-container">
      <div className="container-fluid">
        <div className="approval-header">
          <div className="header-content">
            <div>
              <h2><i className="bi bi-check-circle"></i> Data Summary & Approval</h2>
              <p>Review your financial data and send for approval</p>
            </div>
            <div className="sync-status">
              <div className="simple-sync-indicator synced">
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Section Summaries */}
        {(() => {
          // Get current user info for filtering
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserName = currentUser.fullName || currentUser.username;

          // Check if current user has any entries
          const userFareEntries = fareData.filter(entry => entry.submittedBy === currentUserName);
          const userExpenseEntries = expenseData.filter(entry => entry.submittedBy === currentUserName);
          const hasUserEntries = userFareEntries.length > 0 || userExpenseEntries.length > 0;

          return hasUserEntries ? (
            <div className="section-summaries mb-4">
              {/* Fare Receipt Summary */}
              <div className="section-summary-card">
                <h5><i className="bi bi-receipt"></i> Fare Receipt Summary</h5>
                <div className="row">
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Total Entries</h6>
                      <h5>{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return fareData.filter(entry => 
                          entry.submittedBy === currentUserName || 
                          (!entry.submittedBy && entry.type)
                        ).length;
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Cash Collection</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return fareData.filter(entry => 
                          entry.submittedBy === currentUserName || 
                          (!entry.submittedBy && entry.type)
                        ).reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Bank Collection</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return fareData.filter(entry => 
                          entry.submittedBy === currentUserName || 
                          (!entry.submittedBy && entry.type)
                        ).reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card total">
                      <h6>Total Fare Income</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return fareData.filter(entry => 
                          entry.submittedBy === currentUserName || 
                          (!entry.submittedBy && entry.type)
                        ).reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                </div>
                {fareData.length > 0 && (
                  <div className="recent-entries-preview">
                    <h6>Recent Entries:</h6>
                    {(() => {
                      // Get current user info for filtering
                      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                      const currentUserName = currentUser.fullName || currentUser.username;

                      // Filter entries by current user and show last 3
                      const userEntries = fareData.filter(entry => 
                        entry.submittedBy === currentUserName || 
                        entry.submittedBy === 'driver' || // Fallback for old entries
                        !entry.submittedBy // Handle entries without submittedBy field
                      );

                      return userEntries.slice(-3).map((entry) => (
                        <div key={entry.entryId || entry.id} className="entry-preview">
                          <span className="entry-type">{entry.type === 'daily' ? 'Daily' : entry.type === 'booking' ? 'Booking' : 'Off Day'}</span>
                          <span className="entry-detail">
                            {entry.type === 'daily' && `${entry.route} - ${entry.date}`}
                            {entry.type === 'booking' && `${entry.bookingDetails?.substring(0, 30)}... - ${entry.dateFrom} to ${entry.dateTo}`}
                            {entry.type === 'off' && `${entry.reason} - ${entry.date}`}
                          </span>
                          {entry.type !== 'off' && <span className="entry-amount">₹{entry.totalAmount}</span>}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* Fuel Payment Summary */}
              <div className="section-summary-card">
                <h5><i className="bi bi-fuel-pump"></i> Fuel Payment Summary</h5>
                <div className="row">
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Total Entries</h6>
                      <h5>{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'fuel' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).length;
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Cash Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'fuel' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Bank Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'fuel' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card total">
                      <h6>Total Fuel Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'fuel' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                </div>
                {expenseData.filter(entry => entry.type === 'fuel').length > 0 && (
                  <div className="recent-entries-preview">
                    <h6>Recent Entries:</h6>
                    {(() => {
                      // Get current user info for filtering
                      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                      const currentUserName = currentUser.fullName || currentUser.username;

                      // Filter fuel entries by current user and show last 3
                      const userFuelEntries = expenseData.filter(entry => 
                        entry.type === 'fuel' && (
                          entry.submittedBy === currentUserName || 
                          !entry.submittedBy // Handle entries without submittedBy field
                        )
                      );

                      return userFuelEntries.slice(-3).map((entry) => (
                        <div key={entry.entryId || entry.id} className="entry-preview">
                          <span className="entry-type">Fuel</span>
                          <span className="entry-detail">
                            {entry.pumpName || 'Fuel Station'} - {entry.date}
                            {entry.liters && ` (${entry.liters}L)`}
                          </span>
                          <span className="entry-amount">₹{entry.totalAmount}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* Adda Payment Summary */}
              <div className="section-summary-card">
                <h5><i className="bi bi-building"></i> Adda Payment Summary</h5>
                <div className="row">
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Total Entries</h6>
                      <h5>{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'fees' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).length;
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Cash Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'fees' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Bank Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'fees' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card total">
                      <h6>Total Adda Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'fees' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                </div>
                {expenseData.filter(entry => entry.type === 'fees').length > 0 && (
                  <div className="recent-entries-preview">
                    <h6>Recent Entries:</h6>
                    {(() => {
                      // Get current user info for filtering
                      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                      const currentUserName = currentUser.fullName || currentUser.username;

                      // Filter fees entries by current user and show last 3
                      const userFeesEntries = expenseData.filter(entry => 
                        entry.type === 'fees' && (
                          entry.submittedBy === currentUserName || 
                          !entry.submittedBy // Handle entries without submittedBy field
                        )
                      );

                      return userFeesEntries.slice(-3).map((entry) => (
                        <div key={entry.entryId || entry.id} className="entry-preview">
                          <span className="entry-type">Adda</span>
                          <span className="entry-detail">
                            {entry.description} - {entry.date}
                          </span>
                          <span className="entry-amount">₹{entry.totalAmount}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* Service Payment Summary */}
              <div className="section-summary-card">
                <h5><i className="bi bi-tools"></i> Service Payment Summary</h5>
                <div className="row">
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Total Entries</h6>
                      <h5>{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'service' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).length;
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Cash Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'service' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Bank Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'service' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card total">
                      <h6>Total Service Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'service' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                </div>
                {expenseData.filter(entry => entry.type === 'service').length > 0 && (
                  <div className="recent-entries-preview">
                    <h6>Recent Entries:</h6>
                    {(() => {
                      // Get current user info for filtering
                      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                      const currentUserName = currentUser.fullName || currentUser.username;

                      // Filter service entries by current user and show last 3
                      const userServiceEntries = expenseData.filter(entry => 
                        entry.type === 'service' && (
                          entry.submittedBy === currentUserName || 
                          !entry.submittedBy // Handle entries without submittedBy field
                        )
                      );

                      return userServiceEntries.slice(-3).map((entry) => (
                        <div key={entry.entryId || entry.id} className="entry-preview">
                          <span className="entry-type">Service</span>
                          <span className="entry-detail">
                            {entry.serviceType || entry.description} - {entry.date}
                            {entry.vendor && ` (${entry.vendor})`}
                          </span>
                          <span className="entry-amount">₹{entry.totalAmount}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* Union Payment Summary */}
              <div className="section-summary-card">
                <h5><i className="bi bi-people"></i> Union Payment Summary</h5>
                <div className="row">
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Total Entries</h6>
                      <h5>{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'union' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).length;
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Cash Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'union' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Bank Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'union' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card total">
                      <h6>Total Union Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'union' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                </div>
                {expenseData.filter(entry => entry.type === 'union').length > 0 && (
                  <div className="recent-entries-preview">
                    <h6>Recent Entries:</h6>
                    {(() => {
                      // Get current user info for filtering
                      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                      const currentUserName = currentUser.fullName || currentUser.username;

                      // Filter union entries by current user and show last 3
                      const userUnionEntries = expenseData.filter(entry => 
                        entry.type === 'union' && (
                          entry.submittedBy === currentUserName || 
                          !entry.submittedBy // Handle entries without submittedBy field
                        )
                      );

                      return userUnionEntries.slice(-3).map((entry) => (
                        <div key={entry.entryId || entry.id} className="entry-preview">
                          <span className="entry-type">Union</span>
                          <span className="entry-detail">
                            {entry.description} - {entry.date}
                          </span>
                          <span className="entry-amount">₹{entry.totalAmount}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* Other Payment Summary */}
              <div className="section-summary-card">
                <h5><i className="bi bi-credit-card"></i> Other Payment Summary</h5>
                <div className="row">
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Total Entries</h6>
                      <h5>{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'other' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).length;
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Cash Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'other' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card">
                      <h6>Bank Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'other' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mini-card total">
                      <h6>Total Other Expense</h6>
                      <h5>₹{(() => {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const currentUserName = currentUser.fullName || currentUser.username;
                        return expenseData.filter(entry => 
                          entry.type === 'other' && (
                            entry.submittedBy === currentUserName || 
                            (!entry.submittedBy && entry.type)
                          )
                        ).reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString();
                      })()}</h5>
                    </div>
                  </div>
                </div>
                {expenseData.filter(entry => entry.type === 'other').length > 0 && (
                  <div className="recent-entries-preview">
                    <h6>Recent Entries:</h6>
                    {(() => {
                      // Get current user info for filtering
                      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                      const currentUserName = currentUser.fullName || currentUser.username;

                      // Filter other entries by current user and show last 3
                      const userOtherEntries = expenseData.filter(entry => 
                        entry.type === 'other' && (
                          entry.submittedBy === currentUserName || 
                          !entry.submittedBy // Handle entries without submittedBy field
                        )
                      );

                      return userOtherEntries.slice(-3).map((entry) => (
                        <div key={entry.entryId || entry.id} className="entry-preview">
                          <span className="entry-type">Other</span>
                          <span className="entry-detail">
                            {entry.paymentDetails} - {entry.date}
                            {entry.vendor && ` (${entry.vendor})`}
                          </span>
                          <span className="entry-amount">₹{entry.totalAmount}</span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          ) : (
```javascript
            <div className="no-entries-message text-center py-5">
              <i className="bi bi-clipboard-data display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Data Found</h4>
              <p className="text-muted">Add some fare receipts or expense entries to see the summary</p>
            </div>
          );
        })()}

        {/* Overall Summary Cards - First Row - Only show if user has entries */}
        {(() => {
          // Get current user info for filtering
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserName = currentUser.fullName || currentUser.username;

          // Check if current user has any entries
          const userFareEntries = fareData.filter(entry => entry.submittedBy === currentUserName);
          const userExpenseEntries = expenseData.filter(entry => entry.submittedBy === currentUserName);
          const hasUserEntries = userFareEntries.length > 0 || userExpenseEntries.length > 0;

          return hasUserEntries ? (
            <div className="row mb-3">
              <div className="col-lg-4 col-md-6 col-sm-6 mb-3">
                <div className="summary-card cash-receipts">
                  <div className="card-body">
                    <h6>Total Cash Receipts</h6>
                    <h4>₹{totals.totalCashReceipts.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 mb-3">
                <div className="summary-card cash-payments">
                  <div className="card-body">
                    <h6>Total Cash Payments</h6>
                    <h4>₹{totals.totalCashPayments.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 mb-3">
                <div className="summary-card bank-receipts">
                  <div className="card-body">
                    <h6>Total Bank Receipts</h6>
                    <h4>₹{totals.totalBankReceipts.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Overall Summary Cards - Second Row - Only show if user has entries */}
        {(() => {
          // Get current user info for filtering
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserName = currentUser.fullName || currentUser.username;

          // Check if current user has any entries
          const userFareEntries = fareData.filter(entry => entry.submittedBy === currentUserName);
          const userExpenseEntries = expenseData.filter(entry => entry.submittedBy === currentUserName);
          const hasUserEntries = userFareEntries.length > 0 || userExpenseEntries.length > 0;

          return hasUserEntries ? (
            <div className="row mb-4">
              <div className="col-lg-4 col-md-6 col-sm-6 mb-3">
                <div className="summary-card bank-payments">
                  <div className="card-body">
                    <h6>Total Bank Payments</h6>
                    <h4>₹{totals.totalBankPayments.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 mb-3">
                <div className="summary-card cash-balance">
                  <div className="card-body">
                    <h6>Cash Balance</h6>
                    <h4>₹{totals.cashBalance.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 mb-3">
                <div className="summary-card bank-balance">
                  <div className="card-body">
                    <h6>Bank Balance</h6>
                    <h4>₹{totals.bankBalance.toLocaleString()}</h4>
                  </div>
                </div>
              </div>
            </div>
          ) : null;
        })()}



        {/* Send for Approval Button - Only show if user has entries */}
        {(() => {
          // Get current user info for filtering
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserName = currentUser.fullName || currentUser.username;

          // Check if current user has any entries
          const userFareEntries = fareData.filter(entry => entry.submittedBy === currentUserName);
          const userExpenseEntries = expenseData.filter(entry => entry.submittedBy === currentUserName);
          const hasUserEntries = userFareEntries.length > 0 || userExpenseEntries.length > 0;

          return hasUserEntries ? (
            <div className="text-center">
              <button 
                className="btn btn-lg approval-btn"
                onClick={handleSendForApproval}
              >
                <i className="bi bi-send"></i>
                Send for Approval
              </button>
            </div>
          ) : null;
        })()}

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5><i className="bi bi-check-circle"></i> Send for Approval</h5>
                <button className="btn-close" onClick={handleCloseModal}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleApprovalSubmit}>
                  {/* Cash Handover Section */}
                  <div className="settlement-section mb-4">
                    <h6 className="mb-3"><i className="bi bi-cash-stack"></i> Cash Handover to Manager</h6>
                    <div className="cash-handover-info p-3 mb-3" style={{backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6'}}>
                      <div className="row">
                        <div className="col-md-6">
                          <p><strong>Available Cash Balance:</strong> ₹{totals.cashBalance.toLocaleString()}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Available Bank Balance:</strong> ₹{totals.bankBalance.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Cash Amount to Handover</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settlementData.cashSettlement}
                          onChange={(e) => setSettlementData({...settlementData, cashSettement: e.target.value})}
                          placeholder="Enter cash amount"
                          max={Math.max(0, totals.cashBalance)}
                        />
                        <small className="text-muted">Maximum: ₹{Math.max(0, totals.cashBalance).toLocaleString()}</small>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Manager Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settlementData.settlementWith}
                          onChange={(e) => setSettlementData({...settlementData, settlementWith: e.target.value})}
                          placeholder="Enter manager name"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Remarks</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settlementData.remarks}
                      onChange={(e) => setSettlementData({...settlementData, remarks: e.target.value})}
                      placeholder="Add any additional remarks..."
                    ></textarea>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-send"></i>
                      Submit for Approval
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataSummary;