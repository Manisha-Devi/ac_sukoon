
// ============================================================================
// AC SUKOON TRANSPORT MANAGEMENT - GOOGLE APPS SCRIPT API
// ============================================================================
// Complete CRUD Operations for All Entry Types
// Organized by Entry Types with Proper Comments and Error Handling
// ============================================================================

// ============================================================================
// CONFIGURATION SETTINGS
// ============================================================================

// IMPORTANT: Replace this with your actual Google Sheets ID
const SPREADSHEET_ID = "1bM61ei_kP2QdBQQyRN_d00aOAu0qcWACleOidEmhzgM";

// Sheet names configuration - must match exactly with your Google Sheets
const SHEET_NAMES = {
  USERS: "Users",                    // User authentication data
  FARE_RECEIPTS: "FareReceipts",     // Daily fare collection entries
  BOOKING_ENTRIES: "BookingEntries", // Special booking entries
  OFF_DAYS: "OffDays",               // Off day entries
  ADDA_PAYMENTS: "AddaPayments",     // Adda payment entries
  FUEL_PAYMENTS: "FuelPayments",     // Fuel payment entries
  UNION_PAYMENTS: "UnionPayments"    // Union payment entries
};

// ============================================================================
// MAIN REQUEST HANDLERS
// ============================================================================

/**
 * Handle OPTIONS requests for CORS (Cross-Origin Resource Sharing)
 * This allows web applications to make requests to this script
 */
function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Main POST request handler
 * Routes incoming requests to appropriate functions based on action parameter
 * @param {Object} e - The POST request event object
 * @returns {Object} JSON response with success/error status
 */
