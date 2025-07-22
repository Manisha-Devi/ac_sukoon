
// ============================================================================
// TRANSPORT PAYMENTS - COMPLETE CRUD OPERATIONS (TransportPayments.gs)
// ============================================================================

/**
 * Add new Transport Payment
 * Sheet Columns: A=Timestamp, B=Date, C=PaymentType, D=Description, E=CashAmount, 
 *                F=BankAmount, G=TotalAmount, H=Category, I=SubmittedBy, J=EntryType, K=EntryId, L=EntryStatus,
 *                M=ApprovedBy
 * @param {Object} data - Transport payment data
 * @returns {Object} Success/error response with entry details
 */
function addTransportPayment(data) {
  try {
    console.log("🚛 Adding new transport payment:", data);

    // Get or create TransportPayments sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.TRANSPORT_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating TransportPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.TRANSPORT_PAYMENTS);

      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 13).setValues([[
        "Timestamp", "Date", "PaymentType", "Description", "CashAmount", 
        "BankAmount", "TotalAmount", "Category", "SubmittedBy", "EntryType", 
        "EntryId", "EntryStatus", "ApprovedBy"
      ]]);
    }

    // Generate entry ID if not provided
    const entryId = data.entryId || Date.now();

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || formatISTTimestamp();

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);

    // Add data to the new row
    sheet.getRange(2, 1, 1, 13).setValues([[
      timeOnly,                      // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                     // B: Date from frontend
      data.paymentType || "",        // C: Payment Type (Permit Fee, Registration Fee, etc.)
      data.description || "",        // D: Description
      data.cashAmount || 0,          // E: Cash Amount
      data.bankAmount || 0,          // F: Bank Amount
      data.totalAmount || 0,         // G: Total Amount
      "transport",                   // H: Category (static)
      data.submittedBy || "",        // I: Submitted By
      "transport",                   // J: Entry Type (static)
      entryId,                       // K: Entry ID
      data.entryStatus || "pending", // L: Entry Status (pending/waiting/approved)
      "",                            // M: Approved By (initially empty)
    ]]);

    console.log("✅ Transport payment added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Transport payment added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding transport payment:', error);
    return {
      success: false,
      error: 'Add transport payment error: ' + error.toString()
    };
  }
}

/**
 * Get all Transport Payments
 * @returns {Object} Array of transport payment data or error
 */
function getTransportPayments() {
  try {
    console.log("🚛 Fetching all transport payments...");

    // Get TransportPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.TRANSPORT_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ TransportPayments sheet not found, returning empty data");
      return { 
        success: true, 
        data: [],
        count: 0,
        timestamp: formatISTTimestamp()
      };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No transport payments found");
      return { 
        success: true, 
        data: [],
        count: 0,
        timestamp: formatISTTimestamp()
      };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[10],                    // Entry ID from column K
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: formatDateForDisplay(row[1]),   // Convert date to string
        paymentType: row[2] || '',           // Payment type from column C
        description: row[3] || '',           // Description from column D
        cashAmount: Number(row[4]) || 0,     // Cash amount from column E
        bankAmount: Number(row[5]) || 0,     // Bank amount from column F
        totalAmount: Number(row[6]) || 0,    // Total amount from column G
        category: row[7] || 'transport',     // Category from column H
        submittedBy: row[8] || '',           // Submitted by from column I
        entryType: row[9] || 'transport',    // Entry type from column J
        entryStatus: row[11] || "pending",   // Entry status from column L
        approvedBy: row[12] || "",           // Approved by from column M
        rowIndex: index + 2,                 // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} transport payments`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length,
      timestamp: formatISTTimestamp()
    };

  } catch (error) {
    console.error("❌ Error fetching transport payments:", error);
    return {
      success: false,
      error: "Get transport payments error: " + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Update existing Transport Payment
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateTransportPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating transport payment ID: ${entryId}`, updatedData);

    // Get TransportPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.TRANSPORT_PAYMENTS);

    if (!sheet) {
      throw new Error('TransportPayments sheet not found');
    }

    const entryIdColumn = 11; // Column K contains Entry ID

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
      throw new Error(`Transport payment not found with ID: ${entryId}`);
    }

    // Update fields that are provided in updatedData
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.paymentType !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.paymentType);
    }
    if (updatedData.description !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.description);
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
    if (updatedData.submittedBy !== undefined) {
      sheet.getRange(rowIndex, 9).setValue(updatedData.submittedBy);
    }

    console.log(`✅ Transport payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Transport payment updated successfully',
      entryId: entryId,
      updatedRow: rowIndex,
      timestamp: formatISTTimestamp()
    };

  } catch (error) {
    console.error('❌ Error updating transport payment:', error);
    return {
      success: false,
      error: 'Update transport payment error: ' + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Delete Transport Payment
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteTransportPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting transport payment ID: ${entryId}`);

    // Get TransportPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.TRANSPORT_PAYMENTS);

    if (!sheet) {
      throw new Error('TransportPayments sheet not found');
    }

    const entryIdColumn = 11; // Column K contains Entry ID

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
      throw new Error(`Transport payment not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Transport payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Transport payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex,
      timestamp: formatISTTimestamp()
    };

  } catch (error) {
    console.error('❌ Error deleting transport payment:', error);
    return {
      success: false,
      error: 'Delete transport payment error: ' + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Update Transport Payment Status (for approval workflow)
 * @param {Object} data - Status update data containing entryId, newStatus, and approverName
 * @returns {Object} Success/error response
 */
function updateTransportPaymentStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus;
    const approverName = data.approverName || "";

    console.log(`🔄 Updating transport payment status - ID: ${entryId}, Status: ${newStatus}, Approver: ${approverName}`);

    // Get TransportPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.TRANSPORT_PAYMENTS);

    if (!sheet) {
      throw new Error('TransportPayments sheet not found');
    }

    const entryIdColumn = 11; // Column K contains Entry ID

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
      throw new Error(`Transport payment not found with ID: ${entryId}`);
    }

    // Update status and approver (columns L and M)
    sheet.getRange(rowIndex, 12).setValue(newStatus); // Column L: EntryStatus
    if (approverName) {
      sheet.getRange(rowIndex, 13).setValue(approverName); // Column M: ApprovedBy
    }

    console.log(`✅ Transport payment status updated - ID: ${entryId}, Status: ${newStatus}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Transport payment status updated successfully',
      entryId: entryId,
      newStatus: newStatus,
      approverName: approverName,
      timestamp: formatISTTimestamp()
    };

  } catch (error) {
    console.error('❌ Error updating transport payment status:', error);
    return {
      success: false,
      error: 'Update transport payment status error: ' + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Approve Transport Payment
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveTransportPayment(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving transport payment ID: ${entryId} by ${approverName}`);

    return updateTransportPaymentStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving transport payment:', error);
    return {
      success: false,
      error: 'Approve transport payment error: ' + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Resend Transport Payment (Reset to pending status)
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendTransportPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending transport payment ID: ${entryId}`);

    return updateTransportPaymentStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending transport payment:', error);
    return {
      success: false,
      error: 'Resend transport payment error: ' + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}
