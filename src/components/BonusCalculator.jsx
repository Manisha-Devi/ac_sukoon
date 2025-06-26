
import React, { useState } from "react";

function BonusCalculator() {
  const [period, setPeriod] = useState("weekly");
  const [driverName, setDriverName] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState("");
  const [calculatedBonus, setCalculatedBonus] = useState(0);

  const calculateBonus = () => {
    const base = parseFloat(baseSalary);
    const percentage = parseFloat(bonusPercentage);
    const bonus = (base * percentage) / 100;
    setCalculatedBonus(bonus);
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4">
        <i className="bi bi-calculator me-2"></i>
        Bonus Calculator
      </h2>

      <div className="form-card">
        <h3>Calculate Driver Bonus</h3>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Period</label>
            <select
              className="form-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Driver Name</label>
            <input
              type="text"
              className="form-control"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Base Salary (₹)</label>
            <input
              type="number"
              className="form-control"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Bonus Percentage (%)</label>
            <input
              type="number"
              className="form-control"
              value={bonusPercentage}
              onChange={(e) => setBonusPercentage(e.target.value)}
            />
          </div>

          <div className="col-12">
            <button onClick={calculateBonus} className="btn btn-primary">
              <i className="bi bi-calculator me-2"></i>
              Calculate Bonus
            </button>
          </div>

          {calculatedBonus > 0 && (
            <div className="col-12">
              <div className="alert alert-success">
                <h5 className="alert-heading">
                  Calculated Bonus: ₹{calculatedBonus.toFixed(2)}
                </h5>
                <p className="mb-0">
                  <strong>Period:</strong> {period} |<strong> Driver:</strong>{" "}
                  {driverName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BonusCalculator;
