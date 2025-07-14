// ============================================================================
// CASH DEPOSITS MANAGEMENT (CashDeposits.gs)
// ============================================================================
// Functions for managing cash deposit entries in Google Sheets
// ============================================================================

/**
 * Add new Cash Deposit entry to Google Sheets
 */
function addCashDeposit(data) {
  try {
    console.log("💰 Adding cash deposit:", data);

    // Get Cash Deposits sheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.CASH_DEPOSITS);

    if (!sheet) {
      throw new Error("Cash Deposits sheet not found. Please check sheet configuration.");
    }

    // Validate required fields
    if (!data.entryId || !data.date || !data.cashAmount || !data.description || !data.depositedBy) {
      throw new Error("Missing required fields for cash deposit");
    }

    // Prepare row data - match the column order: Timestamp, EntryType, EntryId, Date, CashAmount, Description, DepositedBy
    const rowData = [
      data.timestamp || formatISTTimestamp(),
      data.entryType || 'Cash Deposit',
      data.entryId,
      data.date,
      parseFloat(data.cashAmount) || 0,
      data.description,
      data.depositedBy
    ];

    console.log("📝 Inserting cash deposit row:", rowData);

    // Insert new row at the top (after header)
    sheet.insertRowAfter(1);
    const newRowRange = sheet.getRange(2, 1, 1, rowData.length);
    newRowRange.setValues([rowData]);

    // Format the new row
    formatCashDepositRow(sheet, 2);

    console.log("✅ Cash deposit added successfully");

    return {
      success: true,
      message: "Cash deposit added successfully",
      entryId: data.entryId,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Error adding cash deposit:", error);
    return {
      success: false,
      error: "Failed to add cash deposit: " + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Get all Cash Deposits from Google Sheets
 */
function getCashDeposits() {
  try {
    console.log("📋 Fetching cash deposits from Google Sheets...");

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.CASH_DEPOSITS);

    if (!sheet) {
      console.log("⚠️ Cash Deposits sheet not found, returning empty data");
      return {
        success: true,
        data: [],
        count: 0,
        timestamp: formatISTTimestamp()
      };
    }

    const data = sheet.getDataRange().getValues();

    if (!data || data.length <= 1) {
      console.log("⚠️ No cash deposits found");
      return {
        success: true,
        data: [],
        count: 0,
        timestamp: formatISTTimestamp()
      };
    }

    const headers = data[0];
    const deposits = [];

    // Column indices - Timestamp, EntryType, EntryId, Date, CashAmount, Description, DepositedBy
    const timestampIndex = 0;
    const entryTypeIndex = 1;
    const entryIdIndex = 2;
    const dateIndex = 3;
    const cashAmountIndex = 4;
    const descriptionIndex = 5;
    const depositedByIndex = 6;

    console.log("📋 Processing cash deposits with headers:", headers);

    // Process each row (skip header)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (row[entryIdIndex] && row[entryIdIndex].toString().trim()) {
        const deposit = {
          id: row[entryIdIndex],
          timestamp: row[timestampIndex] ? formatTimestampForDisplay(row[timestampIndex]) : '',
          entryType: row[entryTypeIndex] || 'Cash Deposit',
          entryId: row[entryIdIndex].toString().trim(),
          date: row[dateIndex] ? formatDateForDisplay(row[dateIndex]) : '',
          cashAmount: parseFloat(row[cashAmountIndex]) || 0,
          description: row[descriptionIndex] ? row[descriptionIndex].toString().trim() : '',
          depositedBy: row[depositedByIndex] ? row[depositedByIndex].toString().trim() : ''
        };

        deposits.push(deposit);
        console.log(`💰 Cash deposit processed: ID=${deposit.entryId}, Amount=${deposit.cashAmount}, By=${deposit.depositedBy}`);
      }
    }

    console.log(`✅ Retrieved ${deposits.length} cash deposits successfully`);

    return {
      success: true,
      data: deposits,
      count: deposits.length,
      timestamp: formatISTTimestamp()
    };

  } catch (error) {
    console.error("❌ Error fetching cash deposits:", error);
    return {
      success: false,
      error: "Failed to fetch cash deposits: " + error.toString(),
      data: [],
      count: 0,
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Update Cash Deposit entry
 */
function updateCashDeposit(data) {
  try {
    console.log("📝 Updating cash deposit:", data);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.CASH_DEPOSITS);

    if (!sheet) {
      throw new Error("Cash Deposits sheet not found");
    }

    // Find the row with matching entry ID
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let targetRow = -1;

    for (let i = 1; i < values.length; i++) {
      if (values[i][2] && values[i][2].toString() === data.entryId.toString()) {
        targetRow = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (targetRow === -1) {
      throw new Error(`Cash deposit with entry ID ${data.entryId} not found`);
    }

    // Update the row with new data
    const updatedData = data.updatedData;
    const rowData = [
      formatISTTimestamp(), // Updated timestamp
      updatedData.entryType || 'Cash Deposit',
      data.entryId,
      updatedData.date,
      parseFloat(updatedData.cashAmount) || 0,
      updatedData.description,
      updatedData.depositedBy
    ];

    const range = sheet.getRange(targetRow, 1, 1, rowData.length);
    range.setValues([rowData]);

    // Format the updated row
    formatCashDepositRow(sheet, targetRow);

    console.log("✅ Cash deposit updated successfully");

    return {
      success: true,
      message: "Cash deposit updated successfully",
      entryId: data.entryId,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Error updating cash deposit:", error);
    return {
      success: false,
      error: "Failed to update cash deposit: " + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Delete Cash Deposit entry
 */
function deleteCashDeposit(data) {
  try {
    console.log("🗑️ Deleting cash deposit:", data);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.CASH_DEPOSITS);

    if (!sheet) {
      throw new Error("Cash Deposits sheet not found");
    }

    // Find the row with matching entry ID
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let targetRow = -1;

    for (let i = 1; i < values.length; i++) {
      if (values[i][2] && values[i][2].toString() === data.entryId.toString()) {
        targetRow = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }

    if (targetRow === -1) {
      throw new Error(`Cash deposit with entry ID ${data.entryId} not found`);
    }

    // Delete the row
    sheet.deleteRow(targetRow);

    console.log("✅ Cash deposit deleted successfully");

    return {
      success: true,
      message: "Cash deposit deleted successfully",
      entryId: data.entryId,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Error deleting cash deposit:", error);
    return {
      success: false,
      error: "Failed to delete cash deposit: " + error.toString(),
      timestamp: formatISTTimestamp()
    };
  }
}

/**
 * Format cash deposit row for better presentation
 */
function formatCashDepositRow(sheet, rowNumber) {
  try {
    const range = sheet.getRange(rowNumber, 1, 1, 7);

    // Set basic formatting
    range.setHorizontalAlignment("center");
    range.setVerticalAlignment("middle");

    // Format cash amount column (column 5) as currency
    const amountRange = sheet.getRange(rowNumber, 5);
    amountRange.setNumberFormat("₹#,##0.00");

    // Set borders
    range.setBorder(true, true, true, true, true, true);

    // Alternate row coloring for better readability
    if (rowNumber % 2 === 0) {
      range.setBackground("#f8f9fa");
    }

  } catch (error) {
    console.error("⚠️ Error formatting cash deposit row:", error);
  }
}