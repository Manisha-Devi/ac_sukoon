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
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
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

    const output = ContentService.createTextOutput(JSON.stringify(result));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;

  } catch (error) {
    const errorOutput = ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }));
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;
  }
}

// GET handler
function doGet(e) {
  try {
    // If no parameters are provided, return the HTML test page.
    if (!e || Object.keys(e).length === 0) {
      return HtmlService.createHtmlOutput(getTestPageHtml());
    }


    // Handle case when no parameters are passed
    if (!e || !e.parameter) {
      const output = ContentService.createTextOutput(JSON.stringify({ success: false, error: 'No parameters provided' }));
      output.setMimeType(ContentService.MimeType.JSON);
      return output;
    }

    const action = e.parameter.action;

    let result;

    switch(action) {
      case 'test':
        result = testApiConnection();
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

  const output = ContentService.createTextOutput(JSON.stringify(result));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;

  } catch (error) {
    const errorOutput = ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: 'doGet Error: ' + error.toString() 
    }));
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;
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

// Comprehensive Test Function
function testApiConnection() {
  try {
    console.log('Starting API test...');

    // Test 1: Basic response
    const testResult = {
      success: true,
      message: 'Google Apps Script API is working!',
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 2: Spreadsheet connection
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      testResult.tests.spreadsheet = {
        success: true,
        name: spreadsheet.getName(),
        id: SPREADSHEET_ID
      };
      console.log('Spreadsheet connection: SUCCESS');
    } catch (error) {
      testResult.tests.spreadsheet = {
        success: false,
        error: error.toString()
      };
      console.log('Spreadsheet connection: FAILED - ' + error.toString());
    }

    // Test 3: Check all required sheets
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheets = spreadsheet.getSheets();
      const sheetNames = sheets.map(sheet => sheet.getName());

      const requiredSheets = Object.values(SHEET_NAMES);
      const missingSheets = requiredSheets.filter(name => !sheetNames.includes(name));

      testResult.tests.sheets = {
        success: missingSheets.length === 0,
        available: sheetNames,
        required: requiredSheets,
        missing: missingSheets
      };
      console.log('Sheets check: ' + (missingSheets.length === 0 ? 'SUCCESS' : 'FAILED'));
    } catch (error) {
      testResult.tests.sheets = {
        success: false,
        error: error.toString()
      };
    }

    // Test 4: Test Users sheet (for login)
    try {
      const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.USERS);
      const userData = usersSheet.getDataRange().getValues();

      testResult.tests.users = {
        success: true,
        userCount: userData.length - 1, // Minus header row
        hasHeaders: userData.length > 0
      };
      console.log('Users sheet test: SUCCESS');
    } catch (error) {
      testResult.tests.users = {
        success: false,
        error: error.toString()
      };
    }

    console.log('API test completed');
    return testResult;

  } catch (error) {
    console.log('API test failed: ' + error.toString());
    return {
      success: false,
      error: 'Test function failed: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}



// HTML Test Page Function
function getTestPageHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚌 AC Sukoon - Google Apps Script API Test</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px auto;
            text-align: center;
        }
        .status-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .test-section {
            margin-bottom: 25px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            background-color: #f8f9fa;
        }
        .test-section h3 {
            margin-top: 0;
            color: #495057;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            box-sizing: border-box;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #007bff;
        }
        button {
            background: linear-gradient(45deg, #007bff, #0056b3);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin: 8px 5px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(0,123,255,0.3);
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,123,255,0.4);
        }
        button:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
        }
        .result {
            margin-top: 15px;
            padding: 15px;
            border-radius: 8px;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            max-height: 300px;
            overflow-y: auto;
            font-size: 13px;
        }
        .success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .error {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .info {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
        }
        .loading {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .api-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚌 AC Sukoon Transport</h1>
        <div class="subtitle">Google Apps Script API Test Dashboard</div>
        <div class="status-badge status-success">✅ Google Apps Script is Working!</div>```tool_code

        <div class="api-info">
            <strong>📡 Current API URL:</strong><br>
            <code id="currentUrl">${ScriptApp.getService().getUrl()}</code>
        </div>

        <!-- Basic Connection Test -->
        <div class="test-section">
            <h3>🔗 1. API Connection Test</h3>
            <button onclick="testConnection()">Test API Connection</button>
            <div id="connectionResult" class="result" style="display: none;"></div>
        </div>

        <!-- Login Test -->
        <div class="test-section">
            <h3>👤 2. Login System Test</h3>
            <div class="grid-2">
                <div>
                    <label><strong>Username:</strong></label>
                    <input type="text" id="username" value="admin" placeholder="Enter username">
                </div>
                <div>
                    <label><strong>Password:</strong></label>
                    <input type="password" id="password" value="admin123" placeholder="Enter password">
                </div>
            </div>
            <button onclick="testLogin()">Test Login</button>
            <div id="loginResult" class="result" style="display: none;"></div>
        </div>

        <!-- Data Operations Test -->
        <div class="test-section">
            <h3>📊 3. Data Operations Test</h3>
            <button onclick="testGetData('getFareReceipts')">Get Fare Receipts</button>
            <button onclick="testGetData('getBookingEntries')">Get Booking Entries</button>
            <button onclick="testAddSampleData()">Add Sample Data</button>
            <div id="dataResult" class="result" style="display: none;"></div>
        </div>

        <!-- System Status -->
        <div class="test-section">
            <h3>🚀 4. Complete System Check</h3>
            <button onclick="runFullSystemCheck()">Run Full System Check</button>
            <div id="systemResult" class="result" style="display: none;"></div>
        </div>
    </div>

    <script>
        const API_URL = '${ScriptApp.getService().getUrl()}';

        function showResult(elementId, message, type = 'info') {
            const element = document.getElementById(elementId);
            element.style.display = 'block';
            element.className = \`result \${type}\`;
            element.textContent = message;
        }

        async function testConnection() {
            showResult('connectionResult', '🔄 Testing API connection...', 'loading');

            try {
                const response = await fetch(API_URL + '?action=test');
                const result = await response.json();

                if (result.success) {
                    showResult('connectionResult', 
                        \`✅ CONNECTION SUCCESS!\\n\\n\` +
                        \`Message: \${result.message}\\n\` +
                        \`Timestamp: \${result.timestamp}\\n\\n\` +
                        \`Tests: \${JSON.stringify(result.tests, null, 2)}\`, 
                        'success'
                    );
                } else {
                    showResult('connectionResult', \`❌ Connection failed: \${result.error}\`, 'error');
                }
            } catch (error) {
                showResult('connectionResult', \`❌ Error: \${error.message}\`, 'error');
            }
        }

        async function testLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            showResult('loginResult', '🔄 Testing login...', 'loading');

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'login',
                        username: username,
                        password: password
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showResult('loginResult', 
                        \`✅ LOGIN SUCCESS!\\n\\n\` +
                        \`Welcome: \${result.user.fullName}\\n\` +
                        \`Username: \${result.user.username}\\n\` +
                        \`User Type: \${result.user.userType}\`, 
                        'success'
                    );
                } else {
                    showResult('loginResult', \`❌ Login failed: \${result.error}\`, 'error');
                }
            } catch (error) {
                showResult('loginResult', \`❌ Error: \${error.message}\`, 'error');
            }
        }

        async function testGetData(action) {
            showResult('dataResult', \`🔄 Testing \${action}...\`, 'loading');

            try {
                const response = await fetch(\`\${API_URL}?action=\${action}\`);
                const result = await response.json();

                if (result.success) {
                    showResult('dataResult', 
                        \`✅ DATA SUCCESS!\\n\\n\` +
                        \`Action: \${action}\\n\` +
                        \`Records: \${result.data ? result.data.length : 0}\\n\\n\` +
                        \`Sample: \${JSON.stringify(result.data?.slice(0, 1) || [], null, 2)}\`, 
                        'success'
                    );
                } else {
                    showResult('dataResult', \`❌ Data error: \${result.error}\`, 'error');
                }
            } catch (error) {
                showResult('dataResult', \`❌ Error: \${error.message}\`, 'error');
            }
        }

        async function testAddSampleData() {
            showResult('dataResult', '🔄 Adding sample data...', 'loading');

            const sampleData = {
                action: 'addFareReceipt',
                date: new Date().toISOString().split('T')[0],
                route: 'Test Route - ' + new Date().toLocaleTimeString(),
                cashAmount: 1000,
                bankAmount: 500,
                totalAmount: 1500,
                remarks: 'Test from Apps Script HTML page',
                submittedBy: 'HTML Test Page'
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sampleData)
                });

                const result = await response.json();

                if (result.success) {
                    showResult('dataResult', 
                        \`✅ SAMPLE DATA ADDED!\\n\\n\` +
                        \`Message: \${result.message}\\n\` +
                        \`Data: \${JSON.stringify(sampleData, null, 2)}\`, 
                        'success'
                    );
                } else {
                    showResult('dataResult', \`❌ Add failed: \${result.error}\`, 'error');
                }
            } catch (error) {
                showResult('dataResult', \`❌ Error: \${error.message}\`, 'error');
            }
        }

        async function runFullSystemCheck() {
            showResult('systemResult', '🔄 Running complete system check...', 'loading');

            let results = [];

            try {
                // Test 1: Connection
                const connTest = await fetch(API_URL + '?action=test');
                const connResult = await connTest.json();
                results.push(\`1. API Connection: \${connResult.success ? '✅ PASS' : '❌ FAIL'}\`);

                // Test 2: Login
                const loginTest = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'login', username: 'admin', password: 'admin123' })
                });
                const loginResult = await loginTest.json();
                results.push(\`2. Login System: \${loginResult.success ? '✅ PASS' : '❌ FAIL'}\`);

                // Test 3: Data Retrieval
                const dataTest = await fetch(API_URL + '?action=getFareReceipts');
                const dataResult = await dataTest.json();
                results.push(\`3. Data Access: \${dataResult.success ? '✅ PASS' : '❌ FAIL'}\`);

                const passCount = results.filter(r => r.includes('✅')).length;

                showResult('systemResult', 
                    \`🏁 SYSTEM CHECK COMPLETE!\\n\\n\` +
                    \`Results: \${passCount}/3 tests passed\\n\\n\` +
                    results.join('\\n') + 
                    \`\\n\\n\${passCount === 3 ? 
                        '🎉 ALL SYSTEMS OPERATIONAL!' : 
                        '⚠️ Some issues detected.'}\`, 
                    passCount === 3 ? 'success' : 'error'
                );

            } catch (error) {
                showResult('systemResult', \`❌ System check failed: \${error.message}\`, 'error');
            }
        }

        // Auto-run connection test on load
        window.onload = function() {
            setTimeout(testConnection, 1000);
        };
    </script>
</body>
</html>
  `;
}