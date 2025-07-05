/**
 * Add new Fare Receipt
 * Sheet Columns: A=Timestamp, B=Date, C=Route, D=CashAmount, E=BankAmount, 
 *                F=TotalAmount, G=SubmittedBy, H=EntryType, I=EntryId,
 *                J=EntryStatus, K=ApprovedBy
 * @param {Object} data - Fare receipt data
 * @returns {Object} Success/error response with entry details
 */
function addFareReceipt(data) {
  try {
    console.log("📝 Adding new fare receipt:", data);

    // Get or create FareReceipts sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating FareReceipts sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.FARE_RECEIPTS);

      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 11).setValues([[
        "Timestamp", "Date", "Route", "CashAmount", "BankAmount", 
        "TotalAmount", "SubmittedBy", "EntryType", "EntryId",
        "EntryStatus", "ApprovedBy"
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
    sheet.getRange(2, 1, 1, 11).setValues([[
      timeOnly,                      // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                     // B: Date from frontend
      data.route || "",              // C: Route information
      data.cashAmount || 0,          // D: Cash amount
      data.bankAmount || 0,          // E: Bank amount
      data.totalAmount || 0,         // F: Total amount
      data.submittedBy || "",        // G: Submitted by
      "fare",                        // H: Entry type (static)
      entryId,                       // I: Entry ID
      "pending",                     // J: Entry Status (pending/waiting/approved)
      "",                            // K: Approved By (empty initially)
    ]]);

    console.log("✅ Fare receipt added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Fare receipt added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding fare receipt:', error);
    return {
      success: false,
      error: 'Add fare receipt error: ' + error.toString()
    };
  }
}

/**
 * Get all Fare Receipts
 * @returns {Array<Object>} Array of fare receipt objects
 */
function getFareReceipts() {
  try {
    console.log("🧾 Fetching all fare receipts...");

    // Get FareReceipts sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      console.warn("⚠️ FareReceipts sheet not found!");
      return {
        success: false,
        error: "FareReceipts sheet not found"
      };
    }

    // Get all data from the sheet
    let values = sheet.getDataRange().getValues();

    // If sheet is empty (only headers), return empty array
    if (values.length <= 1) {
      console.log("🗄️ No fare receipts found (empty sheet).");
      return {
        success: true,
        data: []
      };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[8],                      // Entry ID from column I
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        route: row[2],                        // Route from column C
        cashAmount: row[3],                   // Cash amount from column D
        bankAmount: row[4],                   // Bank amount from column E
        totalAmount: row[5],                  // Total amount from column F
        submittedBy: row[6],                  // Submitted by from column G
        entryType: row[7],                    // Entry type from column H
        entryStatus: row[9] || "pending",     // Entry status from column J
        approvedBy: row[10] || "",            // Approved by from column K
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Retrieved ${data.length} fare receipts.`);

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('❌ Error fetching fare receipts:', error);
    return {
      success: false,
      error: 'Get fare receipts error: ' + error.toString()
    };
  }
}