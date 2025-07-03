// AC Sukoon Transport Management - Google Apps Script API
// Organized by Entry Types with Complete CRUD Operations

// IMPORTANT: Replace this with your actual Google Sheets ID
const SPREADSHEET_ID = "1bM61ei_kP2QdBQQyRN_d00aOAu0qcWACleOidEmhzgM";

// Sheet names - must match exactly
const SHEET_NAMES = {
  USERS: "Users",
  FARE_RECEIPTS: "FareReceipts",
  BOOKING_ENTRIES: "BookingEntries",
  OFF_DAYS: "OffDays",
};

// ======= MAIN HANDLERS =======

// Handle OPTIONS requests for CORS
function doOptions() {
  return ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.TEXT,
  );
}

// Main POST handler
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received");
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;

    switch (action) {
      // Authentication
      case "login":
        result = handleLogin(data);
        break;
      case "test":
        result = testConnection();
        break;

      // Fare Receipts (Daily Entries) - Complete CRUD
      case "addFareReceipt":
        result = addFareReceipt(data);
        break;
      case "getFareReceipts":
        result = getFareReceipts();
        break;
      case "updateFareReceipt":
        result = updateFareReceipt(data);
        break;
      case "deleteFareReceipt":
        result = deleteFareReceipt(data);
        break;

      // Booking Entries - Complete CRUD
      case "addBookingEntry":
        result = addBookingEntry(data);
        break;
      case "getBookingEntries":
        result = getBookingEntries();
        break;
      case "updateBookingEntry":
        result = updateBookingEntry(data);
        break;
      case "deleteBookingEntry":
        result = deleteBookingEntry(data);
        break;

      // Off Days - Complete CRUD
      case "addOffDay":
        result = addOffDay(data);
        break;
      case "getOffDays":
        result = getOffDays();
        break;
      case "updateOffDay":
        result = updateOffDay(data);
        break;
      case "deleteOffDay":
        result = deleteOffDay(data);
        break;

      // Legacy Update/Delete (for backward compatibility)
      case "updateFareEntry":
        result = updateFareEntryLegacy(data);
        break;
      case "deleteFareEntry":
        result = deleteFareEntryLegacy(data);
        break;

      default:
        result = { success: false, error: "Invalid action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "Server Error: " + error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Main GET handler
function doGet(e) {
  try {
    if (!e || !e.parameter || !e.parameter.action) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "No action parameter provided",
        }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const action = e.parameter.action;
    let result;

    switch (action) {
      case "test":
        result = testConnection();
        break;
      case "getFareReceipts":
        result = getFareReceipts();
        break;
      case "getBookingEntries":
        result = getBookingEntries();
        break;
      case "getOffDays":
        result = getOffDays();
        break;
      default:
        result = { success: false, error: "Invalid GET action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: "GET Error: " + error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ======= AUTHENTICATION & UTILITY =======

// Test Connection
function testConnection() {
  try {
    return {
      success: true,
      message: "Google Apps Script is working!"
    };
  } catch (error) {
    return {
      success: false,
      error: "Test connection error: " + error.toString()
    };
  }
}

// Helper function to format IST timestamp
function formatISTTimestamp() {
  const now = new Date();
  const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return istDate.toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    hour12: true,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// User Authentication
function handleLogin(data) {
  try {
    console.log("Login attempt:", data);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.USERS,
    );
    const values = sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {
      const sheetUsername = String(values[i][0]).trim();
      const sheetPassword = String(values[i][1]).trim();
      const inputUsername = String(data.username).trim();
      const inputPassword = String(data.password).trim();

      if (sheetUsername === inputUsername && sheetPassword === inputPassword) {
        // Update last login with IST timestamp
        const istTimestamp = data.timestamp || formatISTTimestamp();
        sheet.getRange(i + 1, 7).setValue(istTimestamp);

        return {
          success: true,
          message: "Login successful",
          user: {
            username: values[i][0],
            userType: values[i][2],
            fullName: values[i][3],
            status: values[i][4],
          },
        };
      }
    }

    return {
      success: false,
      error: "Invalid username or password"
    };
  } catch (error) {
    return { success: false, error: "Login error: " + error.toString() };
  }
}

// ======= FARE RECEIPTS (DAILY ENTRIES) - COMPLETE CRUD =======

/**
 * Add new Fare Receipt (Daily Entry)
 * Columns: A=Timestamp, B=Date, C=Route, D=CashAmount, E=BankAmount, F=TotalAmount, G=EntryType, H=EntryId, I=SubmittedBy
 */
function addFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );

    const entryId = data.entryId;

    // Store timestamp as-is from frontend (already in IST H:MM:SS AM/PM format)
    const timeOnly = data.timestamp || formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert at row 2 to keep new entries at top
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 9).setValues([[
      timeOnly, // A: Time only in IST (HH:MM:SS AM/PM)
      data.date, // B: Date from frontend in IST
      data.route, // C: Route
      data.cashAmount || 0, // D: CashAmount
      data.bankAmount || 0, // E: BankAmount
      data.totalAmount || 0, // F: TotalAmount
      "daily", // G: EntryType
      entryId, // H: EntryId (use provided ID)
      data.submittedBy || "", // I: SubmittedBy
    ]]);

    return {
        success: true,
        entryId: entryId,
        message: "Fare receipt added successfully",
        timestamp: timeOnly,
      };
  } catch (error) {
    return {
      success: false,
      error: "Add fare receipt error: " + error.toString(),
    };
  }
}

/**
 * Get all Fare Receipts (Daily Entries)
 */
function getFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
        const rowData = {
          entryId: row[7], // Entry ID from column H
          timestamp: String(row[0] || ''), // Convert timestamp to string
          date: String(row[1] || ''), // Convert date to string 
          route: row[2], // Route from column C
          cashAmount: row[3], // Cash amount from column D
          bankAmount: row[4], // Bank amount from column E
          totalAmount: row[5], // Total amount from column F
          entryType: row[6], // Static entry type
          submittedBy: row[8], // Submitted by from column I
          rowIndex: index + 2, // Store row index for updates/deletes
        };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get fare receipts error: " + error.toString(),
    };
  }
}

