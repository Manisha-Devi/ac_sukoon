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