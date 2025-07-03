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

      // Adda Payments - Complete CRUD
      case "addAddaPayment":
        result = addAddaPayment(data);
        break;
      case "getAddaPayments":
        result = getAddaPayments();
        break;
      case "updateAddaPayment":
        result = updateAddaPayment(data);
        break;
      case "deleteAddaPayment":
        result = deleteAddaPayment(data);
        break;

      // Fuel Payments - Complete CRUD
      case "addFuelPayment":
        result = addFuelPayment(data);
        break;
      case "getFuelPayments":
        result = getFuelPayments();
        break;
      case "updateFuelPayment":
        result = updateFuelPayment(data);
        break;
      case "deleteFuelPayment":
        result = deleteFuelPayment(data);
        break;

      // Union Payments - Complete CRUD
      case "addUnionPayment":
        result = addUnionPayment(data);
        break;
      case "getUnionPayments":
        result = getUnionPayments();
        break;
      case "updateUnionPayment":
        result = updateUnionPayment(data);
        break;
      case "deleteUnionPayment":
        result = deleteUnionPayment(data);
        break;

      // Service Payments - Complete CRUD
      case "addServicePayment":
        result = addServicePayment(data);
        break;
      case "getServicePayments":
        result = getServicePayments();
        break;
      case "updateServicePayment":
        result = updateServicePayment(data);
        break;
      case "deleteServicePayment":
        result = deleteServicePayment(data);
        break;

      // Other Payments - Complete CRUD
      case "addOtherPayment":
        result = addOtherPayment(data);
        break;
      case "getOtherPayments":
        result = getOtherPayments();
        break;
      case "updateOtherPayment":
        result = updateOtherPayment(data);
        break;
      case "deleteOtherPayment":
        result = deleteOtherPayment(data);
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
      case "getFuelPayments":
        result = getFuelPayments();
        break;
      case "getUnionPayments":
        result = getUnionPayments();
        break;
      case "getServicePayments":
        result = getServicePayments();
        break;
      case "getOtherPayments":
        result = getOtherPayments();
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

// ======= ADDA PAYMENTS - COMPLETE CRUD =======

/**
 * Add new Adda Payment
 * Columns: A=Timestamp, B=Date, C=AddaName, D=CashAmount, E=BankAmount, F=TotalAmount, G=Remarks, H=SubmittedBy, I=EntryType, J=EntryId
 */
