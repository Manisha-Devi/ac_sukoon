
// AC Sukoon Transport Management - Google Apps Script API
// Complete Clean Code with Update & Delete Features

// IMPORTANT: Replace this with your actual Google Sheets ID
const SPREADSHEET_ID = "1bM61ei_kP2QdBQQyRN_d00aOAu0qcWACleOidEmhzgM";

// Sheet names - must match exactly
const SHEET_NAMES = {
  USERS: "Users",
  FARE_RECEIPTS: "FareReceipts",
  BOOKING_ENTRIES: "BookingEntries",
  OFF_DAYS: "OffDays",
};

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
      case "login":
        result = handleLogin(data);
        break;
      case "addFareReceipt":
        result = addFareReceipt(data);
        break;
      case "getFareReceipts":
        result = getFareReceipts();
        break;
      case "addBookingEntry":
        result = addBookingEntry(data);
        break;
      case "getBookingEntries":
        result = getBookingEntries();
        break;
      case "addOffDay":
        result = addOffDay(data);
        break;
      case "getOffDays":
        result = getOffDays();
        break;
      case "updateFareEntry":
        result = updateFareEntry(data);
        break;
      case "deleteFareEntry":
        result = deleteFareEntry(data);
        break;
      case "test":
        result = testConnection();
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

// Test Connection
function testConnection() {
  try {
    return {
      success: true,
      message: "Google Apps Script is working!",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: "Test connection error: " + error.toString()
    };
  }
}

// Authentication
function handleLogin(data) {
  try {
    console.log("Login attempt:", data);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.USERS,
    );
    const values = sheet.getDataRange().getValues();

    console.log("Sheet data:", values);
    console.log(
      "Looking for username:",
      data.username,
      "password:",
      data.password,
    );

    for (let i = 1; i < values.length; i++) {
      console.log("Checking row", i, ":", values[i][0], values[i][1]);

      // Convert to string and trim whitespace
      const sheetUsername = String(values[i][0]).trim();
      const sheetPassword = String(values[i][1]).trim();
      const inputUsername = String(data.username).trim();
      const inputPassword = String(data.password).trim();

      console.log(
        "Comparing:",
        sheetUsername,
        "===",
        inputUsername,
        "&&",
        sheetPassword,
        "===",
        inputPassword,
      );

      if (sheetUsername === inputUsername && sheetPassword === inputPassword) {
        // Update last login
        sheet.getRange(i + 1, 7).setValue(new Date());

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
      error: "Invalid username or password",
      debug: {
        receivedUsername: data.username,
        receivedPassword: data.password,
        sheetData: values
          .slice(1)
          .map((row) => ({ username: row[0], password: row[1] })),
      },
    };
  } catch (error) {
    return { success: false, error: "Login error: " + error.toString() };
  }
}

// ======= FARE RECEIPTS FUNCTIONS =======

// Add Fare Receipt
function addFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );

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
      data.submittedBy || "", // I: SubmittedBy
    ]);

    return { 
      success: true, 
      message: "Fare receipt added successfully",
      entryId: entryId
    };
  } catch (error) {
    return {
      success: false,
      error: "Add fare receipt error: " + error.toString(),
    };
  }
}

// Get Fare Receipts
function getFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );
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
      rowIndex: index + 2, // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get fare receipts error: " + error.toString(),
    };
  }
}

// ======= BOOKING ENTRIES FUNCTIONS =======

// Add Booking Entry
function addBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );

    const entryId = data.id || Date.now();

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.bookingDetails || "", // B: BookingDetails
      data.dateFrom, // C: DateFrom
      data.dateTo, // D: DateTo
      data.cashAmount || 0, // E: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0, // F: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0, // G: TotalAmount
      "booking", // H: EntryType
      entryId, // I: EntryId
      data.submittedBy || "", // J: SubmittedBy
    ]);

    return { 
      success: true, 
      message: "Booking entry added successfully",
      entryId: entryId
    };
  } catch (error) {
    return {
      success: false,
      error: "Add booking entry error: " + error.toString(),
    };
  }
}

// Get Booking Entries
function getBookingEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );
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
      rowIndex: index + 2, // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get booking entries error: " + error.toString(),
    };
  }
}

// ======= OFF DAYS FUNCTIONS =======

