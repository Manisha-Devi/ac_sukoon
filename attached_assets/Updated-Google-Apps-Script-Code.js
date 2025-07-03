
// AC Sukoon Transport Management - Google Apps Script API
// Complete implementation for all payment types and data management

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your actual spreadsheet ID

// Sheet names
const SHEETS = {
  USERS: 'Users',
  FARE_RECEIPTS: 'FareReceipts',
  BOOKING_ENTRIES: 'BookingEntries',
  OFF_DAYS: 'OffDays',
  FUEL_PAYMENTS: 'FuelPayments',
  ADDA_PAYMENTS: 'AddaPayments',
  UNION_PAYMENTS: 'UnionPayments',
  SERVICE_PAYMENTS: 'ServicePayments',
  OTHER_PAYMENTS: 'OtherPayments'
};

// Column mappings for each sheet
const COLUMNS = {
  USERS: ['Username', 'Password', 'FullName', 'UserType', 'LastLogin', 'IsActive'],
  FARE_RECEIPTS: ['Timestamp', 'Date', 'Route', 'CashAmount', 'BankAmount', 'TotalAmount', 'SubmittedBy', 'EntryType', 'EntryId'],
  BOOKING_ENTRIES: ['Timestamp', 'BookingDetails', 'DateFrom', 'DateTo', 'CashAmount', 'BankAmount', 'TotalAmount', 'SubmittedBy', 'EntryType', 'EntryId'],
  OFF_DAYS: ['Timestamp', 'Date', 'Reason', 'SubmittedBy', 'EntryType', 'EntryId'],
  FUEL_PAYMENTS: ['Timestamp', 'Date', 'FuelType', 'Quantity', 'Rate', 'CashAmount', 'BankAmount', 'TotalAmount', 'PumpName', 'SubmittedBy', 'EntryType', 'EntryId'],
  ADDA_PAYMENTS: ['Timestamp', 'Date', 'AddaName', 'CashAmount', 'BankAmount', 'TotalAmount', 'Remarks', 'SubmittedBy', 'EntryType', 'EntryId'],
  UNION_PAYMENTS: ['Timestamp', 'Date', 'UnionName', 'CashAmount', 'BankAmount', 'TotalAmount', 'Remarks', 'SubmittedBy', 'EntryType', 'EntryId'],
  SERVICE_PAYMENTS: ['Timestamp', 'Date', 'ServiceType', 'CashAmount', 'BankAmount', 'TotalAmount', 'ServiceDetails', 'SubmittedBy', 'EntryType', 'EntryId'],
  OTHER_PAYMENTS: ['Timestamp', 'Date', 'PaymentType', 'Description', 'CashAmount', 'BankAmount', 'TotalAmount', 'Category', 'SubmittedBy', 'EntryType', 'EntryId']
};

