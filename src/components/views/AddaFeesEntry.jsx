
import React, { useState } from 'react';
import Form from '../ui/Form';

function AddaFeesEntry() {
  const [formData, setFormData] = useState({
    type: 'adda',
    amount: '',
    description: '',
    date: ''
  });

  const fields = [
    { 
      name: 'type', 
      label: 'Type', 
      type: 'select', 
      options: ['Adda Fees', 'Agent Fees'], 
      required: true 
    },
    { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true, width: 'full' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Adda/Agent fees:', formData);
    setFormData({ type: 'adda', amount: '', description: '', date: '' });
  };

  return (
    <div className="entry-section">
      <h2>Adda & Agent Fees</h2>
      <Form
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        buttonText="Add Entry"
      />
    </div>
  );
}

export default AddaFeesEntry;
