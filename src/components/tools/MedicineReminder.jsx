import { useState, useEffect } from 'react'
import './MedicineReminder.css'
import { useCloudSync } from '../../hooks/useCloudSync'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import MedicineModal from './MedicineModal'

// Utility functions for localStorage
const STORAGE_KEY = 'medicineReminders'
const TAKEN_STORAGE_KEY = 'medicineTaken'

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

const saveTakenToStorage = (taken) => {
  try {
    localStorage.setItem(TAKEN_STORAGE_KEY, JSON.stringify(taken))
    return true
  } catch (error) {
    console.error('❌ Error saving taken medicines:', error)
    return false
  }
}

const loadTakenFromStorage = () => {
  try {
    const savedTaken = localStorage.getItem(TAKEN_STORAGE_KEY)
    return savedTaken ? JSON.parse(savedTaken) : {}
  } catch (error) {
    console.error('❌ Error loading taken medicines:', error)
    return {}
  }
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timeSlots = ['morning', 'afternoon', 'night']

// Helper functions to get current day and time period
const getCurrentDay = () => {
  const today = new Date()
  const dayIndex = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  const mondayBasedIndex = dayIndex === 0 ? 6 : dayIndex - 1 // Convert to Monday-based index
  return days[mondayBasedIndex]
}

const getCurrentTimeSlot = () => {
  const now = new Date()
  const hour = now.getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'morning'
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon'
  } else {
    return 'night'
  }
}