// Main function to handle all requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    console.log('Received action:', action);
    console.log('Data:', data);

    switch (action) {
      // Authentication
      case 'login':
        return handleLogin(data);
      case 'updateLastLogin':
        return handleUpdateLastLogin(data);
      case 'getAllUsers':
        return handleGetAllUsers();
      
      // Test connection
      case 'test':
        return handleTest();
      
      // Fare Receipts
      case 'addFareReceipt':
        return handleAddFareReceipt(data);
      case 'getFareReceipts':
        return handleGetFareReceipts();
      case 'updateFareReceipt':
        return handleUpdateFareReceipt(data);
      case 'deleteFareReceipt':
        return handleDeleteFareReceipt(data);
      
      // Booking Entries
      case 'addBookingEntry':
        return handleAddBookingEntry(data);
      case 'getBookingEntries':
        return handleGetBookingEntries();
      case 'updateBookingEntry':
        return handleUpdateBookingEntry(data);
      case 'deleteBookingEntry':
        return handleDeleteBookingEntry(data);
      
      // Off Days
      case 'addOffDay':
        return handleAddOffDay(data);
      case 'getOffDays':
        return handleGetOffDays();
      case 'updateOffDay':
        return handleUpdateOffDay(data);
      case 'deleteOffDay':
        return handleDeleteOffDay(data);
      
      // Fuel Payments
      case 'addFuelPayment':
        return handleAddFuelPayment(data);
      case 'getFuelPayments':
        return handleGetFuelPayments();
      case 'updateFuelPayment':
        return handleUpdateFuelPayment(data);
      case 'deleteFuelPayment':
        return handleDeleteFuelPayment(data);
      
      // Adda Payments
      case 'addAddaPayment':
        return handleAddAddaPayment(data);
      case 'getAddaPayments':
        return handleGetAddaPayments();
      case 'updateAddaPayment':
        return handleUpdateAddaPayment(data);
      case 'deleteAddaPayment':
        return handleDeleteAddaPayment(data);
      
      // Union Payments
      case 'addUnionPayment':
        return handleAddUnionPayment(data);
      case 'getUnionPayments':
        return handleGetUnionPayments();
      case 'updateUnionPayment':
        return handleUpdateUnionPayment(data);
      case 'deleteUnionPayment':
        return handleDeleteUnionPayment(data);
      
      // Service Payments
      case 'addServicePayment':
        return handleAddServicePayment(data);
      case 'getServicePayments':
        return handleGetServicePayments();
      case 'updateServicePayment':
        return handleUpdateServicePayment(data);
      case 'deleteServicePayment':
        return handleDeleteServicePayment(data);
      
      // Other Payments
      case 'addOtherPayment':
        return handleAddOtherPayment(data);
      case 'getOtherPayments':
        return handleGetOtherPayments();
      case 'updateOtherPayment':
        return handleUpdateOtherPayment(data);
      case 'deleteOtherPayment':
        return handleDeleteOtherPayment(data);
      
      default:
        return createResponse(false, 'Unknown action: ' + action);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return createResponse(false, 'Server error: ' + error.message);
  }
}

// Helper function to create response
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Get or create sheet
function getOrCreateSheet(sheetName, columns) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    // Add headers
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  }
  
  return sheet;
}

// Authentication handlers
function handleLogin(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.USERS, COLUMNS.USERS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === data.username && row[1] === data.password && row[3] === data.userType) {
        return createResponse(true, 'Login successful', {
          username: row[0],
          fullName: row[2],
          userType: row[3],
          lastLogin: row[4]
        });
      }
    }
    
    return createResponse(false, 'Invalid credentials');
  } catch (error) {
    return createResponse(false, 'Login error: ' + error.message);
  }
}

function handleUpdateLastLogin(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.USERS, COLUMNS.USERS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.username) {
        sheet.getRange(i + 1, 5).setValue(data.timestamp);
        break;
      }
    }
    
    return createResponse(true, 'Last login updated');
  } catch (error) {
    return createResponse(false, 'Update last login error: ' + error.message);
  }
}

function handleGetAllUsers() {
  try {
    const sheet = getOrCreateSheet(SHEETS.USERS, COLUMNS.USERS);
    const values = sheet.getDataRange().getValues();
    const users = [];
    
    for (let i = 1; i < values.length; i++) {
      users.push({
        username: values[i][0],
        fullName: values[i][2],
        userType: values[i][3],
        lastLogin: values[i][4],
        isActive: values[i][5]
      });
    }
    
    return createResponse(true, 'Users fetched successfully', users);
  } catch (error) {
    return createResponse(false, 'Get users error: ' + error.message);
  }
}

function handleTest() {
  return createResponse(true, 'Google Apps Script is working!');
}

// Fare Receipts handlers
function handleAddFareReceipt(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.FARE_RECEIPTS, COLUMNS.FARE_RECEIPTS);
    const rowData = [
      data.timestamp,
      data.date,
      data.route,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount,
      data.submittedBy,
      data.entryType || 'daily',
      data.entryId
    ];
    
    sheet.appendRow(rowData);
    return createResponse(true, 'Fare receipt added successfully');
  } catch (error) {
    return createResponse(false, 'Add fare receipt error: ' + error.message);
  }
}

