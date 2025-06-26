import React, { useState, useEffect } from "react";
import "../css/CashBook.css";

const CashBook = ({ cashBookEntries, setCashBookEntries }) => {
  useEffect(() => {
    const savedEntries = localStorage.getItem('cashBookEntries');
    if (savedEntries && cashBookEntries.length === 0) {
      setCashBookEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cashBookEntries', JSON.stringify(cashBookEntries));
  }, [cashBookEntries]);

  // Separate entries by type
  const drEntries = cashBookEntries.filter(entry => entry.type === 'dr');
  const crEntries = cashBookEntries.filter(entry => entry.type === 'cr');

  // Calculate totals
  const totalDrCash = drEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalDrBank = drEntries.reduce((sum, entry) => sum + entry.bankAmount, 0);
  const totalCrCash = crEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalCrBank = crEntries.reduce((sum, entry) => sum + entry.bankAmount, 0);

  const cashBalance = totalDrCash - totalCrCash;
  const bankBalance = totalDrBank - totalCrBank;

  return (
    <div className="cash-book-container">
      <div className="container-fluid">
        <div className="cash-book-header">
          <h2><i className="bi bi-book"></i> Cash Book (Double Column)</h2>
          <p>Traditional Dr./Cr. format with Cash and Bank columns</p>
        </div>

        {/* Summary Cards */}
        {cashBookEntries.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card dr-cash-card">
                <div className="card-body">
                  <h6>Total Cash Receipts</h6>
                  <h4>₹{totalDrCash.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cr-cash-card">
                <div className="card-body">
                  <h6>Total Cash Payments</h6>
                  <h4>₹{totalCrCash.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card dr-bank-card">
                <div className="card-body">
                  <h6>Total Bank Receipts</h6>
                  <h4>₹{totalDrBank.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="summary-card cr-bank-card">
                <div className="card-body">
                  <h6>Total Bank Payments</h6>
                  <h4>₹{totalCrBank.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Balance Cards */}
        {cashBookEntries.length > 0 && (
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="summary-card cash-balance-card">
                <div className="card-body">
                  <h6>Cash Balance</h6>
                  <h4 className={cashBalance >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    {cashBalance < 0 && ' (Deficit)'}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="summary-card bank-balance-card">
                <div className="card-body">
                  <h6>Bank Balance</h6>
                  <h4 className={bankBalance >= 0 ? 'text-success' : 'text-danger'}>
                    ₹{Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                    {bankBalance < 0 && ' (Overdraft)'}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Double Column Cash Book */}
        {cashBookEntries.length > 0 && (
          <div className="double-column-cash-book">
            <div className="cash-book-header-row">
              <h4><i className="bi bi-book-half"></i> In the Books of... Cash Book</h4>
            </div>

            <div className="cash-book-table-container">
              <div className="table-responsive">
                <table className="table cash-book-table">
                  <thead>
                    <tr>
                      <th colSpan="4" className="dr-header">Dr.</th>
                      <th colSpan="4" className="cr-header">Cr.</th>
                    </tr>
                    <tr>
                      <th>Date</th>
                      <th>Particulars</th>
                      <th>Cash(₹)</th>
                      <th>Bank(₹)</th>
                      <th>Date</th>
                      <th>Particulars</th>
                      <th>Cash(₹)</th>
                      <th>Bank(₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Balance b/d row */}
                    <tr>
                      <td></td>
                      <td><strong>To Balance b/d</strong></td>
                      <td className="text-success">
                        {cashBalance > 0 ? `₹${cashBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-success">
                        {bankBalance > 0 ? `₹${bankBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td></td>
                      <td><strong>By Balance b/d</strong></td>
                      <td className="text-danger">
                        {cashBalance < 0 ? `₹${Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-danger">
                        {bankBalance < 0 ? `₹${Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                    </tr>

                    {/* Render entries side by side */}
                    {Math.max(drEntries.length, crEntries.length) > 0 && 
                      Array.from({ length: Math.max(drEntries.length, crEntries.length) }).map((_, index) => {
                        const drEntry = drEntries[index];
                        const crEntry = crEntries[index];

                        return (
                          <tr key={`row-${index}`}>
                            {/* Dr. Side */}
                            <td>{drEntry ? new Date(drEntry.date).toLocaleDateString('en-IN') : ''}</td>
                            <td>{drEntry ? `To ${drEntry.particulars}` : ''}</td>
                            <td className="text-success">
                              {drEntry && drEntry.cashAmount > 0 ? `₹${drEntry.cashAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (drEntry ? '-' : '')}
                            </td>
                            <td className="text-success">
                              {drEntry && drEntry.bankAmount > 0 ? `₹${drEntry.bankAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (drEntry ? '-' : '')}
                            </td>

                            {/* Cr. Side */}
                            <td>{crEntry ? new Date(crEntry.date).toLocaleDateString('en-IN') : ''}</td>
                            <td>{crEntry ? `By ${crEntry.particulars}` : ''}</td>
                            <td className="text-danger">
                              {crEntry && crEntry.cashAmount > 0 ? `₹${crEntry.cashAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (crEntry ? '-' : '')}
                            </td>
                            <td className="text-danger">
                              {crEntry && crEntry.bankAmount > 0 ? `₹${crEntry.bankAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : (crEntry ? '-' : '')}
                            </td>
                          </tr>
                        );
                      })}

                    {/* Totals row */}
                    <tr className="totals-row">
                      <td></td>
                      <td><strong>To Balance c/d</strong></td>
                      <td className="text-success">
                        {cashBalance < 0 ? `₹${Math.abs(cashBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-success">
                        {bankBalance < 0 ? `₹${Math.abs(bankBalance).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td></td>
                      <td><strong>By Balance c/d</strong></td>
                      <td className="text-danger">
                        {cashBalance > 0 ? `₹${cashBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                      <td className="text-danger">
                        {bankBalance > 0 ? `₹${bankBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}
                      </td>
                    </tr>

                    {/* Final totals */}
                    <tr className="final-totals-row">
                      <td></td>
                      <td></td>
                      <td className="total-cell">₹{(totalDrCash + Math.abs(cashBalance < 0 ? cashBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="total-cell">₹{(totalDrBank + Math.abs(bankBalance < 0 ? bankBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td></td>
                      <td></td>
                      <td className="total-cell">₹{(totalCrCash + (cashBalance > 0 ? cashBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="total-cell">₹{(totalCrBank + (bankBalance > 0 ? bankBalance : 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {cashBookEntries.length === 0 && (
          <div className="no-entries">
            <div className="text-center py-5">
              <i className="bi bi-book display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Cash Book Entries Found</h4>
              <p className="text-muted">Entries will appear here automatically when you add Fare Receipts or Payment transactions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashBook;