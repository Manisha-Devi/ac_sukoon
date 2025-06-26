
import React, { useState } from 'react';

function BonusCalculator() {
  const [period, setPeriod] = useState('weekly');
  const [driverName, setDriverName] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [bonusPercentage, setBonusPercentage] = useState('');
  const [calculatedBonus, setCalculatedBonus] = useState(0);

  const calculateBonus = () => {
    const base = parseFloat(baseSalary);
    const percentage = parseFloat(bonusPercentage);
    const bonus = (base * percentage) / 100;
    setCalculatedBonus(bonus);
  };

  return (
    <div className="entry-section">
      <h2>Bonus Calculator</h2>
      
      <div className="bonus-calculator">
        <div className="form-group">
          <label>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Driver Name</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Base Salary (₹)</label>
            <input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bonus Percentage (%)</label>
          <input
            type="number"
            value={bonusPercentage}
            onChange={(e) => setBonusPercentage(e.target.value)}
          />
        </div>

        <button onClick={calculateBonus} className="calculate-btn">
          Calculate Bonus
        </button>

        {calculatedBonus > 0 && (
          <div className="bonus-result">
            <h3>Calculated Bonus: ₹{calculatedBonus.toFixed(2)}</h3>
            <p>Period: {period}</p>
            <p>Driver: {driverName}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BonusCalculator;
