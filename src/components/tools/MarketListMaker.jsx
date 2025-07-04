import { useState, useEffect } from 'react'
import './MarketListMaker.css'
import { useCloudSync } from '../../hooks/useCloudSync'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

// Utility functions for localStorage
const STORAGE_KEY = 'marketListItems'

const saveItemsToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    console.log('🛒 Market list saved successfully:', items.length, 'items')
    return true
  } catch (error) {
    console.error('❌ Error saving market list:', error)
    return false
  }
}

const loadItemsFromStorage = () => {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY)
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems)
      console.log('🛒 Market list loaded successfully:', parsedItems.length, 'items')
      return parsedItems
    }
    console.log('🛒 No saved market list found')
    return []
  } catch (error) {
    console.error('❌ Error loading market list:', error)
    return []
  }
}

function MarketListMaker({ isReadOnly = false, sharedToolData = null }) {
  // Use shared data if available, otherwise load from storage/cloud
  const [items, setItems] = useState(() => {
    if (sharedToolData?.marketLists) {
      console.log('🛒 MarketListMaker using shared data:', sharedToolData.marketLists)
      return sharedToolData.marketLists
    }
    return loadItemsFromStorage()
  })
  const [newItem, setNewItem] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  // Cloud sync for market list items (only when not using shared data)
  const shouldUseCloudSync = !sharedToolData
  useCloudSync(shouldUseCloudSync ? 'marketLists' : null, shouldUseCloudSync ? items : null, shouldUseCloudSync ? setItems : null)

  // Update items when shared data changes
  useEffect(() => {
    if (sharedToolData?.marketLists) {
      console.log('🛒 MarketListMaker updating with shared data:', sharedToolData.marketLists)
      setItems(sharedToolData.marketLists)
    }
  }, [sharedToolData])

  // Save items to localStorage only when not using shared data
  useEffect(() => {
    if (!sharedToolData) {
      saveItemsToStorage(items)
    }
  }, [items, sharedToolData])

  const addItem = () => {
    if (isReadOnly) return // Don't allow adding in read-only mode
    if (newItem.trim()) {
      const item = {
        id: Date.now(),
        text: newItem.trim(),
        completed: false,
        addedAt: new Date().toLocaleString()
      }
      setItems([...items, item])
      setNewItem('')
    }
  }

  const toggleItem = (id) => {
    if (isReadOnly) return // Don't allow toggling in read-only mode
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const deleteItem = (id) => {
    if (isReadOnly) return // Don't allow deleting in read-only mode
    setItems(items.filter(item => item.id !== id))
  }

  const startEditing = (id, text) => {
    if (isReadOnly) return // Don't allow editing in read-only mode
    setEditingId(id)
    setEditingText(text)
  }

  const saveEdit = () => {
    if (isReadOnly) return // Don't allow saving edits in read-only mode
    if (editingText.trim()) {
      setItems(items.map(item =>
        item.id === editingId ? { ...item, text: editingText.trim() } : item
      ))
    }
    setEditingId(null)
    setEditingText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const clearCompleted = () => {
    if (isReadOnly) return // Don't allow clearing in read-only mode
    setItems(items.filter(item => !item.completed))
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

  return (
    <div className="market-list">
      {!isReadOnly && (
        <div className="add-item-form">
          <div className="input-group">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add item to shopping list..."
              className="item-input"
              aria-label="New shopping list item"
            />
            <button
              onClick={addItem}
              className="btn btn-primary btn-sm"
              disabled={!newItem.trim()}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {isReadOnly && items.length === 0 && (
        <div className="empty-state">
          <p>No shopping list items to display</p>
        </div>
      )}

      {totalCount > 0 && (
        <div className="list-stats">
          <span className="stats-text">
            {completedCount} of {totalCount} items completed
          </span>
          {completedCount > 0 && !isReadOnly && (
            <button
              onClick={clearCompleted}
              className="btn btn-secondary btn-sm"
            >
              Clear Completed
            </button>
          )}
        </div>
      )}

      <div className="items-list">
        {items.length === 0 ? (
          <div className="empty-list">
            <span className="empty-icon">📝</span>
            <p>Your shopping list is empty. Add items above to get started!</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`list-item ${item.completed ? 'completed' : ''}`}
            >
              <div className="item-content">
                <button
                  className={`checkbox ${item.completed ? 'checked' : ''}`}
                  onClick={() => !isReadOnly && toggleItem(item.id)}
                  aria-label={`Mark ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}
                  disabled={isReadOnly}
                >
                  {item.completed && '✓'}
                </button>

                {editingId === item.id && !isReadOnly ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="edit-input"
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        onClick={saveEdit}
                        className="btn btn-primary btn-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="item-details">
                    <span className="item-text">{item.text}</span>
                    {!isReadOnly && (
                      <div className="item-actions">
                        <button
                          onClick={() => startEditing(item.id, item.text)}
                          className="btn btn-secondary btn-sm"
                          aria-label={`Edit ${item.text}`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="btn btn-danger btn-sm"
                          aria-label={`Delete ${item.text}`}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MarketListMaker