function doPost(e) {
  try {
    // Validate incoming request
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received in POST request");
    }

    // Parse JSON data from request body
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;

    console.log(`📥 Incoming POST request - Action: ${action}`);

    // Route request to appropriate handler based on action
    switch (action) {
      // ==================== AUTHENTICATION ====================
      case "login":
        result = handleLogin(data);
        break;
      case "test":
        result = testConnection();
        break;

      // ==================== FARE RECEIPTS (DAILY ENTRIES) ====================
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

      // ==================== BOOKING ENTRIES ====================
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

      // ==================== OFF DAYS ====================
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

      // ==================== ADDA PAYMENTS ====================
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

      // ==================== FUEL PAYMENTS ====================
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

      // ==================== UNION PAYMENTS ====================
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

      // ==================== LEGACY FUNCTIONS ====================
      case "updateFareEntry":
        result = updateFareEntryLegacy(data);
        break;
      case "deleteFareEntry":
        result = deleteFareEntryLegacy(data);
        break;

      // ==================== INVALID ACTION ====================
      default:
        result = { 
          success: false, 
          error: `Invalid action: ${action}. Please check the action parameter.` 
        };
    }

    console.log(`✅ POST request completed - Action: ${action}, Success: ${result.success}`);

    // Return JSON response
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(`❌ POST request error:`, error);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Server Error: " + error.toString(),
      timestamp: formatISTTimestamp()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main GET request handler
 * Handles simple GET requests for fetching data
 * @param {Object} e - The GET request event object
 * @returns {Object} JSON response with success/error status
 */
function doGet(e) {
  try {
    // Validate GET request parameters
    if (!e || !e.parameter || !e.parameter.action) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "No action parameter provided in GET request",
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const action = e.parameter.action;
    let result;

    console.log(`📥 Incoming GET request - Action: ${action}`);

    // Route GET request to appropriate handler
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
      case "getAddaPayments":
        result = getAddaPayments();
        break;
      case "getUnionPayments":
        result = getUnionPayments();
        break;
      default:
        result = { 
          success: false, 
          error: `Invalid GET action: ${action}` 
        };
    }

    console.log(`✅ GET request completed - Action: ${action}, Success: ${result.success}`);

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(`❌ GET request error:`, error);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "GET Error: " + error.toString(),
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test the connection to Google Apps Script
 * Used for health checks and debugging
 * @returns {Object} Success response with connection status
 */
function testConnection() {
  try {
    console.log("🔍 Testing connection to Google Apps Script...");
    
    return {
      success: true,
      message: "Google Apps Script is working!",
      timestamp: formatISTTimestamp(),
      version: "2.0.0"
    };
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    
    return {
      success: false,
      error: "Test connection error: " + error.toString()
    };
  }
}

/**
 * Format current timestamp in IST (Indian Standard Time)
 * @returns {String} Formatted timestamp string
 */
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

/**
 * Generate unique entry ID based on current timestamp
 * @returns {String} Unique entry ID
 */
function generateEntryId() {
  return Date.now().toString();
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Handle user login authentication
 * Validates credentials against Users sheet and updates last login timestamp
 * @param {Object} data - Login data containing username, password, userType
 * @returns {Object} Login result with user data or error
 */
function handleLogin(data) {
  try {
    console.log("🔐 Processing login attempt for user:", data.username);
    
    // Get Users sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.USERS);
    
    if (!sheet) {
      throw new Error("Users sheet not found. Please check sheet configuration.");
    }

    // Get all user data
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data
    if (values.length <= 1) {
      console.log("❌ No users found in Users sheet");
      return {
        success: false,
        error: "No users configured in the system"
      };
    }

    // Validate credentials
    for (let i = 1; i < values.length; i++) {
      const sheetUsername = String(values[i][0]).trim();
      const sheetPassword = String(values[i][1]).trim();
      const inputUsername = String(data.username).trim();
      const inputPassword = String(data.password).trim();

      // Check if credentials match
      if (sheetUsername === inputUsername && sheetPassword === inputPassword) {
        console.log("✅ Login successful for user:", inputUsername);
        
        // Update last login timestamp
        const istTimestamp = data.timestamp || formatISTTimestamp();
        sheet.getRange(i + 1, 7).setValue(istTimestamp);

        // Return user data
        return {
          success: true,
          message: "Login successful",
          user: {
            username: values[i][0],
            userType: values[i][2],
            fullName: values[i][3],
            status: values[i][4],
            lastLogin: istTimestamp
          },
          timestamp: istTimestamp
        };
      }
    }

    console.log("❌ Invalid credentials for user:", data.username);
    return {
      success: false,
      error: "Invalid username or password"
    };

  } catch (error) {
    console.error("❌ Login error:", error);
    return { 
      success: false, 
      error: "Login error: " + error.toString() 
    };
  }
}

// ============================================================================
// FARE RECEIPTS (DAILY ENTRIES) - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Fare Receipt (Daily Entry)
 * Sheet Columns: A=Timestamp, B=Date, C=Route, D=CashAmount, E=BankAmount, 
 *                F=TotalAmount, G=EntryType, H=EntryId, I=SubmittedBy
 * @param {Object} data - Fare receipt data
 * @returns {Object} Success/error response with entry details
 */
function addFareReceipt(data) {
  try {
    console.log("📝 Adding new fare receipt:", data);
    
    // Get FareReceipts sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      throw new Error("FareReceipts sheet not found");
    }

    // Generate entry ID if not provided
    const entryId = data.entryId || generateEntryId();

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);
    
    // Add data to the new row
    sheet.getRange(2, 1, 1, 9).setValues([[
      timeOnly,                    // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                   // B: Date from frontend
      data.route,                  // C: Route
      data.cashAmount || 0,        // D: Cash Amount
      data.bankAmount || 0,        // E: Bank Amount
      data.totalAmount || 0,       // F: Total Amount
      "daily",                     // G: Entry Type (static)
      entryId,                     // H: Entry ID
      data.submittedBy || "",      // I: Submitted By
    ]]);

    console.log("✅ Fare receipt added successfully with ID:", entryId);

    return {
      success: true,
      entryId: entryId,
      message: "Fare receipt added successfully",
      timestamp: timeOnly,
    };

  } catch (error) {
    console.error("❌ Error adding fare receipt:", error);
    return {
      success: false,
      error: "Add fare receipt error: " + error.toString(),
    };
  }
}

/**
 * Get all Fare Receipts (Daily Entries)
 * @returns {Object} Array of fare receipt data or error
 */
function getFareReceipts() {
  try {
    console.log("📋 Fetching all fare receipts...");
    
    // Get FareReceipts sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      console.log("ℹ️ FareReceipts sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No fare receipts found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[7],                      // Entry ID from column H
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string 
        route: row[2],                        // Route from column C
        cashAmount: row[3],                   // Cash amount from column D
        bankAmount: row[4],                   // Bank amount from column E
        totalAmount: row[5],                  // Total amount from column F
        entryType: row[6],                    // Entry type from column G
        submittedBy: row[8],                  // Submitted by from column I
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} fare receipts`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching fare receipts:", error);
    return {
      success: false,
      error: "Get fare receipts error: " + error.toString(),
    };
  }
}

/**
 * Update existing Fare Receipt (Daily Entry)
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateFareReceipt(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating fare receipt ID: ${entryId}`, updatedData);

    // Get FareReceipts sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      throw new Error("FareReceipts sheet not found");
    }

    const entryIdColumn = 8; // Column H contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Fare receipt not found with ID: ${entryId}`);
    }

    // Update only provided fields (don't modify timestamp or entryId)
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

    console.log(`✅ Fare receipt updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Fare receipt updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating fare receipt:', error);
    return {
      success: false,
      error: 'Update fare receipt error: ' + error.toString()
    };
  }
}

/**
 * Delete Fare Receipt (Daily Entry)
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteFareReceipt(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting fare receipt ID: ${entryId}`);

    // Get FareReceipts sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      throw new Error("FareReceipts sheet not found");
    }

    const entryIdColumn = 8; // Column H contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Fare receipt not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Fare receipt deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Fare receipt deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting fare receipt:', error);
    return {
      success: false,
      error: 'Delete fare receipt error: ' + error.toString()
    };
  }
}

