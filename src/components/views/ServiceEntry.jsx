
import React, { useState } from 'react';
import Form from '../ui/Form';

function ServiceEntry() {
  const [formData, setFormData] = useState({
    serviceType: '',
    amount: '',
    description: '',
    date: '',
    mechanic: ''
  });

  const serviceTypes = [
    'Engine Service',
    'Brake Service',
    'Tire Change',
    'Oil Change',
    'General Maintenance',
    'Repair Work'
  ];

  const fields = [
    { 
      name: 'serviceType', 
      label: 'Service Type', 
      type: 'select', 
      options: serviceTypes, 
      required: true 
    },
    { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'mechanic', label: 'Mechanic/Service Center', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true, width: 'full' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Service entry:', formData);
    setFormData({ serviceType: '', amount: '', description: '', date: '', mechanic: '' });
  };

  return (
    <div className="entry-section">
      <h2>Service Expense Entry</h2>
      <Form
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        buttonText="Add Service Entry"
      />
    </div>
  );
}

export default ServiceEntry;