// Add Off Day
function addOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );

    const entryId = data.id || Date.now();

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.date, // B: Date
      data.reason || "", // C: Reason (Required as per user request)
      "off", // D: EntryType
      entryId, // E: EntryId
      data.submittedBy || "", // F: SubmittedBy
    ]);

    return { 
      success: true, 
      message: "Off day added successfully",
      entryId: entryId
    };
  } catch (error) {
    return { success: false, error: "Add off day error: " + error.toString() };
  }
}

// Get Off Days
function getOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[4] || (index + 2), // E: EntryId
      timestamp: row[0], // A: Timestamp
      date: row[1], // B: Date
      reason: row[2], // C: Reason
      entryType: row[3], // D: EntryType
      submittedBy: row[5], // F: SubmittedBy
      rowIndex: index + 2, // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: "Get off days error: " + error.toString() };
  }
}

// ======= UPDATE FUNCTIONS =======

// Universal Update Function
function updateFareEntry(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;
    const entryType = data.entryType;
    
    console.log('Updating entry:', { entryId, entryType, updatedData });

    let sheet;
    let entryIdColumn;
    let updateFunction;

    // Determine which sheet and update function to use
    if (entryType === 'daily') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
      entryIdColumn = 8; // Column H
      updateFunction = updateFareReceiptRow;
    } else if (entryType === 'booking') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
      entryIdColumn = 9; // Column I
      updateFunction = updateBookingEntryRow;
    } else if (entryType === 'off') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
      entryIdColumn = 5; // Column E
      updateFunction = updateOffDayRow;
    } else {
      throw new Error('Invalid entry type: ' + entryType);
    }

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
      throw new Error('Entry not found with ID: ' + entryId);
    }

    // Update the specific row using the appropriate function
    updateFunction(sheet, rowIndex, updatedData);

    return {
      success: true,
      message: 'Entry updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update error:', error);
    return {
      success: false,
      error: 'Update entry error: ' + error.toString()
    };
  }
}

// Update Fare Receipt Row
function updateFareReceiptRow(sheet, rowIndex, updatedData) {
  // Update specific columns for Fare Receipt
  if (updatedData.date) {
    sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
  }
  if (updatedData.route) {
    sheet.getRange(rowIndex, 3).setValue(updatedData.route); // C: Route
  }
  if (updatedData.totalAmount !== undefined) {
    sheet.getRange(rowIndex, 6).setValue(updatedData.totalAmount); // F: TotalAmount
  }
  // Update timestamp to show when it was modified
  sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp
}

// Update Booking Entry Row
function updateBookingEntryRow(sheet, rowIndex, updatedData) {
  // Update specific columns for Booking Entry
  if (updatedData.bookingDetails) {
    sheet.getRange(rowIndex, 2).setValue(updatedData.bookingDetails); // B: BookingDetails
  }
  if (updatedData.dateFrom) {
    sheet.getRange(rowIndex, 3).setValue(updatedData.dateFrom); // C: DateFrom
  }
  if (updatedData.dateTo) {
    sheet.getRange(rowIndex, 4).setValue(updatedData.dateTo); // D: DateTo
  }
  if (updatedData.totalAmount !== undefined) {
    sheet.getRange(rowIndex, 7).setValue(updatedData.totalAmount); // G: TotalAmount
  }
  // Update timestamp
  sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp
}

// Update Off Day Row
function updateOffDayRow(sheet, rowIndex, updatedData) {
  // Update specific columns for Off Day
  if (updatedData.date) {
    sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
  }
  if (updatedData.reason) {
    sheet.getRange(rowIndex, 3).setValue(updatedData.reason); // C: Reason
  }
  // Update timestamp
  sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp
}

// ======= DELETE FUNCTIONS =======

// Universal Delete Function
function deleteFareEntry(data) {
  try {
    const entryId = data.entryId;
    const entryType = data.entryType;
    
    console.log('Deleting entry:', { entryId, entryType });

    let sheet;
    let entryIdColumn;

    // Determine which sheet to use
    if (entryType === 'daily') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
      entryIdColumn = 8; // Column H
    } else if (entryType === 'booking') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
      entryIdColumn = 9; // Column I
    } else if (entryType === 'off') {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
      entryIdColumn = 5; // Column E
    } else {
      throw new Error('Invalid entry type: ' + entryType);
    }

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
      throw new Error('Entry not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Entry deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: 'Delete entry error: ' + error.toString()
    };
  }
}