// ============================================================================
// BOOKING ENTRIES - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Booking Entry
 * Sheet Columns: A=Timestamp, B=BookingDetails, C=DateFrom, D=DateTo, E=CashAmount, 
 *                F=BankAmount, G=TotalAmount, H=EntryType, I=EntryId, J=SubmittedBy
 * @param {Object} data - Booking entry data
 * @returns {Object} Success/error response with entry details
 */
function addBookingEntry(data) {
  try {
    console.log("📝 Adding new booking entry:", data);
    
    // Get BookingEntries sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      throw new Error("BookingEntries sheet not found");
    }

    // Generate entry ID if not provided
    const entryId = data.entryId || generateEntryId();

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);
    
    // Add data to the new row
    sheet.getRange(2, 1, 1, 10).setValues([[
      timeOnly,                       // A: Time in IST (HH:MM:SS AM/PM)
      data.bookingDetails || "",      // B: Booking Details
      data.dateFrom,                  // C: Date From
      data.dateTo,                    // D: Date To
      data.cashAmount || 0,           // E: Cash Amount
      data.bankAmount || 0,           // F: Bank Amount
      data.totalAmount || 0,          // G: Total Amount
      "booking",                      // H: Entry Type (static)
      entryId,                        // I: Entry ID
      data.submittedBy || "",         // J: Submitted By
    ]]);

    console.log("✅ Booking entry added successfully with ID:", entryId);

    return {
      success: true,
      entryId: entryId,
      message: "Booking entry added successfully",
      timestamp: timeOnly,
    };

  } catch (error) {
    console.error("❌ Error adding booking entry:", error);
    return {
      success: false,
      error: "Add booking entry error: " + error.toString(),
    };
  }
}

/**
 * Get all Booking Entries
 * @returns {Object} Array of booking entry data or error
 */
function getBookingEntries() {
  try {
    console.log("📋 Fetching all booking entries...");
    
    // Get BookingEntries sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      console.log("ℹ️ BookingEntries sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No booking entries found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[8],                      // Entry ID from column I
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        bookingDetails: row[1],               // Booking details from column B
        dateFrom: String(row[2] || ''),       // Convert date to string
        dateTo: String(row[3] || ''),         // Convert date to string
        cashAmount: row[4],                   // Cash amount from column E
        bankAmount: row[5],                   // Bank amount from column F
        totalAmount: row[6],                  // Total amount from column G
        entryType: row[7],                    // Entry type from column H
        submittedBy: row[9],                  // Submitted by from column J
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} booking entries`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching booking entries:", error);
    return {
      success: false,
      error: "Get booking entries error: " + error.toString(),
    };
  }
}

/**
 * Update existing Booking Entry
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateBookingEntry(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating booking entry ID: ${entryId}`, updatedData);

    // Get BookingEntries sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      throw new Error("BookingEntries sheet not found");
    }

    const entryIdColumn = 9; // Column I contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Booking entry not found with ID: ${entryId}`);
    }

    // Update only provided fields (don't modify timestamp or entryId)
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

    console.log(`✅ Booking entry updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Booking entry updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating booking entry:', error);
    return {
      success: false,
      error: 'Update booking entry error: ' + error.toString()
    };
  }
}

/**
 * Delete Booking Entry
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteBookingEntry(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting booking entry ID: ${entryId}`);

    // Get BookingEntries sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      throw new Error("BookingEntries sheet not found");
    }

    const entryIdColumn = 9; // Column I contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Booking entry not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Booking entry deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Booking entry deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting booking entry:', error);
    return {
      success: false,
      error: 'Delete booking entry error: ' + error.toString()
    };
  }
}

// ============================================================================
// OFF DAYS - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Off Day
 * Sheet Columns: A=Timestamp, B=Date, C=Reason, D=EntryType, E=EntryId, F=SubmittedBy
 * @param {Object} data - Off day data
 * @returns {Object} Success/error response with entry details
 */
function addOffDay(data) {
  try {
    console.log("📝 Adding new off day:", data);
    
    // Get OffDays sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      throw new Error("OffDays sheet not found");
    }

    // Generate entry ID if not provided
    const entryId = data.entryId || generateEntryId();

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);
    
    // Add data to the new row
    sheet.getRange(2, 1, 1, 6).setValues([[
      timeOnly,                    // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                   // B: Date from frontend
      data.reason || "",           // C: Reason
      "off",                       // D: Entry Type (static)
      entryId,                     // E: Entry ID
      data.submittedBy || "",      // F: Submitted By
    ]]);

    console.log("✅ Off day added successfully with ID:", entryId);

    return {
      success: true,
      entryId: entryId,
      message: "Off day added successfully",
      timestamp: timeOnly,
    };

  } catch (error) {
    console.error("❌ Error adding off day:", error);
    return { 
      success: false, 
      error: "Add off day error: " + error.toString() 
    };
  }
}

/**
 * Get all Off Days
 * @returns {Object} Array of off day data or error
 */
function getOffDays() {
  try {
    console.log("📋 Fetching all off days...");
    
    // Get OffDays sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      console.log("ℹ️ OffDays sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No off days found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[4],                      // Entry ID from column E
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        reason: row[2],                       // Reason from column C
        entryType: row[3],                    // Entry type from column D
        submittedBy: row[5],                  // Submitted by from column F
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} off days`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching off days:", error);
    return { 
      success: false, 
      error: "Get off days error: " + error.toString() 
    };
  }
}

/**
 * Update existing Off Day
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateOffDay(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating off day ID: ${entryId}`, updatedData);

    // Get OffDays sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      throw new Error("OffDays sheet not found");
    }

    const entryIdColumn = 5; // Column E contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Off day not found with ID: ${entryId}`);
    }

    // Update only provided fields (don't modify timestamp or entryId)
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.reason) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.reason); // C: Reason
    }

    console.log(`✅ Off day updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Off day updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating off day:', error);
    return {
      success: false,
      error: 'Update off day error: ' + error.toString()
    };
  }
}

/**
 * Delete Off Day
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteOffDay(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting off day ID: ${entryId}`);

    // Get OffDays sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      throw new Error("OffDays sheet not found");
    }

    const entryIdColumn = 5; // Column E contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Off day not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Off day deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Off day deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting off day:', error);
    return {
      success: false,
      error: 'Delete off day error: ' + error.toString()
    };
  }
}

// ============================================================================
// ADDA PAYMENTS - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Adda Payment
 * Sheet Columns: A=Timestamp, B=Date, C=AddaName, D=CashAmount, E=BankAmount, 
 *                F=TotalAmount, G=Remarks, H=SubmittedBy, I=EntryType, J=EntryId
 * @param {Object} data - Adda payment data
 * @returns {Object} Success/error response with entry details
 */
