import './Header.css'
import ToolSelector from './ToolSelector'

function Header({ onToggleToolSelector, isSelectingTools, selectedTools, onAddTool, onCloseToolSelector }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">
          <span role="img" aria-label="compass">🧭</span>
          Daily Companion
        </h1>
        <p className="header-subtitle">
          Your helpful assistant for daily tasks and organization
        </p>
        <div className="header-actions">
          <button
            className={`btn ${isSelectingTools ? 'btn-secondary' : 'btn-primary'}`}
            onClick={onToggleToolSelector}
            aria-expanded={isSelectingTools}
            aria-controls="tool-selector"
          >
            {isSelectingTools ? 'Close Tools' : 'Add Tools'}
          </button>
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
