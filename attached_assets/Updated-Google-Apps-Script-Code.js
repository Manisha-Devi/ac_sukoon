/**
 * Add new Fare Receipt
 * Columns: A=Timestamp, B=ReceiptDetails, C=Date, D=Amount, E: CashAmount, F: BankAmount, G: TotalAmount, H=EntryType, I=EntryId, J=SubmittedBy
 */
function addFareReceipt(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );

    const entryId = data.id || Date.now();

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.receiptDetails, // B: ReceiptDetails
      data.date, // C: Date
      data.amount || 0, // D: Amount
      0, // E: CashAmount (Always 0 as per requirement)
      0, // F: BankAmount (Always 0 as per requirement)
      data.amount || 0, // G: TotalAmount
      "daily", // H: EntryType
      entryId, // I: EntryId
      data.submittedBy || "", // J: SubmittedBy
    ]);

    return {
      success: true,
      message: "Fare receipt added successfully",
      entryId: entryId
    };
  } catch (error) {
    return {
      success: false,
      error: "Add fare receipt error: " + error.toString(),
    };
  }
}

/**
 * Get all Fare Receipts
 */
function getFareReceipts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.FARE_RECEIPTS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[8] || (index + 2), // I: EntryId
      timestamp: row[0], // A: Timestamp
      receiptDetails: row[1], // B: ReceiptDetails
      date: row[2], // C: Date
      amount: row[3], // D: Amount
      cashAmount: row[4], // E: CashAmount
      bankAmount: row[5], // F: BankAmount
      totalAmount: row[6], // G: TotalAmount
      entryType: row[7], // H: EntryType
      submittedBy: row[9], // J: SubmittedBy
      rowIndex: index + 2, // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get fare receipts error: " + error.toString(),
    };
  }
}

/**
 * Update existing Fare Receipt
 */
function updateFareReceipt(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating fare receipt:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const entryIdColumn = 9; // Column I

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Fare receipt not found with ID: ' + entryId);
    }

    // Update specific columns for Fare Receipt
    if (updatedData.receiptDetails) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.receiptDetails); // B: ReceiptDetails
    }
    if (updatedData.date) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.date); // C: Date
    }
    if (updatedData.amount !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.amount); // D: Amount
      sheet.getRange(rowIndex, 7).setValue(updatedData.amount); // G: TotalAmount
    }
    // Update timestamp
    sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp

    return {
      success: true,
      message: 'Fare receipt updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update fare receipt error:', error);
    return {
      success: false,
      error: 'Update fare receipt error: ' + error.toString()
    };
  }
}

/**
 * Delete Fare Receipt
 */
function deleteFareReceipt(data) {
  try {
    const entryId = data.entryId;

    console.log('Deleting fare receipt:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.FARE_RECEIPTS);
    const entryIdColumn = 9; // Column I

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Fare receipt not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Fare receipt deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete fare receipt error:', error);
    return {
      success: false,
      error: 'Delete fare receipt error: ' + error.toString()
    };
  }
}

/**
 * Add new Booking Entry
 * Columns: A=Timestamp, B=BookingDetails, C=DateFrom, D=DateTo, E=CashAmount, F=BankAmount, G=TotalAmount, H=EntryType, I=EntryId, J=SubmittedBy
 */
function addBookingEntry(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );

    const entryId = data.id || Date.now();

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.bookingDetails, // B: BookingDetails
      data.dateFrom, // C: DateFrom
      data.dateTo, // D: DateTo
      data.cashAmount || 0, // E: CashAmount (Always 0 as per requirement)
      data.bankAmount || 0, // F: BankAmount (Always 0 as per requirement)
      data.totalAmount || 0, // G: TotalAmount
      "booking", // H: EntryType
      entryId, // I: EntryId
      data.submittedBy || "", // J: SubmittedBy
    ]);

    return { 
      success: true, 
      message: "Booking entry added successfully",
      entryId: entryId
    };
  } catch (error) {
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
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.BOOKING_ENTRIES,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[8] || (index + 2), // I: EntryId
      timestamp: row[0], // A: Timestamp
      bookingDetails: row[1], // B: BookingDetails
      dateFrom: row[2], // C: DateFrom
      dateTo: row[3], // D: DateTo
      cashAmount: row[4], // E: CashAmount
      bankAmount: row[5], // F: BankAmount
      totalAmount: row[6], // G: TotalAmount
      entryType: row[7], // H: EntryType
      submittedBy: row[9], // J: SubmittedBy
      rowIndex: index + 2, // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
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

    console.log('Updating booking entry:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const entryIdColumn = 9; // Column I

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Booking entry not found with ID: ' + entryId);
    }

    // Update specific columns for Booking Entry
    if (updatedData.bookingDetails) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.bookingDetails); // B: BookingDetails
    }
    if (updatedData.dateFrom) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.dateFrom); // C: DateFrom
    }
    if (updatedData.dateTo) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.dateTo); // D: DateTo
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.totalAmount); // G: TotalAmount
    }
    // Update timestamp
    sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp

    return {
      success: true,
      message: 'Booking entry updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update booking entry error:', error);
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

    console.log('Deleting booking entry:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.BOOKING_ENTRIES);
    const entryIdColumn = 9; // Column I

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Booking entry not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Booking entry deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete booking entry error:', error);
    return {
      success: false,
      error: 'Delete booking entry error: ' + error.toString()
    };
  }
}

