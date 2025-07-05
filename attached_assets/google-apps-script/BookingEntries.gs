// ============================================================================
// BOOKING ENTRIES OPERATIONS (BookingEntries.gs)
// ============================================================================
// Complete CRUD operations for Booking Entries
// Sheet Columns: A=Timestamp, B=BookingDetails, C=DateFrom, D=DateTo, 
//                E=CashAmount, F=BankAmount, G=TotalAmount, H=SubmittedBy, 
//                I=EntryType, J=EntryId, K=EntryStatus, L=ApprovedBy
// ============================================================================

/**
 * Add new Booking Entry
 * Sheet Columns: A=Timestamp, B=BookingDetails, C=DateFrom, D=DateTo, 
 *                E=CashAmount, F=BankAmount, G=TotalAmount, H=SubmittedBy,
 *                I=EntryType, J=EntryId, K=EntryStatus, L=ApprovedBy
 * @param {Object} data - Booking entry data
 * @returns {Object} Success/error response with entry details
 */
function addBookingEntry(data) {
  try {
    console.log("📝 Adding new booking entry:", data);

    // Get or create BookingEntries sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating BookingEntries sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.BOOKING_ENTRIES);

      // Add headers exactly as specified (12 columns)
      sheet.getRange(1, 1, 1, 12).setValues([[
        "Timestamp", "BookingDetails", "DateFrom", "DateTo", "CashAmount", 
        "BankAmount", "TotalAmount", "SubmittedBy", "EntryType", "EntryId",
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

    // Add data to the new row (12 columns to match header)
    sheet.getRange(2, 1, 1, 12).setValues([[
      timeOnly,                      // A: Time in IST (HH:MM:SS AM/PM)
      data.bookingDetails || "",     // B: Booking details
      data.dateFrom,                 // C: Date from
      data.dateTo,                   // D: Date to
      data.cashAmount || 0,          // E: Cash amount
      data.bankAmount || 0,          // F: Bank amount
      data.totalAmount || 0,         // G: Total amount
      data.submittedBy || "",        // H: Submitted by
      "booking",                     // I: Entry type (static)
      entryId,                       // J: Entry ID
      "pending",                     // K: Entry Status (pending/cash/bank/approved)
      "",                            // L: Approved By (empty initially)
    ]]);

    console.log("✅ Booking entry added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Booking entry added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding booking entry:', error);
    return {
      success: false,
      error: 'Add booking entry error: ' + error.toString()
    };
  }
}

/**
 * Get all Booking Entries
 * @returns {Array<Object>} Array of booking entry objects
 */
function getBookingEntries() {
  try {
    console.log("📋 Fetching all booking entries...");

    // Get BookingEntries sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      console.warn("⚠️ BookingEntries sheet not found!");
      return {
        success: false,
        error: "BookingEntries sheet not found"
      };
    }

    // Get all data from the sheet
    let values = sheet.getDataRange().getValues();

    // If sheet is empty (only headers), return empty array
    if (values.length <= 1) {
      console.log("🗄️ No booking entries found (empty sheet).");
      return {
        success: true,
        data: []
      };
    }

    // Process and format data with CORRECT column mapping
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[9],                      // Entry ID from column J (10th column)
        timestamp: String(row[0] || ''),      // Timestamp from column A
        bookingDetails: row[1],               // Booking details from column B
        dateFrom: String(row[2] || ''),       // Date from column C
        dateTo: String(row[3] || ''),         // Date to column D
        cashAmount: row[4],                   // Cash amount from column E
        bankAmount: row[5],                   // Bank amount from column F
        totalAmount: row[6],                  // Total amount from column G
        submittedBy: row[7],                  // Submitted by from column H
        entryType: row[8],                    // Entry type from column I
        entryStatus: row[10] || "pending",    // Entry status from column K
        approvedBy: row[11] || "",            // Approved by from column L
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Retrieved ${data.length} booking entries.`);

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('❌ Error fetching booking entries:', error);
    return {
      success: false,
      error: 'Get booking entries error: ' + error.toString()
    };
  }
}

/**
 * Update Booking Entry
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
      throw new Error('BookingEntries sheet not found');
    }

    const entryIdColumn = 9; // Column I contains Entry ID (9th column)

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

    // Update fields that are provided in updatedData
    if (updatedData.bookingDetails !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.bookingDetails);
    }
    if (updatedData.dateFrom !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.dateFrom);
    }
    if (updatedData.dateTo !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.dateTo);
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

    // Always keep entryStatus as 'pending' when updating regular data
    sheet.getRange(rowIndex, 11).setValue("pending"); // Column K: EntryStatus

    console.log(`✅ Booking entry updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Booking entry updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
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
      throw new Error('BookingEntries sheet not found');
    }

    const entryIdColumn = 9; // Column I contains Entry ID (9th column)

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

/**
 * Update Booking Entry Status (Bank/Cash/Approved)
 * @param {Object} data - Status update data containing entryId, newStatus, and approverName
 * @returns {Object} Success/error response
 */
function updateBookingEntryStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus; // 'bank', 'cash', or 'approved'
    const approverName = data.approverName || "";

    console.log(`📋 Updating booking entry status - ID: ${entryId}, Status: ${newStatus}`);

    // Get BookingEntries sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      throw new Error('BookingEntries sheet not found');
    }

    const entryIdColumn = 9; // Column I contains Entry ID (9th column)

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

    // Update status
    sheet.getRange(rowIndex, 11).setValue(newStatus); // Column K: EntryStatus

    // Update approver name if status is approved
    if (newStatus === 'approved') {
      sheet.getRange(rowIndex, 12).setValue(approverName); // Column L: ApprovedBy
    } else {
      sheet.getRange(rowIndex, 12).setValue(""); // Clear approver for other statuses
    }

    console.log(`✅ Booking entry status updated - ID: ${entryId}, Status: ${newStatus}`);

    return {
      success: true,
      message: `Booking entry status updated to ${newStatus}`,
      entryId: entryId,
      newStatus: newStatus
    };

  } catch (error) {
    console.error('❌ Error updating booking entry status:', error);
    return {
      success: false,
      error: 'Update status error: ' + error.toString()
    };
  }
}

/**
 * Approve Booking Entry
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveBookingEntry(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving booking entry ID: ${entryId} by ${approverName}`);

    return updateBookingEntryStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving booking entry:', error);
    return {
      success: false,
      error: 'Approve booking entry error: ' + error.toString()
    };
  }
}