function addAddaPayment(data) {
  try {
    console.log("📝 Adding new adda payment:", data);
    
    // Get or create AddaPayments sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating AddaPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.ADDA_PAYMENTS);
      
      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 10).setValues([[
        "Timestamp", "Date", "AddaName", "CashAmount", "BankAmount", 
        "TotalAmount", "Remarks", "SubmittedBy", "EntryType", "EntryId"
      ]]);
    }

    // Generate entry ID if not provided
    const entryId = data.entryId || generateEntryId();

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);
    
    // Add data to the new row
    sheet.getRange(2, 1, 1, 10).setValues([[
      timeOnly,                    // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                   // B: Date from frontend
      data.addaName || "",         // C: Adda Name
      data.cashAmount || 0,        // D: Cash Amount
      data.bankAmount || 0,        // E: Bank Amount
      data.totalAmount || 0,       // F: Total Amount
      data.remarks || "",          // G: Remarks
      data.submittedBy || "",      // H: Submitted By
      "adda",                      // I: Entry Type (static)
      entryId,                     // J: Entry ID
    ]]);

    console.log("✅ Adda payment added successfully with ID:", entryId);

    return {
      success: true,
      entryId: entryId,
      message: "Adda payment added successfully",
      timestamp: timeOnly,
    };

  } catch (error) {
    console.error("❌ Error adding adda payment:", error);
    return {
      success: false,
      error: "Add adda payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Adda Payments
 * @returns {Object} Array of adda payment data or error
 */
function getAddaPayments() {
  try {
    console.log("📋 Fetching all adda payments...");
    
    // Get AddaPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ AddaPayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No adda payments found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[9],                      // Entry ID from column J
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        addaName: row[2],                     // Adda name from column C
        cashAmount: row[3],                   // Cash amount from column D
        bankAmount: row[4],                   // Bank amount from column E
        totalAmount: row[5],                  // Total amount from column F
        remarks: row[6],                      // Remarks from column G
        submittedBy: row[7],                  // Submitted by from column H
        entryType: row[8],                    // Entry type from column I
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} adda payments`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching adda payments:", error);
    return {
      success: false,
      error: "Get adda payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Adda Payment
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateAddaPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating adda payment ID: ${entryId}`, updatedData);

    // Get AddaPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    if (!sheet) {
      throw new Error('AddaPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Adda payment not found with ID: ${entryId}`);
    }

    // Update only provided fields (don't modify timestamp or entryId)
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
      sheet.getRange(rowIndex, 7).setValue(updatedData.remarks); // G: Remarks
    }

    console.log(`✅ Adda payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Adda payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating adda payment:', error);
    return {
      success: false,
      error: 'Update adda payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Adda Payment
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteAddaPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting adda payment ID: ${entryId}`);

    // Get AddaPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    if (!sheet) {
      throw new Error('AddaPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Adda payment not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Adda payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Adda payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting adda payment:', error);
    return {
      success: false,
      error: 'Delete adda payment error: ' + error.toString()
    };
  }
}

// ============================================================================
// FUEL PAYMENTS - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Fuel Payment
 * Sheet Columns: A=Timestamp, B=Date, C=PumpName, D=Liters, E=RatePerLiter, 
 *                F=CashAmount, G=BankAmount, H=TotalAmount, I=Remarks, 
 *                J=SubmittedBy, K=EntryType, L=EntryId
 * @param {Object} data - Fuel payment data
 * @returns {Object} Success/error response with entry details
 */
