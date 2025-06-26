import React, { useState } from "react";
import "../css/Approval.css";

function Approval({ fareData = [], expenseData = [], cashBookEntries = [] }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [settlementData, setSettlementData] = useState({
    cashSettlement: "",
    bankSettlement: "",
    settlementWith: "",
    remarks: ""
  });

  // Calculate totals from all data sources
  const calculateTotals = () => {
    let totalCashReceipts = 0;
    let totalCashPayments = 0;
    let totalBankReceipts = 0;
    let totalBankPayments = 0;

    // Calculate from fare data (receipts)
    fareData.forEach(entry => {
      totalCashReceipts += parseFloat(entry.cashAmount) || 0;
      totalBankReceipts += parseFloat(entry.bankAmount) || 0;
    });

    // Calculate from expense data (payments)
    expenseData.forEach(entry => {
      totalCashPayments += parseFloat(entry.cashAmount) || 0;
      totalBankPayments += parseFloat(entry.bankAmount) || 0;
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

  // Get section summaries
  const getSectionSummaries = () => {
    const sections = {
      'Fare Receipt': fareData.reduce((acc, entry) => {
        acc.count++;
        acc.cash += parseFloat(entry.cashAmount) || 0;
        acc.bank += parseFloat(entry.bankAmount) || 0;
        acc.total += parseFloat(entry.totalAmount) || 0;
        return acc;
      }, { count: 0, cash: 0, bank: 0, total: 0 }),

      'Fuel Payment': expenseData.filter(e => e.type === 'fuel').reduce((acc, entry) => {
        acc.count++;
        acc.cash += parseFloat(entry.cashAmount) || 0;
        acc.bank += parseFloat(entry.bankAmount) || 0;
        acc.total += parseFloat(entry.totalAmount) || 0;
        return acc;
      }, { count: 0, cash: 0, bank: 0, total: 0 }),

      'Adda Payment': expenseData.filter(e => e.type === 'fees').reduce((acc, entry) => {
        acc.count++;
        acc.cash += parseFloat(entry.cashAmount) || 0;
        acc.bank += parseFloat(entry.bankAmount) || 0;
        acc.total += parseFloat(entry.totalAmount) || 0;
        return acc;
      }, { count: 0, cash: 0, bank: 0, total: 0 }),

      'Service Payment': expenseData.filter(e => e.type === 'service').reduce((acc, entry) => {
        acc.count++;
        acc.cash += parseFloat(entry.cashAmount) || 0;
        acc.bank += parseFloat(entry.bankAmount) || 0;
        acc.total += parseFloat(entry.totalAmount) || 0;
        return acc;
      }, { count: 0, cash: 0, bank: 0, total: 0 }),

      'Other Payment': expenseData.filter(e => e.type === 'other').reduce((acc, entry) => {
        acc.count++;
        acc.cash += parseFloat(entry.cashAmount) || 0;
        acc.bank += parseFloat(entry.bankAmount) || 0;
        acc.total += parseFloat(entry.totalAmount) || 0;
        return acc;
      }, { count: 0, cash: 0, bank: 0, total: 0 })
    };

    return sections;
  };

  const sectionSummaries = getSectionSummaries();

  const handleSendForApproval = () => {
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!settlementData.settlementWith.trim()) {
      alert("Please enter manager name for cash handover");
      return;
    }

    const cashSettlement = parseFloat(settlementData.cashSettlement) || 0;
    const bankSettlement = parseFloat(settlementData.bankSettlement) || 0;

    if (cashSettlement > totals.cashBalance) {
      alert("Cash settlement amount cannot exceed available cash balance");
      return;
    }

    if (bankSettlement > totals.bankBalance) {
      alert("Bank settlement amount cannot exceed available bank balance");
      return;
    }

    const submissionData = {
      date: new Date().toISOString().split('T')[0],
      totals: totals,
      sectionSummaries: sectionSummaries,
      settlement: {
        cashSettlement,
        bankSettlement,
        settlementWith: settlementData.settlementWith,
        remarks: settlementData.remarks
      },
      fareEntries: fareData.length,
      expenseEntries: expenseData.length,
      timestamp: new Date().toISOString()
    };

    // Here you can handle the approval submission
    console.log("Approval submitted:", submissionData);

    let successMessage = "Data sent for approval successfully!";
    if (cashSettlement > 0) {
      successMessage += `\n\nCash Handover: ₹${cashSettlement.toLocaleString()} to ${settlementData.settlementWith}`;
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

        {/* Financial Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="summary-card">
              <div className="card-body">
                <h6>Total Cash Receipts</h6>
                <h4 style={{color: '#28a745'}}>₹{totals.totalCashReceipts.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="summary-card">
              <div className="card-body">
                <h6>Total Cash Payments</h6>
                <h4 style={{color: '#dc3545'}}>₹{totals.totalCashPayments.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="summary-card">
              <div className="card-body">
                <h6>Total Bank Receipts</h6>
                <h4 style={{color: '#17a2b8'}}>₹{totals.totalBankReceipts.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="summary-card">
              <div className="card-body">
                <h6>Total Bank Payments</h6>
                <h4 style={{color: '#6f42c1'}}>₹{totals.totalBankPayments.toLocaleString()}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="summary-card">
              <div className="card-body">
                <h6>Cash Balance</h6>
                <h4 style={{color: totals.cashBalance >= 0 ? '#28a745' : '#dc3545'}}>
                  ₹{totals.cashBalance.toLocaleString()}
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="summary-card">
              <div className="card-body">
                <h6>Bank Balance</h6>
                <h4 style={{color: totals.bankBalance >= 0 ? '#17a2b8' : '#dc3545'}}>
                  ₹{totals.bankBalance.toLocaleString()}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Section Summaries */}
        <div className="section-summaries">
          <h4 className="mb-3">Section-wise Summary</h4>
          <div className="row">
            {Object.entries(sectionSummaries).map(([section, data]) => (
              <div key={section} className="col-lg-6 mb-3">
                <div className="section-summary-card">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{section}</h6>
                    <span className="badge bg-primary">{data.count} entries</span>
                  </div>
                  <div className="row">
                    <div className="col-4">
                      <small className="text-muted">Cash</small>
                      <div className="fw-bold">₹{data.cash.toLocaleString()}</div>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">Bank</small>
                      <div className="fw-bold">₹{data.bank.toLocaleString()}</div>
                    </div>
                    <div className="col-4">
                      <small className="text-muted">Total</small>
                      <div className="fw-bold">₹{data.total.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Cash Settlement Amount (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settlementData.cashSettlement}
                          onChange={(e) => setSettlementData({ ...settlementData, cashSettlement: e.target.value })}
                          placeholder="Enter cash amount to handover"
                          min="0"
                          max={totals.cashBalance}
                          step="0.01"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Bank Settlement Amount (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settlementData.bankSettlement}
                          onChange={(e) => setSettlementData({ ...settlementData, bankSettlement: e.target.value })}
                          placeholder="Enter bank settlement amount"
                          min="0"
                          max={totals.bankBalance}
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Manager Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settlementData.settlementWith}
                        onChange={(e) => setSettlementData({ ...settlementData, settlementWith: e.target.value })}
                        placeholder="Enter manager name for handover"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={settlementData.remarks}
                        onChange={(e) => setSettlementData({ ...settlementData, remarks: e.target.value })}
                        placeholder="Any additional notes or remarks"
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary flex-fill">
                      <i className="bi bi-send"></i> Submit for Approval
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
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

export default Approval;