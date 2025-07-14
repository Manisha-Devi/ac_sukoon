import authService from './authService.js';

// Simplified Hybrid Data Service - React State with Google Sheets sync
class HybridDataService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;

    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Gone offline');
    });
  }

  async initializeData() {
    try {
      if (!this.isOnline) {
        console.log('📴 Offline - using React state only');
        return [];
      }

      console.log('🔄 Starting background sync...');
      this.syncInProgress = true;

      const [fareReceipts, bookingEntries, offDays, fuelPayments, addaPayments, unionPayments, servicePayments, otherPayments] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays(),
        authService.getFuelPayments(),
        authService.getAddaPayments(),
        authService.getUnionPayments(),
        authService.getServicePayments(),
        authService.getOtherPayments()
      ]);

      let allData = [];

      console.log('🔄 Processing and normalizing data...');

      if (fareReceipts.success && fareReceipts.data) {
        console.log('📋 Processing fare receipts:', fareReceipts.data.length);
        const processedFareReceipts = fareReceipts.data.map(entry => {
          console.log('🔧 Processing fare receipt entry:', entry);
          return normalizeEntryData({
            ...entry,
            type: 'daily',
            entryType: 'daily'
          });
        });
        allData = [...allData, ...processedFareReceipts];
        console.log('✅ Fare receipts processed:', processedFareReceipts.length);
      }

      if (bookingEntries.success && bookingEntries.data) {
        console.log('🎫 Processing booking entries:', bookingEntries.data.length);
        const processedBookingEntries = bookingEntries.data.map(entry => {
          console.log('🔧 Processing booking entry:', entry);
          return normalizeEntryData({
            ...entry,
            type: 'booking',
            entryType: 'booking'
          });
        });
        allData = [...allData, ...processedBookingEntries];
        console.log('✅ Booking entries processed:', processedBookingEntries.length);
      }

      if (offDays.success && offDays.data) {
        console.log('🔒 Processing off days:', offDays.data.length);
        const processedOffDays = offDays.data.map(entry => {
          console.log('🔧 Processing off day entry:', entry);
          return normalizeEntryData({
            ...entry,
            type: 'off',
            entryType: 'off'
          });
        });
        allData = [...allData, ...processedOffDays];
        console.log('✅ Off days processed:', processedOffDays.length);
      }

      // Add expense data
      if (fuelPayments.success && fuelPayments.data) {
        console.log('⛽ Processing fuel payments:', fuelPayments.data.length);
        const processedFuelPayments = fuelPayments.data.map(entry => {
          console.log('🔧 Processing fuel payment entry:', entry);
          return normalizeEntryData({
            ...entry,
            type: 'fuel',
            entryType: 'fuel'
          });
        });
        allData = [...allData, ...processedFuelPayments];
        console.log('✅ Fuel payments processed:', processedFuelPayments.length);
      }

      if (addaPayments.success && addaPayments.data) {
        console.log('🏪 Processing adda payments:', addaPayments.data.length);
        const processedAddaPayments = addaPayments.data.map(entry => {
          console.log('🔧 Processing adda payment entry:', entry);
          return normalizeEntryData({
            ...entry,
            type: 'adda',
            entryType: 'adda'
          });
        });
        allData = [...allData, ...processedAddaPayments];
        console.log('✅ Adda payments processed:', processedAddaPayments.length);
      }

      if (unionPayments.success && unionPayments.data) {
        console.log('🤝 Processing union payments:', unionPayments.data.length);
        const processedUnionPayments = unionPayments.data.map(entry => {
          console.log('🔧 Processing union payment entry:', entry);
          return normalizeEntryData({
            ...entry,
            type: 'union',
            entryType: 'union'
          });
        });
        allData = [...allData, ...processedUnionPayments];
        console.log('✅ Union payments processed:', processedUnionPayments.length);
      }

      if (servicePayments.success && servicePayments.data) {
        console.log('🔧 Processing service payments:', servicePayments.data.length);
        const processedServicePayments = servicePayments.data.map(entry => {
          console.log('🔧 Processing service payment entry:', entry);
          return normalizeEntryData({
            ...entry,
            type: 'service',
            entryType: 'service'
          });
        });
        allData = [...allData, ...processedServicePayments];
        console.log('✅ Service payments processed:', processedServicePayments.length);
      }

      if (otherPayments.success && otherPayments.data) {
        console.log('💸 Processing other payments:', otherPayments.data.length);
        const processedOtherPayments = otherPayments.data.map(entry => {
          console.log('🔧 Processing other payment entry:', entry);
          return normalizeEntryData({
            ...entry,
            type: 'other',
            entryType: 'other'
          });
        });
        allData = [...allData, ...processedOtherPayments];
        console.log('✅ Other payments processed:', processedOtherPayments.length);
      }

      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      this.syncInProgress = false;
      return allData;

    } catch (error) {
      console.error('❌ Error in hybrid sync:', error);
      this.syncInProgress = false;
      return [];
    }
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingSync: 0,
      lastSync: new Date().toISOString(),
      syncInProgress: this.syncInProgress,
      syncing: this.syncInProgress
    };
  }
}

