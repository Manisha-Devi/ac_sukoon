
// ============================================================================
// FARE RECEIPTS OPERATIONS (FareReceipts.gs)
// ============================================================================
// Complete CRUD operations for Fare Receipts (Daily Entries)
// Sheet Columns: A=Timestamp, B=Date, C=Route, D=CashAmount, E=BankAmount, 
//                F=TotalAmount, G=EntryType, H=EntryId, I=SubmittedBy
// ============================================================================

/**
 * Add new Fare Receipt (Daily Entry)
 */
function addFareReceipt(data) {
  try {
    console.log("📝 Adding new fare receipt:", data);
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      throw new Error("FareReceipts sheet not found");
    }

    const entryId = data.entryId || generateEntryId();
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    sheet.insertRowBefore(2);
    
    sheet.getRange(2, 1, 1, 9).setValues([[
      timeOnly,                    // A: Time in IST
      data.date,                   // B: Date
      data.route,                  // C: Route
      data.cashAmount || 0,        // D: Cash Amount
      data.bankAmount || 0,        // E: Bank Amount
      data.totalAmount || 0,       // F: Total Amount
      "daily",                     // G: Entry Type
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
 */
function getFareReceipts() {
  try {
    console.log("📋 Fetching all fare receipts...");
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      console.log("ℹ️ FareReceipts sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      console.log("ℹ️ No fare receipts found");
      return { success: true, data: [] };
    }

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
 */
function updateFareReceipt(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating fare receipt ID: ${entryId}`, updatedData);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      throw new Error("FareReceipts sheet not found");
    }

    const entryIdColumn = 8; // Column H contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Fare receipt not found with ID: ${entryId}`);
    }

    // Update only provided fields
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.route) {
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
 */
function deleteFareReceipt(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting fare receipt ID: ${entryId}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FARE_RECEIPTS);

    if (!sheet) {
      throw new Error("FareReceipts sheet not found");
    }

    const entryIdColumn = 8; // Column H contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Fare receipt not found with ID: ${entryId}`);
    }

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
