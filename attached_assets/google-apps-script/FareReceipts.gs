
/**
 * Add new Fare Receipt
 * Sheet Columns: A=Timestamp, B=Date, C=Route, D=CashAmount, E=BankAmount, 
 *                F=TotalAmount, G=EntryType, H=EntryId, I=SubmittedBy,
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
        "TotalAmount", "EntryType", "EntryId", "SubmittedBy",
        "EntryStatus", "ApprovedBy"
      ]]);
    }

    // Use entry ID from data (already provided by frontend)
    const entryId = data.entryId;

    // Store timestamp exactly as received from frontend
    const timestamp = data.timestamp || new Date().toISOString();

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);

    // Add data to the new row
    sheet.getRange(2, 1, 1, 11).setValues([[
      timestamp,                     // A: Timestamp as-is from frontend
      data.date,                     // B: Date as-is from frontend
      data.route || "",              // C: Route information
      data.cashAmount || 0,          // D: Cash amount
      data.bankAmount || 0,          // E: Bank amount
      data.totalAmount || 0,         // F: Total amount
      "fare",                        // G: Entry type (static)
      entryId,                       // H: Entry ID
      data.submittedBy || "",        // I: Submitted by
      "pending",                     // J: Entry Status (pending/waiting/approved)
      "",                            // K: Approved By (empty initially)
    ]]);

    console.log("✅ Fare receipt added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Fare receipt added successfully',
      entryId: entryId,
      timestamp: timestamp
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

    // Process and return data exactly as stored in sheets
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[7],                      // Entry ID from column H (8th column)
        timestamp: row[0],                    // Timestamp from column A - as-is
        date: row[1],                         // Date from column B - as-is
        route: row[2],                        // Route from column C
        cashAmount: row[3],                   // Cash amount from column D
        bankAmount: row[4],                   // Bank amount from column E
        totalAmount: row[5],                  // Total amount from column F
        entryType: row[6],                    // Entry type from column G
        submittedBy: row[8],                  // Submitted by from column I (9th column)
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

/**
 * Update Fare Receipt Entry
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
      throw new Error('FareReceipts sheet not found');
    }

    const entryIdColumn = 8; // Column H contains Entry ID (8th column)

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

    // Update fields that are provided in updatedData
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.route !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.route);
    }
    if (updatedData.cashAmount !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.cashAmount);
    }
    if (updatedData.bankAmount !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.bankAmount);
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.totalAmount);
    }

    // Always keep entryStatus as 'pending' when updating regular data
    sheet.getRange(rowIndex, 10).setValue("pending"); // Column J: EntryStatus

    console.log(`✅ Fare receipt updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Fare receipt updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
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
 * Delete Fare Receipt Entry
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
      throw new Error('FareReceipts sheet not found');
    }

    const entryIdColumn = 8; // Column H contains Entry ID (8th column)

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

/**
 * Update Fare Receipt Status (Bank/Cash/Approved)
 * @param {Object} data - Status update data containing entryId, newStatus, and approverName
 * @returns {Object} Success/error response
 */
function updateFareReceiptStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus; // 'bank', 'cash', or 'approved'
    const approverName = data.approverName || "";

    console.log(`📋 Updating fare receipt status - ID: ${entryId}, Status: ${newStatus}`);

    // Get FareReceipts sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      throw new Error('FareReceipts sheet not found');
    }

    const entryIdColumn = 8; // Column H contains Entry ID (8th column)

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

    // Update status
    sheet.getRange(rowIndex, 10).setValue(newStatus); // Column J: EntryStatus

    // Update approver name if status is approved
    if (newStatus === 'approved') {
      sheet.getRange(rowIndex, 11).setValue(approverName); // Column K: ApprovedBy
    } else {
      sheet.getRange(rowIndex, 11).setValue(""); // Clear approver for other statuses
    }

    console.log(`✅ Fare receipt status updated - ID: ${entryId}, Status: ${newStatus}`);

    return {
      success: true,
      message: `Fare receipt status updated to ${newStatus}`,
      entryId: entryId,
      newStatus: newStatus
    };

  } catch (error) {
    console.error('❌ Error updating fare receipt status:', error);
    return {
      success: false,
      error: 'Update status error: ' + error.toString()
    };
  }
}

/**
 * Approve Fare Receipt Entry
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveFareReceipt(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving fare receipt ID: ${entryId} by ${approverName}`);

    return updateFareReceiptStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving fare receipt:', error);
    return {
      success: false,
      error: 'Approve fare receipt error: ' + error.toString()
    };
  }
}

/**
 * Resend Fare Receipt Entry
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendFareReceipt(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending fare receipt ID: ${entryId}`);

    return updateFareReceiptStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending fare receipt:', error);
    return {
      success: false,
      error: 'Resend fare receipt error: ' + error.toString()
    };
  }
}


