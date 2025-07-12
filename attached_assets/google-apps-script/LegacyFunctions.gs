// ============================================================================
// LEGACY FUNCTIONS (LegacyFunctions.gs)
// ============================================================================

// This file maintains compatibility with older API calls
// All functions here route to their respective modern implementations

// Legacy Fuel Payment functions
function updateFuelPayment(data) {
  console.log('🔄 Legacy updateFuelPayment called, routing to modern implementation');
  return FuelPayments.updateFuelPayment(data);
}

function deleteFuelPayment(data) {
  console.log('🔄 Legacy deleteFuelPayment called, routing to modern implementation');
  return FuelPayments.deleteFuelPayment(data);
}

// Legacy Adda Payment functions
function updateAddaPayment(data) {
  console.log('🔄 Legacy updateAddaPayment called, routing to modern implementation');
  return AddaPayments.updateAddaPayment(data);
}

function deleteAddaPayment(data) {
  console.log('🔄 Legacy deleteAddaPayment called, routing to modern implementation');
  return AddaPayments.deleteAddaPayment(data);
}

// Legacy Union Payment functions
function updateUnionPayment(data) {
  console.log('🔄 Legacy updateUnionPayment called, routing to modern implementation');
  return UnionPayments.updateUnionPayment(data);
}

function deleteUnionPayment(data) {
  console.log('🔄 Legacy deleteUnionPayment called, routing to modern implementation');
  return UnionPayments.deleteUnionPayment(data);
}

// Legacy Service Payment functions
function updateServicePayment(data) {
  console.log('🔄 Legacy updateServicePayment called, routing to modern implementation');
  return ServicePayments.updateServicePayment(data);
}

function deleteServicePayment(data) {
  console.log('🔄 Legacy deleteServicePayment called, routing to modern implementation');
  return ServicePayments.deleteServicePayment(data);
}

// Legacy Other Payment functions
function updateOtherPayment(data) {
  console.log('🔄 Legacy updateOtherPayment called, routing to modern implementation');
  return OtherPayments.updateOtherPayment(data);
}

function deleteOtherPayment(data) {
  console.log('🔄 Legacy deleteOtherPayment called, routing to modern implementation');
  return OtherPayments.deleteOtherPayment(data);
}


// Legacy FareReceipts functions
function updateFareReceipt(data) {
  console.log('🔄 Legacy updateFareReceipt called, routing to modern implementation');
  return FareReceipts.updateFareReceipt(data);
}

function deleteFareReceipt(data) {
  console.log('🔄 Legacy deleteFareReceipt called, routing to modern implementation');
  return FareReceipts.deleteFareReceipt(data);
}

// Legacy BookingEntries functions
function updateBookingEntry(data) {
  console.log('🔄 Legacy updateBookingEntry called, routing to modern implementation');
  return BookingEntries.updateBookingEntry(data);
}

function deleteBookingEntry(data) {
  console.log('🔄 Legacy deleteBookingEntry called, routing to modern implementation');
  return BookingEntries.deleteBookingEntry(data);
}

// Legacy OffDays functions
function updateOffDay(data) {
  console.log('🔄 Legacy updateOffDay called, routing to modern implementation');
  return OffDays.updateOffDay(data);
}

function deleteOffDay(data) {
  console.log('🔄 Legacy deleteOffDay called, routing to modern implementation');
  return OffDays.deleteOffDay(data);
}

// Legacy Service Payment functions
function updateServicePayment(data) {
  console.log('🔄 Legacy updateServicePayment called, routing to modern implementation');
  return ServicePayments.updateServicePayment(data);
}

function deleteServicePayment(data) {
  console.log('🔄 Legacy deleteServicePayment called, routing to modern implementation');
  return ServicePayments.deleteServicePayment(data);
}

// Legacy Other Payment functions
function updateOtherPayment(data) {
  console.log('🔄 Legacy updateOtherPayment called, routing to modern implementation');
  return OtherPayments.updateOtherPayment(data);
}

function deleteOtherPayment(data) {
  console.log('🔄 Legacy deleteOtherPayment called, routing to modern implementation');
  return OtherPayments.deleteOtherPayment(data);
}

// Legacy Status Update Functions
// ============================================================================

// Legacy FuelPayments status functions
function updateFuelPaymentStatus(data) {
  console.log('🔄 Legacy updateFuelPaymentStatus called, routing to modern implementation');
  return FuelPayments.updateFuelPaymentStatus(data);
}

function approveFuelPayment(data) {
  console.log('🔄 Legacy approveFuelPayment called, routing to modern implementation');
  return FuelPayments.approveFuelPayment(data);
}