function addFuelPayment(data) {
  try {
    console.log("📝 Adding new fuel payment:", data);
    
    // Get or create FuelPayments sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating FuelPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.FUEL_PAYMENTS);
      
      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 12).setValues([[
        "Timestamp", "Date", "PumpName", "Liters", "RatePerLiter", 
        "CashAmount", "BankAmount", "TotalAmount", "Remarks", 
        "SubmittedBy", "EntryType", "EntryId"
      ]]);
    }

    // Generate entry ID if not provided
    const entryId = data.entryId || generateEntryId();

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);
    
    // Add data to the new row
    sheet.getRange(2, 1, 1, 12).setValues([[
      timeOnly,                    // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                   // B: Date from frontend
      data.pumpName || "",         // C: Pump Name
      data.liters || "",           // D: Liters
      data.rate || "",             // E: Rate Per Liter
      data.cashAmount || 0,        // F: Cash Amount
      data.bankAmount || 0,        // G: Bank Amount
      data.totalAmount || 0,       // H: Total Amount
      data.remarks || "",          // I: Remarks
      data.submittedBy || "",      // J: Submitted By
      "fuel",                      // K: Entry Type (static)
      entryId,                     // L: Entry ID
    ]]);

    console.log("✅ Fuel payment added successfully with ID:", entryId);

    return {
      success: true,
      entryId: entryId,
      message: "Fuel payment added successfully",
      timestamp: timeOnly,
    };

  } catch (error) {
    console.error("❌ Error adding fuel payment:", error);
    return {
      success: false,
      error: "Add fuel payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Fuel Payments
 * @returns {Object} Array of fuel payment data or error
 */
function getFuelPayments() {
  try {
    console.log("📋 Fetching all fuel payments...");
    
    // Get FuelPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ FuelPayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No fuel payments found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[11],                     // Entry ID from column L
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        pumpName: row[2],                     // Pump name from column C
        liters: row[3],                       // Liters from column D
        rate: row[4],                         // Rate from column E (RatePerLiter)
        cashAmount: row[5],                   // Cash amount from column F
        bankAmount: row[6],                   // Bank amount from column G
        totalAmount: row[7],                  // Total amount from column H
        remarks: row[8],                      // Remarks from column I
        submittedBy: row[9],                  // Submitted by from column J
        entryType: row[10],                   // Entry type from column K
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} fuel payments`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching fuel payments:", error);
    return {
      success: false,
      error: "Get fuel payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Fuel Payment
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateFuelPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating fuel payment ID: ${entryId}`, updatedData);

    // Get FuelPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    if (!sheet) {
      throw new Error('FuelPayments sheet not found');
    }

    const entryIdColumn = 12; // Column L contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Fuel payment not found with ID: ${entryId}`);
    }

    // Update only provided fields (don't modify timestamp or entryId)
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

    console.log(`✅ Fuel payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Fuel payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating fuel payment:', error);
    return {
      success: false,
      error: 'Update fuel payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Fuel Payment
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteFuelPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting fuel payment ID: ${entryId}`);

    // Get FuelPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    if (!sheet) {
      throw new Error('FuelPayments sheet not found');
    }

    const entryIdColumn = 12; // Column L contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Fuel payment not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Fuel payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Fuel payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting fuel payment:', error);
    return {
      success: false,
      error: 'Delete fuel payment error: ' + error.toString()
    };
  }
}

// ============================================================================
// UNION PAYMENTS - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Union Payment
 * Sheet Columns: A=Timestamp, B=Date, C=UnionName, D=CashAmount, E=BankAmount, 
 *                F=TotalAmount, G=Remarks, H=SubmittedBy, I=EntryType, J=EntryId
 * @param {Object} data - Union payment data
 * @returns {Object} Success/error response with entry details
 */
function addUnionPayment(data) {
  try {
    console.log("📝 Adding new union payment:", data);
    
    // Get or create UnionPayments sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating UnionPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.UNION_PAYMENTS);
      
      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 10).setValues([[
        "Timestamp", "Date", "UnionName", "CashAmount", "BankAmount", 
        "TotalAmount", "Remarks", "SubmittedBy", "EntryType", "EntryId"
      ]]);
    }

    // Generate entry ID if not provided
    const entryId = data.entryId || generateEntryId();

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);
    
    // Add data to the new row
    sheet.getRange(2, 1, 1, 10).setValues([[
      timeOnly,                    // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                   // B: Date from frontend
      data.unionName || "",        // C: Union Name
      data.cashAmount || 0,        // D: Cash Amount
      data.bankAmount || 0,        // E: Bank Amount
      data.totalAmount || 0,       // F: Total Amount
      data.remarks || "",          // G: Remarks
      data.submittedBy || "",      // H: Submitted By
      "union",                     // I: Entry Type (static)
      entryId,                     // J: Entry ID
    ]]);

    console.log("✅ Union payment added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Union payment added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding union payment:', error);
    return {
      success: false,
      error: 'Add union payment error: ' + error.toString()
    };
  }
}

/**
 * Get all Union Payments
 * @returns {Object} Array of union payment data or error
 */
