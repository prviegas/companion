import { useState } from 'react'
import './MainGrid.css'
import MarketListMaker from './tools/MarketListMaker'
import MedicineReminder from './tools/MedicineReminder'
import NotesSection from './tools/NotesSection'

const toolComponents = {
  'market-list': MarketListMaker,
  'medicine-reminder': MedicineReminder,
  'notes-section': NotesSection,
}

function MainGrid({ tools, onRemoveTool }) {
  if (tools.length === 0) {
    return (
      <main className="main-grid main-grid-empty">
        <div className="empty-state">
          <div className="empty-state-icon">
            <span role="img" aria-label="tools">🛠️</span>
          </div>
          <h2 className="empty-state-title">No tools selected yet</h2>
          <p className="empty-state-message">
            Click "Add Tools" above to start building your personalized dashboard.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="main-grid">
      <div className="tools-grid">
        {tools.map((tool) => {
          const ToolComponent = toolComponents[tool.id]
          if (!ToolComponent) {
            return (
              <div key={tool.id} className="tool-card error-card">
                <h3>Tool not found: {tool.name}</h3>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onRemoveTool(tool.id)}
                >
                  Remove
                </button>
              </div>
            )
          }

          return (
            <div key={tool.id} className="tool-card">
              <div className="tool-header">
                <h3 className="tool-title">{tool.name}</h3>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onRemoveTool(tool.id)}
                  aria-label={`Remove ${tool.name}`}
                >
                  ✕
                </button>
              </div>
              <div className="tool-content">
                <ToolComponent />
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default MainGrid