// Legacy AddaPayments status functions
function updateAddaPaymentStatus(data) {
  console.log('🔄 Legacy updateAddaPaymentStatus called, routing to modern implementation');
  return AddaPayments.updateAddaPaymentStatus(data);
}

function approveAddaPayment(data) {
  console.log('🔄 Legacy approveAddaPayment called, routing to modern implementation');
  return AddaPayments.approveAddaPayment(data);
}

// Legacy UnionPayments status functions
function updateUnionPaymentStatus(data) {
  console.log('🔄 Legacy updateUnionPaymentStatus called, routing to modern implementation');
  return UnionPayments.updateUnionPaymentStatus(data);
}

function approveUnionPayment(data) {
  console.log('🔄 Legacy approveUnionPayment called, routing to modern implementation');
  return UnionPayments.approveUnionPayment(data);
}

// Legacy ServicePayments status functions
function updateServicePaymentStatus(data) {
  console.log('🔄 Legacy updateServicePaymentStatus called, routing to modern implementation');
  return ServicePayments.updateServicePaymentStatus(data);
}

function approveServicePayment(data) {
  console.log('🔄 Legacy approveServicePayment called, routing to modern implementation');
  return ServicePayments.approveServicePayment(data);
}

// Legacy OtherPayments status functions
function updateOtherPaymentStatus(data) {
  console.log('🔄 Legacy updateOtherPaymentStatus called, routing to modern implementation');
  return OtherPayments.updateOtherPaymentStatus(data);
}

function approveOtherPayment(data) {
  console.log('🔄 Legacy approveOtherPayment called, routing to modern implementation');
  return OtherPayments.approveOtherPayment(data);
}

// Legacy FareReceipts status functions
function updateFareReceiptStatus(data) {
  console.log('🔄 Legacy updateFareReceiptStatus called, routing to modern implementation');
  return FareReceipts.updateFareReceiptStatus(data);
}

function approveFareReceipt(data) {
  console.log('🔄 Legacy approveFareReceipt called, routing to modern implementation');
  return FareReceipts.approveFareReceipt(data);
}

// Legacy BookingEntries status functions
function updateBookingEntryStatus(data) {
  console.log('🔄 Legacy updateBookingEntryStatus called, routing to modern implementation');
  return BookingEntries.updateBookingEntryStatus(data);
}

function approveBookingEntry(data) {
  console.log('🔄 Legacy approveBookingEntry called, routing to modern implementation');
  return BookingEntries.approveBookingEntry(data);
}

// Legacy OffDays status functions
function updateOffDayStatus(data) {
  console.log('🔄 Legacy updateOffDayStatus called, routing to modern implementation');
  return OffDays.updateOffDayStatus(data);
}

function approveOffDay(data) {
  console.log('🔄 Legacy approveOffDay called, routing to modern implementation');
  return OffDays.approveOffDay(data);
}

// Legacy Resend Functions
// ============================================================================

// Legacy FareReceipts resend functions
function resendFareReceipt(data) {
  console.log('🔄 Legacy resendFareReceipt called, routing to modern implementation');
  return FareReceipts.resendFareReceipt(data);
}

// Legacy BookingEntries resend functions
function resendBookingEntry(data) {
  console.log('🔄 Legacy resendBookingEntry called, routing to modern implementation');
  return BookingEntries.resendBookingEntry(data);
}

// Legacy OffDays resend functions
function resendOffDay(data) {
  console.log('🔄 Legacy resendOffDay called, routing to modern implementation');
  return OffDays.resendOffDay(data);
}

// Legacy FuelPayments resend functions
function resendFuelPayment(data) {
  console.log('🔄 Legacy resendFuelPayment called, routing to modern implementation');
  return FuelPayments.resendFuelPayment(data);
}

// Legacy AddaPayments resend functions
function resendAddaPayment(data) {
  console.log('🔄 Legacy resendAddaPayment called, routing to modern implementation');
  return AddaPayments.resendAddaPayment(data);
}

// Legacy UnionPayments resend functions
function resendUnionPayment(data) {
  console.log('🔄 Legacy resendUnionPayment called, routing to modern implementation');
  return UnionPayments.resendUnionPayment(data);
}

// Legacy ServicePayments resend functions
function resendServicePayment(data) {
  console.log('🔄 Legacy resendServicePayment called, routing to modern implementation');
  return ServicePayments.resendServicePayment(data);
}

// Legacy OtherPayments resend functions
function resendOtherPayment(data) {
  console.log('🔄 Legacy resendOtherPayment called, routing to modern implementation');
  return OtherPayments.resendOtherPayment(data);
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