import { useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { cloudSync } from '../services/cloudSync'

/**
 * Custom hook for syncing tool data to Firestore
 * @param {string} toolKey - The key to store data under (e.g., 'medicines', 'marketLists', 'notes')
 * @param {any} data - The data to sync
 * @param {Function} setData - Function to update local state when cloud data is loaded
 */
export const useCloudSync = (toolKey, data, setData) => {
  const { user, isAuthenticated } = useAuth()

  // Save data to cloud whenever it changes
  useEffect(() => {
    if (isAuthenticated && user && data !== null && data !== undefined) {
      const saveToCloud = async () => {
        try {
          const userData = { [toolKey]: data }
          await cloudSync.saveUserData(user.uid, userData)
          console.log(`✅ ${toolKey} synced to cloud`)
        } catch (error) {
          console.error(`❌ Failed to sync ${toolKey} to cloud:`, error)
        }
      }

      // Debounce the save operation to avoid too many calls
      const timeoutId = setTimeout(saveToCloud, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [data, toolKey, user, isAuthenticated])

  // Load data from cloud when user logs in
  const loadFromCloud = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        const cloudData = await cloudSync.loadUserData(user.uid)
        if (cloudData && cloudData[toolKey]) {
          setData(cloudData[toolKey])
          console.log(`✅ ${toolKey} loaded from cloud`)
          return true
        }
      } catch (error) {
        console.error(`❌ Failed to load ${toolKey} from cloud:`, error)
      }
    }
    return false
  }, [toolKey, user, isAuthenticated, setData])

  // Load data when user changes
  useEffect(() => {
    loadFromCloud()
  }, [loadFromCloud])

  return { loadFromCloud }
}