// ======= OFF DAYS - COMPLETE CRUD =======

/**
 * Add new Off Day
 * Columns: A=Timestamp, B=Date, C=Reason, D=EntryType, E=EntryId, F=SubmittedBy
 */
function addOffDay(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );

    const entryId = data.id || Date.now();

    sheet.appendRow([
      new Date(), // A: Timestamp
      data.date, // B: Date
      data.reason || "", // C: Reason (Required as per user request)
      "off", // D: EntryType
      entryId, // E: EntryId
      data.submittedBy || "", // F: SubmittedBy
    ]);

    return { 
      success: true, 
      message: "Off day added successfully",
      entryId: entryId
    };
  } catch (error) {
    return { success: false, error: "Add off day error: " + error.toString() };
  }
}

/**
 * Get all Off Days
 */
function getOffDays() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
      SHEET_NAMES.OFF_DAYS,
    );
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => ({
      id: row[4] || (index + 2), // E: EntryId
      timestamp: row[0], // A: Timestamp
      date: row[1], // B: Date
      reason: row[2], // C: Reason
      entryType: row[3], // D: EntryType
      submittedBy: row[5], // F: SubmittedBy
      rowIndex: index + 2, // Store actual row index for updates
    }));

    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: "Get off days error: " + error.toString() };
  }
}

/**
 * Update existing Off Day
 */
function updateOffDay(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating off day:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const entryIdColumn = 5; // Column E

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Off day not found with ID: ' + entryId);
    }

    // Update specific columns for Off Day
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.reason) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.reason); // C: Reason
    }
    // Update timestamp
    sheet.getRange(rowIndex, 1).setValue(new Date()); // A: Timestamp

    return {
      success: true,
      message: 'Off day updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update off day error:', error);
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

    console.log('Deleting off day:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAMES.OFF_DAYS);
    const entryIdColumn = 5; // Column E

    // Find the row with matching entryId
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Off day not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Off day deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete off day error:', error);
    return {
      success: false,
      error: 'Delete off day error: ' + error.toString()
    };
  }
}

// ======= LEGACY FUNCTIONS (For Backward Compatibility) =======

/**
 * Legacy Universal Update Function (for backward compatibility)
 */
function updateFareEntryLegacy(data) {
  try {
    const entryType = data.entryType;

    if (entryType === 'daily') {
      return updateFareReceipt(data);
    } else if (entryType === 'booking') {
      return updateBookingEntry(data);
    } else if (entryType === 'off') {
      return updateOffDay(data);
    } else {
      throw new Error('Invalid entry type: ' + entryType);
    }
  } catch (error) {
    return {
      success: false,
      error: 'Legacy update error: ' + error.toString()
    };
  }
}

/**
 * Legacy Universal Delete Function (for backward compatibility)
 */
function deleteFareEntryLegacy(data) {
  try {
    const entryType = data.entryType;

    if (entryType === 'daily') {
      return deleteFareReceipt(data);
    } else if (entryType === 'booking') {
      return deleteBookingEntry(data);
    } else if (entryType === 'off') {
      return deleteOffDay(data);
    } else {
      throw new Error('Invalid entry type: ' + entryType);
    }
  } catch (error) {
    return {
      success: false,
      error: 'Legacy delete error: ' + error.toString()
    };
  }
}