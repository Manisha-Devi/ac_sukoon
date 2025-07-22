
// ============================================================================
// FOOD PAYMENTS - COMPLETE CRUD OPERATIONS
// ============================================================================

/**
 * Add new Food Payment
 * Sheet Columns: A=Timestamp, B=Date, C=PaymentType, D=Description, E=CashAmount, 
 *                F=BankAmount, G=TotalAmount, H=Category, I=SubmittedBy, J=EntryType, K=EntryId, L=EntryStatus,
 *                M=ApprovedBy
 * @param {Object} data - Food payment data
 * @returns {Object} Success/error response with entry details
 */
function addFoodPayment(data) {
  try {
    console.log("🍽️ Adding new food payment:", data);

    // Get or create FoodPayments sheet
    let sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FOOD_PAYMENTS);

    // Create sheet if it doesn't exist
    if (!sheet) {
      console.log("📋 Creating FoodPayments sheet...");
      sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
        .insertSheet(SHEET_NAMES.FOOD_PAYMENTS);

      // Add headers exactly as specified
      sheet.getRange(1, 1, 1, 13).setValues([[
        "Timestamp", "Date", "PaymentType", "Description", "CashAmount", 
        "BankAmount", "TotalAmount", "Category", "SubmittedBy", "EntryType", 
        "EntryId", "EntryStatus", "ApprovedBy"
      ]]);
    }

    // Generate entry ID if not provided
    const entryId = data.entryId;

    // Format timestamp (store only time part)
    const timeOnly = data.timestamp || 
      formatISTTimestamp().split(' ')[1] + ' ' + formatISTTimestamp().split(' ')[2];

    // Insert new row at position 2 (keeps newest entries at top)
    sheet.insertRowBefore(2);

    // Add data to the new row
    sheet.getRange(2, 1, 1, 13).setValues([[
      timeOnly,                      // A: Time in IST (HH:MM:SS AM/PM)
      data.date,                     // B: Date from frontend
      data.paymentType || "",        // C: Payment Type (Lunch, Breakfast, etc.)
      data.description || "",        // D: Description
      data.cashAmount || 0,          // E: Cash Amount
      data.bankAmount || 0,          // F: Bank Amount
      data.totalAmount || 0,         // G: Total Amount
      "food",                        // H: Category (static)
      data.submittedBy || "",        // I: Submitted By
      "food",                        // J: Entry Type (static)
      entryId,                       // K: Entry ID
      "pending",                     // L: Entry Status (pending/waiting/approved)
      "",                            // M: Approved By (initially empty)
    ]]);

    console.log("✅ Food payment added successfully with ID:", entryId);

    return {
      success: true,
      message: 'Food payment added successfully',
      entryId: entryId,
      timestamp: timeOnly
    };

  } catch (error) {
    console.error('❌ Error adding food payment:', error);
    return {
      success: false,
      error: 'Add food payment error: ' + error.toString()
    };
  }
}

/**
 * Get all Food Payments
 * @returns {Object} Array of food payment data or error
 */
function getFoodPayments() {
  try {
    console.log("🍽️ Fetching all food payments...");

    // Get FoodPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FOOD_PAYMENTS);

    if (!sheet) {
      console.log("ℹ️ FoodPayments sheet not found, returning empty data");
      return { success: true, data: [] };
    }

    // Get all data from sheet
    const values = sheet.getDataRange().getValues();

    // Check if sheet has data beyond headers
    if (values.length <= 1) {
      console.log("ℹ️ No food payments found");
      return { success: true, data: [] };
    }

    // Process and format data
    const data = values.slice(1).map((row, index) => {
      return {
        entryId: row[10],                    // Entry ID from column K
        timestamp: String(row[0] || ''),      // Convert timestamp to string
        date: String(row[1] || ''),           // Convert date to string
        paymentType: row[2],                 // Payment type from column C
        description: row[3],                 // Description from column D
        cashAmount: row[4],                  // Cash amount from column E
        bankAmount: row[5],                  // Bank amount from column F
        totalAmount: row[6],                 // Total amount from column G
        category: row[7],                    // Category from column H
        submittedBy: row[8],                 // Submitted by from column I
        entryType: row[9],                   // Entry type from column J
        entryStatus: row[11] || "pending",   // Entry status from column L
        approvedBy: row[12] || "",           // Approved by from column M
        rowIndex: index + 2,                 // Store row index for updates/deletes
      };
    });

    console.log(`✅ Found ${data.length} food payments`);

    // Return data in reverse order (newest first)
    return { 
      success: true, 
      data: data.reverse(),
      count: data.length 
    };

  } catch (error) {
    console.error("❌ Error fetching food payments:", error);
    return {
      success: false,
      error: "Get food payments error: " + error.toString(),
    };
  }
}

