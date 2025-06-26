
import React, { useState } from 'react';
import "../css/BonusCalculator.css";

function BonusCalculator() {
  const [bonusData, setBonusData] = useState({
    totalEarnings: "",
    totalExpenses: "",
    bonusPercentage: "10"
  });

  const calculateBonus = () => {
    const earnings = parseFloat(bonusData.totalEarnings) || 0;
    const expenses = parseFloat(bonusData.totalExpenses) || 0;
    const profit = earnings - expenses;
    const bonus = (profit * parseFloat(bonusData.bonusPercentage)) / 100;
    return { profit, bonus };
  };

  const { profit, bonus } = calculateBonus();

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-calculator me-2"></i>
        Bonus Calculator
      </h2>

      <div className="form-card">
        <h3>Calculate Monthly Bonus</h3>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Total Earnings (₹)</label>
            <input
              type="number"
              className="form-control"
              value={bonusData.totalEarnings}
              onChange={(e) =>
                setBonusData({ ...bonusData, totalEarnings: e.target.value })
              }
              placeholder="Enter total earnings"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Total Expenses (₹)</label>
            <input
              type="number"
              className="form-control"
              value={bonusData.totalExpenses}
              onChange={(e) =>
                setBonusData({ ...bonusData, totalExpenses: e.target.value })
              }
              placeholder="Enter total expenses"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Bonus Percentage (%)</label>
            <input
              type="number"
              className="form-control"
              value={bonusData.bonusPercentage}
              onChange={(e) =>
                setBonusData({ ...bonusData, bonusPercentage: e.target.value })
              }
              min="0"
              max="100"
            />
          </div>

          <div className="col-12">
            <div className="row g-3 mt-3">
              <div className="col-md-4">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h5>Net Profit</h5>
                    <h3>₹{profit.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h5>Bonus Amount</h5>
                    <h3>₹{bonus.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-info text-white">
                  <div className="card-body text-center">
                    <h5>Remaining Profit</h5>
                    <h3>₹{(profit - bonus).toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BonusCalculator;
