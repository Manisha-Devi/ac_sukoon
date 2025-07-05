
// ============================================================================
// OFF DAYS OPERATIONS (OffDays.gs)
// ============================================================================
// Complete CRUD operations for Off Days
// Sheet Columns: A=Timestamp, B=Date, C=Reason, D=EntryType, E=EntryId, F=SubmittedBy
// ============================================================================

/**
 * Add new Off Day
 */
function addOffDay(data) {
  try {
    console.log("📝 Adding new off day:", data);
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      throw new Error("OffDays sheet not found");
    }

    const entryId = data.entryId || generateEntryId();
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    sheet.insertRowBefore(2);
    
    sheet.getRange(2, 1, 1, 6).setValues([[
      timeOnly,                    // A: Time in IST
      data.date,                   // B: Date
      data.reason || "",           // C: Reason
      "off",                       // D: Entry Type
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
 */
function getOffDays() {
  try {
    console.log("📋 Fetching all off days...");
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      console.log("ℹ️ OffDays sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      console.log("ℹ️ No off days found");
      return { success: true, data: [] };
    }

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
 */
function updateOffDay(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating off day ID: ${entryId}`, updatedData);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      throw new Error("OffDays sheet not found");
    }

    const entryIdColumn = 5; // Column E contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Off day not found with ID: ${entryId}`);
    }

    // Update only provided fields
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.reason) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.reason);
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
 */
function deleteOffDay(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting off day ID: ${entryId}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      throw new Error("OffDays sheet not found");
    }

    const entryIdColumn = 5; // Column E contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Off day not found with ID: ${entryId}`);
    }

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