function addAddaPayment(data) {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("AddaPayments");

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet("AddaPayments");
      // Add headers exactly as you specified
      sheet.getRange(1, 1, 1, 10).setValues([[
        "AddaPayments Timestamp", "Date", "AddaName", "CashAmount", "BankAmount", "TotalAmount", "Remarks", "SubmittedBy", "EntryType", "EntryId"
      ]]);
    }

    const entryId = data.entryId;
    const timeOnly = data.timestamp || formatISTTimestamp().split(' ')[1] + ' ' + formatISTtimestamp().split(' ')[2];

    // Insert at row 2 to keep new entries at top
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 10).setValues([[
      timeOnly, // A: Time only in IST (HH:MM:SS AM/PM)
      data.date, // B: Date from frontend in IST
      data.addaName || "", // C: AddaName
      data.cashAmount || 0, // D: CashAmount
      data.bankAmount || 0, // E: BankAmount
      data.totalAmount || 0, // F: TotalAmount
      data.remarks || "", // G: Remarks
      data.submittedBy || "", // H: SubmittedBy
      "adda", // I: EntryType
      entryId, // J: EntryId
    ]]);

    return {
      success: true,
      entryId: entryId,
      message: "Adda payment added successfully",
      timestamp: timeOnly,
    };
  } catch (error) {
    return {
      success: false,
      error: "Add adda payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Adda Payments
 */
function getAddaPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("AddaPayments");

    if (!sheet) {
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
      const rowData = {
        entryId: row[9], // Entry ID from column J
        timestamp: String(row[0] || ''), // Convert timestamp to string
        date: String(row[1] || ''), // Convert date to string
        addaName: row[2], // Adda name from column C
        cashAmount: row[3], // Cash amount from column D
        bankAmount: row[4], // Bank amount from column E
        totalAmount: row[5], // Total amount from column F
        remarks: row[6], // Remarks from column G
        submittedBy: row[7], // Submitted by from column H
        entryType: row[8], // Entry type from column I
        rowIndex: index + 2, // Store row index for updates/deletes
      };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get adda payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Adda Payment
 */
function updateAddaPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating adda payment:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("AddaPayments");

    if (!sheet) {
      throw new Error('AddaPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J

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
      throw new Error('Adda payment not found with ID: ' + entryId);
    }

    // Update only provided fields - don't modify timestamp
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.addaName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.addaName); // C: AddaName
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
    if (updatedData.remarks !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.remarks); // I: Remarks
    }

    return {
      success: true,
      message: 'Adda payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update adda payment error:', error);
    return {
      success: false,
      error: 'Update adda payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Adda Payment
 */
function deleteAddaPayment(data) {
  try {
    const entryId = data.entryId;

    console.log('Deleting adda payment:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("AddaPayments");

    if (!sheet) {
      throw new Error('AddaPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J

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
      throw new Error('Adda payment not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Adda payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete adda payment error:', error);
    return {
      success: false,
      error: 'Delete adda payment error: ' + error.toString()
    };
  }
}

// ======= FUEL PAYMENTS - COMPLETE CRUD =======

/**
 * Add new Fuel Payment
 * Columns: A=Timestamp, B=Date, C=PumpName, D=Liters, E=RatePerLiter, F=CashAmount, G=BankAmount, H=TotalAmount, I=Remarks, J=SubmittedBy, K=EntryType, L=EntryId
 */
function addFuelPayment(data) {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("FuelPayments");

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet("FuelPayments");
      // Add headers exactly as you specified
      sheet.getRange(1, 1, 1, 12).setValues([[
        "Timestamp", "Date", "PumpName", "Liters", "RatePerLiter", "CashAmount", "BankAmount", "TotalAmount", "Remarks", "SubmittedBy", "EntryType", "EntryId"
      ]]);
    }

    const entryId = data.entryId;
    const timeOnly = data.timestamp || formatISTTimestamp().split(' ')[1] + ' ' + formatISTtimestamp().split(' ')[2];

    // Insert at row 2 to keep new entries at top
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 12).setValues([[
      timeOnly, // A: Time only in IST (HH:MM:SS AM/PM)
      data.date, // B: Date from frontend in IST
      data.pumpName || "", // C: PumpName
      data.liters || "", // D: Liters
      data.rate || "", // E: RatePerLiter
      data.cashAmount || 0, // F: CashAmount
      data.bankAmount || 0, // G: BankAmount
      data.totalAmount || 0, // H: TotalAmount
      data.remarks || "", // I: Remarks
      data.submittedBy || "", // J: SubmittedBy
      "fuel", // K: EntryType
      entryId, // L: EntryId
    ]]);

    return {
      success: true,
      entryId: entryId,
      message: "Fuel payment added successfully",
      timestamp: timeOnly,
    };
  } catch (error) {
    return {
      success: false,
      error: "Add fuel payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Fuel Payments
 */
function getFuelPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("FuelPayments");

    if (!sheet) {
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
      const rowData = {
        entryId: row[11], // Entry ID from column L
        timestamp: String(row[0] || ''), // Convert timestamp to string
        date: String(row[1] || ''), // Convert date to string
        pumpName: row[2], // Pump name from column C
        liters: row[3], // Liters from column D
        rate: row[4], // Rate from column E (RatePerLiter)
        cashAmount: row[5], // Cash amount from column F
        bankAmount: row[6], // Bank amount from column G
        totalAmount: row[7], // Total amount from column H
        remarks: row[8], // Remarks from column I
        submittedBy: row[9], // Submitted by from column J
        entryType: row[10], // Entry type from column K
        rowIndex: index + 2, // Store row index for updates/deletes
      };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get fuel payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Fuel Payment
 */
function updateFuelPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating fuel payment:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("FuelPayments");

    if (!sheet) {
      throw new Error('FuelPayments sheet not found');
    }

    const entryIdColumn = 12; // Column L

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
      throw new Error('Fuel payment not found with ID: ' + entryId);
    }

    // Update only provided fields - don't modify timestamp
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.pumpName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.pumpName); // C: PumpName
    }
    if (updatedData.liters !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.liters); // D: Liters
    }
    if (updatedData.rate !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.rate); // E: RatePerLiter
    }
    if (updatedData.cashAmount !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.cashAmount); // F: CashAmount
    }
    if (updatedData.bankAmount !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.bankAmount); // G: BankAmount
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 8).setValue(updatedData.totalAmount); // H: TotalAmount
    }
    if (updatedData.remarks !== undefined) {
      sheet.getRange(rowIndex, 9).setValue(updatedData.remarks); // I: Remarks
    }

    return {
      success: true,
      message: 'Fuel payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update fuel payment error:', error);
    return {
      success: false,
      error: 'Update fuel payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Fuel Payment
 */
function deleteFuelPayment(data) {
  try {
    const entryId = data.entryId;

    console.log('Deleting fuel payment:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("FuelPayments");

    if (!sheet) {
      throw new Error('FuelPayments sheet not found');
    }

    const entryIdColumn = 12; // Column L

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
      throw new Error('Fuel payment not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Fuel payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete fuel payment error:', error);
    return {
      success: false,
      error: 'Delete fuel payment error: ' + error.toString()
    };
  }
}

// ======= UNION PAYMENTS - COMPLETE CRUD =======

/**
 * Add new Union Payment
 * Columns: A=Timestamp, B=Date, C=UnionName, D=CashAmount, E=BankAmount, F=TotalAmount, G=Remarks, H=SubmittedBy, I=EntryType, J=EntryId
 */
function addUnionPayment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("UnionPayments");

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryId = data.entryId || Date.now();
    const timeOnly = data.timestamp;
    const dateOnly = data.date;
    const unionName = data.unionName || '';
    const cashAmount = data.cashAmount || 0;
    const bankAmount = data.bankAmount || 0;
    const totalAmount = data.totalAmount || 0;
    const remarks = data.remarks || '';
    const submittedBy = data.submittedBy || 'driver';
    const entryType = 'union';

    console.log('Adding union payment:', {
      entryId, timeOnly, dateOnly, unionName, cashAmount, bankAmount, totalAmount, remarks, submittedBy
    });

    const rowData = [
      timeOnly, dateOnly, unionName, cashAmount, bankAmount, totalAmount, remarks, submittedBy, entryType, entryId
    ];

    sheet.appendRow(rowData);

    return {
      success: true,
      entryId: entryId,
      message: "Union payment added successfully",
      timestamp: timeOnly,
    };
  } catch (error) {
    return {
      success: false,
      error: "Add union payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Union Payments
 */
function getUnionPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("UnionPayments");

    if (!sheet) {
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
      const rowData = {
        entryId: row[9], // Entry ID from column J
        timestamp: String(row[0] || ''), // Convert timestamp to string
        date: String(row[1] || ''), // Convert date to string
        unionName: row[2], // Union name from column C
        cashAmount: row[3], // Cash amount from column D
        bankAmount: row[4], // Bank amount from column E
        totalAmount: row[5], // Total amount from column F
        remarks: row[6], // Remarks from column G
        submittedBy: row[7], // Submitted by from column H
        entryType: row[8], // Entry type from column I
        rowIndex: index + 2, // Store row index for updates/deletes
      };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get union payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Union Payment
 */
function updateUnionPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating union payment:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("UnionPayments");

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J

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
      throw new Error('Union payment not found with ID: ' + entryId);
    }

    // Update only provided fields - don't modify timestamp
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.unionName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.unionName); // C: UnionName
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
    if (updatedData.remarks !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.remarks); // G: Remarks
    }

    return {
      success: true,
      message: 'Union payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update union payment error:', error);
    return {
      success: false,
      error: 'Update union payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Union Payment
 */
function deleteUnionPayment(data) {
  try {
    const entryId = data.entryId;

    console.log('Deleting union payment:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("UnionPayments");

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J

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
      throw new Error('Union payment not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Union payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete union payment error:', error);
    return {
      success: false,
      error: 'Delete union payment error: ' + error.toString()
    };
  }
}

// ======= SERVICE PAYMENTS - COMPLETE CRUD =======

/**
 * Add new Service Payment
 * Columns: A=Timestamp, B=Date, C=ServiceType, D=CashAmount, E=BankAmount, F=TotalAmount, G=ServiceDetails, H=SubmittedBy, I=EntryType, J=EntryId
 */
function addServicePayment(data) {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("ServicePayments");

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet("ServicePayments");
      // Add headers exactly as you specified
      sheet.getRange(1, 1, 1, 10).setValues([[
        "Timestamp", "Date", "ServiceType", "CashAmount", "BankAmount", "TotalAmount", "ServiceDetails", "SubmittedBy", "EntryType", "EntryId"
      ]]);
    }

    const entryId = data.entryId;
    const timeOnly = data.timestamp || formatISTTimestamp().split(' ')[1] + ' ' + formatISTtimestamp().split(' ')[2];

    // Insert at row 2 to keep new entries at top
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 10).setValues([[
      timeOnly, // A: Time only in IST (HH:MM:SS AM/PM)
      data.date, // B: Date from frontend in IST
      data.serviceType || "", // C: ServiceType
      data.cashAmount || 0, // D: CashAmount
      data.bankAmount || 0, // E: BankAmount
      data.totalAmount || 0, // F: TotalAmount
      data.serviceDetails || "", // G: ServiceDetails
      data.submittedBy || "", // H: SubmittedBy
      "service", // I: EntryType
      entryId, // J: EntryId
    ]]);

    return {
      success: true,
      entryId: entryId,
      message: "Service payment added successfully",
      timestamp: timeOnly,
    };
  } catch (error) {
    return {
      success: false,
      error: "Add service payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Service Payments
 */
function getServicePayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("ServicePayments");

    if (!sheet) {
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
      const rowData = {
        entryId: row[9], // Entry ID from column J
        timestamp: String(row[0] || ''), // Convert timestamp to string
        date: String(row[1] || ''), // Convert date to string
        serviceType: row[2], // Service type from column C
        cashAmount: row[3], // Cash amount from column D
        bankAmount: row[4], // Bank amount from column E
        totalAmount: row[5], // Total amount from column F
        serviceDetails: row[6], // Service details from column G
        submittedBy: row[7], // Submitted by from column H
        entryType: row[8], // Entry type from column I
        rowIndex: index + 2, // Store row index for updates/deletes
      };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get service payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Service Payment
 */
function updateServicePayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating service payment:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("ServicePayments");

    if (!sheet) {
      throw new Error('ServicePayments sheet not found');
    }

    const entryIdColumn = 10; // Column J

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
      throw new Error('Service payment not found with ID: ' + entryId);
    }

    // Update only provided fields - don't modify timestamp
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.serviceType !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.serviceType); // C: ServiceType
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
    if (updatedData.serviceDetails !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.serviceDetails); // G: ServiceDetails
    }

    return {
      success: true,
      message: 'Service payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update service payment error:', error);
    return {
      success: false,
      error: 'Update service payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Service Payment
 */
function deleteServicePayment(data) {
  try {
    const entryId = data.entryId;

    console.log('Deleting service payment:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("ServicePayments");

    if (!sheet) {
      throw new Error('ServicePayments sheet not found');
    }

    const entryIdColumn = 10; // Column J

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
      throw new Error('Service payment not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Service payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete service payment error:', error);
    return {
      success: false,
      error: 'Delete service payment error: ' + error.toString()
    };
  }
}

// ======= OTHER PAYMENTS - COMPLETE CRUD =======

/**
 * Add new Other Payment
 * Columns: A=Timestamp, B=Date, C=PaymentType, D=Description, E=CashAmount, F=BankAmount, G=TotalAmount, H=Category, I=SubmittedBy, J=EntryType, K=EntryId
 */
function addOtherPayment(data) {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("OtherPayments");

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet("OtherPayments");
      // Add headers exactly as you specified
      sheet.getRange(1, 1, 1, 11).setValues([[
        "Timestamp", "Date", "PaymentType", "Description", "CashAmount", "BankAmount", "TotalAmount", "Category", "SubmittedBy", "EntryType", "EntryId"
      ]]);
    }

    const entryId = data.entryId;
    const timeOnly = data.timestamp || formatISTTimestamp().split(' ')[1] + ' ' + formatISTtimestamp().split(' ')[2];

    // Insert at row 2 to keep new entries at top
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 11).setValues([[
      timeOnly, // A: Time only in IST (HH:MM:SS AM/PM)
      data.date, // B: Date from frontend in IST
      data.paymentType || "", // C: PaymentType
      data.description || "", // D: Description
      data.cashAmount || 0, // E: CashAmount
      data.bankAmount || 0, // F: BankAmount
      data.totalAmount || 0, // G: TotalAmount
      data.category || "", // H: Category
      data.submittedBy || "", // I: SubmittedBy
      "other", // J: EntryType
      entryId, // K: EntryId
    ]]);

    return {
      success: true,
      entryId: entryId,
      message: "Other payment added successfully",
      timestamp: timeOnly,
    };
  } catch (error) {
    return {
      success: false,
      error: "Add other payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Other Payments
 */
function getOtherPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("OtherPayments");

    if (!sheet) {
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
      const rowData = {
        entryId: row[10], // Entry ID from column K
        timestamp: String(row[0] || ''), // Convert timestamp to string
        date: String(row[1] || ''), // Convert date to string
        paymentType: row[2], // Payment type from column C
        description: row[3], // Description from column D
        cashAmount: row[4], // Cash amount from column E
        bankAmount: row[5], // Bank amount from column F
        totalAmount: row[6], // Total amount from column G
        category: row[7], // Category from column H
        submittedBy: row[8], // Submitted by from column I
        entryType: row[9], // Entry type from column J
        rowIndex: index + 2, // Store row index for updates/deletes
      };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get other payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Other Payment
 */
function updateOtherPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating other payment:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("OtherPayments");

    if (!sheet) {
      throw new Error('OtherPayments sheet not found');
    }

    const entryIdColumn = 11; // Column K

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
      throw new Error('Other payment not found with ID: ' + entryId);
    }

    // Update only provided fields - don't modify timestamp
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.paymentType !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.paymentType); // C: PaymentType
    }
    if (updatedData.description !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.description); // D: Description
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
    if (updatedData.category !== undefined) {
      sheet.getRange(rowIndex, 8).setValue(updatedData.category); // H: Category
    }

    return {
      success: true,
      message: 'Other payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update other payment error:', error);
    return {
      success: false,
      error: 'Update other payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Other Payment
 */
function deleteOtherPayment(data) {
  try {
    const entryId = data.entryId;

    console.log('Deleting other payment:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("OtherPayments");

    if (!sheet) {
      throw new Error('OtherPayments sheet not found');
    }

    const entryIdColumn = 11; // Column K

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
      throw new Error('Other payment not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Other payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete other payment error:', error);
    return {
      success: false,
      error: 'Delete other payment error: ' + error.toString()
    };
  }
}

//// ======= LEGACY FUNCTIONS (For Backward Compatibility) =======

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