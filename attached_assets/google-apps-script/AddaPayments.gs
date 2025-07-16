// ============================================================================
// ADDA PAYMENTS OPERATIONS (AddaPayments.gs)
// ============================================================================
// Complete CRUD operations for Adda Payments
// Sheet Columns: A=Timestamp, B=Date, C=AddaName, D=CashAmount, E=BankAmount, 
//                F=TotalAmount, G=Remarks, H=SubmittedBy, I=EntryType, J=EntryId
// ============================================================================

/**
 * Add new Adda Payment
 */
function addAddaPayment(data) {
  try {
    console.log("📝 Adding new adda payment:", data);

    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating AddaPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.ADDA_PAYMENTS);

      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 12).setValues([[
        "Timestamp", "Date", "AddaName", "CashAmount", "BankAmount", 
        "TotalAmount", "Description", "SubmittedBy", "EntryType", "EntryId",
        "EntryStatus", "ApprovedBy"
      ]]);
    }

    const entryId = data.entryId || Utilities.getUuid();
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    sheet.insertRowBefore(2);

    // Add data to the new row
    sheet.getRange(2, 1, 1, 12).setValues([[
      timeOnly,                      // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                     // B: Date from frontend
      data.addaName || "",           // C: Adda Name
      data.cashAmount || 0,          // D: Cash Amount
      data.bankAmount || 0,          // E: Bank Amount
      data.totalAmount || 0,         // F: Total Amount
      data.description || "",        // G: Description (changed from remarks)
      data.submittedBy || "",        // H: Submitted By
      "adda",                        // I: Entry Type (static)
      entryId,                       // J: Entry ID
      "pending",                     // K: Entry Status (pending/waiting/approved)
      "",                            // L: Approved By
    ]]);

    console.log("✅ Adda payment added successfully with ID:", entryId);

    return {
      success: true,
      entryId: entryId,
      message: "Adda payment added successfully",
      timestamp: timeOnly,
    };

  } catch (error) {
    console.error("❌ Error adding adda payment:", error);
    return {
      success: false,
      error: "Add adda payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Adda Payments
 */
function getAddaPayments() {
  try {
    console.log("📋 Fetching all adda payments...");

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ AddaPayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      console.log("ℹ️ No adda payments found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[9],                     // Entry ID from column J
        timestamp: String(row[0] || ''),     // Convert timestamp to string
        date: String(row[1] || ''),          // Convert date to string
        addaName: row[2],                    // Adda name from column C
        cashAmount: row[3],                  // Cash amount from column D
        bankAmount: row[4],                  // Bank amount from column E
        totalAmount: row[5],                 // Total amount from column F
        description: row[6],                 // Description from column G (changed from remarks)
        submittedBy: row[7],                 // Submitted by from column H
        entryType: row[8],                   // Entry type from column I
        entryStatus: row[10] || "pending",   // Entry status from column K
        approvedBy: row[11] || "",           // Approved by from column L
        rowIndex: index + 2,                 // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} adda payments`);

    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching adda payments:", error);
    return {
      success: false,
      error: "Get adda payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Adda Payment
 */
function updateAddaPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating adda payment ID: ${entryId}`, updatedData);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    if (!sheet) {
      throw new Error('AddaPayments sheet not found');
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
      throw new Error(`Adda payment not found with ID: ${entryId}`);
    }

    // Update fields that are provided in updatedData
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.addaName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.addaName);
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
    if (updatedData.description !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.description);
    }
    if (updatedData.submittedBy !== undefined) {
      sheet.getRange(rowIndex, 8).setValue(updatedData.submittedBy);
    }

    console.log(`✅ Adda payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Adda payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating adda payment:', error);
    return {
      success: false,
      error: 'Update adda payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Adda Payment
 */
function deleteAddaPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting adda payment ID: ${entryId}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    if (!sheet) {
      throw new Error('AddaPayments sheet not found');
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
      throw new Error(`Adda payment not found with ID: ${entryId}`);
    }

    sheet.deleteRow(rowIndex);

    console.log(`✅ Adda payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Adda payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting adda payment:', error);
    return {
      success: false,
      error: 'Delete adda payment error: ' + error.toString()
    };
  }
}

/**
 * Update Adda Payment Status
 */
function updateAddaPaymentStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus;
    const approverName = data.approverName;

    console.log(`📝 Updating adda payment status - ID: ${entryId}, Status: ${newStatus}, Approver: ${approverName}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.ADDA_PAYMENTS);

    if (!sheet) {
      throw new Error('AddaPayments sheet not found');
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
      throw new Error(`Adda payment not found with ID: ${entryId}`);
    }

    // Update status in column K and approver in column L
    sheet.getRange(rowIndex, 11).setValue(newStatus);
    if (approverName) {
      sheet.getRange(rowIndex, 12).setValue(approverName);
    }

    console.log(`✅ Adda payment status updated successfully - ID: ${entryId}, Status: ${newStatus}`);

    return {
      success: true,
      message: 'Adda payment status updated successfully',
      entryId: entryId,
      newStatus: newStatus,
      approverName: approverName
    };

  } catch (error) {
    console.error('❌ Error updating adda payment status:', error);
    return {
      success: false,
      error: 'Update adda payment status error: ' + error.toString()
    };
  }
}

/**
 * Approve Adda Payment
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveAddaPayment(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving adda payment ID: ${entryId} by ${approverName}`);

    return updateAddaPaymentStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving adda payment:', error);
    return {
      success: false,
      error: 'Approve adda payment error: ' + error.toString()
    };
  }
}

/**
 * Resend Adda Payment (Reset to pending status)
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendAddaPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending adda payment ID: ${entryId}`);

    return updateAddaPaymentStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending adda payment:', error);
    return {
      success: false,
      error: 'Resend adda payment error: ' + error.toString()
    };
  }
}

/**
 * Resend Adda Payment (Reset to pending status) - Alternative name for consistency
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendAddaPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending adda payment ID: ${entryId} (alternative function)`);

    return updateAddaPaymentStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending adda payment (alternative):', error);
    return {
      success: false,
      error: 'Resend adda payment error: ' + error.toString()
    };
  }
}