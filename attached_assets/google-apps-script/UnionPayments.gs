// ============================================================================
// UNION PAYMENTS OPERATIONS (UnionPayments.gs)
// ============================================================================
// Complete CRUD operations for Union Payments
// Sheet Columns: A=Timestamp, B=Date, C=UnionName, D=CashAmount, E=BankAmount, 
//                F=TotalAmount, G=Remarks, H=SubmittedBy, I=EntryType, J=EntryId
// ============================================================================

/**
 * Add new Union Payment
 */
function addUnionPayment(data) {
  try {
    console.log("📝 Adding new union payment:", data);

    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating UnionPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.UNION_PAYMENTS);

      sheet.getRange(1, 1, 1, 12).setValues([[
        "Timestamp", "Date", "UnionName", "CashAmount", "BankAmount", 
        "TotalAmount", "Remarks", "SubmittedBy", "SubmittedBy", "EntryId",
        "EntryStatus", "ApprovedBy"
      ]]);
    }

    const entryId = data.entryId || generateEntryId();
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    sheet.insertRowBefore(2);

    sheet.getRange(2, 1, 1, 12).setValues([[
      timeOnly,                    // A: Time in IST
      data.date,                   // B: Date
      data.unionName || "",        // C: Union Name
      data.cashAmount || 0,        // D: Cash Amount
      data.bankAmount || 0,        // E: Bank Amount
      data.totalAmount || 0,       // F: Total Amount
      data.remarks || "",          // G: Remarks
      data.submittedBy || "",      // H: Submitted By
      "union",                     // I: Entry Type
      entryId,                     // J: Entry ID
      "pending",                   // K: Entry Status
      "",                          // L: Approved By
    ]]);

    console.log("✅ Union payment added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Union payment added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding union payment:', error);
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
    console.log("📋 Fetching all union payments...");

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ UnionPayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      console.log("ℹ️ No union payments found");
      return { success: true, data: [] };
    }

    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[9],                      // Entry ID from column J
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        unionName: row[2],                    // Union name from column C
        cashAmount: row[3],                   // Cash amount from column D
        bankAmount: row[4],                   // Bank amount from column E
        totalAmount: row[5],                  // Total amount from column F
        remarks: row[6],                      // Remarks from column G
        submittedBy: row[7],                  // Submitted by from column H
        entryType: row[8],                    // Entry type from column I
        entryStatus: row[10] || "pending",    // Entry status from column K
        approvedBy: row[11] || "",            // Approved by from column L
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} union payments`);

    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching union payments:", error);
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

    console.log(`📝 Updating union payment ID: ${entryId}`, updatedData);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Union payment not found with ID: ${entryId}`);
    }

    // Update only provided fields
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.unionName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.unionName);
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
    if (updatedData.remarks !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.remarks);
    }

    console.log(`✅ Union payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Union payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating union payment:', error);
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

    console.log(`🗑️ Deleting union payment ID: ${entryId}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Union payment not found with ID: ${entryId}`);
    }

    sheet.deleteRow(rowIndex);

    console.log(`✅ Union payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Union payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting union payment:', error);
    return {
      success: false,
      error: 'Delete union payment error: ' + error.toString()
    };
  }
}

/**
 * Update Union Payment Status
 */
function updateUnionPaymentStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus;
    const approverName = data.approverName;

    console.log(`📝 Updating union payment status - ID: ${entryId}, Status: ${newStatus}, Approver: ${approverName}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.UNION_PAYMENTS);

    if (!sheet) {
      throw new Error('UnionPayments sheet not found');
    }

    // Need to add status columns to existing sheets
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.length < 12) {
      // Add EntryStatus and ApprovedBy columns
      sheet.getRange(1, 11, 1, 2).setValues([["EntryStatus", "ApprovedBy"]]);
    }

    const entryIdColumn = 10; // Column J contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Union payment not found with ID: ${entryId}`);
    }

    // Update status in column K and approver in column L
    sheet.getRange(rowIndex, 11).setValue(newStatus);
    if (approverName) {
      sheet.getRange(rowIndex, 12).setValue(approverName);
    }

    console.log(`✅ Union payment status updated successfully - ID: ${entryId}, Status: ${newStatus}`);

    return {
      success: true,
      message: 'Union payment status updated successfully',
      entryId: entryId,
      newStatus: newStatus,
      approverName: approverName
    };

  } catch (error) {
    console.error('❌ Error updating union payment status:', error);
    return {
      success: false,
      error: 'Update union payment status error: ' + error.toString()
    };
  }
}

/**
 * Approve Union Payment
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveUnionPayment(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving union payment ID: ${entryId} by ${approverName}`);

    return updateUnionPaymentStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving union payment:', error);
    return {
      success: false,
      error: 'Approve union payment error: ' + error.toString()
    };
  }
}

/**
 * Resend Union Payment (Reset to pending status)
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendUnionPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending union payment ID: ${entryId}`);

    return updateUnionPaymentStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending union payment:', error);
    return {
      success: false,
      error: 'Resend union payment error: ' + error.toString()
    };
  }
}