/**
 * Update existing Fare Receipt (Daily Entry)
 */
function updateFareReceipt(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating fare receipt:', { entryId, updatedData });

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

    // Update only provided fields - don't modify timestamp
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.route) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.route); // C: Route
    }
    if (updatedData.cashAmount !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.cashAmount); // D: CashAmount
    }
    if (updatedData.bankAmount !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.bankAmount); // E: BankAmount
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.totalAmount); // F: TotalAmount
    }

    return {
      success: true,
      message: 'Fare receipt updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update fare receipt error:', error);
    return {
      success: false,
      error: 'Update fare receipt error: ' + error.toString()
    };
  }
}

/**
 * Delete Fare Receipt (Daily Entry)
 */
function deleteFareReceipt(data) {
  try {
    const entryId = data.entryId;

    console.log('Deleting fare receipt:', { entryId });

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
    console.error('Delete fare receipt error:', error);
    return {
      success: false,
      error: 'Delete fare receipt error: ' + error.toString()
    };
  }
}

// ======= BOOKING ENTRIES - COMPLETE CRUD =======

/**
 * Add new Booking Entry
 * Columns: A=Timestamp, B=BookingDetails, C=DateFrom, D=DateTo, E=CashAmount, F=BankAmount, G=TotalAmount, H=EntryType, I=EntryId, J=SubmittedBy
 */
function addBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );

    const entryId = data.entryId;

    // Store timestamp as-is from frontend (already in IST H:MM:SS AM/PM format)
    const timeOnly = data.timestamp || formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert at row 2 to keep new entries at top
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 10).setValues([[
      timeOnly, // A: Time only in IST (HH:MM:SS AM/PM)
      data.bookingDetails || "", // B: BookingDetails
      data.dateFrom, // C: DateFrom from frontend in IST
      data.dateTo, // D: DateTo from frontend in IST
      data.cashAmount || 0, // E: CashAmount
      data.bankAmount || 0, // F: BankAmount
      data.totalAmount || 0, // G: TotalAmount
      "booking", // H: EntryType
      entryId, // I: EntryId (use provided ID)
      data.submittedBy || "", // J: SubmittedBy
    ]]);

    return {
        success: true,
        entryId: entryId,
        message: "Booking entry added successfully",
        timestamp: timeOnly,
      };
  } catch (error) {
    return {
      success: false,
      error: "Add booking entry error: " + error.toString(),
    };
  }
}

