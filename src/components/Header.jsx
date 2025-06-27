import './Header.css'
import ToolSelector from './ToolSelector'
import { useAuth } from '../context/AuthContext'

function Header({ 
  onToggleToolSelector, 
  isSelectingTools, 
  selectedTools, 
  onAddTool, 
  onCloseToolSelector,
  user,
  isAuthenticated,
  syncStatus,
  // Sharing props
  isViewingSharedBoard,
  sharedBoardOwner,
  onShowShareModal,
  onExitSharedBoard
}) {
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return '🔄'
      case 'synced': return '☁️'
      case 'error': return '⚠️'
      default: return '💾'
    }
  }

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Syncing...'
      case 'synced': return 'Synced'
      case 'error': return 'Sync Error'
      default: return 'Local Only'
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <h1 className="header-title">
            <span role="img" aria-label="compass">🧭</span>
            Daily Companion
          </h1>
          <p className="header-subtitle">
            Your helpful assistant for daily tasks and organization
          </p>
        </div>
        
        <div className="header-controls">
          {isViewingSharedBoard ? (
            <div className="shared-board-banner">
              <div className="shared-info">
                <span className="shared-icon">👁️</span>
                <div className="shared-text">
                  <span className="shared-label">Viewing shared board from:</span>
                  <span className="shared-owner">{sharedBoardOwner}</span>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onExitSharedBoard}
              >
                Exit Shared View
              </button>
            </div>
          ) : (
            <div className="header-actions">
              <button
                className={`btn ${isSelectingTools ? 'btn-secondary' : 'btn-primary'}`}
                onClick={onToggleToolSelector}
                aria-expanded={isSelectingTools}
                aria-controls="tool-selector"
              >
                {isSelectingTools ? 'Close Tools' : 'Add Tools'}
              </button>
              
              {isAuthenticated && selectedTools.length > 0 && (
                <button
                  className="btn btn-outline share-btn"
                  onClick={onShowShareModal}
                  title="Share your board"
                >
                  <span className="share-icon">🔗</span>
                  Share Board
                </button>
              )}
            </div>
          )}

          <div className="header-auth">
            {isAuthenticated && user && (
              <div className="user-menu">
                <div className="sync-status" title={getSyncStatusText()}>
                  <span className="sync-icon">{getSyncStatusIcon()}</span>
                  <span className="sync-text">{getSyncStatusText()}</span>
                </div>
                <div className="user-info">
                  <span className="user-email">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isSelectingTools && (
        <ToolSelector 
          onAddTool={onAddTool}
          selectedTools={selectedTools}
          onClose={onCloseToolSelector}
        />
      )}
    </header>
  )
}

export default Header
