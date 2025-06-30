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
  
  // Sharing state
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [isGeneratingShare, setIsGeneratingShare] = useState(false)
  const [sharedBoardData, setSharedBoardData] = useState(null)
  const [sharedBoardOwner, setSharedBoardOwner] = useState('')
  const [isViewingSharedBoard, setIsViewingSharedBoard] = useState(false)
  const [sharedToolData, setSharedToolData] = useState(null) // Store shared tool data
  
  const { user, isAuthenticated, loading } = useAuth()

  // Load user data when authenticated (but not when viewing shared board)
  useEffect(() => {
    if (isAuthenticated && user && !dataLoaded && !isViewingSharedBoard) {
      loadUserData()
    }
  }, [isAuthenticated, user, dataLoaded, isViewingSharedBoard])

  // Check for shared board in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const shareId = urlParams.get('shared')
    
    console.log('🔍 Checking URL for shared board parameter')
    console.log('🔍 Current URL:', window.location.href)
    console.log('🔍 URL search params:', window.location.search)
    console.log('🔍 Extracted shareId:', shareId)
    
    if (shareId) {
      console.log('📋 Found shared board parameter, loading:', shareId)
      // Set viewing shared board immediately to prevent personal data loading
      setIsViewingSharedBoard(true)
      // Load shared board immediately, regardless of authentication status
      loadSharedBoard(shareId)
    } else {
      console.log('📋 No shared board parameter found')
    }
  }, []) // Don't depend on auth state for initial shared board check

  // Auto-save to cloud whenever data changes (but not for shared boards)
  useEffect(() => {
    if (isAuthenticated && user && dataLoaded && !isViewingSharedBoard) {
      saveUserData()
    }
  }, [selectedTools, isAuthenticated, user, dataLoaded, isViewingSharedBoard])

  const loadUserData = async () => {
    if (!user) return
    
    // Check URL for shared board parameter to prevent loading personal data
    const urlParams = new URLSearchParams(window.location.search)
    const shareId = urlParams.get('shared')
    
    // Don't load user data if we're viewing a shared board OR if there's a share parameter in URL
    if (isViewingSharedBoard || shareId) {
      console.log('⏸️ Skipping user data load - viewing shared board or share parameter detected')
      return
    }

    setSyncStatus('syncing')
    try {
      console.log('🔄 Loading user data from Firestore...')
      const userData = await cloudSync.loadUserData(user.uid)
      
      if (userData) {
        console.log('✅ User data loaded:', userData)
        setSelectedTools(userData.selectedTools || [])
        
        // Restore user's tool data to localStorage
        console.log('📦 Restoring user tool data to localStorage...')
        if (userData.notes) {
          localStorage.setItem('notes', JSON.stringify(userData.notes))
        }
        if (userData.medicineReminders) {
          localStorage.setItem('medicineReminders', JSON.stringify(userData.medicineReminders))
        }
        if (userData.medicineTaken) {
          localStorage.setItem('medicineTaken', JSON.stringify(userData.medicineTaken))
        }
        if (userData.marketLists) {
          localStorage.setItem('marketListItems', JSON.stringify(userData.marketLists))
        }
        if (userData.ifoodFavorites) {
          localStorage.setItem('ifoodFavorites', JSON.stringify(userData.ifoodFavorites))
        }
        if (userData.ifoodFavoriteDishes) {
          localStorage.setItem('ifoodFavoriteDishes', JSON.stringify(userData.ifoodFavoriteDishes))
        }
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
    
    // Don't save user data if we're viewing a shared board
    if (isViewingSharedBoard) {
      console.log('⏸️ Skipping user data save - viewing shared board')
      return
    }

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

  // Sharing functions
  const generateShareLink = async () => {
    if (!user || selectedTools.length === 0) return

    setIsGeneratingShare(true)
    try {
      const shareId = `share_${user.uid}_${Date.now()}`
      
      // Load all user data including tool-specific data
      const userData = await cloudSync.loadUserData(user.uid)
      
      const shareData = {
        id: shareId,
        ownerEmail: user.email,
        tools: selectedTools,
        // Include all tool-specific data
        toolData: {
          notes: userData?.notes || [],
          medicineReminders: userData?.medicineReminders || [],
          medicineTaken: userData?.medicineTaken || {},
          marketLists: userData?.marketLists || [],
          ifoodFavorites: userData?.ifoodFavorites || [],
          ifoodFavoriteDishes: userData?.ifoodFavoriteDishes || []
        },
        createdAt: new Date().toISOString(),
        isActive: true
      }

      console.log('💾 Attempting to save share data:', {
        shareId,
        ownerEmail: shareData.ownerEmail,
        toolsCount: shareData.tools.length,
        toolDataKeys: Object.keys(shareData.toolData),
        isActive: shareData.isActive
      })

      const saveResult = await cloudSync.saveShareData(shareId, shareData)
      
      if (!saveResult) {
        throw new Error('Failed to save share data')
      }

      const link = `${window.location.origin}${window.location.pathname}?shared=${shareId}`
      setShareLink(link)
      
      // Save share config to user's data
      const userShares = await cloudSync.getUserShares(user.uid) || []
      userShares.push({ shareId, createdAt: shareData.createdAt, isActive: true })
      await cloudSync.saveUserShares(user.uid, userShares)

      console.log('✅ Share link generated successfully:', link)
    } catch (error) {
      console.error('❌ Failed to generate share link:', error)
      alert('Failed to generate share link. Please try again.')
    } finally {
      setIsGeneratingShare(false)
    }
  }

  const loadSharedBoard = async (shareId) => {
    try {
      console.log('🔄 Loading shared board:', shareId)
      const shareData = await cloudSync.loadShareData(shareId)
      
      console.log('📋 Share data received:', shareData)
      
      if (!shareData) {
        console.warn('⚠️ No share data found for shareId:', shareId)
        alert('This share link is invalid or has been disabled.')
        // Remove share parameter from URL
        const url = new URL(window.location)
        url.searchParams.delete('shared')
        window.history.replaceState({}, '', url)
        return
      }

      if (!shareData.isActive) {
        console.warn('⚠️ Share link is disabled:', shareId)
        alert('This share link has been disabled by the owner.')
        // Remove share parameter from URL
        const url = new URL(window.location)
        url.searchParams.delete('shared')
        window.history.replaceState({}, '', url)
        return
      }

      console.log('✅ Valid share data found:', {
        ownerEmail: shareData.ownerEmail,
        toolsCount: shareData.tools?.length || 0,
        toolDataKeys: shareData.toolData ? Object.keys(shareData.toolData) : [],
        createdAt: shareData.createdAt
      })

      // Store shared tool data in state instead of localStorage
      if (shareData.toolData) {
        console.log('📦 Storing shared tool data in state...')
        setSharedToolData(shareData.toolData)
        
        console.log('📝 Shared notes count:', shareData.toolData.notes?.length || 0)
        console.log('💊 Shared medicine reminders count:', shareData.toolData.medicineReminders?.length || 0)
        console.log('🛒 Shared market list count:', shareData.toolData.marketLists?.length || 0)
        console.log('🍔 Shared iFood favorites count:', shareData.toolData.ifoodFavorites?.length || 0)
      }

      setSharedBoardData(shareData.tools || [])
      setSharedBoardOwner(shareData.ownerEmail || 'Unknown')
      setIsViewingSharedBoard(true)
      setSelectedTools(shareData.tools || [])
      
      console.log('✅ Shared board loaded successfully with all tool data')
    } catch (error) {
      console.error('❌ Failed to load shared board:', error)
      alert('Failed to load shared board. The link may be invalid.')
    }
  }

  const copyShareLink = async () => {
    if (!shareLink) return

    try {
      await navigator.clipboard.writeText(shareLink)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('❌ Failed to copy to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Share link copied to clipboard!')
    }
  }

  const disableSharing = async () => {
    if (!user || !shareLink) return

    try {
      const shareId = shareLink.split('shared=')[1]
      await cloudSync.disableShare(shareId)
      
      // Update user's share config
      const userShares = await cloudSync.getUserShares(user.uid) || []
      const updatedShares = userShares.map(share => 
        share.shareId === shareId ? { ...share, isActive: false } : share
      )
      await cloudSync.saveUserShares(user.uid, updatedShares)

      setShareLink('')
      setShowShareModal(false)
      alert('Sharing has been disabled. The link is no longer accessible.')
    } catch (error) {
      console.error('❌ Failed to disable sharing:', error)
      alert('Failed to disable sharing. Please try again.')
    }
  }

  const exitSharedBoard = () => {
    console.log('🔄 Exiting shared board mode...')
    
    // Remove share parameter from URL and force immediate page refresh
    const url = new URL(window.location)
    url.searchParams.delete('shared')
    
    // Force hard refresh by navigating to the clean URL
    console.log('🔄 Refreshing page to load user\'s own data...')
    window.location.href = url.toString()
  }

  // Show loading screen while checking authentication (but not for shared boards)
  if (loading || (isAuthenticated && !dataLoaded && !isViewingSharedBoard)) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <span className="loading-icon">🧭</span>
          <p>{loading ? 'Loading your companion...' : 'Loading your data...'}</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated AND not viewing a shared board
  if (!isAuthenticated && !isViewingSharedBoard) {
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
        // Sharing props
        isViewingSharedBoard={isViewingSharedBoard}
        sharedBoardOwner={sharedBoardOwner}
        onShowShareModal={() => setShowShareModal(true)}
        onExitSharedBoard={exitSharedBoard}
      />
      
      <MainGrid 
        tools={selectedTools}
        onRemoveTool={removeTool}
        onUpdateTool={updateTool}
        isReadOnly={isViewingSharedBoard}
        sharedToolData={sharedToolData}
      />

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Your Board</h2>
              <button 
                className="modal-close"
                onClick={() => setShowShareModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {!shareLink ? (
                <div className="share-generate">
                  <p>Share your entire board with others. They'll be able to view all your tools and data, but won't be able to make changes.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={generateShareLink}
                    disabled={isGeneratingShare || selectedTools.length === 0}
                  >
                    {isGeneratingShare ? 'Generating...' : 'Generate Share Link'}
                  </button>
                  {selectedTools.length === 0 && (
                    <p className="share-warning">Add some tools to your board first before sharing.</p>
                  )}
                </div>
              ) : (
                <div className="share-active">
                  <p>Your board is now shareable! Anyone with this link can view your board:</p>
                  <div className="share-link-container">
                    <input 
                      type="text" 
                      value={shareLink} 
                      readOnly 
                      className="share-link-input"
                    />
                    <button 
                      className="btn btn-secondary"
                      onClick={copyShareLink}
                    >
                      Copy Link
                    </button>
                  </div>
                  <div className="share-actions">
                    <button 
                      className="btn btn-danger"
                      onClick={disableSharing}
                    >
                      Disable Sharing
                    </button>
                  </div>
                  <p className="share-info">
                    <strong>Note:</strong> The shared board is read-only. Viewers can see your tools and data but cannot make changes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
