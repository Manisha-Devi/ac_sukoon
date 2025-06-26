// App.jsx
import React from 'react';
import AddaFeesEntry from './components/jsx/AddaFeesEntry';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Adda Fees Management</h1>
      <AddaFeesEntry />
    </div>
  );
}

export default App;

// components/jsx/AddaFeesEntry.jsx
import React from 'react';
import '../css/AddaFeesEntry.css';

function AddaFeesEntry() {
  return (
    <div className="adda-fees-entry">
      <h2>Enter Fees Details</h2>
      <input type="text" placeholder="Member Name" />
      <input type="number" placeholder="Amount" />
      <button>Submit</button>
    </div>
  );
}

export default AddaFeesEntry;

// components/css/AddaFeesEntry.css
.adda-fees-entry {
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 20px;
}

.adda-fees-entry input {
  margin-right: 10px;
}

// App.css
.App {
  text-align: center;
}