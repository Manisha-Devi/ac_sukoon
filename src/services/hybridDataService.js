import authService from './authService.js';
import localStorageService from './localStorageService.js';

// Hybrid Data Service - Combines localStorage with Google Sheets sync
class HybridDataService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncQueue = [];

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting auto sync');
      this.autoSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Gone offline - using localStorage only');
    });

    // Start periodic sync when online
    this.startPeriodicSync();
  }

  // Initialize data - Load from localStorage first, then sync with Google Sheets
  async initializeData() {
    try {
      console.log('🚀 Initializing hybrid data system...');

      // First load from localStorage for immediate response
      let localData = localStorageService.loadFareData();
      console.log('📂 Loaded from localStorage:', localData.length, 'entries');

      // If online, try to sync with Google Sheets in background
      if (this.isOnline) {
        this.backgroundSync().catch(error => {
          console.error('⚠️ Background sync failed:', error);
        });
      }

      return localData;

    } catch (error) {
      console.error('❌ Error initializing data:', error);
      return localStorageService.loadFareData(); // Fallback to localStorage
    }
  }

  // Background sync with Google Sheets
  async backgroundSync() {
    try {
      if (this.syncInProgress) return;
      this.syncInProgress = true;

      console.log('🔄 Starting background sync...');

      // Get data from Google Sheets
      const [fareReceipts, bookingEntries, offDays] = await Promise.all([
        authService.getFareReceipts(),
        authService.getBookingEntries(),
        authService.getOffDays()
      ]);

      // Combine all data with proper type and sync status
      let allData = [];

      if (fareReceipts.success && fareReceipts.data) {
        allData = [...allData, ...fareReceipts.data.map(entry => ({
          ...entry,
          entryId: entry.entryId || entry.id,
          type: 'daily',
          synced: true,
          pendingSync: false,
          // Ensure date is date only (YYYY-MM-DD format)
          date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : entry.date,
          // Keep full timestamp from server or generate if missing
          timestamp: entry.timestamp || new Date().toISOString()
        }))];
      }

      if (bookingEntries.success && bookingEntries.data) {
        allData = [...allData, ...bookingEntries.data.map(entry => ({
          ...entry,
          entryId: entry.entryId || entry.id,
          type: 'booking',
          synced: true,
          pendingSync: false,
          // Ensure dates are date only (YYYY-MM-DD format)
          dateFrom: entry.dateFrom ? new Date(entry.dateFrom).toISOString().split('T')[0] : entry.dateFrom,
          dateTo: entry.dateTo ? new Date(entry.dateTo).toISOString().split('T')[0] : entry.dateTo,
          // Keep full timestamp from server or generate if missing
          timestamp: entry.timestamp || new Date().toISOString()
        }))];
      }

      if (offDays.success && offDays.data) {
        allData = [...allData, ...offDays.data.map(entry => ({
          ...entry,
          entryId: entry.entryId || entry.id,
          type: 'off',
          synced: true,
          pendingSync: false,
          // Ensure date is date only (YYYY-MM-DD format)
          date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : entry.date,
          // Keep full timestamp from server or generate if missing
          timestamp: entry.timestamp || new Date().toISOString()
        }))];
      }

      // Sort by entry ID (newest first) since timestamp is now time only
      allData.sort((a, b) => (b.entryId || 0) - (a.entryId || 0));

      // Save to localStorage
      localStorageService.saveFareData(allData);
      localStorageService.updateLastSync();

      // Generate cash book entries for all fare data
      this.generateAllCashBookEntries(allData);

      // Sync pending entries
      await this.syncPendingEntries();

      // Trigger UI update after sync
      this.triggerSyncStatusChange();

      // Trigger custom event for data update
      const dataUpdateEvent = new CustomEvent('dataUpdated', { detail: allData });
      window.dispatchEvent(dataUpdateEvent);

      // Trigger cash book update
      this.triggerCashBookUpdate();

      console.log('✅ Background sync completed:', allData.length, 'entries');
      return allData;

    } catch (error) {
      console.error('❌ Background sync error:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Add new fare entry - Save to localStorage immediately, sync to Google Sheets in background
  async addFareEntry(entryData, currentFareData) {
    try {
      console.log('📝 Adding entry with hybrid system...');

      const newEntry = {
        ...entryData,
        entryId: Date.now(),
        timestamp: new Date().toISOString(), // Full timestamp for local storage
        synced: false,
        pendingSync: true
      };

      // Save to localStorage immediately for instant response
      const updatedData = [newEntry, ...currentFareData];
      localStorageService.saveFareData(updatedData);
      localStorageService.markPendingSync(newEntry.entryId);

      // Generate and save cash book entry immediately
      this.generateCashBookEntry(newEntry);

      console.log('💾 Entry saved to localStorage immediately - UI updated instantly!');
      console.log('📖 Cash book entry generated automatically');

      // Trigger sync status change event for UI update
      this.triggerSyncStatusChange();

      // Trigger cash book update event
      this.triggerCashBookUpdate();

      // Background sync to Google Sheets - don't wait for response
      if (this.isOnline) {
        console.log('🔄 Starting background sync after add...');
        this.backgroundSyncSingleEntry(newEntry).then(syncResult => {
          if (syncResult) {
            console.log('✅ Entry synced to Google Sheets in background');
            // Update the local data to mark as synced
            const currentData = localStorageService.loadFareData();
            const finalData = currentData.map(entry => 
              entry.entryId === newEntry.entryId 
                ? { ...entry, synced: true, pendingSync: false }
                : entry
            );
            localStorageService.saveFareData(finalData);
            localStorageService.removePendingSync(newEntry.entryId);

            // Trigger sync status change event for UI update
            this.triggerSyncStatusChange();
          }
        }).catch(syncError => {
          console.error('⚠️ Background sync failed, will retry later:', syncError);
        });
      }

      // Return immediately with localStorage data for instant UI update
      return { success: true, data: updatedData, entry: newEntry, instant: true };

    } catch (error) {
      console.error('❌ Error adding fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Background sync single entry to Google Sheets (non-blocking)
  async backgroundSyncSingleEntry(entry) {
    try {
      let result;

      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';

      // Add to appropriate Google Sheet based on type
      if (entry.type === 'daily') {
        result = await authService.addFareReceipt({
          entryId: entry.entryId,
          date: entry.date,
          route: entry.route,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount,
          submittedBy: submittedBy
        });
      } else if (entry.type === 'booking') {
        result = await authService.addBookingEntry({
          entryId: entry.entryId,
          bookingDetails: entry.bookingDetails,
          dateFrom: entry.dateFrom,
          dateTo: entry.dateTo,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount,
          submittedBy: submittedBy
        });
      } else if (entry.type === 'off') {
        result = await authService.addOffDay({
          entryId: entry.entryId,
          date: entry.date,
          reason: entry.reason,
          submittedBy: submittedBy
        });
      }

      if (result && result.success) {
        console.log('✅ Entry synced to Google Sheets in background:', entry.entryId);
        return true;
      } else {
        throw new Error(result?.error || 'Failed to sync to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error syncing entry in background:', error);
      return false;
    }
  }

  // Background sync update to Google Sheets (non-blocking)
  async backgroundSyncUpdate(entryId, updatedData, entryType) {
    try {
      console.log('🔄 Updating in Google Sheets in background with ID:', entryId);

      let result;

      // Call appropriate update function based on entry type
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
        console.log('✅ Update synced to Google Sheets in background:', entryId);
        return true;
      } else {
        throw new Error(result?.error || 'Failed to sync update to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error syncing update in background:', error);
      return false;
    }
  }

  // Sync single entry to Google Sheets (legacy method for pending sync)
  async syncSingleEntry(entry) {
    try {
      let result;

      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const submittedBy = currentUser.fullName || currentUser.username || 'Unknown User';

      // Add to appropriate Google Sheet based on type
      if (entry.type === 'daily') {
        result = await authService.addFareReceipt({
          entryId: entry.entryId,
          date: entry.date,
          route: entry.route,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount,
          submittedBy: submittedBy
        });
      } else if (entry.type === 'booking') {
        result = await authService.addBookingEntry({
          entryId: entry.entryId,
          bookingDetails: entry.bookingDetails,
          dateFrom: entry.dateFrom,
          dateTo: entry.dateTo,
          cashAmount: entry.cashAmount || 0,
          bankAmount: entry.bankAmount || 0,
          totalAmount: entry.totalAmount,
          submittedBy: submittedBy
        });
      } else if (entry.type === 'off') {
        result = await authService.addOffDay({
          entryId: entry.entryId,
          date: entry.date,
          reason: entry.reason,
          submittedBy: submittedBy
        });
      }

      if (result && result.success) {
        // Mark as synced in localStorage
        const currentData = localStorageService.loadFareData();
        const updatedData = currentData.map(item => 
          item.entryId === entry.entryId 
            ? { 
                ...item, 
                synced: true, 
                pendingSync: false
              }
            : item
        );
        localStorageService.saveFareData(updatedData);
        localStorageService.removePendingSync(entry.entryId);

        console.log('✅ Entry synced to Google Sheets:', entry.entryId);
        return true;
      } else {
        throw new Error(result?.error || 'Failed to sync to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error syncing entry:', error);
      return false;
    }
  }

  // Update existing entry - Update localStorage immediately, sync to Google Sheets in background
  async updateFareEntry(entryId, updatedData, currentFareData) {
    try {
      console.log('📝 Updating entry with hybrid system...');

      // Find the existing entry
      const existingEntry = currentFareData.find(entry => entry.entryId === entryId);
      if (!existingEntry) {
        throw new Error('Entry not found');
      }

      // Update in localStorage immediately
      const updatedFareData = currentFareData.map(entry => 
        entry.entryId === entryId 
          ? { 
              ...entry, 
              ...updatedData, 
              lastModified: new Date().toISOString(),
              synced: false,
              pendingSync: true
            }
          : entry
      );

      localStorageService.saveFareData(updatedFareData);
      localStorageService.markPendingSync(entryId);

      // Update cash book entry
      const updatedEntry = updatedFareData.find(entry => entry.entryId === entryId);
      if (updatedEntry) {
        this.generateCashBookEntry(updatedEntry);
      }

      console.log('💾 Entry updated in localStorage immediately - UI updated instantly!');
      console.log('📖 Cash book entry updated');

      // Trigger sync status change event for UI update
      this.triggerSyncStatusChange();

      // Trigger cash book update
      this.triggerCashBookUpdate();

      // Background sync to Google Sheets - don't wait for response
      if (this.isOnline) {
        console.log('🔄 Starting background sync after update...');
        // Send complete entry data for update
        const completeUpdateData = {
          ...updatedData,
          cashAmount: updatedData.cashAmount,
          bankAmount: updatedData.bankAmount,
          totalAmount: updatedData.totalAmount
        };
        this.backgroundSyncUpdate(entryId, completeUpdateData, existingEntry.type).then(syncResult => {
          if (syncResult) {
            console.log('✅ Update synced to Google Sheets in background');
            // Update the local data to mark as synced
            const currentData = localStorageService.loadFareData();
            const finalData = currentData.map(entry => 
              entry.entryId === entryId 
                ? { ...entry, synced: true, pendingSync: false }
                : entry
            );
            localStorageService.saveFareData(finalData);
            localStorageService.removePendingSync(entryId);

            // Trigger sync status change event for UI update
            this.triggerSyncStatusChange();
          }
        }).catch(syncError => {
          console.error('⚠️ Background sync failed, will retry later:', syncError);
        });
      }

      // Return immediately with localStorage data for instant UI update
      return { success: true, data: updatedFareData, instant: true };

    } catch (error) {
      console.error('❌ Error updating fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync update to Google Sheets
  async syncUpdateToGoogleSheets(entryId, updatedData, entryType) {
    try {
      console.log('🔄 Updating in Google Sheets with ID:', entryId);

      let result;

      // Call appropriate update function based on entry type
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
        // Mark as synced in localStorage
        const currentData = localStorageService.loadFareData();
        const updatedLocalData = currentData.map(item => 
          item.entryId === entryId 
            ? { ...item, synced: true, pendingSync: false }
            : item
        );
        localStorageService.saveFareData(updatedLocalData);
        localStorageService.removePendingSync(entryId);

        console.log('✅ Update synced to Google Sheets:', entryId);
        return true;
      } else {
        throw new Error(result?.error || 'Failed to sync update to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error syncing update:', error);
      return false;
    }
  }

  // Delete entry - Remove from localStorage immediately, sync to Google Sheets in background
  async deleteFareEntry(entryId, currentFareData) {
    try {
      console.log('🗑️ Deleting entry with hybrid system...');

      const existingEntry = currentFareData.find(entry => entry.entryId === entryId);
      if (!existingEntry) {
        throw new Error('Entry not found');
      }

      // Remove from localStorage immediately
      const updatedData = currentFareData.filter(entry => entry.entryId !== entryId);
      localStorageService.saveFareData(updatedData);

      // Remove corresponding cash book entry
      this.removeCashBookEntry(entryId);

      console.log('💾 Entry deleted from localStorage immediately');
      console.log('📖 Cash book entry removed');

      // Try to sync deletion to Google Sheets in background if online
      if (this.isOnline && existingEntry.synced) {
        this.syncDeleteToGoogleSheets(entryId, existingEntry.type).catch(error => {
          console.error('⚠️ Background delete sync failed:', error);
        });
      }

      // Remove from pending sync
      localStorageService.removePendingSync(entryId);

      return { success: true, data: updatedData };

    } catch (error) {
      console.error('❌ Error deleting fare entry:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync delete to Google Sheets
  async syncDeleteToGoogleSheets(entryId, entryType) {
    try {
      console.log('🗑️ Deleting from Google Sheets with ID:', entryId);

      let result;

      // Call appropriate delete function based on entry type
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
        console.log('✅ Delete synced to Google Sheets:', entryId);
        return true;
      } else {
        throw new Error(result?.error || 'Failed to sync delete to Google Sheets');
      }

    } catch (error) {
      console.error('❌ Error syncing delete:', error);
      return false;
    }
  }

  // Sync all pending entries
  async syncPendingEntries() {
    try {
      const pendingIds = localStorageService.getPendingSync();
      if (pendingIds.length === 0) return;

      console.log('🔄 Syncing pending entries:', pendingIds.length);

      const currentData = localStorageService.loadFareData();
      const pendingEntries = currentData.filter(entry => pendingIds.includes(entry.entryId));

      for (const entry of pendingEntries) {
        if (!entry.synced && entry.pendingSync) {
          // Check if this is a new entry (no previous sync) or an update
          if (!entry.lastModified) {
            // New entry - add to Google Sheets
            await this.syncSingleEntry(entry);
          } else {
            // Updated entry - sync the update with complete data
            const updatedData = {
              date: entry.date,
              route: entry.route,
              cashAmount: entry.cashAmount,
              bankAmount: entry.bankAmount,
              totalAmount: entry.totalAmount,
              bookingDetails: entry.bookingDetails,
              dateFrom: entry.dateFrom,
              dateTo: entry.dateTo,
              reason: entry.reason
            };
            await this.syncUpdateToGoogleSheets(entry.entryId, updatedData, entry.type);
          }
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('✅ All pending entries synced');

    } catch (error) {
      console.error('❌ Error syncing pending entries:', error);
    }
  }

  // Get connection and sync status
  getSyncStatus() {
    const pendingSync = localStorageService.getPendingSync();
    const lastSync = localStorageService.getLastSync();

    return {
      isOnline: this.isOnline,
      pendingSync: pendingSync.length,
      lastSync: lastSync,
      syncInProgress: this.syncInProgress
    };
  }

  // Manual force sync
  async forceSync() {
    try {
      if (!this.isOnline) {
        throw new Error('No internet connection available');
      }

      console.log('🔄 Manual sync started...');
      const result = await this.backgroundSync();

      // Also refresh the UI data
      return result;

    } catch (error) {
      console.error('❌ Error in force sync:', error);
      throw error;
    }
  }

  // Auto sync when coming online
  async autoSync() {
    if (this.isOnline && !this.syncInProgress) {
      try {
        await this.syncPendingEntries();
        await this.backgroundSync();
      } catch (error) {
        console.error('❌ Auto sync failed:', error);
      }
    }
  }

  // Start periodic sync (every 5 minutes when online)
  startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.autoSync();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Generate cash book entry from fare data
  generateCashBookEntry(fareEntry) {
    try {
      if (fareEntry.type === 'off') return; // Off days don't generate cash book entries

      const cashBookEntry = {
        id: `cb_${fareEntry.entryId}`,
        date: fareEntry.date || fareEntry.dateFrom, // Use appropriate date
        type: 'dr', // Fare entries are always debit (income)
        particulars: this.formatCashBookParticulars(fareEntry),
        cashAmount: fareEntry.cashAmount || 0,
        bankAmount: fareEntry.bankAmount || 0,
        source: this.getCashBookSource(fareEntry),
        sourceId: fareEntry.entryId,
        route: fareEntry.route,
        bookingDetails: fareEntry.bookingDetails,
        description: fareEntry.bookingDetails || fareEntry.route,
        timestamp: fareEntry.timestamp
      };

      // Get existing cash book entries
      let cashBookEntries = JSON.parse(localStorage.getItem('cashBookEntries') || '[]');

      // Remove existing entry if updating
      cashBookEntries = cashBookEntries.filter(entry => entry.sourceId !== fareEntry.entryId);

      // Add new entry
      cashBookEntries.unshift(cashBookEntry);

      // Save to localStorage
      localStorage.setItem('cashBookEntries', JSON.stringify(cashBookEntries));

      console.log('📖 Cash book entry generated:', cashBookEntry);

    } catch (error) {
      console.error('❌ Error generating cash book entry:', error);
    }
  }

  // Format cash book particulars
  formatCashBookParticulars(fareEntry) {
    switch (fareEntry.type) {
      case 'daily':
        return `Daily Fare - ${fareEntry.route || 'Route'}`;
      case 'booking':
        return `Booking - ${fareEntry.bookingDetails || 'Booking Details'}`;
      default:
        return `Fare - ${fareEntry.route || fareEntry.bookingDetails || 'Income'}`;
    }
  }

  // Get cash book source
  getCashBookSource(fareEntry) {
    switch (fareEntry.type) {
      case 'daily':
        return 'fare-daily';
      case 'booking':
        return 'fare-booking';
      default:
        return 'fare-other';
    }
  }

  // Generate all cash book entries from fare data
  generateAllCashBookEntries(fareData) {
    try {
      console.log('📖 Generating all cash book entries from fare data...');

      let cashBookEntries = [];

      fareData.forEach(fareEntry => {
        if (fareEntry.type !== 'off') { // Skip off days
          const cashBookEntry = {
            id: `cb_${fareEntry.entryId}`,
            date: fareEntry.date || fareEntry.dateFrom,
            type: 'dr', // Fare entries are always debit (income)
            particulars: this.formatCashBookParticulars(fareEntry),
            cashAmount: fareEntry.cashAmount || 0,
            bankAmount: fareEntry.bankAmount || 0,
            source: this.getCashBookSource(fareEntry),
            sourceId: fareEntry.entryId,
            route: fareEntry.route,
            bookingDetails: fareEntry.bookingDetails,
            description: fareEntry.bookingDetails || fareEntry.route,
            timestamp: fareEntry.timestamp
          };

          cashBookEntries.push(cashBookEntry);
        }
      });

      // Sort by timestamp (newest first)
      cashBookEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Save to localStorage
      localStorage.setItem('cashBookEntries', JSON.stringify(cashBookEntries));

      console.log('📖 Generated', cashBookEntries.length, 'cash book entries');

    } catch (error) {
      console.error('❌ Error generating all cash book entries:', error);
    }
  }

  // Remove cash book entry
  removeCashBookEntry(sourceId) {
    try {
      let cashBookEntries = JSON.parse(localStorage.getItem('cashBookEntries') || '[]');
      cashBookEntries = cashBookEntries.filter(entry => entry.sourceId !== sourceId);
      localStorage.setItem('cashBookEntries', JSON.stringify(cashBookEntries));

      console.log('📖 Cash book entry removed for:', sourceId);

    } catch (error) {
      console.error('❌ Error removing cash book entry:', error);
    }
  }

  // Trigger cash book update event
  triggerCashBookUpdate() {
    try {
      const cashBookEntries = JSON.parse(localStorage.getItem('cashBookEntries') || '[]');
      const event = new CustomEvent('cashBookUpdated', { detail: cashBookEntries });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('❌ Error triggering cash book update:', error);
    }
  }

  // Trigger sync status change event for real-time UI updates
  triggerSyncStatusChange() {
    try {
      const event = new CustomEvent('syncStatusChanged');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('❌ Error triggering sync status change:', error);
    }
  }

  
}

export default new HybridDataService();