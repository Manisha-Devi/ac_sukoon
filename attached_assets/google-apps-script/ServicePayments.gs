// ============================================================================
// SERVICE PAYMENTS - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Service Payment
 * Sheet Columns: A=Timestamp, B=Date, C=ServiceType, D=CashAmount, E=BankAmount, 
 *                F=TotalAmount, G=ServiceDetails, H=SubmittedBy, I=EntryType, J=EntryId
 * @param {Object} data - Service payment data
 * @returns {Object} Success/error response with entry details
 */
function addServicePayment(data) {
  try {
    console.log("📝 Adding new service payment:", data);

    // Get or create ServicePayments sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating ServicePayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.SERVICE_PAYMENTS);

      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 12).setValues([[
        "Timestamp", "Date", "ServiceType", "CashAmount", "BankAmount", 
        "TotalAmount", "ServiceDetails", "SubmittedBy", "EntryType", "EntryId",
        "EntryStatus", "ApprovedBy"
      ]]);
    }

    // Generate entry ID if not provided
    const entryId = data.entryId || new Date().getTime();

    // Store timestamp exactly as received from frontend
    const timestamp = data.timestamp || new Date().toISOString();

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);

    // Add data to the new row
    sheet.getRange(2, 1, 1, 12).setValues([[
      timestamp,                     // A: Timestamp as-is
      data.date,                     // B: Date from frontend
      data.serviceType || "",        // C: Service Type
      data.cashAmount || 0,          // D: Cash Amount
      data.bankAmount || 0,          // E: Bank Amount
      data.totalAmount || 0,         // F: Total Amount
      data.serviceDetails || "",     // G: Service Details
      data.submittedBy || "",        // H: Submitted By
      "service",                     // I: Entry Type (static)
      entryId,                       // J: Entry ID
      "pending",                     // K: Entry Status (pending/waiting/approved)
      "",                            // L: Approved By (empty initially)
    ]]);

    console.log("✅ Service payment added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Service payment added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding service payment:', error);
    return {
      success: false,
      error: 'Add service payment error: ' + error.toString()
    };
  }
}

/**
 * Get all Service Payments
 * @returns {Object} Array of service payment data or error
 */
function getServicePayments() {
  try {
    console.log("📋 Fetching all service payments...");

    // Get ServicePayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ ServicePayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No service payments found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[9],                      // Entry ID from column J
        timestamp: row[0],                    // Timestamp as-is
        date: row[1],                         // Date as-is
        serviceType: row[2],                  // Service type from column C
        cashAmount: row[3],                   // Cash amount from column D
        bankAmount: row[4],                   // Bank amount from column E
        totalAmount: row[5],                  // Total amount from column F
        serviceDetails: row[6],               // Service details from column G
        submittedBy: row[7],                  // Submitted by from column H
        entryType: row[8],                    // Entry type from column I
        entryStatus: row[10] || "pending",    // Entry status from column K
        approvedBy: row[11] || "",            // Approved by from column L
        rowIndex: index + 2,                  // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} service payments`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching service payments:", error);
    return {
      success: false,
      error: "Get service payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Service Payment
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateServicePayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating service payment ID: ${entryId}`, updatedData);

    // Get ServicePayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);

    if (!sheet) {
      throw new Error('ServicePayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID

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
      throw new Error(`Service payment not found with ID: ${entryId}`);
    }

    // Update fields that are provided in updatedData
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.serviceType !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.serviceType);
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
    if (updatedData.serviceDetails !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.serviceDetails);
    }

    console.log(`✅ Service payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Service payment updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating service payment:', error);
    return {
      success: false,
      error: 'Update service payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Service Payment
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteServicePayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting service payment ID: ${entryId}`);

    // Get ServicePayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);

    if (!sheet) {
      throw new Error('ServicePayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID

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
      throw new Error(`Service payment not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Service payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Service payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting service payment:', error);
    return {
      success: false,
      error: 'Delete service payment error: ' + error.toString()
    };
  }
}

/**
 * Update Service Payment Status (for approval workflow)
 * @param {Object} data - Status update data containing entryId, newStatus, and approverName
 * @returns {Object} Success/error response
 */
function updateServicePaymentStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus;
    const approverName = data.approverName || "";

    console.log(`🔄 Updating service payment status - ID: ${entryId}, Status: ${newStatus}, Approver: ${approverName}`);

    // Get ServicePayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);

    if (!sheet) {
      throw new Error('ServicePayments sheet not found');
    }

    const entryIdColumn = 10; // Column J contains Entry ID

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
      throw new Error(`Service payment not found with ID: ${entryId}`);
    }

    // Update status and approver (columns K and L)
    sheet.getRange(rowIndex, 11).setValue(newStatus); // Column K: EntryStatus
    if (approverName) {
      sheet.getRange(rowIndex, 12).setValue(approverName); // Column L: ApprovedBy
    }

    console.log(`✅ Service payment status updated - ID: ${entryId}, Status: ${newStatus}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Service payment status updated successfully',
      entryId: entryId,
      newStatus: newStatus,
      approverName: approverName
    };

  } catch (error) {
    console.error('❌ Error updating service payment status:', error);
    return {
      success: false,
      error: 'Update service payment status error: ' + error.toString()
    };
  }
}

/**
 * Approve Service Payment
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveServicePayment(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving service payment ID: ${entryId} by ${approverName}`);

    return updateServicePaymentStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving service payment:', error);
    return {
      success: false,
      error: 'Approve service payment error: ' + error.toString()
    };
  }
}

/**
 * Resend Service Payment (Reset to pending status)
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendServicePayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending service payment ID: ${entryId}`);

    return updateServicePaymentStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending service payment:', error);
    return {
      success: false,
      error: 'Resend service payment error: ' + error.toString()
    };
  }
}