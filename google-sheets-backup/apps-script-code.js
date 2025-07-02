
// AC Sukoon Transport Management - Google Apps Script API
// Complete Clean Code with CORS Support

// IMPORTANT: Replace this with your actual Google Sheets ID
const SPREADSHEET_ID = '1bM61ei_kP2QdBQQyRN_d00aOAu0qcWACleOidEmhzgM';

// Sheet names - must match exactly
const SHEET_NAMES = {
  USERS: 'Users',
  FARE_RECEIPTS: 'FareReceipts', 
  BOOKING_ENTRIES: 'BookingEntries',
  OFF_DAYS: 'OffDays',
  FUEL_PAYMENTS: 'FuelPayments',
  ADDA_PAYMENTS: 'AddaPayments',
  UNION_PAYMENTS: 'UnionPayments',
  SERVICE_PAYMENTS: 'ServicePayments',
  OTHER_PAYMENTS: 'OtherPayments',
  CASH_BOOK_ENTRIES: 'CashBookEntries',
  BANK_BOOK_ENTRIES: 'BankBookEntries',
  APPROVAL_DATA: 'ApprovalData'
};

// Handle OPTIONS requests for CORS
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '3600'
    });
}

// Main GET handler
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (!action) {
      return createResponse({ success: false, error: 'No action specified' });
    }

    let result;
    switch (action) {
      case 'test':
        result = testConnection();
        break;
      case 'getFareReceipts':
        result = handleGetFareReceipts();
        break;
      case 'getBookingEntries':
        result = handleGetBookingEntries();
        break;
      case 'getOffDays':
        result = handleGetOffDays();
        break;
      case 'getFuelPayments':
        result = handleGetFuelPayments();
        break;
      case 'getAddaPayments':
        result = handleGetAddaPayments();
        break;
      case 'getUnionPayments':
        result = handleGetUnionPayments();
        break;
      case 'getServicePayments':
        result = handleGetServicePayments();
        break;
      case 'getOtherPayments':
        result = handleGetOtherPayments();
        break;
      case 'getCashBookEntries':
        result = handleGetCashBookEntries();
        break;
      case 'getBankBookEntries':
        result = handleGetBankBookEntries();
        break;
      case 'getApprovalData':
        result = handleGetApprovalData();
        break;
      default:
        result = { success: false, error: 'Invalid action: ' + action };
    }

    return createResponse(result);
  } catch (error) {
    return createResponse({ success: false, error: 'Server Error: ' + error.toString() });
  }
}

// Main POST handler
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (!data || !data.action) {
      return createResponse({ success: false, error: 'No data or action received' });
    }

    let result;
    switch (data.action) {
      case 'login':
        result = handleLogin(data);
        break;
      case 'addFareReceipt':
        result = handleAddFareReceipt(data);
        break;
      case 'addBookingEntry':
        result = handleAddBookingEntry(data);
        break;
      case 'addOffDay':
        result = handleAddOffDay(data);
        break;
      case 'addFuelPayment':
        result = handleAddFuelPayment(data);
        break;
      case 'addAddaPayment':
        result = handleAddAddaPayment(data);
        break;
      case 'addUnionPayment':
        result = handleAddUnionPayment(data);
        break;
      case 'addServicePayment':
        result = handleAddServicePayment(data);
        break;
      case 'addOtherPayment':
        result = handleAddOtherPayment(data);
        break;
      case 'addCashBookEntry':
        result = handleAddCashBookEntry(data);
        break;
      case 'addBankBookEntry':
        result = handleAddBankBookEntry(data);
        break;
      case 'addApprovalData':
        result = handleAddApprovalData(data);
        break;
      case 'updateEntry':
        result = handleUpdateEntry(data);
        break;
      case 'deleteEntry':
        result = handleDeleteEntry(data);
        break;
      default:
        result = { success: false, error: 'Invalid action: ' + data.action };
    }

    return createResponse(result);
  } catch (error) {
    return createResponse({ success: false, error: 'Server Error: ' + error.toString() });
  }
}

// Helper function to create response with CORS headers
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
}

// Test connection function
function testConnection() {
  try {
    const result = {
      success: true,
      message: 'API is working perfectly!',
      timestamp: new Date().toISOString(),
      spreadsheetId: SPREADSHEET_ID,
      tests: {}
    };

    // Test spreadsheet access
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      result.tests.spreadsheet = {
        success: true,
        name: spreadsheet.getName()
      };
    } catch (error) {
      result.tests.spreadsheet = {
        success: false,
        error: error.toString()
      };
    }

    // Test sheets existence
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheets = spreadsheet.getSheets();
      const sheetNames = sheets.map(sheet => sheet.getName());
      
      result.tests.sheets = {
        success: true,
        available: sheetNames,
        required: Object.values(SHEET_NAMES)
      };
    } catch (error) {
      result.tests.sheets = {
        success: false,
        error: error.toString()
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: 'Test failed: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// Authentication
function handleLogin(data) {
  try {
    console.log('Login attempt:', data);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.USERS);
    const values = sheet.getDataRange().getValues();
    
    console.log('Sheet data:', values);
    console.log('Looking for username:', data.username, 'password:', data.password);

    for (let i = 1; i < values.length; i++) {
      console.log('Checking row', i, ':', values[i][0], values[i][1]);
      
      // Convert to string and trim whitespace
      const sheetUsername = String(values[i][0]).trim();
      const sheetPassword = String(values[i][1]).trim();
      const inputUsername = String(data.username).trim();
      const inputPassword = String(data.password).trim();
      
      console.log('Comparing:', sheetUsername, '===', inputUsername, '&&', sheetPassword, '===', inputPassword);
      
      if (sheetUsername === inputUsername && sheetPassword === inputPassword) {
        // Update last login
        sheet.getRange(i + 1, 7).setValue(new Date());

        return {
          success: true,
          message: 'Login successful',
          user: {
            username: values[i][0],
            userType: values[i][2],
            fullName: values[i][3],
            status: values[i][4]
          }
        };
      }
    }

    return { 
      success: false, 
      error: 'Invalid username or password',
      debug: {
        receivedUsername: data.username,
        receivedPassword: data.password,
        sheetData: values.slice(1).map(row => ({username: row[0], password: row[1]}))
      }
    };
  } catch (error) {
    return { success: false, error: 'Login error: ' + error.toString() };
  }
}

// Fare Receipts
function handleAddFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const newRow = [
      new Date(data.date),
      data.route || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || '',
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Fare receipt added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding fare receipt: ' + error.toString() };
  }
}

function handleGetFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting fare receipts: ' + error.toString() };
  }
}

// Fuel Payments
function handleAddFuelPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);
    const newRow = [
      new Date(data.date),
      data.pumpName || '',
      data.liters || 0,
      data.rate || 0,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Fuel payment added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding fuel payment: ' + error.toString() };
  }
}

function handleGetFuelPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting fuel payments: ' + error.toString() };
  }
}

// Bank Book Entries
function handleAddBankBookEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BANK_BOOK_ENTRIES);
    const newRow = [
      new Date(data.date),
      data.particulars || '',
      data.description || '',
      data.chequeNo || '',
      data.debit || 0,
      data.credit || 0,
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Bank book entry added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding bank book entry: ' + error.toString() };
  }
}

function handleGetBankBookEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BANK_BOOK_ENTRIES);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting bank book entries: ' + error.toString() };
  }
}

// Cash Book Entries
function handleAddCashBookEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.CASH_BOOK_ENTRIES);
    const newRow = [
      new Date(data.date),
      data.particulars || '',
      data.description || '',
      data.jfNo || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.type || '',
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Cash book entry added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding cash book entry: ' + error.toString() };
  }
}

function handleGetCashBookEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.CASH_BOOK_ENTRIES);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting cash book entries: ' + error.toString() };
  }
}

// Placeholder functions for other payment types
function handleAddBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const newRow = [
      new Date(data.dateFrom),
      new Date(data.dateTo),
      data.bookingDetails || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Booking entry added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding booking entry: ' + error.toString() };
  }
}

function handleGetBookingEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting booking entries: ' + error.toString() };
  }
}

function handleAddOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const newRow = [
      new Date(data.date),
      data.reason || '',
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Off day added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding off day: ' + error.toString() };
  }
}

function handleGetOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting off days: ' + error.toString() };
  }
}

// Add placeholder functions for other payment types
function handleAddAddaPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);
    const newRow = [
      new Date(data.date),
      data.description || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Adda payment added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding adda payment: ' + error.toString() };
  }
}

function handleGetAddaPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting adda payments: ' + error.toString() };
  }
}

function handleAddUnionPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.UNION_PAYMENTS);
    const newRow = [
      new Date(data.date),
      data.description || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Union payment added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding union payment: ' + error.toString() };
  }
}

function handleGetUnionPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.UNION_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting union payments: ' + error.toString() };
  }
}

function handleAddServicePayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);
    const newRow = [
      new Date(data.date),
      data.description || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Service payment added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding service payment: ' + error.toString() };
  }
}

function handleGetServicePayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting service payments: ' + error.toString() };
  }
}

function handleAddOtherPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OTHER_PAYMENTS);
    const newRow = [
      new Date(data.date),
      data.description || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Other payment added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding other payment: ' + error.toString() };
  }
}

function handleGetOtherPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OTHER_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting other payments: ' + error.toString() };
  }
}

function handleAddApprovalData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.APPROVAL_DATA);
    const newRow = [
      new Date(data.date),
      data.type || '',
      data.description || '',
      data.amount || 0,
      data.status || 'pending',
      data.submittedBy || '',
      new Date()
    ];
    sheet.appendRow(newRow);
    return { success: true, message: 'Approval data added successfully' };
  } catch (error) {
    return { success: false, error: 'Error adding approval data: ' + error.toString() };
  }
}

function handleGetApprovalData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.APPROVAL_DATA);
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    return { success: true, data: data };
  } catch (error) {
    return { success: false, error: 'Error getting approval data: ' + error.toString() };
  }
}

// Generic Update/Delete functions
function handleUpdateEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(data.sheetName);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == data.rowId) {
        Object.keys(data.updates).forEach(key => {
          const columnIndex = values[0].indexOf(key);
          if (columnIndex !== -1) {
            sheet.getRange(i + 1, columnIndex + 1).setValue(data.updates[key]);
          }
        });
        break;
      }
    }
    
    return { success: true, message: 'Entry updated successfully' };
  } catch (error) {
    return { success: false, error: 'Error updating entry: ' + error.toString() };
  }
}

function handleDeleteEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(data.sheetName);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == data.rowId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return { success: true, message: 'Entry deleted successfully' };
  } catch (error) {
    return { success: false, error: 'Error deleting entry: ' + error.toString() };
  }
}