function handleGetFareReceipts() {
  try {
    const sheet = getOrCreateSheet(SHEETS.FARE_RECEIPTS, COLUMNS.FARE_RECEIPTS);
    const values = sheet.getDataRange().getValues();
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      data.push({
        entryId: row[8],
        timestamp: row[0],
        date: row[1],
        route: row[2],
        cashAmount: row[3] || 0,
        bankAmount: row[4] || 0,
        totalAmount: row[5],
        submittedBy: row[6],
        entryType: row[7],
        rowIndex: i + 1
      });
    }
    
    return createResponse(true, 'Fare receipts fetched successfully', data);
  } catch (error) {
    return createResponse(false, 'Get fare receipts error: ' + error.message);
  }
}

function handleUpdateFareReceipt(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.FARE_RECEIPTS, COLUMNS.FARE_RECEIPTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][8] == data.entryId) {
        const updatedData = data.updatedData;
        if (updatedData.date) sheet.getRange(i + 1, 2).setValue(updatedData.date);
        if (updatedData.route) sheet.getRange(i + 1, 3).setValue(updatedData.route);
        if (updatedData.cashAmount !== undefined) sheet.getRange(i + 1, 4).setValue(updatedData.cashAmount);
        if (updatedData.bankAmount !== undefined) sheet.getRange(i + 1, 5).setValue(updatedData.bankAmount);
        if (updatedData.totalAmount) sheet.getRange(i + 1, 6).setValue(updatedData.totalAmount);
        break;
      }
    }
    
    return createResponse(true, 'Fare receipt updated successfully');
  } catch (error) {
    return createResponse(false, 'Update fare receipt error: ' + error.message);
  }
}

function handleDeleteFareReceipt(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.FARE_RECEIPTS, COLUMNS.FARE_RECEIPTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][8] == data.entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return createResponse(true, 'Fare receipt deleted successfully');
  } catch (error) {
    return createResponse(false, 'Delete fare receipt error: ' + error.message);
  }
}

// Booking Entries handlers
function handleAddBookingEntry(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.BOOKING_ENTRIES, COLUMNS.BOOKING_ENTRIES);
    const rowData = [
      data.timestamp,
      data.bookingDetails,
      data.dateFrom,
      data.dateTo,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount,
      data.submittedBy,
      data.entryType || 'booking',
      data.entryId
    ];
    
    sheet.appendRow(rowData);
    return createResponse(true, 'Booking entry added successfully');
  } catch (error) {
    return createResponse(false, 'Add booking entry error: ' + error.message);
  }
}

function handleGetBookingEntries() {
  try {
    const sheet = getOrCreateSheet(SHEETS.BOOKING_ENTRIES, COLUMNS.BOOKING_ENTRIES);
    const values = sheet.getDataRange().getValues();
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      data.push({
        entryId: row[9],
        timestamp: row[0],
        bookingDetails: row[1],
        dateFrom: row[2],
        dateTo: row[3],
        cashAmount: row[4] || 0,
        bankAmount: row[5] || 0,
        totalAmount: row[6],
        submittedBy: row[7],
        entryType: row[8],
        rowIndex: i + 1
      });
    }
    
    return createResponse(true, 'Booking entries fetched successfully', data);
  } catch (error) {
    return createResponse(false, 'Get booking entries error: ' + error.message);
  }
}

function handleUpdateBookingEntry(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.BOOKING_ENTRIES, COLUMNS.BOOKING_ENTRIES);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][9] == data.entryId) {
        const updatedData = data.updatedData;
        if (updatedData.bookingDetails) sheet.getRange(i + 1, 2).setValue(updatedData.bookingDetails);
        if (updatedData.dateFrom) sheet.getRange(i + 1, 3).setValue(updatedData.dateFrom);
        if (updatedData.dateTo) sheet.getRange(i + 1, 4).setValue(updatedData.dateTo);
        if (updatedData.cashAmount !== undefined) sheet.getRange(i + 1, 5).setValue(updatedData.cashAmount);
        if (updatedData.bankAmount !== undefined) sheet.getRange(i + 1, 6).setValue(updatedData.bankAmount);
        if (updatedData.totalAmount) sheet.getRange(i + 1, 7).setValue(updatedData.totalAmount);
        break;
      }
    }
    
    return createResponse(true, 'Booking entry updated successfully');
  } catch (error) {
    return createResponse(false, 'Update booking entry error: ' + error.message);
  }
}