function getUnionPayments() {
  try {
    console.log("📋 Fetching all union payments...");
    
    // Get UnionPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ UnionPayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No union payments found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[9],                      // Entry ID from column J
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        unionName: row[2],                    // Union name from column C
        cashAmount: row[3],                   // Cash amount from column D
        bankAmount: row[4],                   // Bank amount from column E
        totalAmount: row[5],                  // Total amount from column F
        remarks: row[6],                      // Remarks from column G
        submittedBy: row[7],                  // Submitted by from column H
        entryType: row[8],                    // Entry type from column I
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} union payments`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching union payments:", error);
    return {
      success: false,
      error: "Get union payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Union Payment
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateUnionPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating union payment ID: ${entryId}`, updatedData);

    // Get UnionPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Union payment not found with ID: ${entryId}`);
    }

    // Update only provided fields (don't modify timestamp or entryId)
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

    console.log(`✅ Union payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Union payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating union payment:', error);
    return {
      success: false,
      error: 'Update union payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Union Payment
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteUnionPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting union payment ID: ${entryId}`);

    // Get UnionPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    // Check if entry was found
    if (rowIndex === -1) {
      throw new Error(`Union payment not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Union payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Union payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting union payment:', error);
    return {
      success: false,
      error: 'Delete union payment error: ' + error.toString()
    };
  }
}

// ============================================================================
// LEGACY FUNCTIONS (FOR BACKWARD COMPATIBILITY)
// ============================================================================

/**
 * Legacy Universal Update Function (for backward compatibility)
 * Routes update requests to appropriate specific functions based on entry type
 * @param {Object} data - Update data with entryType, entryId, and updatedData
 * @returns {Object} Success/error response
 */
function updateFareEntryLegacy(data) {
  try {
    const entryType = data.entryType;

    console.log(`🔄 Legacy update request for entry type: ${entryType}`);

    // Route to specific update function based on entry type
    if (entryType === 'daily') {
      return updateFareReceipt(data);
    } else if (entryType === 'booking') {
      return updateBookingEntry(data);
    } else if (entryType === 'off') {
      return updateOffDay(data);
    } else if (entryType === 'adda') {
      return updateAddaPayment(data);
    } else if (entryType === 'fuel') {
      return updateFuelPayment(data);
    } else if (entryType === 'union') {
      return updateUnionPayment(data);
    } else {
      throw new Error(`Invalid entry type: ${entryType}`);
    }

  } catch (error) {
    console.error('❌ Legacy update error:', error);
    return {
      success: false,
      error: 'Legacy update error: ' + error.toString()
    };
  }
}

/**
 * Legacy Universal Delete Function (for backward compatibility)
 * Routes delete requests to appropriate specific functions based on entry type
 * @param {Object} data - Delete data with entryType and entryId
 * @returns {Object} Success/error response
 */
function deleteFareEntryLegacy(data) {
  try {
    const entryType = data.entryType;

    console.log(`🔄 Legacy delete request for entry type: ${entryType}`);

    // Route to specific delete function based on entry type
    if (entryType === 'daily') {
      return deleteFareReceipt(data);
    } else if (entryType === 'booking') {
      return deleteBookingEntry(data);
    } else if (entryType === 'off') {
      return deleteOffDay(data);
    } else if (entryType === 'adda') {
      return deleteAddaPayment(data);
    } else if (entryType === 'fuel') {
      return deleteFuelPayment(data);
    } else if (entryType === 'union') {
      return deleteUnionPayment(data);
    } else {
      throw new Error(`Invalid entry type: ${entryType}`);
    }

  } catch (error) {
    console.error('❌ Legacy delete error:', error);
    return {
      success: false,
      error: 'Legacy delete error: ' + error.toString()
    };
  }
}

// ============================================================================
// END OF GOOGLE APPS SCRIPT CODE
// ============================================================================

/**
 * Code Summary:
 * - Complete CRUD operations for 6 different entry types
 * - Proper error handling and logging throughout
 * - IST timestamp formatting
 * - Legacy function support for backward compatibility
 * - Auto sheet creation for payment types
 * - Comprehensive comments and documentation
 * - Consistent data structure across all entry types
 * - Security features with proper validation
 * 
 * Supported Entry Types:
 * 1. Fare Receipts (Daily Entries)
 * 2. Booking Entries (Special Bookings)
 * 3. Off Days
 * 4. Adda Payments
 * 5. Fuel Payments
 * 6. Union Payments
 * 
 * Each entry type supports: CREATE, READ, UPDATE, DELETE operations
 */
