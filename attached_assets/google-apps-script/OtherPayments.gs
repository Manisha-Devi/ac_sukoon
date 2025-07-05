// ============================================================================
// OTHER PAYMENTS - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Other Payment
 * Sheet Columns: A=Timestamp, B=Date, C=PaymentType, D=Description, E=CashAmount, 
 *                F=BankAmount, G=TotalAmount, H=Category, I=SubmittedBy, J=EntryType, K=EntryId
 * @param {Object} data - Other payment data
 * @returns {Object} Success/error response with entry details
 */
function addOtherPayment(data) {
  try {
    console.log("📝 Adding new other payment:", data);

    // Get or create OtherPayments sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OTHER_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating OtherPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.OTHER_PAYMENTS);

      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 11).setValues([[
        "Timestamp", "Date", "PaymentType", "Description", "CashAmount", 
        "BankAmount", "TotalAmount", "Category", "SubmittedBy", "EntryType", "EntryId"
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
      data.paymentDetails || "",     // C: Payment Type
      data.description || "",        // D: Description
      data.cashAmount || 0,          // E: Cash Amount
      data.bankAmount || 0,          // F: Bank Amount
      data.totalAmount || 0,         // G: Total Amount
      data.vendor || "General",      // H: Category (using vendor as category)
      data.submittedBy || "",        // I: Submitted By
      "other",                       // J: Entry Type (static)
      entryId,                       // K: Entry ID
    ]]);

    console.log("✅ Other payment added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Other payment added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding other payment:', error);
    return {
      success: false,
      error: 'Add other payment error: ' + error.toString()
    };
  }
}

/**
 * Get all Other Payments
 * @returns {Object} Array of other payment data or error
 */
function getOtherPayments() {
  try {
    console.log("📋 Fetching all other payments...");

    // Get OtherPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName("OtherPayments");

    if (!sheet) {
      console.log("ℹ️ OtherPayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No other payments found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[10],                     // Entry ID from column K
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        paymentDetails: row[2],               // Payment type from column C
        description: row[3],                  // Description from column D
        cashAmount: row[4],                   // Cash amount from column E
        bankAmount: row[5],                   // Bank amount from column F
        totalAmount: row[6],                  // Total amount from column G
        vendor: row[7],                       // Category from column H
        submittedBy: row[8],                  // Submitted by from column I
        entryType: row[9],                    // Entry type from column J
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} other payments`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching other payments:", error);
    return {
      success: false,
      error: "Get other payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Other Payment
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateOtherPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating other payment ID: ${entryId}`, updatedData);

    // Get OtherPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName("OtherPayments");

    if (!sheet) {
      throw new Error('OtherPayments sheet not found');
    }

    const entryIdColumn = 11; // Column K contains Entry ID

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
      throw new Error(`Other payment not found with ID: ${entryId}`);
    }

    // Update fields that are provided in updatedData
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.paymentDetails !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.paymentDetails);
    }
    if (updatedData.description !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.description);
    }
    if (updatedData.cashAmount !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.cashAmount);
    }
    if (updatedData.bankAmount !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.bankAmount);
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.totalAmount);
    }
    if (updatedData.vendor !== undefined) {
      sheet.getRange(rowIndex, 8).setValue(updatedData.vendor);
    }

    console.log(`✅ Other payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Other payment updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating other payment:', error);
    return {
      success: false,
      error: 'Update other payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Other Payment
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteOtherPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting other payment ID: ${entryId}`);

    // Get OtherPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName("OtherPayments");

    if (!sheet) {
      throw new Error('OtherPayments sheet not found');
    }

    const entryIdColumn = 11; // Column K contains Entry ID

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
      throw new Error(`Other payment not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Other payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Other payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting other payment:', error);
    return {
      success: false,
      error: 'Delete other payment error: ' + error.toString()
    };
  }
}