import { useState, useEffect } from 'react'
import './App.css'
import MainGrid from './components/MainGrid'
import ToolSelector from './components/ToolSelector'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import { cloudSync } from './services/cloudSync'

// Utility functions for localStorage
const STORAGE_KEY = 'companionTools'

const saveToolsToStorage = (tools) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools))
    console.log('✅ Tools saved successfully:', tools)
    return true
  } catch (error) {
    console.error('❌ Error saving tools:', error)
    return false
  }
}

const loadToolsFromStorage = () => {
  try {
    const savedTools = localStorage.getItem(STORAGE_KEY)
    if (savedTools) {
      const parsedTools = JSON.parse(savedTools)
      console.log('✅ Tools loaded successfully:', parsedTools)
      return parsedTools
    }
    console.log('ℹ️ No saved tools found')
    return []
  } catch (error) {
    console.error('❌ Error loading tools:', error)
    return []
  }
}

function AppContent() {
  const [selectedTools, setSelectedTools] = useState([])
  const [isSelectingTools, setIsSelectingTools] = useState(false)
  const [syncStatus, setSyncStatus] = useState('loading') // 'loading', 'syncing', 'synced', 'error'
  const [dataLoaded, setDataLoaded] = useState(false)
  
  const { user, isAuthenticated, loading } = useAuth()

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user && !dataLoaded) {
      loadUserData()
    }
  }, [isAuthenticated, user, dataLoaded])

  // Auto-save to cloud whenever data changes
  useEffect(() => {
    if (isAuthenticated && user && dataLoaded) {
      saveUserData()
    }
  }, [selectedTools, isAuthenticated, user, dataLoaded])

  const loadUserData = async () => {
    if (!user) return

    setSyncStatus('syncing')
    try {
      console.log('🔄 Loading user data from Firestore...')
      const userData = await cloudSync.loadUserData(user.uid)
      
      if (userData) {
        console.log('✅ User data loaded:', userData)
        setSelectedTools(userData.selectedTools || [])
      } else {
        console.log('ℹ️ No existing user data found, starting fresh')
        setSelectedTools([])
      }
      
      setDataLoaded(true)
      setSyncStatus('synced')
    } catch (error) {
      console.error('❌ Failed to load user data:', error)
      setSyncStatus('error')
      // Fallback to empty state
      setSelectedTools([])
      setDataLoaded(true)
    }
  }

  const saveUserData = async () => {
    if (!user || !dataLoaded) return

    try {
      setSyncStatus('syncing')
      const userData = {
        selectedTools,
        lastUpdated: new Date().toISOString()
      }
      
      await cloudSync.saveUserData(user.uid, userData)
      console.log('✅ User data saved successfully')
      setSyncStatus('synced')
    } catch (error) {
      console.error('❌ Failed to save user data:', error)
      setSyncStatus('error')
    }
  }

  const addTool = (tool) => {
    if (!selectedTools.find(t => t.id === tool.id)) {
      // Find the first available grid position
      const GRID_COLS = 4
      const GRID_ROWS = 8
      const TOTAL_TILES = GRID_COLS * GRID_ROWS
      
      // Get all occupied positions
      const occupiedPositions = new Set()
      selectedTools.forEach((existingTool) => {
        const position = existingTool.gridPosition !== undefined ? existingTool.gridPosition : selectedTools.indexOf(existingTool)
        const width = existingTool.width || 2
        const height = existingTool.height || 3
        
        // Mark all tiles this tool occupies
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const currentRow = Math.floor(position / GRID_COLS) + row
            const currentCol = (position % GRID_COLS) + col
            if (currentRow < GRID_ROWS && currentCol < GRID_COLS) {
              occupiedPositions.add(currentRow * GRID_COLS + currentCol)
            }
          }
        }
      })
      
      // Find first available position that can fit the new tool
      const toolWidth = tool.width || 2
      const toolHeight = tool.height || 3
      let availablePosition = 0
      
      for (let pos = 0; pos < TOTAL_TILES; pos++) {
        const row = Math.floor(pos / GRID_COLS)
        const col = pos % GRID_COLS
        
        // Check if tool fits at this position
        let canFit = true
        if (row + toolHeight > GRID_ROWS || col + toolWidth > GRID_COLS) {
          canFit = false
        } else {
          // Check all tiles the tool would occupy
          for (let r = 0; r < toolHeight && canFit; r++) {
            for (let c = 0; c < toolWidth && canFit; c++) {
              const checkPos = (row + r) * GRID_COLS + (col + c)
              if (occupiedPositions.has(checkPos)) {
                canFit = false
              }
            }
          }
        }
        
        if (canFit) {
          availablePosition = pos
          break
        }
      }
      
      const newTool = {
        ...tool,
        gridPosition: availablePosition,
        gridRow: Math.floor(availablePosition / GRID_COLS),
        gridCol: availablePosition % GRID_COLS
      }
      
      const newTools = [...selectedTools, newTool]
      setSelectedTools(newTools)
      console.log('✅ Tool added:', tool.name, 'at position:', availablePosition)
    }
  }

  const removeTool = (toolId) => {
    const newTools = selectedTools.filter(tool => tool.id !== toolId)
    setSelectedTools(newTools)
    console.log('✅ Tool removed:', toolId)
  }

  const updateTool = (updatedTool) => {
    const newTools = selectedTools.map(tool => 
      tool.id === updatedTool.id ? { ...tool, ...updatedTool } : tool
    )
    setSelectedTools(newTools)
    console.log('✅ Tool updated:', updatedTool.name, updatedTool)
  }

  // Show loading screen while checking authentication
  if (loading || (isAuthenticated && !dataLoaded)) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <span className="loading-icon">🧭</span>
          <p>{loading ? 'Loading your companion...' : 'Loading your data...'}</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="auth-required">
          <div className="auth-required-content">
            <AuthModal onClose={() => {}} showCloseButton={false} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header 
        onToggleToolSelector={() => setIsSelectingTools(!isSelectingTools)}
        isSelectingTools={isSelectingTools}
        selectedTools={selectedTools}
        onAddTool={addTool}
        onCloseToolSelector={() => setIsSelectingTools(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        syncStatus={syncStatus}
      />
      
      <MainGrid 
        tools={selectedTools}
        onRemoveTool={removeTool}
        onUpdateTool={updateTool}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
