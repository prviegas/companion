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
      const newTools = [...selectedTools, tool]
      setSelectedTools(newTools)
      console.log('✅ Tool added:', tool.name)
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
            <span className="auth-icon">🔐</span>
            <h2>Welcome to Companion</h2>
            <p>Please sign in to access your personalized dashboard and tools.</p>
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
