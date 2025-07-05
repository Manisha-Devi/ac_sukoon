
// ============================================================================
// BOOKING ENTRIES OPERATIONS (BookingEntries.gs)
// ============================================================================
// Complete CRUD operations for Booking Entries
// Sheet Columns: A=Timestamp, B=BookingDetails, C=DateFrom, D=DateTo, 
//                E=CashAmount, F=BankAmount, G=TotalAmount, H=EntryType, 
//                I=EntryId, J=SubmittedBy
// ============================================================================

/**
 * Add new Booking Entry
 */
function addBookingEntry(data) {
  try {
    console.log("📝 Adding new booking entry:", data);
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      throw new Error("BookingEntries sheet not found");
    }

    const entryId = data.entryId || generateEntryId();
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    sheet.insertRowBefore(2);
    
    sheet.getRange(2, 1, 1, 10).setValues([[
      timeOnly,                       // A: Time in IST
      data.bookingDetails || "",      // B: Booking Details
      data.dateFrom,                  // C: Date From
      data.dateTo,                    // D: Date To
      data.cashAmount || 0,           // E: Cash Amount
      data.bankAmount || 0,           // F: Bank Amount
      data.totalAmount || 0,          // G: Total Amount
      "booking",                      // H: Entry Type
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
 */
function getBookingEntries() {
  try {
    console.log("📋 Fetching all booking entries...");
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      console.log("ℹ️ BookingEntries sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      console.log("ℹ️ No booking entries found");
      return { success: true, data: [] };
    }

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
 */
function updateBookingEntry(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating booking entry ID: ${entryId}`, updatedData);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      throw new Error("BookingEntries sheet not found");
    }

    const entryIdColumn = 9; // Column I contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Booking entry not found with ID: ${entryId}`);
    }

    // Update only provided fields
    if (updatedData.bookingDetails) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.bookingDetails);
    }
    if (updatedData.dateFrom) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.dateFrom);
    }
    if (updatedData.dateTo) {
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
 */
function deleteBookingEntry(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting booking entry ID: ${entryId}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);

    if (!sheet) {
      throw new Error("BookingEntries sheet not found");
    }

    const entryIdColumn = 9; // Column I contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Booking entry not found with ID: ${entryId}`);
    }

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
