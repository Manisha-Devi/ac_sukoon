

// AC Sukoon Transport Management - Google Apps Script API
// Created for React App Integration

// Get your Google Sheets ID from the URL
// IMPORTANT: Replace this with your actual Google Sheets ID
const SPREADSHEET_ID = '1bM61ei_kP2QdBQQyRN_d00aOAu0qcWACleOidEmhzgM'; // Your actual Google Sheets ID

// Sheet names - exact match required
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
  APPROVAL_DATA: 'ApprovalData'
};

// CORS handler for React app - handles preflight OPTIONS requests
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', 'https://bb948baf-d71d-4183-882c-dfc8b9ee2094-00-vj1xcz5mfci9.pike.replit.dev')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .setHeader('Access-Control-Max-Age', '86400');
}

// Main API handler
function doPost(e) {
  try {
    // Add basic logging
    console.log('Received POST request:', e);
    
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received');
    }
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    let result;
    
    switch(action) {
      case 'login':
        result = handleLogin(data);
        break;
      case 'addFareReceipt':
        result = addFareReceipt(data);
        break;
      case 'getFareReceipts':
        result = getFareReceipts();
        break;
      case 'addBookingEntry':
        result = addBookingEntry(data);
        break;
      case 'getBookingEntries':
        result = getBookingEntries();
        break;
      case 'addOffDay':
        result = addOffDay(data);
        break;
      case 'getOffDays':
        result = getOffDays();
        break;
      case 'addFuelPayment':
        result = addFuelPayment(data);
        break;
      case 'getFuelPayments':
        result = getFuelPayments();
        break;
      case 'addAddaPayment':
        result = addAddaPayment(data);
        break;
      case 'getAddaPayments':
        result = getAddaPayments();
        break;
      case 'addUnionPayment':
        result = addUnionPayment(data);
        break;
      case 'getUnionPayments':
        result = getUnionPayments();
        break;
      case 'addServicePayment':
        result = addServicePayment(data);
        break;
      case 'getServicePayments':
        result = getServicePayments();
        break;
      case 'addOtherPayment':
        result = addOtherPayment(data);
        break;
      case 'getOtherPayments':
        result = getOtherPayments();
        break;
      case 'addCashBookEntry':
        result = addCashBookEntry(data);
        break;
      case 'getCashBookEntries':
        result = getCashBookEntries();
        break;
      case 'addApprovalData':
        result = addApprovalData(data);
        break;
      case 'getApprovalData':
        result = getApprovalData();
        break;
      case 'updateEntry':
        result = updateEntry(data);
        break;
      case 'deleteEntry':
        result = deleteEntry(data);
        break;
      default:
        result = { success: false, error: 'Invalid action' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', 'https://bb948baf-d71d-4183-882c-dfc8b9ee2094-00-vj1xcz5mfci9.pike.replit.dev')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', 'https://bb948baf-d71d-4183-882c-dfc8b9ee2094-00-vj1xcz5mfci9.pike.replit.dev')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

// GET handler
function doGet(e) {
  try {
    // Handle case when no parameters are passed
    if (!e || !e.parameter) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'No parameters provided' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = e.parameter.action;
    
    let result;
    
    switch(action) {
      case 'test':
        result = { success: true, message: 'API is working properly!', timestamp: new Date() };
        break;
    case 'getFareReceipts':
      result = getFareReceipts();
      break;
    case 'getBookingEntries':
      result = getBookingEntries();
      break;
    case 'getOffDays':
      result = getOffDays();
      break;
    case 'getFuelPayments':
      result = getFuelPayments();
      break;
    case 'getAddaPayments':
      result = getAddaPayments();
      break;
    case 'getUnionPayments':
      result = getUnionPayments();
      break;
    case 'getServicePayments':
      result = getServicePayments();
      break;
    case 'getOtherPayments':
      result = getOtherPayments();
      break;
    case 'getCashBookEntries':
      result = getCashBookEntries();
      break;
    case 'getApprovalData':
      result = getApprovalData();
      break;
    default:
      result = { success: false, error: 'Invalid action' };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', 'https://bb948baf-d71d-4183-882c-dfc8b9ee2094-00-vj1xcz5mfci9.pike.replit.dev')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'doGet Error: ' + error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', 'https://bb948baf-d71d-4183-882c-dfc8b9ee2094-00-vj1xcz5mfci9.pike.replit.dev')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

// Authentication function
function handleLogin(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.USERS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.username && values[i][1] === data.password) {
        // Update last login
        sheet.getRange(i + 1, 7).setValue(new Date());
        
        return {
          success: true,
          user: {
            username: values[i][0],
            userType: values[i][2],
            fullName: values[i][3],
            status: values[i][4]
          }
        };
      }
    }
    
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Fare Receipts Functions
function addFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.date,
      data.route,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Fare receipt added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      route: row[2],
      cashAmount: row[3],
      bankAmount: row[4],
      totalAmount: row[5],
      remarks: row[6],
      submittedBy: row[7]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Booking Entries Functions
function addBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.bookingDetails || '',
      data.dateFrom,
      data.dateTo,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Booking entry added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getBookingEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      bookingDetails: row[1],
      dateFrom: row[2],
      dateTo: row[3],
      cashAmount: row[4],
      bankAmount: row[5],
      totalAmount: row[6],
      remarks: row[7],
      submittedBy: row[8]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Off Days Functions
function addOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.date,
      data.reason || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Off day added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      reason: row[2],
      submittedBy: row[3]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Fuel Payments Functions
function addFuelPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.date,
      data.pumpName || '',
      data.liters || 0,
      data.ratePerLiter || 0,
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Fuel payment added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getFuelPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      pumpName: row[2],
      liters: row[3],
      ratePerLiter: row[4],
      cashAmount: row[5],
      bankAmount: row[6],
      totalAmount: row[7],
      remarks: row[8],
      submittedBy: row[9]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Adda Payments Functions
function addAddaPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.date,
      data.addaName || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Adda payment added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getAddaPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      addaName: row[2],
      cashAmount: row[3],
      bankAmount: row[4],
      totalAmount: row[5],
      remarks: row[6],
      submittedBy: row[7]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Union Payments Functions
function addUnionPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.UNION_PAYMENTS);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.date,
      data.unionName || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.remarks || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Union payment added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getUnionPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.UNION_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      unionName: row[2],
      cashAmount: row[3],
      bankAmount: row[4],
      totalAmount: row[5],
      remarks: row[6],
      submittedBy: row[7]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Service Payments Functions
function addServicePayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.date,
      data.serviceType || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.serviceDetails || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Service payment added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getServicePayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      serviceType: row[2],
      cashAmount: row[3],
      bankAmount: row[4],
      totalAmount: row[5],
      serviceDetails: row[6],
      submittedBy: row[7]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Other Payments Functions
function addOtherPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OTHER_PAYMENTS);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.date,
      data.paymentType || '',
      data.description || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.totalAmount || 0,
      data.category || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Other payment added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getOtherPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OTHER_PAYMENTS);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      paymentType: row[2],
      description: row[3],
      cashAmount: row[4],
      bankAmount: row[5],
      totalAmount: row[6],
      category: row[7],
      submittedBy: row[8]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Cash Book Entries Functions
function addCashBookEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.CASH_BOOK_ENTRIES);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.date,
      data.type || '',
      data.description || '',
      data.cashAmount || 0,
      data.bankAmount || 0,
      data.category || '',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Cash book entry added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getCashBookEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.CASH_BOOK_ENTRIES);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      date: row[1],
      type: row[2],
      description: row[3],
      cashAmount: row[4],
      bankAmount: row[5],
      category: row[6],
      submittedBy: row[7]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Approval Data Functions
