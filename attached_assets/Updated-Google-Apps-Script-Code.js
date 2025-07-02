
// Enhanced Google Apps Script Code with Update/Delete Support

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAMES = {
  FARE_RECEIPTS: 'FareReceipts',
  BOOKING_ENTRIES: 'BookingEntries', 
  OFF_DAYS: 'OffDays',
  USERS: 'Users'
};

// Main function to handle all requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('Received request:', data);

    switch(data.action) {
      case 'addFareReceipt':
        return ContentService.createTextOutput(JSON.stringify(addFareReceipt(data)));
      case 'addBookingEntry':
        return ContentService.createTextOutput(JSON.stringify(addBookingEntry(data)));
      case 'addOffDay':
        return ContentService.createTextOutput(JSON.stringify(addOffDay(data)));
      case 'getFareReceipts':
        return ContentService.createTextOutput(JSON.stringify(getFareReceipts()));
      case 'getBookingEntries':
        return ContentService.createTextOutput(JSON.stringify(getBookingEntries()));
      case 'getOffDays':
        return ContentService.createTextOutput(JSON.stringify(getOffDays()));
      case 'updateFareEntry':
        return ContentService.createTextOutput(JSON.stringify(updateFareEntry(data)));
      case 'deleteFareEntry':
        return ContentService.createTextOutput(JSON.stringify(deleteFareEntry(data)));
      case 'login':
        return ContentService.createTextOutput(JSON.stringify(authenticateUser(data)));
      case 'test':
        return ContentService.createTextOutput(JSON.stringify({success: true, message: 'Connection successful'}));
      default:
        return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Invalid action'}));
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

// Fare Receipts Functions
function addFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const entryId = data.id || Date.now();
    
    sheet.appendRow([
      new Date(),           // A: Timestamp
      data.date,            // B: Date
      data.route,           // C: Route
      data.cashAmount || 0, // D: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0, // E: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0,// F: TotalAmount
      "daily",              // G: EntryType
      entryId,              // H: EntryId
      data.submittedBy || ''// I: SubmittedBy
    ]);

    return { success: true, message: 'Fare receipt added successfully', id: entryId };
  } catch (error) {
    return { success: false, error: 'Add fare receipt error: ' + error.toString() };
  }
}

function getFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[7] || (index + 2),     // H: EntryId
      timestamp: row[0],             // A: Timestamp
      date: row[1],                  // B: Date
      route: row[2],                 // C: Route
      cashAmount: row[3],            // D: CashAmount
      bankAmount: row[4],            // E: BankAmount
      totalAmount: row[5],           // F: TotalAmount
      entryType: row[6],             // G: EntryType
      submittedBy: row[8],           // I: SubmittedBy
      rowIndex: index + 2            // Store row index for updates/deletes
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: 'Get fare receipts error: ' + error.toString() };
  }
}

// Booking Entries Functions
function addBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const entryId = data.id || Date.now();
    
    sheet.appendRow([
      new Date(),                    // A: Timestamp
      data.bookingDetails || '',     // B: BookingDetails
      data.dateFrom,                 // C: DateFrom
      data.dateTo,                   // D: DateTo
      data.cashAmount || 0,          // E: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0,          // F: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0,         // G: TotalAmount
      "booking",                     // H: EntryType
      entryId,                       // I: EntryId
      data.submittedBy || ''         // J: SubmittedBy
    ]);

    return { success: true, message: 'Booking entry added successfully', id: entryId };
  } catch (error) {
    return { success: false, error: 'Add booking entry error: ' + error.toString() };
  }
}

function getBookingEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[8] || (index + 2),     // I: EntryId
      timestamp: row[0],             // A: Timestamp
      bookingDetails: row[1],        // B: BookingDetails
      dateFrom: row[2],              // C: DateFrom
      dateTo: row[3],                // D: DateTo
      cashAmount: row[4],            // E: CashAmount
      bankAmount: row[5],            // F: BankAmount
      totalAmount: row[6],           // G: TotalAmount
      entryType: row[7],             // H: EntryType
      submittedBy: row[9],           // J: SubmittedBy
      rowIndex: index + 2            // Store row index for updates/deletes
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: 'Get booking entries error: ' + error.toString() };
  }
}