/**
 * Get all Booking Entries
 */
function getBookingEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
        const rowData = {
          entryId: row[8], // Entry ID from column I
          timestamp: String(row[0] || ''), // Convert timestamp to string
          bookingDetails: row[1], // Booking details from column B
          dateFrom: String(row[2] || ''), // Convert date to string
          dateTo: String(row[3] || ''), // Convert date to string
          cashAmount: row[4], // Cash amount from column E
          bankAmount: row[5], // Bank amount from column F
          totalAmount: row[6], // Total amount from column G
          entryType: row[7], // Static entry type
          submittedBy: row[9], // Submitted by from column J
          rowIndex: index + 2, // Store row index for updates/deletes
        };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get booking entries error: " + error.toString(),
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

    console.log('Updating booking entry:', { entryId, updatedData });

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

    // Update only provided fields - don't modify timestamp
    if (updatedData.bookingDetails) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.bookingDetails); // B: BookingDetails
    }
    if (updatedData.dateFrom) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.dateFrom); // C: DateFrom
    }
    if (updatedData.dateTo) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.dateTo); // D: DateTo
    }
    if (updatedData.cashAmount !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.cashAmount); // E: CashAmount
    }
    if (updatedData.bankAmount !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.bankAmount); // F: BankAmount
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.totalAmount); // G: TotalAmount
    }

    return {
      success: true,
      message: 'Booking entry updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update booking entry error:', error);
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

    console.log('Deleting booking entry:', { entryId });

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
    console.error('Delete booking entry error:', error);
    return {
      success: false,
      error: 'Delete booking entry error: ' + error.toString()
    };
  }
}

// ======= OFF DAYS - COMPLETE CRUD =======

/**
 * Add new Off Day
 * Columns: A=Timestamp, B=Date, C=Reason, D=EntryType, E=EntryId, F=SubmittedBy
 */
function addOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );

    const entryId = data.entryId;

    // Store timestamp as-is from frontend (already in IST H:MM:SS AM/PM format)
    const timeOnly = data.timestamp || formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert at row 2 to keep new entries at top
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 6).setValues([[
      timeOnly, // A: Time only in IST (HH:MM:SS AM/PM)
      data.date, // B: Date from frontend in IST
      data.reason || "", // C: Reason
      "off", // D: EntryType
      entryId, // E: EntryId (use provided ID)
      data.submittedBy || "", // F: SubmittedBy
    ]]);

    return {
        success: true,
        entryId: entryId,
        message: "Off day added successfully",
        timestamp: timeOnly,
      };
  } catch (error) {
    return { success: false, error: "Add off day error: " + error.toString() };
  }
}

/**
 * Get all Off Days
 */
function getOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
      const rowData = {
        entryId: row[4], // Entry ID from column E
        timestamp: String(row[0] || ''), // Convert timestamp to string
        date: String(row[1] || ''), // Convert date to string
        reason: row[2], // Reason from column C
        entryType: row[3], // Static entry type
        submittedBy: row[5], // Submitted by from column F
        rowIndex: index + 2, // Store row index for updates/deletes
      };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: "Get off days error: " + error.toString() };
  }
}

/**
 * Update existing Off Day
 */
function updateOffDay(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating off day:', { entryId, updatedData });

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

    // Update only provided fields - don't modify timestamp
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.reason) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.reason); // C: Reason
    }

    return {
      success: true,
      message: 'Off day updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update off day error:', error);
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

    console.log('Deleting off day:', { entryId });

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
    console.error('Delete off day error:', error);
    return {
      success: false,
      error: 'Delete off day error: ' + error.toString()
    };
  }
}

// ======= LEGACY FUNCTIONS (For Backward Compatibility) =======

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