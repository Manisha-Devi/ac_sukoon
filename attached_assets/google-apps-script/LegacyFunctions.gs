// ============================================================================
// LEGACY FUNCTIONS (LegacyFunctions.gs)
// ============================================================================

// This file maintains compatibility with older API calls
// All functions here route to their respective modern implementations
// Constants are handled in Code.gs to avoid duplication

// Legacy Fuel Payment functions
function updateFuelPaymentLegacy(data) {
  console.log('🔄 Legacy updateFuelPayment called, routing to modern implementation');
  return updateFuelPayment(data);
}

function deleteFuelPaymentLegacy(data) {
  console.log('🔄 Legacy deleteFuelPayment called, routing to modern implementation');
  return deleteFuelPayment(data);
}

// Direct function aliases for backward compatibility
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
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.pumpName !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.pumpName);
    }
    if (updatedData.liters !== undefined) {
      sheet.getRange(rowIndex, 4).setValue(updatedData.liters);
    }
    if (updatedData.rate !== undefined) {
      sheet.getRange(rowIndex, 5).setValue(updatedData.rate);
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
    if (updatedData.remarks !== undefined) {
      sheet.getRange(rowIndex, 9).setValue(updatedData.remarks);
    }

    console.log(`✅ Fuel payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Fuel payment updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
    };
  } catch (error) {
    console.error('❌ updateFuelPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteFuelPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting fuel payment ID: ${entryId}`);

    // Get FuelPayments sheet
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
    console.error('❌ deleteFuelPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

// Legacy Adda Payment functions
function updateAddaPaymentLegacy(data) {
  console.log('🔄 Legacy updateAddaPayment called, routing to modern implementation');
  return updateAddaPayment(data);
}

function deleteAddaPaymentLegacy(data) {
  console.log('🔄 Legacy deleteAddaPayment called, routing to modern implementation');
  return deleteAddaPayment(data);
}

// Legacy Union Payment functions
function updateUnionPaymentLegacy(data) {
  console.log('🔄 Legacy updateUnionPayment called, routing to modern implementation');
  return updateUnionPayment(data);
}

function deleteUnionPaymentLegacy(data) {
  console.log('🔄 Legacy deleteUnionPayment called, routing to modern implementation');
  return deleteUnionPayment(data);
}

// Legacy Service Payment functions
function updateServicePaymentLegacy(data) {
  console.log('🔄 Legacy updateServicePayment called, routing to modern implementation');
  return updateServicePayment(data);
}

function deleteServicePaymentLegacy(data) {
  console.log('🔄 Legacy deleteServicePayment called, routing to modern implementation');
  return deleteServicePayment(data);
}

// Legacy Other Payment functions
function updateOtherPaymentLegacy(data) {
  console.log('🔄 Legacy updateOtherPayment called, routing to modern implementation');
  return updateOtherPayment(data);
}

function deleteOtherPaymentLegacy(data) {
  console.log('🔄 Legacy deleteOtherPayment called, routing to modern implementation');
  return deleteOtherPayment(data);
}

// Legacy Employee Payment functions
function updateEmployPaymentLegacy(data) {
  console.log('🔄 Legacy updateEmployPayment called, routing to modern implementation');
  return updateEmployPayment(data);
}

function deleteEmployPaymentLegacy(data) {
  console.log('🔄 Legacy deleteEmployPayment called, routing to modern implementation');
  return deleteEmployPayment(data);
}

// Direct function aliases for Adda Payments
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

    // Update only provided fields
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
    if (updatedData.remarks !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.remarks);
    }

    console.log(`✅ Adda payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Adda payment updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
    };
  } catch (error) {
    console.error('❌ updateAddaPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

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
    console.error('❌ deleteAddaPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

// Direct function aliases for Union Payments
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
    if (updatedData.date !== undefined) {
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
      updatedRow: rowIndex
    };
  } catch (error) {
    console.error('❌ updateUnionPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

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
    console.error('❌ deleteUnionPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

// Direct function aliases for Service Payments
function updateServicePayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating service payment ID: ${entryId}`, updatedData);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);

    if (!sheet) {
      throw new Error('ServicePayments sheet not found');
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
      throw new Error(`Service payment not found with ID: ${entryId}`);
    }

    // Update only provided fields
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
    console.error('❌ updateServicePayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteServicePayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting service payment ID: ${entryId}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.SERVICE_PAYMENTS);

    if (!sheet) {
      throw new Error('ServicePayments sheet not found');
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
      throw new Error(`Service payment not found with ID: ${entryId}`);
    }

    sheet.deleteRow(rowIndex);

    console.log(`✅ Service payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Service payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };
  } catch (error) {
    console.error('❌ deleteServicePayment error:', error);
    return { success: false, error: error.toString() };
  }
}

// Direct function aliases for Other Payments
function updateOtherPayment(data) {
  try {
    const entryId = data.entryId;
    const updatedData = data.updatedData;

    console.log(`📝 Updating other payment ID: ${entryId}`, updatedData);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OTHER_PAYMENTS);

    if (!sheet) {
      throw new Error('OtherPayments sheet not found');
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
      throw new Error(`Other payment not found with ID: ${entryId}`);
    }

    // Update only provided fields
    if (updatedData.date !== undefined) {
      sheet.getRange(rowIndex, 2).setValue(updatedData.date);
    }
    if (updatedData.paymentType !== undefined) {
      sheet.getRange(rowIndex, 3).setValue(updatedData.paymentType);
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
    if (updatedData.paymentDetails !== undefined) {
      sheet.getRange(rowIndex, 7).setValue(updatedData.paymentDetails);
    }

    console.log(`✅ Other payment updated successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Other payment updated successfully',
      entryId: entryId,
      updatedRow: rowIndex
    };
  } catch (error) {
    console.error('❌ updateOtherPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteOtherPayment(data) {
  try {
    const entryId = data.entryId;

    console.log(`🗑️ Deleting other payment ID: ${entryId}`);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAMES.OTHER_PAYMENTS);

    if (!sheet) {
      throw new Error('OtherPayments sheet not found');
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
      throw new Error(`Other payment not found with ID: ${entryId}`);
    }

    sheet.deleteRow(rowIndex);

    console.log(`✅ Other payment deleted successfully - ID: ${entryId}, Row: ${rowIndex}`);

    return {
      success: true,
      message: 'Other payment deleted successfully',
      entryId: entryId,
      deletedRow: rowIndex
    };
  } catch (error) {
    console.error('❌ deleteOtherPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

// Legacy FareReceipts functions
function updateFareReceiptLegacy(data) {
  console.log('🔄 Legacy updateFareReceipt called, routing to modern implementation');
  return updateFareReceipt(data);
}

function deleteFareReceiptLegacy(data) {
  console.log('🔄 Legacy deleteFareReceipt called, routing to modern implementation');
  return deleteFareReceipt(data);
}

// Legacy BookingEntries functions
function updateBookingEntryLegacy(data) {
  console.log('🔄 Legacy updateBookingEntry called, routing to modern implementation');
  return updateBookingEntry(data);
}

function deleteBookingEntryLegacy(data) {
  console.log('🔄 Legacy deleteBookingEntry called, routing to modern implementation');
  return deleteBookingEntry(data);
}

// Legacy OffDays functions
function updateOffDayLegacy(data) {
  console.log('🔄 Legacy updateOffDay called, routing to modern implementation');
  return updateOffDay(data);
}

function deleteOffDayLegacy(data) {
  console.log('🔄 Legacy deleteOffDay called, routing to modern implementation');
  return deleteOffDay(data);
}

// Legacy Status Update Functions
// ============================================================================

// Legacy FuelPayments status functions
function updateFuelPaymentStatusLegacy(data) {
  console.log('🔄 Legacy updateFuelPaymentStatus called, routing to modern implementation');
  return updateFuelPaymentStatus(data);
}

function approveFuelPaymentLegacy(data) {
  console.log('🔄 Legacy approveFuelPayment called, routing to modern implementation');
  return approveFuelPayment(data);
}

// Legacy AddaPayments status functions
function updateAddaPaymentStatusLegacy(data) {
  console.log('🔄 Legacy updateAddaPaymentStatus called, routing to modern implementation');
  return updateAddaPaymentStatus(data);
}

function approveAddaPaymentLegacy(data) {
  console.log('🔄 Legacy approveAddaPayment called, routing to modern implementation');
  return approveAddaPayment(data);
}

// Legacy UnionPayments status functions
function updateUnionPaymentStatusLegacy(data) {
  console.log('🔄 Legacy updateUnionPaymentStatus called, routing to modern implementation');
  return updateUnionPaymentStatus(data);
}

function approveUnionPaymentLegacy(data) {
  console.log('🔄 Legacy approveUnionPayment called, routing to modern implementation');
  return approveUnionPayment(data);
}

// Legacy ServicePayments status functions
function updateServicePaymentStatusLegacy(data) {
  console.log('🔄 Legacy updateServicePaymentStatus called, routing to modern implementation');
  return updateServicePaymentStatus(data);
}

function approveServicePaymentLegacy(data) {
  console.log('🔄 Legacy approveServicePayment called, routing to modern implementation');
  return approveServicePayment(data);
}

// Legacy OtherPayments status functions
function updateOtherPaymentStatusLegacy(data) {
  console.log('🔄 Legacy updateOtherPaymentStatus called, routing to modern implementation');
  return updateOtherPaymentStatus(data);
}

function approveOtherPaymentLegacy(data) {
  console.log('🔄 Legacy approveOtherPayment called, routing to modern implementation');
  return approveOtherPayment(data);
}

// Legacy EmployeePayments status functions
function updateEmployPaymentStatusLegacy(data) {
  console.log('🔄 Legacy updateEmployPaymentStatus called, routing to modern implementation');
  return updateEmployPaymentStatus(data);
}

function approveEmployPaymentLegacy(data) {
  console.log('🔄 Legacy approveEmployPayment called, routing to modern implementation');
  return approveEmployPayment(data);
}

// Legacy FareReceipts status functions
function updateFareReceiptStatusLegacy(data) {
  console.log('🔄 Legacy updateFareReceiptStatus called, routing to modern implementation');
  return updateFareReceiptStatus(data);
}

function approveFareReceiptLegacy(data) {
  console.log('🔄 Legacy approveFareReceipt called, routing to modern implementation');
  return approveFareReceipt(data);
}

// Legacy BookingEntries status functions
function updateBookingEntryStatusLegacy(data) {
  console.log('🔄 Legacy updateBookingEntryStatus called, routing to modern implementation');
  return updateBookingEntryStatus(data);
}

function approveBookingEntryLegacy(data) {
  console.log('🔄 Legacy approveBookingEntry called, routing to modern implementation');
  return approveBookingEntry(data);
}

// Legacy OffDays status functions
function updateOffDayStatusLegacy(data) {
  console.log('🔄 Legacy updateOffDayStatus called, routing to modern implementation');
  return updateOffDayStatus(data);
}

function approveOffDayLegacy(data) {
  console.log('🔄 Legacy approveOffDay called, routing to modern implementation');
  return approveOffDay(data);
}

// FareReceipt functions are implemented in FareReceipts.gs
// No placeholder functions needed here

// BookingEntry functions are implemented in BookingEntries.gs
// No placeholder functions needed here - functions automatically available

// OffDay functions are implemented in OffDays.gs
// No placeholder functions needed here - functions automatically available

// Legacy functions for backward compatibility with existing API calls
// ============================================================================

/**
 * Legacy Universal Update Function (for backward compatibility)
 * Routes update requests to appropriate specific functions based on entry type
 */
function updateFareEntryLegacy(data) {
  try {
    const entryType = data.entryType;

    console.log(`🔄 Legacy update request for entry type: ${entryType}`);

    // Route to specific update function based on entry type
    if (entryType === 'daily') {
      return updateFareReceipt(data);
    } else if (entryType === 'booking') {
      return updateBookingEntry(data);
    } else if (entryType === 'off') {
      return updateOffDay(data);
    } else if (entryType === 'adda') {
      return updateAddaPayment(data);
    } else if (entryType === 'fuel') {
      return updateFuelPayment(data);
    } else if (entryType === 'union') {
      return updateUnionPayment(data);
    } else if (entryType === 'service') {
      return updateServicePayment(data);
    } else if (entryType === 'other') {
      return updateOtherPayment(data);
    } else if (entryType === 'employ') {
      return updateEmployPayment(data);
    } else {
      throw new Error(`Invalid entry type: ${entryType}`);
    }

  } catch (error) {
    console.error('❌ Legacy update error:', error);
    return {
      success: false,
      error: 'Legacy update error: ' + error.toString()
    };
  }
}

/**
 * Legacy Universal Delete Function (for backward compatibility)
 * Routes delete requests to appropriate specific functions based on entry type
 */
function deleteFareEntryLegacy(data) {
  try {
    const entryType = data.entryType;

    console.log(`🔄 Legacy delete request for entry type: ${entryType}`);

    // Route to specific delete function based on entry type
    if (entryType === 'daily') {
      return deleteFareReceipt(data);
    } else if (entryType === 'booking') {
      return deleteBookingEntry(data);
    } else if (entryType === 'off') {
      return deleteOffDay(data);
    } else if (entryType === 'adda') {
      return deleteAddaPayment(data);
    } else if (entryType === 'fuel') {
      return deleteFuelPayment(data);
    } else if (entryType === 'union') {
      return deleteUnionPayment(data);
    } else if (entryType === 'service') {
      return deleteServicePayment(data);
    } else if (entryType === 'other') {
      return deleteOtherPayment(data);
    } else if (entryType === 'employ') {
      return deleteEmployPayment(data);
    } else {
      throw new Error(`Invalid entry type: ${entryType}`);
    }

  } catch (error) {
    console.error('❌ Legacy delete error:', error);
    return {
      success: false,
      error: 'Legacy delete error: ' + error.toString()
    };
  }
}