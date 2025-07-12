
// ============================================================================
// LEGACY FUNCTIONS (LegacyFunctions.gs)
// ============================================================================

// This file maintains compatibility with older API calls
// All functions here route to their respective modern implementations

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
    return updateFuelPaymentLegacy ? updateFuelPaymentLegacy(data) : 
           typeof updateFuelPaymentStatus !== 'undefined' ? updateFuelPaymentStatus(data) : 
           { success: false, error: 'Function not implemented' };
  } catch (error) {
    console.error('❌ updateFuelPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteFuelPayment(data) {
  try {
    return deleteFuelPaymentLegacy ? deleteFuelPaymentLegacy(data) : 
           { success: false, error: 'Function not implemented' };
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

// Direct function aliases for Adda Payments
function updateAddaPayment(data) {
  try {
    return updateAddaPaymentLegacy ? updateAddaPaymentLegacy(data) : 
           { success: false, error: 'Function not implemented' };
  } catch (error) {
    console.error('❌ updateAddaPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteAddaPayment(data) {
  try {
    return deleteAddaPaymentLegacy ? deleteAddaPaymentLegacy(data) : 
           { success: false, error: 'Function not implemented' };
  } catch (error) {
    console.error('❌ deleteAddaPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

// Direct function aliases for Union Payments
function updateUnionPayment(data) {
  try {
    return updateUnionPaymentLegacy ? updateUnionPaymentLegacy(data) : 
           { success: false, error: 'Function not implemented' };
  } catch (error) {
    console.error('❌ updateUnionPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteUnionPayment(data) {
  try {
    return deleteUnionPaymentLegacy ? deleteUnionPaymentLegacy(data) : 
           { success: false, error: 'Function not implemented' };
  } catch (error) {
    console.error('❌ deleteUnionPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

// Direct function aliases for Other Payments
function updateOtherPayment(data) {
  try {
    return updateOtherPaymentLegacy ? updateOtherPaymentLegacy(data) : 
           { success: false, error: 'Function not implemented' };
  } catch (error) {
    console.error('❌ updateOtherPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteOtherPayment(data) {
  try {
    return deleteOtherPaymentLegacy ? deleteOtherPaymentLegacy(data) : 
           { success: false, error: 'Function not implemented' };
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