// Off Days Functions
function addOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const entryId = data.id || Date.now();
    
    sheet.appendRow([
      new Date(),              // A: Timestamp
      data.date,               // B: Date
      data.reason || '',       // C: Reason (Required as per user request)
      "off",                   // D: EntryType
      entryId,                 // E: EntryId
      data.submittedBy || ''   // F: SubmittedBy
    ]);

    return { success: true, message: 'Off day added successfully', id: entryId };
  } catch (error) {
    return { success: false, error: 'Add off day error: ' + error.toString() };
  }
}

function getOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[4] || (index + 2),     // E: EntryId
      timestamp: row[0],             // A: Timestamp
      date: row[1],                  // B: Date
      reason: row[2],                // C: Reason
      entryType: row[3],             // D: EntryType
      submittedBy: row[5],           // F: SubmittedBy
      rowIndex: index + 2            // Store row index for updates/deletes
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: 'Get off days error: ' + error.toString() };
  }
}

// Enhanced UPDATE Function - Find and Update Entry by ID
function updateFareEntry(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;
    const entryType = data.entryType || updatedData.type;
    
    let sheet;
    let columnMapping;
    
    // Determine which sheet to update based on entry type
    if (entryType === 'daily') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
      columnMapping = {
        date: 'B',
        route: 'C', 
        totalAmount: 'F'
      };
    } else if (entryType === 'booking') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
      columnMapping = {
        bookingDetails: 'B',
        dateFrom: 'C',
        dateTo: 'D',
        totalAmount: 'G'
      };
    } else if (entryType === 'off') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
      columnMapping = {
        date: 'B',
        reason: 'C'
      };
    } else {
      return { success: false, error: 'Invalid entry type' };
    }
    
    // Find the row with matching EntryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      const idColumnIndex = entryType === 'daily' ? 7 : (entryType === 'booking' ? 8 : 4); // H, I, E columns
      if (values[i][idColumnIndex] == entryId) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Entry not found with ID: ' + entryId };
    }
    
    // Update specific cells based on the updatedData
    for (const [field, value] of Object.entries(updatedData)) {
      if (columnMapping[field]) {
        const cellAddress = columnMapping[field] + rowIndex;
        sheet.getRange(cellAddress).setValue(value);
      }
    }
    
    // Update timestamp
    sheet.getRange('A' + rowIndex).setValue(new Date());
    
    return { success: true, message: 'Entry updated successfully in Google Sheets' };
    
  } catch (error) {
    return { success: false, error: 'Update entry error: ' + error.toString() };
  }
}

// Enhanced DELETE Function - Find and Delete Entry by ID
function deleteFareEntry(data) {
  try {
    const entryId = data.entryId;
    const entryType = data.entryType;
    
    let sheet;
    let idColumnIndex;
    
    // Determine which sheet to delete from based on entry type
    if (entryType === 'daily') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
      idColumnIndex = 7; // H column (EntryId)
    } else if (entryType === 'booking') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
      idColumnIndex = 8; // I column (EntryId)
    } else if (entryType === 'off') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
      idColumnIndex = 4; // E column (EntryId)
    } else {
      return { success: false, error: 'Invalid entry type' };
    }
    
    // Find the row with matching EntryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][idColumnIndex] == entryId) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Entry not found with ID: ' + entryId };
    }
    
    // Delete the entire row
    sheet.deleteRow(rowIndex);
    
    return { success: true, message: 'Entry deleted successfully from Google Sheets' };
    
  } catch (error) {
    return { success: false, error: 'Delete entry error: ' + error.toString() };
  }
}

// Authentication function (existing)
function authenticateUser(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.USERS);
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === data.username && row[1] === data.password && row[2] === data.userType) {
        return {
          success: true,
          user: {
            username: row[0],
            userType: row[2],
            fullName: row[3] || row[0],
            status: row[4] || 'active'
          }
        };
      }
    }
    
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    return { success: false, error: 'Authentication error: ' + error.toString() };
  }
}