function handleDeleteBookingEntry(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.BOOKING_ENTRIES, COLUMNS.BOOKING_ENTRIES);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][9] == data.entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return createResponse(true, 'Booking entry deleted successfully');
  } catch (error) {
    return createResponse(false, 'Delete booking entry error: ' + error.message);
  }
}

// Off Days handlers
function handleAddOffDay(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.OFF_DAYS, COLUMNS.OFF_DAYS);
    const rowData = [
      data.timestamp,
      data.date,
      data.reason,
      data.submittedBy,
      data.entryType || 'off',
      data.entryId
    ];
    
    sheet.appendRow(rowData);
    return createResponse(true, 'Off day added successfully');
  } catch (error) {
    return createResponse(false, 'Add off day error: ' + error.message);
  }
}

function handleGetOffDays() {
  try {
    const sheet = getOrCreateSheet(SHEETS.OFF_DAYS, COLUMNS.OFF_DAYS);
    const values = sheet.getDataRange().getValues();
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      data.push({
        entryId: row[5],
        timestamp: row[0],
        date: row[1],
        reason: row[2],
        submittedBy: row[3],
        entryType: row[4],
        rowIndex: i + 1
      });
    }
    
    return createResponse(true, 'Off days fetched successfully', data);
  } catch (error) {
    return createResponse(false, 'Get off days error: ' + error.message);
  }
}

function handleUpdateOffDay(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.OFF_DAYS, COLUMNS.OFF_DAYS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][5] == data.entryId) {
        const updatedData = data.updatedData;
        if (updatedData.date) sheet.getRange(i + 1, 2).setValue(updatedData.date);
        if (updatedData.reason) sheet.getRange(i + 1, 3).setValue(updatedData.reason);
        break;
      }
    }
    
    return createResponse(true, 'Off day updated successfully');
  } catch (error) {
    return createResponse(false, 'Update off day error: ' + error.message);
  }
}

function handleDeleteOffDay(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.OFF_DAYS, COLUMNS.OFF_DAYS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][5] == data.entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return createResponse(true, 'Off day deleted successfully');
  } catch (error) {
    return createResponse(false, 'Delete off day error: ' + error.message);
  }
}

// Fuel Payments handlers
function handleAddFuelPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.FUEL_PAYMENTS, COLUMNS.FUEL_PAYMENTS);
    const rowData = [
      data.timestamp,
      data.date,
      data.fuelType,
      data.quantity,
      data.rate,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount,
      data.pumpName,
      data.submittedBy,
      data.entryType || 'fuel',
      data.entryId
    ];
    
    sheet.appendRow(rowData);
    return createResponse(true, 'Fuel payment added successfully');
  } catch (error) {
    return createResponse(false, 'Add fuel payment error: ' + error.message);
  }
}

function handleGetFuelPayments() {
  try {
    const sheet = getOrCreateSheet(SHEETS.FUEL_PAYMENTS, COLUMNS.FUEL_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      data.push({
        entryId: row[11],
        timestamp: row[0],
        date: row[1],
        fuelType: row[2],
        quantity: row[3],
        rate: row[4],
        cashAmount: row[5] || 0,
        bankAmount: row[6] || 0,
        totalAmount: row[7],
        pumpName: row[8],
        submittedBy: row[9],
        entryType: row[10],
        rowIndex: i + 1
      });
    }
    
    return createResponse(true, 'Fuel payments fetched successfully', data);
  } catch (error) {
    return createResponse(false, 'Get fuel payments error: ' + error.message);
  }
}

function handleUpdateFuelPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.FUEL_PAYMENTS, COLUMNS.FUEL_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][11] == data.entryId) {
        const updatedData = data.updatedData;
        if (updatedData.date) sheet.getRange(i + 1, 2).setValue(updatedData.date);
        if (updatedData.fuelType) sheet.getRange(i + 1, 3).setValue(updatedData.fuelType);
        if (updatedData.quantity) sheet.getRange(i + 1, 4).setValue(updatedData.quantity);
        if (updatedData.rate) sheet.getRange(i + 1, 5).setValue(updatedData.rate);
        if (updatedData.cashAmount !== undefined) sheet.getRange(i + 1, 6).setValue(updatedData.cashAmount);
        if (updatedData.bankAmount !== undefined) sheet.getRange(i + 1, 7).setValue(updatedData.bankAmount);
        if (updatedData.totalAmount) sheet.getRange(i + 1, 8).setValue(updatedData.totalAmount);
        if (updatedData.pumpName) sheet.getRange(i + 1, 9).setValue(updatedData.pumpName);
        break;
      }
    }
    
    return createResponse(true, 'Fuel payment updated successfully');
  } catch (error) {
    return createResponse(false, 'Update fuel payment error: ' + error.message);
  }
}

function handleDeleteFuelPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.FUEL_PAYMENTS, COLUMNS.FUEL_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][11] == data.entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return createResponse(true, 'Fuel payment deleted successfully');
  } catch (error) {
    return createResponse(false, 'Delete fuel payment error: ' + error.message);
  }
}

// Adda Payments handlers
function handleAddAddaPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.ADDA_PAYMENTS, COLUMNS.ADDA_PAYMENTS);
    const rowData = [
      data.timestamp,
      data.date,
      data.addaName,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount,
      data.remarks,
      data.submittedBy,
      data.entryType || 'adda',
      data.entryId
    ];
    
    sheet.appendRow(rowData);
    return createResponse(true, 'Adda payment added successfully');
  } catch (error) {
    return createResponse(false, 'Add adda payment error: ' + error.message);
  }
}

function handleGetAddaPayments() {
  try {
    const sheet = getOrCreateSheet(SHEETS.ADDA_PAYMENTS, COLUMNS.ADDA_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      data.push({
        entryId: row[9],
        timestamp: row[0],
        date: row[1],
        addaName: row[2],
        cashAmount: row[3] || 0,
        bankAmount: row[4] || 0,
        totalAmount: row[5],
        remarks: row[6],
        submittedBy: row[7],
        entryType: row[8],
        rowIndex: i + 1
      });
    }
    
    return createResponse(true, 'Adda payments fetched successfully', data);
  } catch (error) {
    return createResponse(false, 'Get adda payments error: ' + error.message);
  }
}

function handleUpdateAddaPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.ADDA_PAYMENTS, COLUMNS.ADDA_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][9] == data.entryId) {
        const updatedData = data.updatedData;
        if (updatedData.date) sheet.getRange(i + 1, 2).setValue(updatedData.date);
        if (updatedData.addaName) sheet.getRange(i + 1, 3).setValue(updatedData.addaName);
        if (updatedData.cashAmount !== undefined) sheet.getRange(i + 1, 4).setValue(updatedData.cashAmount);
        if (updatedData.bankAmount !== undefined) sheet.getRange(i + 1, 5).setValue(updatedData.bankAmount);
        if (updatedData.totalAmount) sheet.getRange(i + 1, 6).setValue(updatedData.totalAmount);
        if (updatedData.remarks) sheet.getRange(i + 1, 7).setValue(updatedData.remarks);
        break;
      }
    }
    
    return createResponse(true, 'Adda payment updated successfully');
  } catch (error) {
    return createResponse(false, 'Update adda payment error: ' + error.message);
  }
}

function handleDeleteAddaPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.ADDA_PAYMENTS, COLUMNS.ADDA_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][9] == data.entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return createResponse(true, 'Adda payment deleted successfully');
  } catch (error) {
    return createResponse(false, 'Delete adda payment error: ' + error.message);
  }
}

// Union Payments handlers
function handleAddUnionPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.UNION_PAYMENTS, COLUMNS.UNION_PAYMENTS);
    const rowData = [
      data.timestamp,
      data.date,
      data.unionName,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount,
      data.remarks,
      data.submittedBy,
      data.entryType || 'union',
      data.entryId
    ];
    
    sheet.appendRow(rowData);
    return createResponse(true, 'Union payment added successfully');
  } catch (error) {
    return createResponse(false, 'Add union payment error: ' + error.message);
  }
}