function MedicineReminder({ isReadOnly = false }) {
  const [medicines, setMedicines] = useState(() => loadMedicinesFromStorage())
  const [takenMedicines, setTakenMedicines] = useState(() => loadTakenFromStorage())
  const [showManageModal, setShowManageModal] = useState(false)
  const [animatingPills, setAnimatingPills] = useState(new Set())

  // Get current day and time slot for highlighting
  const currentDay = getCurrentDay()
  const currentTimeSlot = getCurrentTimeSlot()

  // Cloud sync for medicines and taken medicines
  useCloudSync('medicineReminders', medicines, setMedicines)
  useCloudSync('medicineTaken', takenMedicines, setTakenMedicines)

  // Save to localStorage whenever medicines changes (backup)
  useEffect(() => {
    saveMedicinesToStorage(medicines)
  }, [medicines])

  // Save taken medicines to localStorage whenever takenMedicines changes (backup)
  useEffect(() => {
    saveTakenToStorage(takenMedicines)
  }, [takenMedicines])

  const addMedicine = (medicine) => {
    setMedicines([...medicines, medicine])
  }

  const updateMedicine = (updatedMedicine) => {
    setMedicines(medicines.map(m => m.id === updatedMedicine.id ? updatedMedicine : m))
  }

  const deleteMedicine = (id) => {
    setMedicines(medicines.filter(medicine => medicine.id !== id))
    // Also remove any taken records for this medicine
    const newTaken = { ...takenMedicines }
    Object.keys(newTaken).forEach(key => {
      if (key.includes(`-${id}-`)) {
        delete newTaken[key]
      }
    })
    setTakenMedicines(newTaken)
  }

  const toggleTimeSlot = (slot) => {
    setNewMedicine(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot]
    }))
  }

  const toggleTaken = (medicineId, day, timeSlot) => {
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1)) // Monday
    const dayDate = new Date(weekStart)
    dayDate.setDate(weekStart.getDate() + days.indexOf(day))
    
    const key = `${dayDate.toDateString()}-${medicineId}-${timeSlot}`
    const pillKey = `${medicineId}-${day}-${timeSlot}`
    
    // Add animation class
    setAnimatingPills(prev => new Set(prev).add(pillKey))
    
    // Remove animation class after animation completes
    setTimeout(() => {
      setAnimatingPills(prev => {
        const newSet = new Set(prev)
        newSet.delete(pillKey)
        return newSet
      })
    }, 600)
    
    setTakenMedicines(prev => {
      const newTaken = { ...prev }
      if (newTaken[key]) {
        // If already taken, remove it (untake)
        delete newTaken[key]
      } else {
        // If not taken, mark as taken with timestamp
        newTaken[key] = new Date().toLocaleString()
      }
      return newTaken
    })
  }

  const isTaken = (medicineId, day, timeSlot) => {
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1)) // Monday
    const dayDate = new Date(weekStart)
    dayDate.setDate(weekStart.getDate() + days.indexOf(day))
    
    const key = `${dayDate.toDateString()}-${medicineId}-${timeSlot}`
    return takenMedicines[key] || null
  }

  const getMedicinesForSlot = (day, timeSlot) => {
    return medicines.filter(medicine => medicine.timeSlots && medicine.timeSlots.includes(timeSlot))
  }

  return (
    <div className="medicine-reminder">
      <div className="medicine-header">
        {!isReadOnly && (
          <button
            onClick={() => setShowManageModal(true)}
            className="btn btn-primary btn-sm"
          >
            Manage Medicine
          </button>
        )}
        {isReadOnly && (
          <div className="read-only-header">
            <span className="medicine-title">Medicine Reminders</span>
            <span className="read-only-badge">👁️ Read-only</span>
          </div>
        )}
      </div>

      {/* Medicine Modal - only show in edit mode */}
      {!isReadOnly && (
        <MedicineModal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          medicines={medicines}
          onAddMedicine={addMedicine}
          onUpdateMedicine={updateMedicine}
          onDeleteMedicine={deleteMedicine}
        />
      )}

      {medicines.length === 0 ? (
        <div className="empty-list">
          <span className="empty-icon">💊</span>
          <p>No medicines added yet. Click "Manage Medicine" to create your weekly pill organizer!</p>
        </div>
      ) : (
        <div className="pill-organizer">
          <div className="organizer-header">
            <div className="day-header"></div>
            {timeSlots.map(slot => (
              <div 
                key={slot} 
                className={`time-header ${slot === currentTimeSlot ? 'current-time' : ''}`}
              >
                {slot.charAt(0).toUpperCase() + slot.slice(1)}
                {slot === currentTimeSlot && <span className="current-indicator"> ●</span>}
              </div>
            ))}
          </div>
          
          {days.map(day => (
            <div key={day} className="day-row">
              <div className={`day-label ${day === currentDay ? 'current-day' : ''}`}>
                {day}
                {day === currentDay && <span className="current-indicator"> ●</span>}
              </div>
              {timeSlots.map(timeSlot => {
                const isCurrentSlot = day === currentDay && timeSlot === currentTimeSlot
                return (
                  <div 
                    key={`${day}-${timeSlot}`} 
                    className={`pill-slot ${isCurrentSlot ? 'current-slot' : ''}`}
                  >
                    {getMedicinesForSlot(day, timeSlot).map(medicine => {
                      const taken = isTaken(medicine.id, day, timeSlot)
                      const pillKey = `${medicine.id}-${day}-${timeSlot}`
                      const isAnimating = animatingPills.has(pillKey)
                      const wasJustTaken = taken && isAnimating
                      const wasJustUntaken = !taken && isAnimating
                      
                      return (
                        <div
                          key={pillKey}
                          className={`pill ${taken ? 'taken' : ''} ${wasJustUntaken ? 'untaking' : ''} ${isReadOnly ? 'read-only' : ''}`}
                          style={{ backgroundColor: medicine.color }}
                          onClick={() => !isReadOnly && toggleTaken(medicine.id, day, timeSlot)}
                          title={`${medicine.name} - ${medicine.dosage}${medicine.notes ? '\n' + medicine.notes : ''}${taken ? '\nTaken: ' + taken + (isReadOnly ? '' : '\nClick to mark as not taken') : (isReadOnly ? '' : '\nClick to mark as taken')}`}
                        >
                          <span className="pill-label">{medicine.name.charAt(0).toUpperCase()}</span>
                          <span className="pill-dosage">{medicine.dosage}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MedicineReminder
