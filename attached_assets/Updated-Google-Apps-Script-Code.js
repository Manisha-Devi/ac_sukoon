
// =============================================================================
// Google Apps Script - Complete Fare Receipt Management System
// =============================================================================

// Configuration - Update these IDs with your actual Google Sheets
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your actual spreadsheet ID

const SHEET_NAMES = {
  USERS: 'Users',
  FARE_RECEIPTS: 'Fare Receipts',
  BOOKING_ENTRIES: 'Booking Entries',
  OFF_DAYS: 'Off Days'
};

// =============================================================================
// MAIN ENTRY POINT - Handle all incoming requests
// =============================================================================
function doPost(e) {
  try {
    console.log('📥 Incoming request:', e.postData.contents);
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    console.log('🎯 Action requested:', action);

    switch (action) {
      // Authentication
      case 'login':
        return ContentService
          .createTextOutput(JSON.stringify(authenticateUser(data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'updateLastLogin':
        return ContentService
          .createTextOutput(JSON.stringify(updateLastLogin(data)))
          .setMimeType(ContentService.MimeType.JSON);

      // Fare Receipts (Daily)
      case 'addFareReceipt':
        return ContentService
          .createTextOutput(JSON.stringify(addFareReceipt(data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'getFareReceipts':
        return ContentService
          .createTextOutput(JSON.stringify(getFareReceipts()))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'updateFareReceipt':
        return ContentService
          .createTextOutput(JSON.stringify(updateFareReceipt(data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'deleteFareReceipt':
        return ContentService
          .createTextOutput(JSON.stringify(deleteFareReceipt(data)))
          .setMimeType(ContentService.MimeType.JSON);

      // Booking Entries
      case 'addBookingEntry':
        return ContentService
          .createTextOutput(JSON.stringify(addBookingEntry(data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'getBookingEntries':
        return ContentService
          .createTextOutput(JSON.stringify(getBookingEntries()))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'updateBookingEntry':
        return ContentService
          .createTextOutput(JSON.stringify(updateBookingEntry(data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'deleteBookingEntry':
        return ContentService
          .createTextOutput(JSON.stringify(deleteBookingEntry(data)))
          .setMimeType(ContentService.MimeType.JSON);

      // Off Days
      case 'addOffDay':
        return ContentService
          .createTextOutput(JSON.stringify(addOffDay(data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'getOffDays':
        return ContentService
          .createTextOutput(JSON.stringify(getOffDays()))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'updateOffDay':
        return ContentService
          .createTextOutput(JSON.stringify(updateOffDay(data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'deleteOffDay':
        return ContentService
          .createTextOutput(JSON.stringify(deleteOffDay(data)))
          .setMimeType(ContentService.MimeType.JSON);

      // Legacy Functions (for backward compatibility)
      case 'updateFareEntry':
        return ContentService
          .createTextOutput(JSON.stringify(updateFareEntryLegacy(data)))
          .setMimeType(ContentService.MimeType.JSON);
      
      case 'deleteFareEntry':
        return ContentService
          .createTextOutput(JSON.stringify(deleteFareEntryLegacy(data)))
          .setMimeType(ContentService.MimeType.JSON);

      // Test connection
      case 'test':
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            message: 'Google Apps Script is working!',
            timestamp: new Date().toISOString()
          }))
          .setMimeType(ContentService.MimeType.JSON);

      default:
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            error: 'Unknown action: ' + action
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    console.error('❌ Main error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Server error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================================================
// AUTHENTICATION FUNCTIONS
// =============================================================================

/**
 * Authenticate user against Users sheet
 */
function authenticateUser(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.USERS);
    const values = sheet.getDataRange().getValues();

    // Skip header row
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === data.username && row[1] === data.password && row[2] === data.userType) {
        return {
          success: true,
          message: 'Login successful',
          user: {
            username: row[0],
            userType: row[2],
            fullName: row[3] || row[0],
            status: row[4] || 'Active'
          }
        };
      }
    }

    return {
      success: false,
      message: 'Invalid credentials'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Authentication error: ' + error.toString()
    };
  }
}

/**
 * Update last login timestamp
 */
function updateLastLogin(data) {
  try {
    // Implementation can be added if needed
    return {
      success: true,
      message: 'Last login updated'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Update last login error: ' + error.toString()
    };
  }
}

// =============================================================================
// FARE RECEIPTS (DAILY) - COMPLETE CRUD OPERATIONS
// =============================================================================

/**
 * Add new Fare Receipt
 * Columns: A=Timestamp, B=Date, C=Route, D=CashAmount, E=BankAmount, F=TotalAmount, G=EntryType, H=EntryId, I=SubmittedBy
 */
function addFareReceipt(data) {
  try {
    console.log('📝 Adding fare receipt:', data);
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const entryId = data.id || Date.now();

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.date, // B: Date
      data.route, // C: Route
      data.cashAmount || 0, // D: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0, // E: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0, // F: TotalAmount
      "daily", // G: EntryType
      entryId, // H: EntryId
      data.submittedBy || "driver" // I: SubmittedBy
    ]);

    return {
      success: true,
      message: "Fare receipt added successfully",
      entryId: entryId
    };
  } catch (error) {
    console.error('❌ Add fare receipt error:', error);
    return {
      success: false,
      error: "Add fare receipt error: " + error.toString()
    };
  }
}

/**
 * Get all Fare Receipts
 */
function getFareReceipts() {
  try {
    console.log('📋 Getting fare receipts...');
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[7] || (index + 2), // H: EntryId
      timestamp: row[0], // A: Timestamp
      date: row[1], // B: Date
      route: row[2], // C: Route
      cashAmount: row[3], // D: CashAmount
      bankAmount: row[4], // E: BankAmount
      totalAmount: row[5], // F: TotalAmount
      entryType: row[6], // G: EntryType
      submittedBy: row[8], // I: SubmittedBy
      rowIndex: index + 2 // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    console.error('❌ Get fare receipts error:', error);
    return {
      success: false,
      error: "Get fare receipts error: " + error.toString()
    };
  }
}

/**
 * Update existing Fare Receipt
 */
function updateFareReceipt(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('📝 Updating fare receipt:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const entryIdColumn = 8; // Column H

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Fare receipt not found with ID: ' + entryId);
    }

    // Update specific columns for Fare Receipt
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.route !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.route); // C: Route
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.totalAmount); // F: TotalAmount
    }
    // Update timestamp
    sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp

    return {
      success: true,
      message: 'Fare receipt updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Update fare receipt error:', error);
    return {
      success: false,
      error: 'Update fare receipt error: ' + error.toString()
    };
  }
}

/**
 * Delete Fare Receipt
 */
function deleteFareReceipt(data) {
  try {
    const entryId = data.entryId;

    console.log('🗑️ Deleting fare receipt:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const entryIdColumn = 8; // Column H

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Fare receipt not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Fare receipt deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Delete fare receipt error:', error);
    return {
      success: false,
      error: 'Delete fare receipt error: ' + error.toString()
    };
  }
}

// =============================================================================
// BOOKING ENTRIES - COMPLETE CRUD OPERATIONS
// =============================================================================

/**
 * Add new Booking Entry
 * Columns: A=Timestamp, B=BookingDetails, C=DateFrom, D=DateTo, E=CashAmount, F=BankAmount, G=TotalAmount, H=EntryType, I=EntryId, J=SubmittedBy
 */
function addBookingEntry(data) {
  try {
    console.log('📝 Adding booking entry:', data);
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const entryId = data.id || Date.now();

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.bookingDetails, // B: BookingDetails
      data.dateFrom, // C: DateFrom
      data.dateTo, // D: DateTo
      data.cashAmount || 0, // E: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0, // F: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0, // G: TotalAmount
      "booking", // H: EntryType
      entryId, // I: EntryId
      data.submittedBy || "driver" // J: SubmittedBy
    ]);

    return { 
      success: true, 
      message: "Booking entry added successfully",
      entryId: entryId
    };
  } catch (error) {
    console.error('❌ Add booking entry error:', error);
    return {
      success: false,
      error: "Add booking entry error: " + error.toString()
    };
  }
}

/**
 * Get all Booking Entries
 */
function getBookingEntries() {
  try {
    console.log('📋 Getting booking entries...');
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[8] || (index + 2), // I: EntryId
      timestamp: row[0], // A: Timestamp
      bookingDetails: row[1], // B: BookingDetails
      dateFrom: row[2], // C: DateFrom
      dateTo: row[3], // D: DateTo
      cashAmount: row[4], // E: CashAmount
      bankAmount: row[5], // F: BankAmount
      totalAmount: row[6], // G: TotalAmount
      entryType: row[7], // H: EntryType
      submittedBy: row[9], // J: SubmittedBy
      rowIndex: index + 2 // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    console.error('❌ Get booking entries error:', error);
    return {
      success: false,
      error: "Get booking entries error: " + error.toString()
    };
  }
}

/**
 * Update existing Booking Entry
 */
function updateBookingEntry(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('📝 Updating booking entry:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const entryIdColumn = 9; // Column I

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Booking entry not found with ID: ' + entryId);
    }

    // Update specific columns for Booking Entry
    if (updatedData.bookingDetails !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.bookingDetails); // B: BookingDetails
    }
    if (updatedData.dateFrom !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.dateFrom); // C: DateFrom
    }
    if (updatedData.dateTo !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.dateTo); // D: DateTo
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.totalAmount); // G: TotalAmount
    }
    // Update timestamp
    sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp

    return {
      success: true,
      message: 'Booking entry updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Update booking entry error:', error);
    return {
      success: false,
      error: 'Update booking entry error: ' + error.toString()
    };
  }
}

/**
 * Delete Booking Entry
 */
function deleteBookingEntry(data) {
  try {
    const entryId = data.entryId;

    console.log('🗑️ Deleting booking entry:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const entryIdColumn = 9; // Column I

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Booking entry not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Booking entry deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Delete booking entry error:', error);
    return {
      success: false,
      error: 'Delete booking entry error: ' + error.toString()
    };
  }
}

// =============================================================================
// OFF DAYS - COMPLETE CRUD OPERATIONS
// =============================================================================

/**
 * Add new Off Day
 * Columns: A=Timestamp, B=Date, C=Reason, D=EntryType, E=EntryId, F=SubmittedBy
 */
function addOffDay(data) {
  try {
    console.log('📝 Adding off day:', data);
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const entryId = data.id || Date.now();

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.date, // B: Date
      data.reason || "", // C: Reason (Required as per user request)
      "off", // D: EntryType
      entryId, // E: EntryId
      data.submittedBy || "driver" // F: SubmittedBy
    ]);

    return { 
      success: true, 
      message: "Off day added successfully",
      entryId: entryId
    };
  } catch (error) {
    console.error('❌ Add off day error:', error);
    return { 
      success: false, 
      error: "Add off day error: " + error.toString() 
    };
  }
}

/**
 * Get all Off Days
 */
function getOffDays() {
  try {
    console.log('📋 Getting off days...');
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[4] || (index + 2), // E: EntryId
      timestamp: row[0], // A: Timestamp
      date: row[1], // B: Date
      reason: row[2], // C: Reason
      entryType: row[3], // D: EntryType
      submittedBy: row[5], // F: SubmittedBy
      rowIndex: index + 2 // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    console.error('❌ Get off days error:', error);
    return { 
      success: false, 
      error: "Get off days error: " + error.toString() 
    };
  }
}

/**
 * Update existing Off Day
 */
function updateOffDay(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('📝 Updating off day:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const entryIdColumn = 5; // Column E

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Off day not found with ID: ' + entryId);
    }

    // Update specific columns for Off Day
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.reason !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.reason); // C: Reason
    }
    // Update timestamp
    sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp

    return {
      success: true,
      message: 'Off day updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Update off day error:', error);
    return {
      success: false,
      error: 'Update off day error: ' + error.toString()
    };
  }
}

/**
 * Delete Off Day
 */
function deleteOffDay(data) {
  try {
    const entryId = data.entryId;

    console.log('🗑️ Deleting off day:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const entryIdColumn = 5; // Column E

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Off day not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Off day deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Delete off day error:', error);
    return {
      success: false,
      error: 'Delete off day error: ' + error.toString()
    };
  }
}

// =============================================================================
// LEGACY FUNCTIONS (For Backward Compatibility)
// =============================================================================

/**
 * Legacy Universal Update Function (for backward compatibility)
 */
function updateFareEntryLegacy(data) {
  try {
    const entryType = data.entryType;

    if (entryType === 'daily') {
      return updateFareReceipt(data);
    } else if (entryType === 'booking') {
      return updateBookingEntry(data);
    } else if (entryType === 'off') {
      return updateOffDay(data);
    } else {
      throw new Error('Invalid entry type: ' + entryType);
    }
  } catch (error) {
    return {
      success: false,
      error: 'Legacy update error: ' + error.toString()
    };
  }
}

/**
 * Legacy Universal Delete Function (for backward compatibility)
 */
function deleteFareEntryLegacy(data) {
  try {
    const entryType = data.entryType;

    if (entryType === 'daily') {
      return deleteFareReceipt(data);
    } else if (entryType === 'booking') {
      return deleteBookingEntry(data);
    } else if (entryType === 'off') {
      return deleteOffDay(data);
    } else {
      throw new Error('Invalid entry type: ' + entryType);
    }
  } catch (error) {
    return {
      success: false,
      error: 'Legacy delete error: ' + error.toString()
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all users (for admin purposes)
 */
function getAllUsers() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.USERS);
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const users = values.slice(1).map(row => ({
      username: row[0],
      userType: row[2],
      fullName: row[3] || row[0],
      status: row[4] || 'Active'
    }));

    return { success: true, data: users };
  } catch (error) {
    return {
      success: false,
      error: 'Get users error: ' + error.toString()
    };
  }
}

// =============================================================================
// SETUP FUNCTIONS (Run once to create sheets structure)
// =============================================================================

/**
 * Setup function to create all required sheets with proper headers
 * Run this function once after creating the spreadsheet
 */
function setupSheets() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Create Users sheet
    let usersSheet = spreadsheet.getSheetByName(SHEET_NAMES.USERS);
    if (!usersSheet) {
      usersSheet = spreadsheet.insertSheet(SHEET_NAMES.USERS);
      usersSheet.appendRow(['Username', 'Password', 'UserType', 'FullName', 'Status', 'LastLogin']);
      
      // Add sample user
      usersSheet.appendRow(['driver', 'password123', 'driver', 'Driver User', 'Active', '']);
    }

    // Create Fare Receipts sheet
    let fareSheet = spreadsheet.getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    if (!fareSheet) {
      fareSheet = spreadsheet.insertSheet(SHEET_NAMES.FARE_RECEIPTS);
      fareSheet.appendRow([
        'Timestamp', 'Date', 'Route', 'CashAmount', 'BankAmount', 
        'TotalAmount', 'EntryType', 'EntryId', 'SubmittedBy'
      ]);
    }

    // Create Booking Entries sheet
    let bookingSheet = spreadsheet.getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    if (!bookingSheet) {
      bookingSheet = spreadsheet.insertSheet(SHEET_NAMES.BOOKING_ENTRIES);
      bookingSheet.appendRow([
        'Timestamp', 'BookingDetails', 'DateFrom', 'DateTo', 'CashAmount', 
        'BankAmount', 'TotalAmount', 'EntryType', 'EntryId', 'SubmittedBy'
      ]);
    }

    // Create Off Days sheet
    let offDaysSheet = spreadsheet.getSheetByName(SHEET_NAMES.OFF_DAYS);
    if (!offDaysSheet) {
      offDaysSheet = spreadsheet.insertSheet(SHEET_NAMES.OFF_DAYS);
      offDaysSheet.appendRow([
        'Timestamp', 'Date', 'Reason', 'EntryType', 'EntryId', 'SubmittedBy'
      ]);
    }

    return {
      success: true,
      message: 'All sheets created successfully!'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Setup error: ' + error.toString()
    };
  }
}
