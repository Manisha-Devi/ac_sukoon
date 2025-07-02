// AC Sukoon Transport Management - Google Apps Script API
// Complete Clean Code

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

// Updated Google Apps Script Code for New Sheet Structure

// Fare Receipts Functions
function addFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.date, // B: Date
      data.route, // C: Route
      data.cashAmount || 0, // D: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0, // E: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0, // F: TotalAmount
      "daily", // G: EntryType
      data.id || Date.now(), // H: EntryId
      data.submittedBy || "", // I: SubmittedBy
    ]);

    return { success: true, message: "Fare receipt added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add fare receipt error: " + error.toString(),
    };
  }
}

function getFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[7] || index + 2, // H: EntryId
      timestamp: row[0], // A: Timestamp
      date: row[1], // B: Date
      route: row[2], // C: Route
      cashAmount: row[3], // D: CashAmount
      bankAmount: row[4], // E: BankAmount
      totalAmount: row[5], // F: TotalAmount
      entryType: row[6], // G: EntryType
      submittedBy: row[8], // I: SubmittedBy
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get fare receipts error: " + error.toString(),
    };
  }
}

// Booking Entries Functions
function addBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.bookingDetails || "", // B: BookingDetails
      data.dateFrom, // C: DateFrom
      data.dateTo, // D: DateTo
      data.cashAmount || 0, // E: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0, // F: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0, // G: TotalAmount
      "booking", // H: EntryType
      data.id || Date.now(), // I: EntryId
      data.submittedBy || "", // J: SubmittedBy
    ]);

    return { success: true, message: "Booking entry added successfully" };
  } catch (error) {
    return {
      success: false,
      error: "Add booking entry error: " + error.toString(),
    };
  }
}

function getBookingEntries() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[8] || index + 2, // I: EntryId
      timestamp: row[0], // A: Timestamp
      bookingDetails: row[1], // B: BookingDetails
      dateFrom: row[2], // C: DateFrom
      dateTo: row[3], // D: DateTo
      cashAmount: row[4], // E: CashAmount
      bankAmount: row[5], // F: BankAmount
      totalAmount: row[6], // G: TotalAmount
      entryType: row[7], // H: EntryType
      submittedBy: row[9], // J: SubmittedBy
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get booking entries error: " + error.toString(),
    };
  }
}

// Off Days Functions (Simplified - Only Date and Reason)
function addOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.date, // B: Date
      data.reason || "", // C: Reason (Required as per user request)
      "off", // D: EntryType
      data.id || Date.now(), // E: EntryId
      data.submittedBy || "", // F: SubmittedBy
    ]);

    return { success: true, message: "Off day added successfully" };
  } catch (error) {
    return { success: false, error: "Add off day error: " + error.toString() };
  }
}

function getOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[4] || index + 2, // E: EntryId
      timestamp: row[0], // A: Timestamp
      date: row[1], // B: Date
      reason: row[2], // C: Reason
      entryType: row[3], // D: EntryType
      submittedBy: row[5], // F: SubmittedBy
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: "Get off days error: " + error.toString() };
  }
}