function addApprovalData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.APPROVAL_DATA);
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.submissionDate,
      data.managerName || '',
      data.cashHandover || 0,
      data.bankAmount || 0,
      data.totalCashReceipts || 0,
      data.totalCashPayments || 0,
      data.totalBankReceipts || 0,
      data.totalBankPayments || 0,
      data.cashBalance || 0,
      data.bankBalance || 0,
      data.remarks || '',
      data.status || 'Pending',
      data.submittedBy || ''
    ]);
    
    return { success: true, message: 'Approval data added successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getApprovalData() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.APPROVAL_DATA);
    const values = sheet.getDataRange().getValues();
    
    if (values.length <= 1) return { success: true, data: [] };
    
    const data = values.slice(1).map((row, index) => ({
      id: index + 2,
      timestamp: row[0],
      submissionDate: row[1],
      managerName: row[2],
      cashHandover: row[3],
      bankAmount: row[4],
      totalCashReceipts: row[5],
      totalCashPayments: row[6],
      totalBankReceipts: row[7],
      totalBankPayments: row[8],
      cashBalance: row[9],
      bankBalance: row[10],
      remarks: row[11],
      status: row[12],
      submittedBy: row[13]
    }));
    
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Generic Update Function
function updateEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(data.sheetName);
    const rowIndex = data.rowId;
    
    // Update specific columns based on data provided
    Object.keys(data.updates).forEach((column, index) => {
      const columnIndex = parseInt(column);
      sheet.getRange(rowIndex, columnIndex + 1).setValue(data.updates[column]);
    });
    
    return { success: true, message: 'Entry updated successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Generic Delete Function
function deleteEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(data.sheetName);
    sheet.deleteRow(data.rowId);
    
    return { success: true, message: 'Entry deleted successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