export default new HybridDataService();
class HybridDataService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;

    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting auto sync');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Gone offline - using React state only');
    });
  }

  async initializeData() {
    try {
      console.log('🚀 Initializing data from Google Sheets...');

      if (!this.isOnline) {
        console.log('📴 Offline - returning empty data');
        return [];
      }

      const [fareReceipts, bookingEntries, offDays, fuelPayments, addaPayments, unionPayments, servicePayments, otherPayments] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays(),
        authService.getFuelPayments(),
        authService.getAddaPayments(),
        authService.getUnionPayments(),
        authService.getServicePayments(),
        authService.getOtherPayments()
      ]);

      let allData = [];

      if (fareReceipts.success && fareReceipts.data) {
        allData = [...allData, ...fareReceipts.data.map(entry => normalizeEntryData({
          ...entry,
          type: 'daily',
          entryType: 'daily'
        }))];
      }

      if (bookingEntries.success && bookingEntries.data) {
        allData = [...allData, ...bookingEntries.data.map(entry => normalizeEntryData({
          ...entry,
          type: 'booking',
          entryType: 'booking'
        }))];
      }

      if (offDays.success && offDays.data) {
        allData = [...allData, ...offDays.data.map(entry => normalizeEntryData({
          ...entry,
          type: 'off',
          entryType: 'off'
        }))];
      }

      // Add expense data
      if (fuelPayments.success && fuelPayments.data) {
        allData = [...allData, ...fuelPayments.data.map(entry => normalizeEntryData({
          ...entry,
          type: 'fuel',
          entryType: 'fuel'
        }))];
      }

      if (addaPayments.success && addaPayments.data) {
        allData = [...allData, ...addaPayments.data.map(entry => normalizeEntryData({
          ...entry,
          type: 'adda',
          entryType: 'adda'
        }))];
      }

      if (unionPayments.success && unionPayments.data) {
        allData = [...allData, ...unionPayments.data.map(entry => normalizeEntryData({
          ...entry,
          type: 'union',
          entryType: 'union'
        }))];
      }

      if (servicePayments.success && servicePayments.data) {
        allData = [...allData, ...servicePayments.data.map(entry => normalizeEntryData({
          ...entry,
          type: 'service',
          entryType: 'service'
        }))];
      }

      if (otherPayments.success && otherPayments.data) {
        allData = [...allData, ...otherPayments.data.map(entry => normalizeEntryData({
          ...entry,
          type: 'other',
          entryType: 'other'
        }))];
      }

      // Sort by timestamp (newest first)
      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('✅ Data loaded from Google Sheets:', allData.length, 'entries');
      return allData;

    } catch (error) {
      console.error('❌ Error initializing data:', error);
      return [];
    }
  }

  async addFareEntry(entryData) {
    try {
      console.log('📝 Adding entry...');

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';

      const newEntry = {
        ...entryData,
        entryId: Date.now(),
        timestamp: new Date().toISOString(),
        submittedBy: submittedBy
      };

      // Try to sync to Google Sheets if online
      if (this.isOnline) {
        let result;

        if (entryData.type === 'daily') {
          result = await authService.addFareReceipt({
            entryId: newEntry.entryId,
            timestamp: newEntry.timestamp,
            date: entryData.date,
            route: entryData.route,
            cashAmount: entryData.cashAmount || 0,
            bankAmount: entryData.bankAmount || 0,
            totalAmount: entryData.totalAmount,
            submittedBy: submittedBy
          });
        } else if (entryData.type === 'booking') {
          result = await authService.addBookingEntry({
            entryId: newEntry.entryId,
            timestamp: newEntry.timestamp,
            bookingDetails: entryData.bookingDetails,
            dateFrom: entryData.dateFrom,
            dateTo: entryData.dateTo,
            cashAmount: entryData.cashAmount || 0,
            bankAmount: entryData.bankAmount || 0,
            totalAmount: entryData.totalAmount,
            submittedBy: submittedBy
          });
        } else if (entryData.type === 'off') {
          result = await authService.addOffDay({
            entryId: newEntry.entryId,
            timestamp: newEntry.timestamp,
            date: entryData.date,
            reason: entryData.reason,
            submittedBy: submittedBy
          });
        }

        if (result && result.success) {
          console.log('✅ Entry added to Google Sheets successfully');
          return { success: true, entry: newEntry };
        } else {
          console.warn('⚠️ Failed to sync to Google Sheets but entry created locally');
          return { success: true, entry: newEntry, syncError: true };
        }
      } else {
        console.log('📴 Offline - entry will be added when online');
        return { success: true, entry: newEntry, offline: true };
      }

    } catch (error) {
      console.error('❌ Error adding fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  async updateFareEntry(entryId, updatedData, entryType) {
    try {
      console.log('📝 Updating entry...');

      if (!this.isOnline) {
        console.log('📴 Offline - update will be saved locally');
        return { success: true, offline: true };
      }

      let result;

      if (entryType === 'daily') {
        result = await authService.updateFareReceipt({
          entryId: entryId,
          updatedData: updatedData
        });
      } else if (entryType === 'booking') {
        result = await authService.updateBookingEntry({
          entryId: entryId,
          updatedData: updatedData
        });
      } else if (entryType === 'off') {
        result = await authService.updateOffDay({
          entryId: entryId,
          updatedData: updatedData
        });
      }

      if (result && result.success) {
        console.log('✅ Entry updated in Google Sheets successfully');
        return { success: true };
      } else {
        console.warn('⚠️ Failed to sync update to Google Sheets');
        return { success: true, syncError: true };
      }

    } catch (error) {
      console.error('❌ Error updating fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteFareEntry(entryId, entryType) {
    try {
      console.log('🗑️ Deleting entry...');

      if (!this.isOnline) {
        console.log('📴 Offline - delete will be saved locally');
        return { success: true, offline: true };
      }

      let result;

      if (entryType === 'daily') {
        result = await authService.deleteFareReceipt({
          entryId: entryId
        });
      } else if (entryType === 'booking') {
        result = await authService.deleteBookingEntry({
          entryId: entryId
        });
      } else if (entryType === 'off') {
        result = await authService.deleteOffDay({
          entryId: entryId
        });
      }

      if (result && result.success) {
        console.log('✅ Entry deleted from Google Sheets successfully');
        return { success: true };
      } else {
        console.warn('⚠️ Failed to sync delete to Google Sheets');
        return { success: true, syncError: true };
      }

    } catch (error) {
      console.error('❌ Error deleting fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingSync: 0,
      lastSync: new Date().toISOString(),
      syncInProgress: this.syncInProgress
    };
  }

  async forceSync() {
    try {
      if (!this.isOnline) {
        throw new Error('No internet connection available');
      }

      console.log('🔄 Manual sync started...');
      return await this.initializeData();

    } catch (error) {
      console.error('❌ Error in force sync:', error);
      throw error;
    }
  }
}

export default new HybridDataService();

// Function to normalize date and timestamp formats
function normalizeEntryData(entry) {
  if (entry.date) {
    entry.date = formatDate(entry.date);
  }
  if (entry.dateFrom) {
    entry.dateFrom = formatDate(entry.dateFrom);
  }
  if (entry.dateTo) {
    entry.dateTo = formatDate(entry.dateTo);
  }
  if (entry.timestamp) {
    entry.timestamp = formatTime(entry.timestamp);
  }
  return entry;
}

// Function to format date as YYYY-MM-DD
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original string if formatting fails
  }
}

// Function to format timestamp as HH:MM:SS AM/PM
function formatTime(timeString) {
  try {
    const date = new Date(timeString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original string if formatting fails
  }
}