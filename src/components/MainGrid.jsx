import { useState, useCallback, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './MainGrid.css'
import MarketListMaker from './tools/MarketListMaker'
import MedicineReminder from './tools/MedicineReminder'
import NotesSection from './tools/NotesSection'
import GoogleCalendar from './tools/GoogleCalendar'
import IFoodHelper from './tools/IFoodHelper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faGripVertical, faExpandArrowsAlt, faTrash } from '@fortawesome/free-solid-svg-icons'

const toolComponents = {
  'market-list': MarketListMaker,
  'medicine-reminder': MedicineReminder,
  'notes-section': NotesSection,
  'google-calendar': GoogleCalendar,
  'ifood-helper': IFoodHelper,
}

// Define grid dimensions
const GRID_COLS = 4
const GRID_ROWS = 8
const TOTAL_TILES = GRID_COLS * GRID_ROWS

// Item types for drag and drop
const ItemTypes = {
  TOOL: 'tool'
}

// Helper functions
const positionToIndex = (row, col) => row * GRID_COLS + col
const indexToPosition = (index) => ({
  row: Math.floor(index / GRID_COLS),
  col: index % GRID_COLS
})

// Resize Selector Component
function ResizeSelector({ isOpen, onClose, onResize, currentWidth = 2, currentHeight = 3 }) {
  const [hoverWidth, setHoverWidth] = useState(0)
  const [hoverHeight, setHoverHeight] = useState(0)
  
  if (!isOpen) return null

  const handleSizeSelect = (width, height) => {
    onResize(width, height)
    onClose()
  }

  const handleMouseEnter = (width, height) => {
    setHoverWidth(width + 1)
    setHoverHeight(height + 1)
  }

  const handleMouseLeave = () => {
    setHoverWidth(0)
    setHoverHeight(0)
  }

  return (
    <div className="resize-overlay" onClick={onClose}>
      <div className="resize-selector" onClick={(e) => e.stopPropagation()}>
        <div className="resize-header">
          <h3>Select Size</h3>
          <button className="resize-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="resize-grid" onMouseLeave={handleMouseLeave}>
          {Array.from({ length: 4 }, (_, height) => (
            <div key={height} className="resize-row">
              {Array.from({ length: 4 }, (_, width) => {
                const isInCurrentSize = width < currentWidth && height < currentHeight
                const isHovered = hoverWidth > 0 && hoverHeight > 0 && 
                                 width < hoverWidth && height < hoverHeight
                const isCornerCell = width + 1 === currentWidth && height + 1 === currentHeight
                
                // Show current size area when not hovering, hovered area when hovering
                const shouldHighlight = hoverWidth > 0 ? isHovered : isInCurrentSize
                
                return (
                  <button
                    key={`${width}-${height}`}
                    className={`resize-cell ${isCornerCell ? 'current' : ''} ${shouldHighlight ? 'preview-selected' : ''}`}
                    onClick={() => handleSizeSelect(width + 1, height + 1)}
                    onMouseEnter={() => handleMouseEnter(width, height)}
                    title={`${width + 1} × ${height + 1}`}
                  >
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="resize-footer">
          <span className="resize-hint">
            {hoverWidth > 0 && hoverHeight > 0 
              ? `${hoverWidth} × ${hoverHeight}` 
              : "Hover to preview size"}
          </span>
        </div>
      </div>
    </div>
  )
}

// Draggable Tool Component
function DraggableTool({ tool, index, onMove, onResize, onRemove }) {
  const [showResizeSelector, setShowResizeSelector] = useState(false)
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TOOL,
    item: { tool, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [tool, index])

  const { row, col } = indexToPosition(index)
  const ToolComponent = toolComponents[tool.id]

  const handleResize = (width, height) => {
    onResize(tool.id, width, height)
  }

  if (!ToolComponent) {
    return (
      <div 
        className="tool-tile tool-error"
        style={{
          gridRow: row + 1,
          gridColumn: col + 1,
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="tool-header">
          <span>Tool not found: {tool.name}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`tool-tile ${isDragging ? 'dragging' : ''}`}
        style={{
          gridRow: `${row + 1} / span ${tool.height || 3}`,
          gridColumn: `${col + 1} / span ${tool.width || 2}`,
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="tool-header">
          <div ref={drag} className="tool-drag-handle">
            <FontAwesomeIcon icon={faGripVertical} />
            <span className="tool-title">{tool.name}</span>
          </div>
          <div className="tool-controls">
            <button
              className="tool-control-btn"
              onClick={() => setShowResizeSelector(true)}
              title="Resize tool"
            >
              <FontAwesomeIcon icon={faExpandArrowsAlt} />
            </button>
            <button
              className="tool-control-btn tool-remove-btn"
              onClick={() => onRemove(tool.id)}
              title="Remove tool"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
        <div className="tool-content">
          <ToolComponent />
        </div>
      </div>
      
      <ResizeSelector
        isOpen={showResizeSelector}
        onClose={() => setShowResizeSelector(false)}
        onResize={handleResize}
        currentWidth={tool.width || 2}
        currentHeight={tool.height || 3}
      />
    </>
  )
}

// Drop Target for empty tiles
function DropTile({ index, isOccupied, onDrop }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.TOOL,
    drop: (item) => {
      if (item.index !== index) {
        onDrop(item.index, index)
      }
    },
    canDrop: () => !isOccupied,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [index, isOccupied, onDrop])

  const { row, col } = indexToPosition(index)

  if (isOccupied) return null

  return (
    <div
      ref={drop}
      className={`tile-drop-zone ${isOver && canDrop ? 'drop-active' : ''}`}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
      }}
    >
      {isOver && canDrop && (
        <div className="drop-indicator">
          <span>Drop here</span>
        </div>
      )}
    </div>
  )
}

// Main Grid Component
function MainGrid({ tools, onRemoveTool, onUpdateTool }) {
  // Create a simple array mapping tools to grid positions
  const [toolPositions, setToolPositions] = useState(() => {
    const positions = new Array(TOTAL_TILES).fill(null)
    
    tools.forEach((tool) => {
      // Use saved grid position if available, otherwise assign sequentially
      const gridPosition = tool.gridPosition !== undefined ? tool.gridPosition : tools.indexOf(tool)
      
      if (gridPosition < TOTAL_TILES) {
        positions[gridPosition] = { 
          ...tool, 
          width: tool.width || 2, 
          height: tool.height || 3 
        }
      }
    })
    return positions
  })

  // Update toolPositions when tools prop changes (e.g., loading from server)
  useEffect(() => {
    const positions = new Array(TOTAL_TILES).fill(null)
    
    tools.forEach((tool) => {
      // Use saved grid position if available, otherwise assign sequentially
      const gridPosition = tool.gridPosition !== undefined ? tool.gridPosition : tools.indexOf(tool)
      
      if (gridPosition < TOTAL_TILES) {
        positions[gridPosition] = { 
          ...tool, 
          width: tool.width || 2, 
          height: tool.height || 3 
        }
      }
    })
    
    setToolPositions(positions)
  }, [tools])

  const handleDrop = useCallback((fromIndex, toIndex) => {
    setToolPositions(prev => {
      const newPositions = [...prev]
      const tool = newPositions[fromIndex]
      newPositions[fromIndex] = null
      newPositions[toIndex] = tool
      
      // Update the tool with its new position in parent state
      if (tool && onUpdateTool) {
        const { row, col } = indexToPosition(toIndex)
        onUpdateTool({
          ...tool,
          gridPosition: toIndex,
          gridRow: row,
          gridCol: col
        })
      }
      
      return newPositions
    })
  }, [onUpdateTool])

  const handleResize = useCallback((toolId, width, height) => {
    setToolPositions(prev => {
      const newPositions = [...prev]
      const toolIndex = newPositions.findIndex(t => t && t.id === toolId)
      if (toolIndex !== -1) {
        const updatedTool = {
          ...newPositions[toolIndex],
          width,
          height
        }
        newPositions[toolIndex] = updatedTool
        
        // Update parent state with position and size data
        if (onUpdateTool) {
          const { row, col } = indexToPosition(toolIndex)
          onUpdateTool({
            ...updatedTool,
            gridPosition: toolIndex,
            gridRow: row,
            gridCol: col
          })
        }
      }
      return newPositions
    })
  }, [onUpdateTool])

  // Calculate which tiles are occupied (including multi-tile tools)
  const getOccupiedTiles = useCallback(() => {
    const occupied = new Set()
    toolPositions.forEach((tool, startIndex) => {
      if (tool) {
        const { row: startRow, col: startCol } = indexToPosition(startIndex)
        for (let r = 0; r < (tool.height || 3); r++) {
          for (let c = 0; c < (tool.width || 2); c++) {
            const tileRow = startRow + r
            const tileCol = startCol + c
            if (tileRow < GRID_ROWS && tileCol < GRID_COLS) {
              occupied.add(positionToIndex(tileRow, tileCol))
            }
          }
        }
      }
    })
    return occupied
  }, [toolPositions])

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
    <DndProvider backend={HTML5Backend}>
      <main className="main-grid">
        <div className="tile-grid">
          {/* Render drop zones for all tiles */}
          {Array.from({ length: TOTAL_TILES }, (_, index) => {
            const occupiedTiles = getOccupiedTiles()
            return (
              <DropTile
                key={`drop-${index}`}
                index={index}
                isOccupied={occupiedTiles.has(index)}
                onDrop={handleDrop}
              />
            )
          })}
          
          {/* Render tools */}
          {toolPositions.map((tool, index) => 
            tool ? (
              <DraggableTool
                key={tool.id}
                tool={tool}
                index={index}
                onMove={handleDrop}
                onResize={handleResize}
                onRemove={onRemoveTool}
              />
            ) : null
          )}
        </div>
        
        <div className="grid-info">
          <p className="grid-stats">
            {tools.length} tools • {TOTAL_TILES - getOccupiedTiles().size} empty tiles
          </p>
        </div>
      </main>
    </DndProvider>
  )
}

export default MainGrid
