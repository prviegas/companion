import { useState, useEffect } from 'react'
import './NotesSection.css'
import { useCloudSync } from '../../hooks/useCloudSync'
import NotesModal from './NotesModal'

// Utility functions for localStorage
const STORAGE_KEY = 'notesSection'

const saveNotesToStorage = (notes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    console.log('📝 Notes saved successfully:', notes.length, 'items')
    return true
  } catch (error) {
    console.error('❌ Error saving notes:', error)
    return false
  }
}

const loadNotesFromStorage = () => {
  try {
    const savedNotes = localStorage.getItem(STORAGE_KEY)
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes)
      console.log('📝 Notes loaded successfully:', parsedNotes.length, 'items')
      return parsedNotes
    }
    console.log('📝 No saved notes found')
    return []
  } catch (error) {
    console.error('❌ Error loading notes:', error)
    return []
  }
}

function NotesSection({ isReadOnly = false }) {
  const [notes, setNotes] = useState(() => loadNotesFromStorage())
  const [showManageModal, setShowManageModal] = useState(false)

  // Cloud sync for notes
  useCloudSync('notes', notes, setNotes)

  // Save notes to localStorage whenever notes changes (backup)
  useEffect(() => {
    saveNotesToStorage(notes)
  }, [notes])

  const addNote = (note) => {
    setNotes([note, ...notes])
  }

  const updateNote = (updatedNote) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note))
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼'
      case 'personal': return '👤'
      case 'health': return '🏥'
      case 'shopping': return '🛒'
      case 'reminders': return '⏰'
      default: return '📝'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-normal'
    }
  }

  return (
    <div className="notes-section">
      <div className="notes-header">
        {!isReadOnly && (
          <button
            onClick={() => setShowManageModal(true)}
            className="btn btn-primary btn-sm"
          >
            Manage Notes
          </button>
        )}
        {isReadOnly && (
          <div className="read-only-header">
            <span className="notes-title">Notes</span>
            <span className="read-only-badge">👁️ Read-only</span>
          </div>
        )}
      </div>

      {/* Notes Modal - only show in edit mode */}
      {!isReadOnly && (
        <NotesModal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          notes={notes}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
        />
      )}

      <div className="notes-display">
        {notes.length === 0 ? (
          <div className="empty-list">
            <span className="empty-icon">📝</span>
            <p>No notes yet. Click "Manage Notes" to create your first note!</p>
          </div>
        ) : (
          <div className="notes-list">
            {notes.slice(0, 4).map((note) => (
              <div key={note.id} className={`note-card ${getPriorityColor(note.priority)}`}>
                <div className="note-header">
                  <div className="note-meta">
                    <span className="note-category">
                      {getCategoryIcon(note.category)} {note.category}
                    </span>
                    <span className="note-priority">{note.priority}</span>
                  </div>
                </div>

                <div className="note-content">
                  <h4 className="note-title">{note.title || 'Untitled'}</h4>
                  {note.content && (
                    <p className="note-text">{note.content}</p>
                  )}
                </div>

                <div className="note-footer">
                  <span className="note-date">
                    {note.updatedAt !== note.createdAt ? `Updated: ${note.updatedAt}` : `Created: ${note.createdAt}`}
                  </span>
                </div>
              </div>
            ))}
            {notes.length > 4 && (
              <div className="notes-overflow">
                <p>+ {notes.length - 4} more notes available in Manage Notes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesSection
