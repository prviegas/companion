import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import './NotesSection.css'

function NotesModal({ 
  isOpen, 
  onClose, 
  notes, 
  onAddNote, 
  onUpdateNote, 
  onDeleteNote 
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    priority: 'normal',
    category: 'general'
  })

  if (!isOpen) return null

  const handleSaveNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note = {
        id: editingNote ? editingNote.id : Date.now(),
        title: newNote.title.trim() || 'Untitled Note',
        content: newNote.content.trim(),
        priority: newNote.priority,
        category: newNote.category,
        createdAt: editingNote ? editingNote.createdAt : new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString()
      }
      
      if (editingNote) {
        onUpdateNote(note)
      } else {
        onAddNote(note)
      }
      
      resetForm()
    }
  }

  const startEditNote = (note) => {
    setEditingNote(note)
    setNewNote({
      title: note.title,
      content: note.content,
      priority: note.priority,
      category: note.category
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setNewNote({ title: '', content: '', priority: 'normal', category: 'general' })
    setShowAddForm(false)
    setEditingNote(null)
  }

  const closeModal = () => {
    resetForm()
    onClose()
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

  const modalContent = (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Notes</h3>
          <button onClick={closeModal} className="modal-close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Add/Edit Note Form */}
          <div className="manage-section">
            <div className="section-header">
              <h4>{editingNote ? 'Edit Note' : 'Add New Note'}</h4>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-primary btn-sm"
                >
                  + Add Note
                </button>
              )}
            </div>

            {showAddForm && (
              <div className="add-note-form">
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
                    onClick={handleSaveNote}
                    className="btn btn-primary"
                    disabled={!newNote.title.trim() && !newNote.content.trim()}
                  >
                    {editingNote ? 'Update Note' : 'Add Note'}
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
          </div>

          {/* Existing Notes List */}
          {notes.length > 0 && (
            <div className="manage-section">
              <h4>Your Notes ({notes.length})</h4>
              <div className="notes-list">
                {notes.map((note) => (
                  <div key={note.id} className={`note-card ${getPriorityColor(note.priority)}`}>
                    <div className="note-header">
                      <div className="note-meta">
                        <span className="note-category">
                          {getCategoryIcon(note.category)} {note.category}
                        </span>
                        <span className="note-priority">{note.priority}</span>
                      </div>
                      <div className="note-actions">
                        <button
                          onClick={() => startEditNote(note)}
                          className="btn btn-secondary btn-sm"
                          aria-label={`Edit ${note.title}`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="btn btn-danger btn-sm"
                          aria-label={`Delete ${note.title}`}
                        >
                          <FontAwesomeIcon icon={faTrash} />
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Use portal to render modal outside the tool tile
  return createPortal(modalContent, document.body)
}

export default NotesModal
