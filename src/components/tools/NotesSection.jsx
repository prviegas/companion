import { useState, useEffect } from 'react'
import './NotesSection.css'

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

function NotesSection() {
  const [notes, setNotes] = useState(() => loadNotesFromStorage())
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    priority: 'normal',
    category: 'general'
  })
  const [editingId, setEditingId] = useState(null)
  const [editingNote, setEditingNote] = useState({})

  // Save notes to localStorage whenever notes changes
  useEffect(() => {
    saveNotesToStorage(notes)
  }, [notes])

  const addNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note = {
        id: Date.now(),
        title: newNote.title.trim() || 'Untitled Note',
        content: newNote.content.trim(),
        priority: newNote.priority,
        category: newNote.category,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString()
      }
      setNotes([note, ...notes])
      setNewNote({ title: '', content: '', priority: 'normal', category: 'general' })
      setShowAddForm(false)
    }
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  const startEditing = (note) => {
    setEditingId(note.id)
    setEditingNote({ ...note })
  }

  const saveEdit = () => {
    if (editingNote.title.trim() || editingNote.content.trim()) {
      setNotes(notes.map(note =>
        note.id === editingId
          ? {
              ...editingNote,
              title: editingNote.title.trim() || 'Untitled Note',
              content: editingNote.content.trim(),
              updatedAt: new Date().toLocaleString()
            }
          : note
      ))
    }
    setEditingId(null)
    setEditingNote({})
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingNote({})
  }

  const resetForm = () => {
    setNewNote({ title: '', content: '', priority: 'normal', category: 'general' })
    setShowAddForm(false)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-normal'
    }
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

  return (
    <div className="notes-section">
      <div className="notes-header">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary btn-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-note-form">
          <h4>Add New Note</h4>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="note-title">Title</label>
              <input
                id="note-title"
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title (optional)"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="note-category">Category</label>
              <select
                id="note-category"
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                className="form-input"
              >
                <option value="general">General</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="shopping">Shopping</option>
                <option value="reminders">Reminders</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="note-priority">Priority</label>
              <select
                id="note-priority"
                value={newNote.priority}
                onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                className="form-input"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="note-content">Content</label>
              <textarea
                id="note-content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note here..."
                className="form-input"
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={addNote}
              className="btn btn-primary"
              disabled={!newNote.title.trim() && !newNote.content.trim()}
            >
              Add Note
            </button>
            <button
              onClick={resetForm}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-list">
            <span className="empty-icon">📝</span>
            <p>No notes yet. Click "Add Note" to create your first note!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`note-card ${getPriorityColor(note.priority)}`}>
              {editingId === note.id ? (
                <div className="edit-note-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <input
                        type="text"
                        value={editingNote.title}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        placeholder="Note title"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <select
                        value={editingNote.category}
                        onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                        className="form-input"
                      >
                        <option value="general">General</option>
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="health">Health</option>
                        <option value="shopping">Shopping</option>
                        <option value="reminders">Reminders</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <select
                        value={editingNote.priority}
                        onChange={(e) => setEditingNote({ ...editingNote, priority: e.target.value })}
                        className="form-input"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="form-group form-group-full">
                      <textarea
                        value={editingNote.content}
                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                        className="form-input"
                        rows="4"
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button onClick={saveEdit} className="btn btn-primary btn-sm">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="btn btn-secondary btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="note-header">
                    <div className="note-meta">
                      <span className="note-category">
                        {getCategoryIcon(note.category)} {note.category}
                      </span>
                      <span className="note-priority">{note.priority}</span>
                    </div>
                    <div className="note-actions">
                      <button
                        onClick={() => startEditing(note)}
                        className="btn btn-secondary btn-sm"
                        aria-label={`Edit ${note.title}`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="btn btn-danger btn-sm"
                        aria-label={`Delete ${note.title}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="note-content">
                    <h4 className="note-title">{note.title}</h4>
                    {note.content && (
                      <p className="note-text">{note.content}</p>
                    )}
                  </div>

                  <div className="note-footer">
                    <span className="note-date">
                      Created: {note.createdAt}
                    </span>
                    {note.updatedAt !== note.createdAt && (
                      <span className="note-date">
                        Updated: {note.updatedAt}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotesSection
