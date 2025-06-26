
import React, { useState } from 'react';
import Form from '../ui/Form';
import Table from '../ui/Table';

function FareEntry({ fareData, setFareData, setTotalEarnings }) {
  const [formData, setFormData] = useState({
    route: '',
    fare: '',
    passengers: '',
    date: '',
    time: ''
  });

  const routes = [
    'Ghuraka to Bhaderwah',
    'Bhaderwah to Pul Doda',
    'Pul Doda to Thatri',
    'Thatri to Pul Doda',
    'Pul Doda to Bhaderwah',
    'Bhaderwah to Ghuraka'
  ];

  const fields = [
    { name: 'route', label: 'Route', type: 'select', options: routes, required: true },
    { name: 'fare', label: 'Fare per Passenger (₹)', type: 'number', required: true },
    { name: 'passengers', label: 'Number of Passengers', type: 'number', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'time', label: 'Time', type: 'time', required: true }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      ...formData,
      totalAmount: parseInt(formData.fare) * parseInt(formData.passengers)
    };
    setFareData([...fareData, newEntry]);
    setTotalEarnings(prev => prev + newEntry.totalAmount);
    setFormData({ route: '', fare: '', passengers: '', date: '', time: '' });
  };

  const tableHeaders = ['Route', 'Fare', 'Passengers', 'Total Amount', 'Date', 'Time'];
  const tableData = fareData.map(entry => [
    entry.route,
    `₹${entry.fare}`,
    entry.passengers,
    `₹${entry.totalAmount}`,
    entry.date,
    entry.time
  ]);

  return (
    <div className="entry-section">
      <h2>Route-wise Fare Collection</h2>
      
      <Form
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        buttonText="Add Fare Entry"
      />

      <Table
        title="Recent Fare Entries"
        headers={tableHeaders}
        data={tableData}
      />
    </div>
  );
}

export default FareEntry;
