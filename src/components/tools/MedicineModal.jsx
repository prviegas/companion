import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import './MedicineReminder.css'

const timeSlots = ['morning', 'afternoon', 'night']

function MedicineModal({ 
  isOpen, 
  onClose, 
  medicines, 
  onAddMedicine, 
  onUpdateMedicine, 
  onDeleteMedicine 
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    timeSlots: [],
    color: '#6366f1',
    notes: ''
  })

  if (!isOpen) return null

  const handleSaveMedicine = () => {
    if (newMedicine.name.trim() && newMedicine.dosage.trim() && newMedicine.timeSlots.length > 0) {
      const medicine = {
        id: editingMedicine ? editingMedicine.id : Date.now(),
        name: newMedicine.name.trim(),
        dosage: newMedicine.dosage.trim(),
        timeSlots: newMedicine.timeSlots,
        color: newMedicine.color,
        notes: newMedicine.notes.trim(),
        createdAt: editingMedicine ? editingMedicine.createdAt : new Date().toLocaleString()
      }
      
      if (editingMedicine) {
        onUpdateMedicine(medicine)
      } else {
        onAddMedicine(medicine)
      }
      
      resetForm()
    }
  }

  const startEditMedicine = (medicine) => {
    setEditingMedicine(medicine)
    setNewMedicine({
      name: medicine.name,
      dosage: medicine.dosage,
      timeSlots: medicine.timeSlots || [],
      color: medicine.color,
      notes: medicine.notes || ''
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setNewMedicine({ name: '', dosage: '', timeSlots: [], color: '#6366f1', notes: '' })
    setShowAddForm(false)
    setEditingMedicine(null)
  }

  const closeModal = () => {
    resetForm()
    onClose()
  }

  const toggleTimeSlot = (slot) => {
    setNewMedicine(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot]
    }))
  }

  const modalContent = (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Medicines</h3>
          <button onClick={closeModal} className="modal-close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Add/Edit Medicine Form */}
          <div className="manage-section">
            <div className="section-header">
              <h4>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h4>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-primary btn-sm"
                >
                  + Add Medicine
                </button>
              )}
            </div>

            {showAddForm && (
              <div className="add-medicine-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="medicine-name">Medicine Name *</label>
                    <input
                      id="medicine-name"
                      type="text"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      placeholder="e.g., Aspirin"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="medicine-dosage">Dosage *</label>
                    <input
                      id="medicine-dosage"
                      type="text"
                      value={newMedicine.dosage}
                      onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                      placeholder="e.g., 100mg"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="medicine-color">Pill Color</label>
                    <input
                      id="medicine-color"
                      type="color"
                      value={newMedicine.color}
                      onChange={(e) => setNewMedicine({ ...newMedicine, color: e.target.value })}
                      className="form-input color-input"
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label>When to take *</label>
                    <div className="time-slots">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleTimeSlot(slot)}
                          className={`time-slot-btn ${newMedicine.timeSlots.includes(slot) ? 'selected' : ''}`}
                        >
                          {slot.charAt(0).toUpperCase() + slot.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group form-group-full">
                    <label htmlFor="medicine-notes">Notes</label>
                    <textarea
                      id="medicine-notes"
                      value={newMedicine.notes}
                      onChange={(e) => setNewMedicine({ ...newMedicine, notes: e.target.value })}
                      placeholder="Any additional notes about this medicine..."
                      className="form-input"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    onClick={handleSaveMedicine}
                    className="btn btn-primary"
                    disabled={!newMedicine.name.trim() || !newMedicine.dosage.trim() || newMedicine.timeSlots.length === 0}
                  >
                    {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
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

          {/* Existing Medicines List */}
          {medicines.length > 0 && (
            <div className="manage-section">
              <h4>Your Medicines ({medicines.length})</h4>
              <div className="medicine-list">
                {medicines.map((medicine) => (
                  <div key={medicine.id} className="medicine-summary">
                    <div className="medicine-info">
                      <div 
                        className="medicine-color-indicator" 
                        style={{ backgroundColor: medicine.color }}
                      ></div>
                      <div>
                        <span className="medicine-name">{medicine.name}</span>
                        <span className="medicine-dosage">{medicine.dosage}</span>
                        <span className="medicine-schedule">
                          {medicine.timeSlots ? medicine.timeSlots.join(', ') : 'No schedule set'}
                        </span>
                      </div>
                    </div>
                    <div className="medicine-actions">
                      <button
                        onClick={() => startEditMedicine(medicine)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteMedicine(medicine.id)}
                        className="btn btn-danger btn-sm"
                        aria-label={`Delete ${medicine.name}`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
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

export default MedicineModal
