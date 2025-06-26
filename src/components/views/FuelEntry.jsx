
import React, { useState } from 'react';
import Form from '../ui/Form';

function FuelEntry({ expenseData, setExpenseData, setTotalExpenses }) {
  const [formData, setFormData] = useState({
    amount: '',
    liters: '',
    rate: '',
    date: '',
    pumpName: ''
  });

  const fields = [
    { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
    { name: 'liters', label: 'Liters', type: 'number', required: true },
    { name: 'rate', label: 'Rate per Liter (₹)', type: 'number', required: true },
    { name: 'pumpName', label: 'Pump Name', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true, width: 'full' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      type: 'fuel',
      ...formData
    };
    setExpenseData([...expenseData, newEntry]);
    setTotalExpenses(prev => prev + parseInt(formData.amount));
    setFormData({ amount: '', liters: '', rate: '', date: '', pumpName: '' });
  };

  return (
    <div className="entry-section">
      <h2>Fuel Expense Entry</h2>
      <Form
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        buttonText="Add Fuel Entry"
      />
    </div>
  );
}

export default FuelEntry;
import React, { useState } from 'react';
import Form from '../ui/Form';

function FuelEntry() {
  const [formData, setFormData] = useState({
    fuelType: '',
    quantity: '',
    rate: '',
    totalAmount: '',
    station: '',
    date: ''
  });

  const fuelTypes = ['Diesel', 'Petrol', 'CNG'];

  const fields = [
    { 
      name: 'fuelType', 
      label: 'Fuel Type', 
      type: 'select', 
      options: fuelTypes, 
      required: true 
    },
    { name: 'quantity', label: 'Quantity (Liters)', type: 'number', required: true },
    { name: 'rate', label: 'Rate per Liter (₹)', type: 'number', required: true },
    { name: 'totalAmount', label: 'Total Amount (₹)', type: 'number', required: true },
    { name: 'station', label: 'Fuel Station', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Fuel entry:', formData);
    setFormData({ fuelType: '', quantity: '', rate: '', totalAmount: '', station: '', date: '' });
  };

  return (
    <div className="entry-section">
      <h2>Fuel Expense Entry</h2>
      <Form
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        buttonText="Add Fuel Entry"
      />
    </div>
  );
}

export default FuelEntry;
