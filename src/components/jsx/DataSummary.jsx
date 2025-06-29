
import React, { useState } from "react";
import "../css/DataSummary.css";

function DataSummary({ fareData, expenseData, cashBookEntries }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [settlementData, setSettlementData] = useState({
    cashSettlement: "",
    bankSettlement: "",
    settlementWith: "",
    remarks: ""
  });

  // Calculate totals from cashBookEntries
  const calculateTotals = () => {
    let totalCashReceipts = 0;
    let totalCashPayments = 0;
    let totalBankReceipts = 0;
    let totalBankPayments = 0;

    cashBookEntries.forEach(entry => {
      if (entry.type === 'dr') {
        totalCashReceipts += entry.cashAmount || 0;
        totalBankReceipts += entry.bankAmount || 0;
      } else if (entry.type === 'cr') {
        totalCashPayments += entry.cashAmount || 0;
        totalBankPayments += entry.bankAmount || 0;
      }
    });

    const cashBalance = totalCashReceipts - totalCashPayments;
    const bankBalance = totalBankReceipts - totalBankPayments;

    return {
      totalCashReceipts,
      totalCashPayments,
      totalBankReceipts,
      totalBankPayments,
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

    const submissionData = {
      timestamp: new Date().toISOString(),
      totals,
      settlementData,
      summaryData: {
        fareReceipts: {
          totalEntries: fareData.length,
          cashCollection: fareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankCollection: fareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalIncome: fareData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        fuelPayments: {
          totalEntries: expenseData.filter(entry => entry.type === 'fuel').length,
          cashExpense: expenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: expenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: expenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        addaPayments: {
          totalEntries: expenseData.filter(entry => entry.type === 'fees').length,
          cashExpense: expenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: expenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: expenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        servicePayments: {
          totalEntries: expenseData.filter(entry => entry.type === 'service').length,
          cashExpense: expenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: expenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: expenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        },
        otherPayments: {
          totalEntries: expenseData.filter(entry => entry.type === 'other').length,
          cashExpense: expenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0),
          bankExpense: expenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0),
          totalExpense: expenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
        }
      }
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
          <h2><i className="bi bi-check-circle"></i> Data Summary & Approval</h2>
          <p>Review your financial data and send for approval</p>
        </div>

        {/* Detailed Section Summaries */}
        <div className="section-summaries mb-4">
          {/* Fare Receipt Summary */}
          <div className="section-summary-card">
            <h5><i className="bi bi-receipt"></i> Fare Receipt Summary</h5>
            <div className="row">
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Total Entries</h6>
                  <h5>{fareData.length}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Cash Collection</h6>
                  <h5>₹{fareData.reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Bank Collection</h6>
                  <h5>₹{fareData.reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card total">
                  <h6>Total Fare Income</h6>
                  <h5>₹{fareData.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
            </div>
            {fareData.length > 0 && (
              <div className="recent-entries-preview">
                <h6>Recent Entries:</h6>
                {fareData.slice(-3).map((entry) => (
                  <div key={entry.id} className="entry-preview">
                    <span className="entry-type">{entry.type === 'daily' ? 'Daily' : entry.type === 'booking' ? 'Booking' : 'Off Day'}</span>
                    <span className="entry-detail">
                      {entry.type === 'daily' && `${entry.route} - ${entry.date}`}
                      {entry.type === 'booking' && `${entry.bookingDetails?.substring(0, 30)}... - ${entry.dateFrom} to ${entry.dateTo}`}
                      {entry.type === 'off' && `${entry.reason} - ${entry.date}`}
                    </span>
                    {entry.type !== 'off' && <span className="entry-amount">₹{entry.totalAmount}</span>}
                  </div>
                ))}
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
                  <h5>{expenseData.filter(entry => entry.type === 'fuel').length}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Cash Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Bank Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card total">
                  <h6>Total Fuel Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'fuel').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
            </div>
            {expenseData.filter(entry => entry.type === 'fuel').length > 0 && (
              <div className="recent-entries-preview">
                <h6>Recent Entries:</h6>
                {expenseData.filter(entry => entry.type === 'fuel').slice(-3).map((entry) => (
                  <div key={entry.id} className="entry-preview">
                    <span className="entry-type">Fuel</span>
                    <span className="entry-detail">
                      {entry.pumpName || 'Fuel Station'} - {entry.date}
                      {entry.liters && ` (${entry.liters}L)`}
                    </span>
                    <span className="entry-amount">₹{entry.totalAmount}</span>
                  </div>
                ))}
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
                  <h5>{expenseData.filter(entry => entry.type === 'fees').length}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Cash Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Bank Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card total">
                  <h6>Total Adda Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'fees').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Service Payment Summary */}
          <div className="section-summary-card">
            <h5><i className="bi bi-tools"></i> Service Payment Summary</h5>
            <div className="row">
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Total Entries</h6>
                  <h5>{expenseData.filter(entry => entry.type === 'service').length}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Cash Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Bank Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card total">
                  <h6>Total Service Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'service').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
            </div>
            {expenseData.filter(entry => entry.type === 'service').length > 0 && (
              <div className="recent-entries-preview">
                <h6>Recent Entries:</h6>
                {expenseData.filter(entry => entry.type === 'service').slice(-3).map((entry) => (
                  <div key={entry.id} className="entry-preview">
                    <span className="entry-type">Service</span>
                    <span className="entry-detail">
                      {entry.serviceType || entry.description} - {entry.date}
                      {entry.vendor && ` (${entry.vendor})`}
                    </span>
                    <span className="entry-amount">₹{entry.totalAmount}</span>
                  </div>
                ))}
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
                  <h5>{expenseData.filter(entry => entry.type === 'other').length}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Cash Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.cashAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card">
                  <h6>Bank Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.bankAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
              <div className="col-md-3">
                <div className="mini-card total">
                  <h6>Total Other Expense</h6>
                  <h5>₹{expenseData.filter(entry => entry.type === 'other').reduce((sum, entry) => sum + (entry.totalAmount || 0), 0).toLocaleString()}</h5>
                </div>
              </div>
            </div>
            {expenseData.filter(entry => entry.type === 'other').length > 0 && (
              <div className="recent-entries-preview">
                <h6>Recent Entries:</h6>
                {expenseData.filter(entry => entry.type === 'other').slice(-3).map((entry) => (
                  <div key={entry.id} className="entry-preview">
                    <span className="entry-type">Other</span>
                    <span className="entry-detail">
                      {entry.paymentDetails} - {entry.date}
                      {entry.vendor && ` (${entry.vendor})`}
                    </span>
                    <span className="entry-amount">₹{entry.totalAmount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overall Summary Cards */}
        <div className="row mb-4">
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card cash-receipts">
              <div className="card-body">
                <h6>Total Cash Receipts</h6>
                <h4>₹{totals.totalCashReceipts.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card cash-payments">
              <div className="card-body">
                <h6>Total Cash Payments</h6>
                <h4>₹{totals.totalCashPayments.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card bank-receipts">
              <div className="card-body">
                <h6>Total Bank Receipts</h6>
                <h4>₹{totals.totalBankReceipts.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card bank-payments">
              <div className="card-body">
                <h6>Total Bank Payments</h6>
                <h4>₹{totals.totalBankPayments.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card cash-balance">
              <div className="card-body">
                <h6>Cash Balance</h6>
                <h4>₹{totals.cashBalance.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
            <div className="summary-card bank-balance">
              <div className="card-body">
                <h6>Bank Balance</h6>
                <h4>₹{totals.bankBalance.toLocaleString()}</h4>
              </div>
            </div>
          </div>
        </div>



        {/* Send for Approval Button */}
        <div className="text-center">
          <button 
            className="btn btn-lg approval-btn"
            onClick={handleSendForApproval}
          >
            <i className="bi bi-send"></i>
            Send for Approval
          </button>
        </div>

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
                          onChange={(e) => setSettlementData({...settlementData, cashSettlement: e.target.value})}
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
