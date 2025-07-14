
/**
 * Add new Off Day
 * Sheet Columns: A=Timestamp, B=Date, C=Reason, D=EntryType, E=EntryId, 
 *                F=SubmittedBy, G=EntryStatus, H=ApprovedBy
 * @param {Object} data - Off day data
 * @returns {Object} Success/error response with entry details
 */
function addOffDay(data) {
  try {
    console.log("📝 Adding new off day:", data);

    // Get or create OffDays sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating OffDays sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.OFF_DAYS);

      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 8).setValues([[
        "Timestamp", "Date", "Reason", "EntryType", "EntryId", 
        "SubmittedBy", "EntryStatus", "ApprovedBy"
      ]]);
    }

    // Use entry ID from data (already provided by frontend)
    const entryId = data.entryId;

    // Store raw timestamp
    const timestamp = data.timestamp || new Date().toISOString();

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);

    // Add data to the new row
    sheet.getRange(2, 1, 1, 8).setValues([[
      timestamp,                     // A: Raw timestamp
      data.date,                     // B: Date from frontend
      data.reason || "",             // C: Reason for off day
      "off",                         // D: Entry type (static)
      entryId,                       // E: Entry ID
      data.submittedBy || "",        // F: Submitted by
      "pending",                     // G: Entry Status (pending/waiting/approved)
      "",                            // H: Approved By (empty initially)
    ]]);

    console.log("✅ Off day added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Off day added successfully',
      entryId: entryId,
      timestamp: timestamp
    };

  } catch (error) {
    console.error('❌ Error adding off day:', error);
    return {
      success: false,
      error: 'Add off day error: ' + error.toString()
    };
  }
}

/**
 * Get all Off Days
 * @returns {Array<Object>} Array of off day objects
 */
function getOffDays() {
  try {
    console.log("📅 Fetching all off days...");

    // Get OffDays sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      console.warn("⚠️ OffDays sheet not found!");
      return {
        success: false,
        error: "OffDays sheet not found"
      };
    }

    // Get all data from the sheet
    let values = sheet.getDataRange().getValues();

    // If sheet is empty (only headers), return empty array
    if (values.length <= 1) {
      console.log("🗄️ No off days found (empty sheet).");
      return {
        success: true,
        data: []
      };
    }

    // Process and format data with CORRECT column mapping
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[4],                      // Entry ID from column E (5th column)
        timestamp: String(row[0] || ''),      // Timestamp from column A
        date: String(row[1] || ''),           // Date from column B
        reason: row[2],                       // Reason from column C
        entryType: row[3],                    // Entry type from column D
        submittedBy: row[5],                  // Submitted by from column F (6th column)
        entryStatus: row[6] || "pending",     // Entry status from column G
        approvedBy: row[7] || "",             // Approved by from column H
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Retrieved ${data.length} off days.`);

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('❌ Error fetching off days:', error);
    return {
      success: false,
      error: 'Get off days error: ' + error.toString()
    };
  }
}

/**
 * Update Off Day Entry
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
      throw new Error('OffDays sheet not found');
    }

    const entryIdColumn = 5; // Column E contains Entry ID (5th column)

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

    // Update fields that are provided in updatedData
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.reason !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.reason);
    }

    // Always keep entryStatus as 'pending' when updating regular data
    sheet.getRange(rowIndex, 7).setValue("pending"); // Column G: EntryStatus

    console.log(`✅ Off day updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Off day updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
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
 * Delete Off Day Entry
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
      throw new Error('OffDays sheet not found');
    }

    const entryIdColumn = 5; // Column E contains Entry ID (5th column)

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

/**
 * Update Off Day Status (Approved/Waiting/Pending)
 * @param {Object} data - Status update data containing entryId, newStatus, and approverName
 * @returns {Object} Success/error response
 */
function updateOffDayStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus; // 'pending', 'waiting', or 'approved'
    const approverName = data.approverName || "";

    console.log(`📋 Updating off day status - ID: ${entryId}, Status: ${newStatus}`);

    // Get OffDays sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OFF_DAYS);

    if (!sheet) {
      throw new Error('OffDays sheet not found');
    }

    const entryIdColumn = 5; // Column E contains Entry ID (5th column)

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

    // Update status
    sheet.getRange(rowIndex, 7).setValue(newStatus); // Column G: EntryStatus

    // Update approver name if status is approved
    if (newStatus === 'approved') {
      sheet.getRange(rowIndex, 8).setValue(approverName); // Column H: ApprovedBy
    } else {
      sheet.getRange(rowIndex, 8).setValue(""); // Clear approver for other statuses
    }

    console.log(`✅ Off day status updated - ID: ${entryId}, Status: ${newStatus}`);

    return {
      success: true,
      message: `Off day status updated to ${newStatus}`,
      entryId: entryId,
      newStatus: newStatus
    };

  } catch (error) {
    console.error('❌ Error updating off day status:', error);
    return {
      success: false,
      error: 'Update status error: ' + error.toString()
    };
  }
}

/**
 * Approve Off Day Entry
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveOffDay(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving off day ID: ${entryId} by ${approverName}`);

    return updateOffDayStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving off day:', error);
    return {
      success: false,
      error: 'Approve off day error: ' + error.toString()
    };
  }
}

/**
 * Resend Off Day (Reset to pending status)
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendOffDay(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending off day ID: ${entryId}`);

    return updateOffDayStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending off day:', error);
    return {
      success: false,
      error: 'Resend off day error: ' + error.toString()
    };
  }
}

/**
 * Resend Off Day Entry
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendOffDay(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending off day ID: ${entryId}`);

    return updateOffDayStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending off day:', error);
    return {
      success: false,
      error: 'Resend off day error: ' + error.toString()
    };
  }
}


