import React, { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('buses');

  return (
    <div className="container mt-4">
      <h1 className="text-center">Mini Bus Management System</h1>
      <div className="row mt-4">
        <div className="col-md-3">
          {/* Sidebar */}
          <div className="list-group">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'buses' ? 'active' : ''}`}
              onClick={() => setActiveTab('buses')}
            >
              Bus Management
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'drivers' ? 'active' : ''}`}
              onClick={() => setActiveTab('drivers')}
            >
              Driver Management
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              Route Management
            </button>
          </div>
        </div>

        <div className="col-md-9">
          {/* Content Area */}
          {activeTab === 'buses' && <BusManagement />}
          {activeTab === 'drivers' && <DriverManagement />}
          {activeTab === 'routes' && <RouteManagement />}
        </div>
      </div>
    </div>
  );
}

function BusManagement() {
  return (
    <div>
      <h3>Bus Management</h3>
      <button className="btn btn-primary mb-3">Add New Bus</button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Bus ID</th>
            <th>Bus Model</th>
            <th>Seats</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mercedes-Benz</td>
            <td>40</td>
            <td>Active</td>
            <td>
              <button className="btn btn-info btn-sm">Edit</button>
              <button className="btn btn-danger btn-sm ms-2">Delete</button>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>Volvo</td>
            <td>35</td>
            <td>Inactive</td>
            <td>
              <button className="btn btn-info btn-sm">Edit</button>
              <button className="btn btn-danger btn-sm ms-2">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function DriverManagement() {
  return (
    <div>
      <h3>Driver Management</h3>
      <button className="btn btn-primary mb-3">Add New Driver</button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Driver ID</th>
            <th>Driver Name</th>
            <th>License Number</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>John Doe</td>
            <td>A12345</td>
            <td>Active</td>
            <td>
              <button className="btn btn-info btn-sm">Edit</button>
              <button className="btn btn-danger btn-sm ms-2">Delete</button>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jane Smith</td>
            <td>B67890</td>
            <td>Inactive</td>
            <td>
              <button className="btn btn-info btn-sm">Edit</button>
              <button className="btn btn-danger btn-sm ms-2">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function RouteManagement() {
  return (
    <div>
      <h3>Route Management</h3>
      <button className="btn btn-primary mb-3">Add New Route</button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Route ID</th>
            <th>Start Location</th>
            <th>End Location</th>
            <th>Distance (km)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Downtown</td>
            <td>Airport</td>
            <td>20</td>
            <td>
              <button className="btn btn-info btn-sm">Edit</button>
              <button className="btn btn-danger btn-sm ms-2">Delete</button>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>Station</td>
            <td>City Center</td>
            <td>15</td>
            <td>
              <button className="btn btn-info btn-sm">Edit</button>
              <button className="btn btn-danger btn-sm ms-2">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
