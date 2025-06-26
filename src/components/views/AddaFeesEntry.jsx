
import React, { useState } from 'react';
import Form from '../ui/Form';

function AddaFeesEntry() {
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Adda Fees Entry:', formData);
    // Add logic to save the data
    setFormData({ date: '', amount: '', description: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fields = [
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      value: formData.date,
      required: true
    },
    {
      name: 'amount',
      label: 'Adda Fees Amount',
      type: 'number',
      value: formData.amount,
      placeholder: 'Enter amount',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      value: formData.description,
      placeholder: 'Enter description (optional)'
    }
  ];

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Adda Fees Entry</h3>
            </div>
            <div className="card-body">
              <Form
                fields={fields}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitText="Add Adda Fees"
                submitButtonClass="btn-success"
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Recent Adda Fees</h5>
            </div>
            <div className="card-body">
              <div className="activity-item">
                <div className="activity-text">
                  <div>Daily Adda Fees</div>
                  <div className="activity-time">Today</div>
                </div>
                <div className="activity-amount">₹150</div>
              </div>
              <div className="activity-item">
                <div className="activity-text">
                  <div>Daily Adda Fees</div>
                  <div className="activity-time">Yesterday</div>
                </div>
                <div className="activity-amount">₹150</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddaFeesEntry;