function handleGetUnionPayments() {
  try {
    const sheet = getOrCreateSheet(SHEETS.UNION_PAYMENTS, COLUMNS.UNION_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      data.push({
        entryId: row[9],
        timestamp: row[0],
        date: row[1],
        unionName: row[2],
        cashAmount: row[3] || 0,
        bankAmount: row[4] || 0,
        totalAmount: row[5],
        remarks: row[6],
        submittedBy: row[7],
        entryType: row[8],
        rowIndex: i + 1
      });
    }
    
    return createResponse(true, 'Union payments fetched successfully', data);
  } catch (error) {
    return createResponse(false, 'Get union payments error: ' + error.message);
  }
}

function handleUpdateUnionPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.UNION_PAYMENTS, COLUMNS.UNION_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][9] == data.entryId) {
        const updatedData = data.updatedData;
        if (updatedData.date) sheet.getRange(i + 1, 2).setValue(updatedData.date);
        if (updatedData.unionName) sheet.getRange(i + 1, 3).setValue(updatedData.unionName);
        if (updatedData.cashAmount !== undefined) sheet.getRange(i + 1, 4).setValue(updatedData.cashAmount);
        if (updatedData.bankAmount !== undefined) sheet.getRange(i + 1, 5).setValue(updatedData.bankAmount);
        if (updatedData.totalAmount) sheet.getRange(i + 1, 6).setValue(updatedData.totalAmount);
        if (updatedData.remarks) sheet.getRange(i + 1, 7).setValue(updatedData.remarks);
        break;
      }
    }
    
    return createResponse(true, 'Union payment updated successfully');
  } catch (error) {
    return createResponse(false, 'Update union payment error: ' + error.message);
  }
}

function handleDeleteUnionPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.UNION_PAYMENTS, COLUMNS.UNION_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][9] == data.entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return createResponse(true, 'Union payment deleted successfully');
  } catch (error) {
    return createResponse(false, 'Delete union payment error: ' + error.message);
  }
}

// Service Payments handlers
function handleAddServicePayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.SERVICE_PAYMENTS, COLUMNS.SERVICE_PAYMENTS);
    const rowData = [
      data.timestamp,
      data.date,
      data.serviceType,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount,
      data.serviceDetails,
      data.submittedBy,
      data.entryType || 'service',
      data.entryId
    ];
    
    sheet.appendRow(rowData);
    return createResponse(true, 'Service payment added successfully');
  } catch (error) {
    return createResponse(false, 'Add service payment error: ' + error.message);
  }
}

function handleGetServicePayments() {
  try {
    const sheet = getOrCreateSheet(SHEETS.SERVICE_PAYMENTS, COLUMNS.SERVICE_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      data.push({
        entryId: row[9],
        timestamp: row[0],
        date: row[1],
        serviceType: row[2],
        cashAmount: row[3] || 0,
        bankAmount: row[4] || 0,
        totalAmount: row[5],
        serviceDetails: row[6],
        submittedBy: row[7],
        entryType: row[8],
        rowIndex: i + 1
      });
    }
    
    return createResponse(true, 'Service payments fetched successfully', data);
  } catch (error) {
    return createResponse(false, 'Get service payments error: ' + error.message);
  }
}

function handleUpdateServicePayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.SERVICE_PAYMENTS, COLUMNS.SERVICE_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][9] == data.entryId) {
        const updatedData = data.updatedData;
        if (updatedData.date) sheet.getRange(i + 1, 2).setValue(updatedData.date);
        if (updatedData.serviceType) sheet.getRange(i + 1, 3).setValue(updatedData.serviceType);
        if (updatedData.cashAmount !== undefined) sheet.getRange(i + 1, 4).setValue(updatedData.cashAmount);
        if (updatedData.bankAmount !== undefined) sheet.getRange(i + 1, 5).setValue(updatedData.bankAmount);
        if (updatedData.totalAmount) sheet.getRange(i + 1, 6).setValue(updatedData.totalAmount);
        if (updatedData.serviceDetails) sheet.getRange(i + 1, 7).setValue(updatedData.serviceDetails);
        break;
      }
    }
    
    return createResponse(true, 'Service payment updated successfully');
  } catch (error) {
    return createResponse(false, 'Update service payment error: ' + error.message);
  }
}

function handleDeleteServicePayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.SERVICE_PAYMENTS, COLUMNS.SERVICE_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][9] == data.entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return createResponse(true, 'Service payment deleted successfully');
  } catch (error) {
    return createResponse(false, 'Delete service payment error: ' + error.message);
  }
}

// Other Payments handlers
function handleAddOtherPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.OTHER_PAYMENTS, COLUMNS.OTHER_PAYMENTS);
    const rowData = [
      data.timestamp,
      data.date,
      data.paymentType,
      data.description,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount,
      data.category,
      data.submittedBy,
      data.entryType || 'other',
      data.entryId
    ];
    
    sheet.appendRow(rowData);
    return createResponse(true, 'Other payment added successfully');
  } catch (error) {
    return createResponse(false, 'Add other payment error: ' + error.message);
  }
}

function handleGetOtherPayments() {
  try {
    const sheet = getOrCreateSheet(SHEETS.OTHER_PAYMENTS, COLUMNS.OTHER_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      data.push({
        entryId: row[10],
        timestamp: row[0],
        date: row[1],
        paymentType: row[2],
        description: row[3],
        cashAmount: row[4] || 0,
        bankAmount: row[5] || 0,
        totalAmount: row[6],
        category: row[7],
        submittedBy: row[8],
        entryType: row[9],
        rowIndex: i + 1
      });
    }
    
    return createResponse(true, 'Other payments fetched successfully', data);
  } catch (error) {
    return createResponse(false, 'Get other payments error: ' + error.message);
  }
}

function handleUpdateOtherPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.OTHER_PAYMENTS, COLUMNS.OTHER_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][10] == data.entryId) {
        const updatedData = data.updatedData;
        if (updatedData.date) sheet.getRange(i + 1, 2).setValue(updatedData.date);
        if (updatedData.paymentType) sheet.getRange(i + 1, 3).setValue(updatedData.paymentType);
        if (updatedData.description) sheet.getRange(i + 1, 4).setValue(updatedData.description);
        if (updatedData.cashAmount !== undefined) sheet.getRange(i + 1, 5).setValue(updatedData.cashAmount);
        if (updatedData.bankAmount !== undefined) sheet.getRange(i + 1, 6).setValue(updatedData.bankAmount);
        if (updatedData.totalAmount) sheet.getRange(i + 1, 7).setValue(updatedData.totalAmount);
        if (updatedData.category) sheet.getRange(i + 1, 8).setValue(updatedData.category);
        break;
      }
    }
    
    return createResponse(true, 'Other payment updated successfully');
  } catch (error) {
    return createResponse(false, 'Update other payment error: ' + error.message);
  }
}

function handleDeleteOtherPayment(data) {
  try {
    const sheet = getOrCreateSheet(SHEETS.OTHER_PAYMENTS, COLUMNS.OTHER_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][10] == data.entryId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return createResponse(true, 'Other payment deleted successfully');
  } catch (error) {
    return createResponse(false, 'Delete other payment error: ' + error.message);
  }
}

// Legacy functions for backward compatibility
function handleUpdateFareEntry(data) {
  if (data.entryType === 'daily') {
    return handleUpdateFareReceipt(data);
  } else if (data.entryType === 'booking') {
    return handleUpdateBookingEntry(data);
  } else {
    return createResponse(false, 'Unknown entry type for update');
  }
}

function handleDeleteFareEntry(data) {
  if (data.entryType === 'daily') {
    return handleDeleteFareReceipt(data);
  } else if (data.entryType === 'booking') {
    return handleDeleteBookingEntry(data);
  } else {
    return createResponse(false, 'Unknown entry type for deletion');
  }
}
