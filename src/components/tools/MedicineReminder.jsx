import { useState, useEffect } from 'react'
import './MedicineReminder.css'

// Utility functions for localStorage
const STORAGE_KEY = 'medicineReminders'

const saveMedicinesToStorage = (medicines) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines))
    console.log('💊 Medicines saved successfully:', medicines.length, 'items')
    return true
  } catch (error) {
    console.error('❌ Error saving medicines:', error)
    return false
  }
}

const loadMedicinesFromStorage = () => {
  try {
    const savedMedicines = localStorage.getItem(STORAGE_KEY)
    if (savedMedicines) {
      const parsedMedicines = JSON.parse(savedMedicines)
      console.log('💊 Medicines loaded successfully:', parsedMedicines.length, 'items')
      return parsedMedicines
    }
    console.log('💊 No saved medicines found')
    return []
  } catch (error) {
    console.error('❌ Error loading medicines:', error)
    return []
  }
}

function MedicineReminder() {
  const [medicines, setMedicines] = useState(() => loadMedicinesFromStorage())
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
    notes: ''
  })

  // Save medicines to localStorage whenever medicines changes
  useEffect(() => {
    saveMedicinesToStorage(medicines)
  }, [medicines])

  const addMedicine = () => {
    if (newMedicine.name.trim() && newMedicine.dosage.trim()) {
      const medicine = {
        id: Date.now(),
        ...newMedicine,
        name: newMedicine.name.trim(),
        dosage: newMedicine.dosage.trim(),
        lastTaken: null,
        createdAt: new Date().toLocaleString()
      }
      setMedicines([...medicines, medicine])
      setNewMedicine({ name: '', dosage: '', frequency: '', time: '', notes: '' })
      setShowAddForm(false)
    }
  }

  const deleteMedicine = (id) => {
    setMedicines(medicines.filter(medicine => medicine.id !== id))
  }

  const markAsTaken = (id) => {
    setMedicines(medicines.map(medicine =>
      medicine.id === id
        ? { ...medicine, lastTaken: new Date().toLocaleString() }
        : medicine
    ))
  }

  const resetForm = () => {
    setNewMedicine({ name: '', dosage: '', frequency: '', time: '', notes: '' })
    setShowAddForm(false)
  }

  return (
    <div className="medicine-reminder">
      <div className="medicine-header">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary btn-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Medicine'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-medicine-form">
          <h4>Add New Medicine</h4>
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
              <label htmlFor="medicine-frequency">Frequency</label>
              <select
                id="medicine-frequency"
                value={newMedicine.frequency}
                onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                className="form-input"
              >
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="As needed">As needed</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="medicine-time">Preferred Time</label>
              <input
                id="medicine-time"
                type="time"
                value={newMedicine.time}
                onChange={(e) => setNewMedicine({ ...newMedicine, time: e.target.value })}
                className="form-input"
              />
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
              onClick={addMedicine}
              className="btn btn-primary"
              disabled={!newMedicine.name.trim() || !newMedicine.dosage.trim()}
            >
              Add Medicine
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

      <div className="medicines-list">
        {medicines.length === 0 ? (
          <div className="empty-list">
            <span className="empty-icon">💊</span>
            <p>No medicines added yet. Click "Add Medicine" to get started!</p>
          </div>
        ) : (
          medicines.map((medicine) => (
            <div key={medicine.id} className="medicine-card">
              <div className="medicine-info">
                <h4 className="medicine-name">{medicine.name}</h4>
                <div className="medicine-details">
                  <span className="dosage">{medicine.dosage}</span>
                  {medicine.frequency && (
                    <span className="frequency">{medicine.frequency}</span>
                  )}
                  {medicine.time && (
                    <span className="time">⏰ {medicine.time}</span>
                  )}
                </div>
                {medicine.notes && (
                  <p className="medicine-notes">{medicine.notes}</p>
                )}
                {medicine.lastTaken && (
                  <p className="last-taken">
                    Last taken: {medicine.lastTaken}
                  </p>
                )}
              </div>

              <div className="medicine-actions">
                <button
                  onClick={() => markAsTaken(medicine.id)}
                  className="btn btn-primary btn-sm"
                >
                  Mark as Taken
                </button>
                <button
                  onClick={() => deleteMedicine(medicine.id)}
                  className="btn btn-danger btn-sm"
                  aria-label={`Delete ${medicine.name}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MedicineReminder
