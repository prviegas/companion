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
        return data
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

    if (cloudData.ifoodFavorites && Array.isArray(cloudData.ifoodFavorites)) {
      merged.ifoodFavorites = cloudData.ifoodFavorites
    }

    if (cloudData.ifoodFavoriteDishes && Array.isArray(cloudData.ifoodFavoriteDishes)) {
      merged.ifoodFavoriteDishes = cloudData.ifoodFavoriteDishes
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

  // Sharing functions
  async saveShareData(shareId, shareData) {
    try {
      console.log('🔄 Saving share data to Firestore:', shareId, shareData)
      const shareDocRef = doc(db, 'shares', shareId)
      await setDoc(shareDocRef, shareData, { merge: true })
      console.log('☁️ Share data saved successfully to collection "shares" with id:', shareId)
      return true
    } catch (error) {
      console.error('❌ Error saving share data:', error)
      return false
    }
  }

  async loadShareData(shareId) {
    try {
      console.log('🔄 Loading share data from Firestore:', shareId)
      const shareDocRef = doc(db, 'shares', shareId)
      const docSnap = await getDoc(shareDocRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        console.log('☁️ Share data loaded successfully:', data)
        return data
      } else {
        console.log('📄 No share data found for shareId:', shareId)
        console.log('📄 Document path checked:', `shares/${shareId}`)
        return null
      }
    } catch (error) {
      console.error('❌ Error loading share data:', error)
      console.error('❌ Error details:', error.message)
      return null
    }
  }

  async disableShare(shareId) {
    try {
      const shareDocRef = doc(db, 'shares', shareId)
      await setDoc(shareDocRef, { isActive: false }, { merge: true })
      console.log('☁️ Share disabled successfully')
      return true
    } catch (error) {
      console.error('❌ Error disabling share:', error)
      return false
    }
  }

  async saveUserShares(userId, shares) {
    try {
      const userDocRef = doc(db, 'users', userId)
      await setDoc(userDocRef, { shares }, { merge: true })
      console.log('☁️ User shares saved successfully')
      return true
    } catch (error) {
      console.error('❌ Error saving user shares:', error)
      return false
    }
  }

  async getUserShares(userId) {
    try {
      const userDocRef = doc(db, 'users', userId)
      const docSnap = await getDoc(userDocRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return data.shares || []
      }
      return []
    } catch (error) {
      console.error('❌ Error loading user shares:', error)
      return []
    }
  }
}

export const cloudSync = new CloudSyncService()
export default cloudSync
