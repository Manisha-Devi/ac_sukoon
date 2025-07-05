
// ======= UNION PAYMENTS - COMPLETE CRUD =======

/**
 * Add new Union Payment
 * Columns: A=Timestamp, B=Date, C=UnionName, D=CashAmount, E=BankAmount, F=TotalAmount, G=Remarks, H=SubmittedBy, I=EntryType, J=EntryId
 */
function addUnionPayment(data) {
  try {
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("UnionPayments");

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet("UnionPayments");
      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 10).setValues([[
        "Timestamp", "Date", "UnionName", "CashAmount", "BankAmount", "TotalAmount", "Remarks", "SubmittedBy", "EntryType", "EntryId"
      ]]);
    }

    const entryId = data.entryId;
    const timeOnly = data.timestamp || formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert at row 2 to keep new entries at top
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 10).setValues([[
      timeOnly, // A: Time only in IST (HH:MM:SS AM/PM)
      data.date, // B: Date from frontend in IST
      data.unionName || "", // C: UnionName
      data.cashAmount || 0, // D: CashAmount
      data.bankAmount || 0, // E: BankAmount
      data.totalAmount || 0, // F: TotalAmount
      data.remarks || "", // G: Remarks
      data.submittedBy || "", // H: SubmittedBy
      "union", // I: EntryType
      entryId, // J: EntryId
    ]]);

    return {
      success: true,
      message: 'Union payment added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('Add union payment error:', error);
    return {
      success: false,
      error: 'Add union payment error: ' + error.toString()
    };
  }
}

/**
 * Get all Union Payments
 */
function getUnionPayments() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("UnionPayments");

    if (!sheet) {
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) return { success: true, data: [] };

    const data = values.slice(1).map((row, index) => {
      const rowData = {
        entryId: row[9], // Entry ID from column J
        timestamp: String(row[0] || ''), // Convert timestamp to string
        date: String(row[1] || ''), // Convert date to string
        unionName: row[2], // Union name from column C
        cashAmount: row[3], // Cash amount from column D
        bankAmount: row[4], // Bank amount from column E
        totalAmount: row[5], // Total amount from column F
        remarks: row[6], // Remarks from column G
        submittedBy: row[7], // Submitted by from column H
        entryType: row[8], // Entry type from column I
        rowIndex: index + 2, // Store row index for updates/deletes
      };
      return rowData;
    });

    return { success: true, data: data.reverse() };
  } catch (error) {
    return {
      success: false,
      error: "Get union payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Union Payment
 */
function updateUnionPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log('Updating union payment:', { entryId, updatedData });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("UnionPayments");

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J

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
      throw new Error('Union payment not found with ID: ' + entryId);
    }

    // Update only provided fields - don't modify timestamp
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date); // B: Date
    }
    if (updatedData.unionName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.unionName); // C: UnionName
    }
    if (updatedData.cashAmount !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.cashAmount); // D: CashAmount
    }
    if (updatedData.bankAmount !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.bankAmount); // E: BankAmount
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.totalAmount); // F: TotalAmount
    }
    if (updatedData.remarks !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.remarks); // G: Remarks
    }

    return {
      success: true,
      message: 'Union payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('Update union payment error:', error);
    return {
      success: false,
      error: 'Update union payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Union Payment
 */
function deleteUnionPayment(data) {
  try {
    const entryId = data.entryId;

    console.log('Deleting union payment:', { entryId });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("UnionPayments");

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J

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
      throw new Error('Union payment not found with ID: ' + entryId);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return {
      success: true,
      message: 'Union payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('Delete union payment error:', error);
    return {
      success: false,
      error: 'Delete union payment error: ' + error.toString()
    };
  }
}
