
// ============================================================================
// CASH DEPOSIT OPERATIONS (CashDeposit.gs)
// ============================================================================
// Complete CRUD operations for Cash Deposits
// Sheet Columns: A=Timestamp, B=EntryType, C=EntryId, D=Date, 
//                E=CashAmount, F=DepositedBy
// ============================================================================

/**
 * Add new Cash Deposit Entry
 * Sheet Columns: A=Timestamp, B=EntryType, C=EntryId, D=Date, 
 *                E=CashAmount, F=DepositedBy
 * @param {Object} data - Cash deposit data
 * @returns {Object} Success/error response with entry details
 */
function addCashDeposit(data) {
  try {
    console.log("💰 Adding new cash deposit:", data);

    // Get or create CashDeposit sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.CASH_DEPOSIT);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating CashDeposit sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.CASH_DEPOSIT);

      // Add headers exactly as specified (6 columns)
      sheet.getRange(1, 1, 1, 6).setValues([[
        "Timestamp", "EntryType", "EntryId", "Date", "CashAmount", "DepositedBy"
      ]]);
    }

    // Use entry ID from data (already provided by frontend)
    const entryId = data.entryId;

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);

    // Add data to the new row (6 columns to match header)
    sheet.getRange(2, 1, 1, 6).setValues([[
      timeOnly,                      // A: Time in IST (HH:MM:SS AM/PM)
      "cash_deposit",                // B: Entry type (static)
      entryId,                       // C: Entry ID
      data.date,                     // D: Date
      data.cashAmount || 0,          // E: Cash amount
      data.depositedBy || "",        // F: Deposited by
    ]]);

    console.log("✅ Cash deposit added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Cash deposit added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding cash deposit:', error);
    return {
      success: false,
      error: 'Add cash deposit error: ' + error.toString()
    };
  }
}

/**
 * Get all Cash Deposits
 * @returns {Array<Object>} Array of cash deposit objects
 */
function getCashDeposits() {
  try {
    console.log("📋 Fetching all cash deposits...");

    // Get CashDeposit sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.CASH_DEPOSIT);

    if (!sheet) {
      console.warn("⚠️ CashDeposit sheet not found!");
      return {
        success: false,
        error: "CashDeposit sheet not found"
      };
    }

    // Get all data from the sheet
    let values = sheet.getDataRange().getValues();

    // If sheet is empty (only headers), return empty array
    if (values.length <= 1) {
      console.log("🗄️ No cash deposits found (empty sheet).");
      return {
        success: true,
        data: []
      };
    }

    // Process and format data with CORRECT column mapping
    const data = values.slice(1).map((row, index) => {
      return {
        timestamp: String(row[0] || ''),      // Timestamp from column A
        entryType: row[1],                    // Entry type from column B
        entryId: row[2],                      // Entry ID from column C
        date: String(row[3] || ''),           // Date from column D
        cashAmount: row[4] || 0,              // Cash amount from column E
        depositedBy: row[5] || "",            // Deposited by from column F
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Retrieved ${data.length} cash deposits.`);

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('❌ Error fetching cash deposits:', error);
    return {
      success: false,
      error: 'Get cash deposits error: ' + error.toString()
    };
  }
}

/**
 * Update Cash Deposit
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateCashDeposit(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating cash deposit ID: ${entryId}`, updatedData);

    // Get CashDeposit sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.CASH_DEPOSIT);

    if (!sheet) {
      throw new Error('CashDeposit sheet not found');
    }

    const entryIdColumn = 3; // Column C contains Entry ID (3rd column)

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
      throw new Error(`Cash deposit not found with ID: ${entryId}`);
    }

    // Update fields that are provided in updatedData
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.date);
    }
    if (updatedData.cashAmount !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.cashAmount);
    }
    if (updatedData.depositedBy !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.depositedBy);
    }

    console.log(`✅ Cash deposit updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Cash deposit updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating cash deposit:', error);
    return {
      success: false,
      error: 'Update cash deposit error: ' + error.toString()
    };
  }
}

/**
 * Delete Cash Deposit
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteCashDeposit(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting cash deposit ID: ${entryId}`);

    // Get CashDeposit sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.CASH_DEPOSIT);

    if (!sheet) {
      throw new Error('CashDeposit sheet not found');
    }

    const entryIdColumn = 3; // Column C contains Entry ID (3rd column)

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
      throw new Error(`Cash deposit not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Cash deposit deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Cash deposit deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting cash deposit:', error);
    return {
      success: false,
      error: 'Delete cash deposit error: ' + error.toString()
    };
  }
}
