import './ToolSelector.css'

const availableTools = [
  {
    id: 'market-list',
    name: 'Market List Maker',
    description: 'Create and manage shopping lists with easy organization',
    icon: '🛒',
    category: 'Organization'
  },
  {
    id: 'medicine-reminder',
    name: 'Medicine Reminder',
    description: 'Track medications, schedules, and dosages',
    icon: '💊',
    category: 'Health'
  },
  {
    id: 'notes-section',
    name: 'Notes Section',
    description: 'Quick notes and reminders for daily tasks',
    icon: '📝',
    category: 'Organization'
  }
]

function ToolSelector({ onAddTool, selectedTools, onClose }) {
  const isToolSelected = (toolId) => {
    return selectedTools.some(tool => tool.id === toolId)
  }

  return (
    <div className="tool-selector" id="tool-selector">
      <div className="tool-selector-header">
        <h2 className="tool-selector-title">Add Tools to Your Dashboard</h2>
        <button
          className="btn btn-secondary"
          onClick={onClose}
          aria-label="Close tool selector"
        >
          ✕
        </button>
      </div>
      
      <div className="tools-list">
        {availableTools.map((tool) => {
          const isSelected = isToolSelected(tool.id)
          
          return (
            <div key={tool.id} className={`tool-option ${isSelected ? 'tool-selected' : ''}`}>
              <div className="tool-option-content">
                <div className="tool-option-icon">
                  <span role="img" aria-label={tool.name}>{tool.icon}</span>
                </div>
                <div className="tool-option-info">
                  <h3 className="tool-option-name">{tool.name}</h3>
                  <p className="tool-option-description">{tool.description}</p>
                  <span className="tool-option-category">{tool.category}</span>
                </div>
              </div>
              <div className="tool-option-actions">
                {isSelected ? (
                  <span className="tool-selected-indicator">
                    ✓ Added
                  </span>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onAddTool(tool)}
                    aria-label={`Add ${tool.name} to dashboard`}
                  >
                    Add Tool
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {selectedTools.length > 0 && (
        <div className="tool-selector-footer">
          <p className="selected-count">
            {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} added to your dashboard
          </p>
        </div>
      )}
    </div>
  )
}

export default ToolSelector
