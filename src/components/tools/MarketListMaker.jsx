import { useState, useEffect } from 'react'
import './MarketListMaker.css'
import { useCloudSync } from '../../hooks/useCloudSync'

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

function MarketListMaker() {
  const [items, setItems] = useState(() => loadItemsFromStorage())
  const [newItem, setNewItem] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  // Cloud sync for market list items
  useCloudSync('marketLists', items, setItems)

  // Save items to localStorage whenever items changes (backup)
  useEffect(() => {
    saveItemsToStorage(items)
  }, [items])

  const addItem = () => {
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
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const startEditing = (id, text) => {
    setEditingId(id)
    setEditingText(text)
  }

  const saveEdit = () => {
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
    setItems(items.filter(item => !item.completed))
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

  return (
    <div className="market-list">
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

      {totalCount > 0 && (
        <div className="list-stats">
          <span className="stats-text">
            {completedCount} of {totalCount} items completed
          </span>
          {completedCount > 0 && (
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
                  onClick={() => toggleItem(item.id)}
                  aria-label={`Mark ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}
                >
                  {item.completed && '✓'}
                </button>

                {editingId === item.id ? (
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
                        🗑️
                      </button>
                    </div>
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
