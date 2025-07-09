// ============================================================================
// LEGACY FUNCTIONS (LegacyFunctions.gs)
// ============================================================================

/**
 * Legacy function routing for Service Payment operations
 */
function updateServicePayment(data) {
  try {
    console.log('🔄 Legacy: Routing updateServicePayment');
    return updateServicePaymentInternal(data);
  } catch (error) {
    console.error('❌ Legacy updateServicePayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteServicePayment(data) {
  try {
    console.log('🔄 Legacy: Routing deleteServicePayment');
    return deleteServicePaymentInternal(data);
  } catch (error) {
    console.error('❌ Legacy deleteServicePayment error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Legacy function routing for Other Payment operations
 */
function updateOtherPayment(data) {
  try {
    console.log('🔄 Legacy: Routing updateOtherPayment');
    return updateOtherPaymentInternal(data);
  } catch (error) {
    console.error('❌ Legacy updateOtherPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

function deleteOtherPayment(data) {
  try {
    console.log('🔄 Legacy: Routing deleteOtherPayment');
    return deleteOtherPaymentInternal(data);
  } catch (error) {
    console.error('❌ Legacy deleteOtherPayment error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Legacy function routing for Service Payment Status Updates
 */
function updateServicePaymentStatus(data) {
  try {
    console.log('🔄 Legacy: Routing updateServicePaymentStatus');
    return updateServicePaymentStatusInternal(data);
  } catch (error) {
    console.error('❌ Legacy updateServicePaymentStatus error:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Legacy function routing for Other Payment Status Updates
 */
function updateOtherPaymentStatus(data) {
  try {
    console.log('🔄 Legacy: Routing updateOtherPaymentStatus');
    return updateOtherPaymentStatusInternal(data);
  } catch (error) {
    console.error('❌ Legacy updateOtherPaymentStatus error:', error);
    return { success: false, error: error.toString() };
  }
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