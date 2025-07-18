// ============================================================================
// FUEL PAYMENTS OPERATIONS (FuelPayments.gs)
// ============================================================================
// Complete CRUD operations for Fuel Payments
// Sheet Columns: A=Timestamp, B=Date, C=PumpName, D=Liters, E=RatePerLiter, 
//                F=CashAmount, G=BankAmount, H=TotalAmount, I=Remarks, 
//                J=SubmittedBy, K=EntryType, L=EntryId
// ============================================================================

/**
 * Add new Fuel Payment
 */
function addFuelPayment(data) {
  try {
    console.log("📝 Adding new fuel payment:", data);

    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating FuelPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.FUEL_PAYMENTS);

      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 14).setValues([[
        "Timestamp", "Date", "PumpName", "Liters", "RatePerLiter", "CashAmount", 
        "BankAmount", "TotalAmount", "Description", "SubmittedBy", "EntryType", "EntryId",
        "EntryStatus", "ApprovedBy"
      ]]);
    }

    // Assuming generateEntryId() is defined elsewhere or is a global function
    const entryId = data.entryId || generateEntryId();
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    sheet.insertRowBefore(2);

    // Add data to the new row
    sheet.getRange(2, 1, 1, 14).setValues([[
      timeOnly,                      // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                     // B: Date from frontend
      data.pumpName || "",           // C: Pump Name
      data.liters || "",             // D: Liters
      data.ratePerLiter || "",       // E: RatePerLiter
      data.cashAmount || 0,          // F: Cash Amount
      data.bankAmount || 0,          // G: Bank Amount
      data.totalAmount || 0,         // H: Total Amount
      data.description || "",        // I: Description
      data.submittedBy || "",        // J: Submitted By
      "fuel",                        // K: Entry Type (static)
      entryId,                       // L: Entry ID
      "pending",                     // M: Entry Status (pending/waiting/approved)
      "",                            // N: Approved By (empty initially)
    ]]);

    console.log("✅ Fuel payment added successfully with ID:", entryId);

    return {
      success: true,
      entryId: entryId,
      message: "Fuel payment added successfully",
      timestamp: timeOnly,
    };

  } catch (error) {
    console.error("❌ Error adding fuel payment:", error);
    return {
      success: false,
      error: "Add fuel payment error: " + error.toString(),
    };
  }
}

/**
 * Get all Fuel Payments
 */
function getFuelPayments() {
  try {
    console.log("📋 Fetching all fuel payments...");

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ FuelPayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      console.log("ℹ️ No fuel payments found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[11],                     // Entry ID from column L
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        pumpName: row[2],                     // Pump name from column C
        liters: row[3],                       // Liters from column D
        ratePerLiter: row[4],                 // RatePerLiter from column E
        cashAmount: row[5],                   // Cash amount from column F
        bankAmount: row[6],                   // Bank amount from column G
        totalAmount: row[7],                  // Total amount from column H
        description: row[8],                  // Description from column I
        submittedBy: row[9],                  // Submitted by from column J
        entryType: row[10],                   // Entry type from column K
        entryStatus: row[12] || "pending",    // Entry status from column M
        approvedBy: row[13] || "",            // Approved by from column N
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} fuel payments`);

    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching fuel payments:", error);
    return {
      success: false,
      error: "Get fuel payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Fuel Payment
 */
function updateFuelPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating fuel payment ID: ${entryId}`, updatedData);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    if (!sheet) {
      throw new Error('FuelPayments sheet not found');
    }

    const entryIdColumn = 12; // Column L contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Fuel payment not found with ID: ${entryId}`);
    }

    // Update only provided fields
    if (updatedData.date) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.pumpName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.pumpName);
    }
    if (updatedData.liters !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.liters);
    }
    if (updatedData.ratePerLiter !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.ratePerLiter);
    }
    if (updatedData.cashAmount !== undefined) {
      sheet.getRange(rowIndex, 6).setValue(updatedData.cashAmount);
    }
    if (updatedData.bankAmount !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.bankAmount);
    }
    if (updatedData.totalAmount !== undefined) {
      sheet.getRange(rowIndex, 8).setValue(updatedData.totalAmount);
    }
    if (updatedData.description !== undefined) {
      sheet.getRange(rowIndex, 9).setValue(updatedData.description);
    }

    console.log(`✅ Fuel payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Fuel payment updated successfully',
      entryId: entryId,
      rowIndex: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating fuel payment:', error);
    return {
      success: false,
      error: 'Update fuel payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Fuel Payment
 */
function deleteFuelPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting fuel payment ID: ${entryId}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    if (!sheet) {
      throw new Error('FuelPayments sheet not found');
    }

    const entryIdColumn = 12; // Column L contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Fuel payment not found with ID: ${entryId}`);
    }

    sheet.deleteRow(rowIndex);

    console.log(`✅ Fuel payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Fuel payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting fuel payment:', error);
    return {
      success: false,
      error: 'Delete fuel payment error: ' + error.toString()
    };
  }
}

/**
 * Update Fuel Payment Status
 */
function updateFuelPaymentStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus;
    const approverName = data.approverName;

    console.log(`📝 Updating fuel payment status - ID: ${entryId}, Status: ${newStatus}, Approver: ${approverName}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FUEL_PAYMENTS);

    if (!sheet) {
      throw new Error('FuelPayments sheet not found');
    }

    const entryIdColumn = 12; // Column L contains Entry ID
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][entryIdColumn - 1]) === String(entryId)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Fuel payment not found with ID: ${entryId}`);
    }

    // Update status in column M and approver in column N
    sheet.getRange(rowIndex, 13).setValue(newStatus);
    if (approverName) {
      sheet.getRange(rowIndex, 14).setValue(approverName);
    }

    console.log(`✅ Fuel payment status updated successfully - ID: ${entryId}, Status: ${newStatus}`);

    return {
      success: true,
      message: 'Fuel payment status updated successfully',
      entryId: entryId,
      newStatus: newStatus,
      approverName: approverName
    };

  } catch (error) {
    console.error('❌ Error updating fuel payment status:', error);
    return {
      success: false,
      error: 'Update fuel payment status error: ' + error.toString()
    };
  }
}

/**
 * Approve Fuel Payment
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveFuelPayment(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving fuel payment ID: ${entryId} by ${approverName}`);

    return updateFuelPaymentStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving fuel payment:', error);
    return {
      success: false,
      error: 'Approve fuel payment error: ' + error.toString()
    };
  }
}

/**
 * Resend Fuel Payment Entry
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendFuelPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending fuel payment ID: ${entryId}`);

    return updateFuelPaymentStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending fuel payment:', error);
    return {
      success: false,
      error: 'Resend fuel payment error: ' + error.toString()
    };
  }
}