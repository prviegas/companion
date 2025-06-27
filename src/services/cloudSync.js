import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

class CloudSyncService {
  constructor() {
    this.listeners = new Map()
  }

  // Save user data to Firestore
  async saveUserData(userId, data) {
    try {
      const userDocRef = doc(db, 'users', userId)
      await setDoc(userDocRef, {
        ...data,
        lastSynced: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true })
      
      console.log('☁️ Data synced to cloud successfully')
      return true
    } catch (error) {
      console.error('❌ Error syncing to cloud:', error)
      return false
    }
  }

  // Load user data from Firestore
  async loadUserData(userId) {
    try {
      const userDocRef = doc(db, 'users', userId)
      const docSnap = await getDoc(userDocRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        console.log('☁️ Data loaded from cloud successfully')
        return {
          selectedTools: data.selectedTools || [],
          marketLists: data.marketLists || [],
          medicineReminders: data.medicineReminders || [],
          medicineTaken: data.medicineTaken || {},
          notes: data.notes || [],
          lastSynced: data.lastSynced
        }
      } else {
        console.log('📄 No cloud data found, using local data')
        return null
      }
    } catch (error) {
      console.error('❌ Error loading from cloud:', error)
      return null
    }
  }

  // Real-time sync listener
  setupRealtimeSync(userId, onDataUpdate) {
    const userDocRef = doc(db, 'users', userId)
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        console.log('🔄 Real-time data update received')
        onDataUpdate(data)
      }
    }, (error) => {
      console.error('❌ Real-time sync error:', error)
    })

    this.listeners.set(userId, unsubscribe)
    return unsubscribe
  }

  // Stop real-time sync
  stopRealtimeSync(userId) {
    const unsubscribe = this.listeners.get(userId)
    if (unsubscribe) {
      unsubscribe()
      this.listeners.delete(userId)
      console.log('🛑 Real-time sync stopped')
    }
  }

  // Merge local and cloud data intelligently
  mergeData(localData, cloudData) {
    if (!cloudData) return localData

    // Simple merge strategy - prefer newer data based on timestamps
    const merged = { ...localData }

    // For arrays, merge by comparing timestamps or IDs
    if (cloudData.selectedTools && Array.isArray(cloudData.selectedTools)) {
      merged.selectedTools = cloudData.selectedTools
    }

    if (cloudData.medicineReminders && Array.isArray(cloudData.medicineReminders)) {
      merged.medicineReminders = this.mergeArraysByTimestamp(
        localData.medicineReminders || [], 
        cloudData.medicineReminders
      )
    }

    if (cloudData.marketLists && Array.isArray(cloudData.marketLists)) {
      merged.marketLists = this.mergeArraysByTimestamp(
        localData.marketLists || [], 
        cloudData.marketLists
      )
    }

    if (cloudData.notes && Array.isArray(cloudData.notes)) {
      merged.notes = this.mergeArraysByTimestamp(
        localData.notes || [], 
        cloudData.notes
      )
    }

    // For medicine taken data, merge objects
    if (cloudData.medicineTaken) {
      merged.medicineTaken = { ...localData.medicineTaken, ...cloudData.medicineTaken }
    }

    return merged
  }

  // Helper to merge arrays by timestamp
  mergeArraysByTimestamp(localArray, cloudArray) {
    const merged = new Map()

    // Add local items
    localArray.forEach(item => {
      merged.set(item.id, item)
    })

    // Add/update with cloud items (cloud data wins for same IDs)
    cloudArray.forEach(item => {
      merged.set(item.id, item)
    })

    return Array.from(merged.values())
  }
}

export const cloudSync = new CloudSyncService()
export default cloudSync