/**
 * Update existing Food Payment
 * @param {Object} data - Update data containing entryId and updatedData
 * @returns {Object} Success/error response
 */
function updateFoodPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating food payment ID: ${entryId}`, updatedData);

    // Get FoodPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FOOD_PAYMENTS);

    if (!sheet) {
      throw new Error('FoodPayments sheet not found');
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
      throw new Error(`Food payment not found with ID: ${entryId}`);
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

    console.log(`✅ Food payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Food payment updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error updating food payment:', error);
    return {
      success: false,
      error: 'Update food payment error: ' + error.toString()
    };
  }
}

/**
 * Delete Food Payment
 * @param {Object} data - Delete data containing entryId
 * @returns {Object} Success/error response
 */
function deleteFoodPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting food payment ID: ${entryId}`);

    // Get FoodPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FOOD_PAYMENTS);

    if (!sheet) {
      throw new Error('FoodPayments sheet not found');
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
      throw new Error(`Food payment not found with ID: ${entryId}`);
    }

    // Delete the entire row
    sheet.deleteRow(rowIndex);

    console.log(`✅ Food payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Food payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };

  } catch (error) {
    console.error('❌ Error deleting food payment:', error);
    return {
      success: false,
      error: 'Delete food payment error: ' + error.toString()
    };
  }
}

/**
 * Update Food Payment Status (for approval workflow)
 * @param {Object} data - Status update data containing entryId, newStatus, and approverName
 * @returns {Object} Success/error response
 */
function updateFoodPaymentStatus(data) {
  try {
    const entryId = data.entryId;
    const newStatus = data.newStatus;
    const approverName = data.approverName || "";

    console.log(`🔄 Updating food payment status - ID: ${entryId}, Status: ${newStatus}, Approver: ${approverName}`);

    // Get FoodPayments sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.FOOD_PAYMENTS);

    if (!sheet) {
      throw new Error('FoodPayments sheet not found');
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
      throw new Error(`Food payment not found with ID: ${entryId}`);
    }

    // Update status and approver (columns L and M)
    sheet.getRange(rowIndex, 12).setValue(newStatus); // Column L: EntryStatus
    if (approverName) {
      sheet.getRange(rowIndex, 13).setValue(approverName); // Column M: ApprovedBy
    }

    console.log(`✅ Food payment status updated - ID: ${entryId}, Status: ${newStatus}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Food payment status updated successfully',
      entryId: entryId,
      newStatus: newStatus,
      approverName: approverName
    };

  } catch (error) {
    console.error('❌ Error updating food payment status:', error);
    return {
      success: false,
      error: 'Update food payment status error: ' + error.toString()
    };
  }
}

/**
 * Approve Food Payment
 * @param {Object} data - Approval data containing entryId and approverName
 * @returns {Object} Success/error response
 */
function approveFoodPayment(data) {
  try {
    const entryId = data.entryId;
    const approverName = data.approverName;

    console.log(`✅ Approving food payment ID: ${entryId} by ${approverName}`);

    return updateFoodPaymentStatus({
      entryId: entryId,
      newStatus: 'approved',
      approverName: approverName
    });

  } catch (error) {
    console.error('❌ Error approving food payment:', error);
    return {
      success: false,
      error: 'Approve food payment error: ' + error.toString()
    };
  }
}

/**
 * Resend Food Payment (Reset to pending status)
 * @param {Object} data - Resend data containing entryId
 * @returns {Object} Success/error response
 */
function resendFoodPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🔄 Resending food payment ID: ${entryId}`);

    return updateFoodPaymentStatus({
      entryId: entryId,
      newStatus: 'pending',
      approverName: ''
    });

  } catch (error) {
    console.error('❌ Error resending food payment:', error);
    return {
      success: false,
      error: 'Resend food payment error: ' + error.toString()
    };
  }
}
