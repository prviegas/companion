import { useState, useEffect } from 'react'
import './GoogleCalendar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt, faCog, faExternalLinkAlt, faPlus, faTimes, faEdit } from '@fortawesome/free-solid-svg-icons'

// Utility functions for localStorage
const STORAGE_KEY = 'googleCalendarSettings'

const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    console.log('📅 Calendar settings saved successfully')
    return true
  } catch (error) {
    console.error('❌ Error saving calendar settings:', error)
    return false
  }
}

const loadSettingsFromStorage = () => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY)
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      console.log('📅 Calendar settings loaded successfully')
      
      // Migrate old single calendar format to new multiple calendar format
      if (parsedSettings.calendarId && !parsedSettings.calendars) {
        return {
          calendars: parsedSettings.calendarId ? [{
            id: Date.now().toString(),
            calendarId: parsedSettings.calendarId,
            name: 'My Calendar',
            showWeekends: parsedSettings.showWeekends || true,
            showTitle: parsedSettings.showTitle || true,
            showNav: parsedSettings.showNav || true,
            showDate: parsedSettings.showDate || true,
            showTabs: parsedSettings.showTabs || true,
            showCalendarList: parsedSettings.showCalendarList || false,
            mode: parsedSettings.mode || 'WEEK'
          }] : [],
          activeCalendarId: parsedSettings.calendarId ? Date.now().toString() : null
        }
      }
      
      return parsedSettings
    }
    console.log('📅 No saved calendar settings found')
    return {
      calendars: [],
      activeCalendarId: null
    }
  } catch (error) {
    console.error('❌ Error loading calendar settings:', error)
    return {
      calendars: [],
      activeCalendarId: null
    }
  }
}

function GoogleCalendar() {
  const [settings, setSettings] = useState(() => loadSettingsFromStorage())
  const [showSettings, setShowSettings] = useState(false)
  const [newCalendarId, setNewCalendarId] = useState('')
  const [newCalendarName, setNewCalendarName] = useState('')
  const [editingCalendarId, setEditingCalendarId] = useState(null)

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    saveSettingsToStorage(settings)
  }, [settings])

  // Get active calendar
  const activeCalendar = settings.calendars?.find(cal => cal.id === settings.activeCalendarId)

  // Add a new calendar
  const addCalendar = () => {
    if (!newCalendarId.trim() || !newCalendarName.trim()) return

    const newCalendar = {
      id: Date.now().toString(),
      calendarId: newCalendarId.trim(),
      name: newCalendarName.trim(),
      showWeekends: true,
      showTitle: true,
      showNav: true,
      showDate: true,
      showTabs: true,
      showCalendarList: false,
      mode: 'WEEK'
    }

    setSettings(prev => ({
      ...prev,
      calendars: [...(prev.calendars || []), newCalendar],
      activeCalendarId: prev.calendars?.length === 0 ? newCalendar.id : prev.activeCalendarId
    }))

    setNewCalendarId('')
    setNewCalendarName('')
  }

  // Remove a calendar
  const removeCalendar = (calendarId) => {
    setSettings(prev => {
      const newCalendars = prev.calendars.filter(cal => cal.id !== calendarId)
      return {
        ...prev,
        calendars: newCalendars,
        activeCalendarId: prev.activeCalendarId === calendarId 
          ? (newCalendars.length > 0 ? newCalendars[0].id : null)
          : prev.activeCalendarId
      }
    })
  }

  // Update calendar settings
  const updateCalendar = (calendarId, updates) => {
    setSettings(prev => ({
      ...prev,
      calendars: prev.calendars.map(cal => 
        cal.id === calendarId ? { ...cal, ...updates } : cal
      )
    }))
  }

  // Switch active calendar
  const switchCalendar = (calendarId) => {
    setSettings(prev => ({
      ...prev,
      activeCalendarId: calendarId
    }))
  }

  // Generate the Google Calendar embed URL
  const generateCalendarUrl = (calendar) => {
    if (!calendar || !calendar.calendarId) {
      return null
    }

    const baseUrl = 'https://calendar.google.com/calendar/embed'
    const params = new URLSearchParams({
      src: calendar.calendarId,
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      mode: calendar.mode,
      showTitle: calendar.showTitle ? '1' : '0',
      showNav: calendar.showNav ? '1' : '0',
      showDate: calendar.showDate ? '1' : '0',
      showTabs: calendar.showTabs ? '1' : '0',
      showCalendarList: calendar.showCalendarList ? '1' : '0',
      wkst: '1', // Week starts on Sunday
      bgcolor: '%23ffffff'
    })

    if (!calendar.showWeekends) {
      params.append('showWkEnd', '0')
    }

    return `${baseUrl}?${params.toString()}`
  }

  const calendarUrl = generateCalendarUrl(activeCalendar)

  return (
    <div className="google-calendar">
      <div className="calendar-header">
        <div className="calendar-title">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <h3>Google Calendar</h3>
        </div>
        <div className="calendar-actions">
          <button
            className="settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Calendar Settings"
          >
            <FontAwesomeIcon icon={faCog} />
          </button>
          {calendarUrl && (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link-btn"
              title="Open in Google Calendar"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} />
            </a>
          )}
        </div>
      </div>

      {/* Calendar Tabs */}
      {settings.calendars && settings.calendars.length > 0 && (
        <div className="calendar-tabs">
          {settings.calendars.map(calendar => (
            <div
              key={calendar.id}
              className={`calendar-tab ${settings.activeCalendarId === calendar.id ? 'active' : ''}`}
              onClick={() => switchCalendar(calendar.id)}
            >
              <span className="tab-name">{calendar.name}</span>
              <button
                className="tab-remove"
                onClick={(e) => {
                  e.stopPropagation()
                  removeCalendar(calendar.id)
                }}
                title="Remove calendar"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ))}
          <button
            className="add-calendar-tab"
            onClick={() => setShowSettings(true)}
            title="Add calendar"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      )}

      {showSettings && (
        <div className="calendar-settings">
          <div className="settings-section">
            <h4>Add New Calendar</h4>
            <div className="setting-item">
              <label>Calendar Name:</label>
              <input
                type="text"
                value={newCalendarName}
                onChange={(e) => setNewCalendarName(e.target.value)}
                placeholder="e.g., Work Calendar, Personal"
                className="calendar-name-input"
              />
            </div>
            <div className="setting-item">
              <label>Google Calendar ID:</label>
              <input
                type="text"
                value={newCalendarId}
                onChange={(e) => setNewCalendarId(e.target.value)}
                placeholder="your-email@gmail.com or calendar-id"
                className="calendar-id-input"
              />
              <small className="help-text">
                Enter your Google Calendar ID or email address. For public calendars, you can find the Calendar ID in Google Calendar settings.
              </small>
            </div>
            <button 
              className="save-btn" 
              onClick={addCalendar}
              disabled={!newCalendarId.trim() || !newCalendarName.trim()}
            >
              Add Calendar
            </button>
          </div>

          {activeCalendar && (
            <div className="settings-section">
              <h4>Calendar Settings - {activeCalendar.name}</h4>
              <div className="setting-item">
                <label>Calendar Name:</label>
                <input
                  type="text"
                  value={activeCalendar.name}
                  onChange={(e) => updateCalendar(activeCalendar.id, { name: e.target.value })}
                  className="calendar-name-input"
                />
              </div>
              <div className="setting-item">
                <label>View Mode:</label>
                <select
                  value={activeCalendar.mode}
                  onChange={(e) => updateCalendar(activeCalendar.id, { mode: e.target.value })}
                >
                  <option value="WEEK">Week View</option>
                  <option value="MONTH">Month View</option>
                  <option value="AGENDA">Agenda View</option>
                </select>
              </div>

              <div className="setting-item checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    checked={activeCalendar.showWeekends}
                    onChange={(e) => updateCalendar(activeCalendar.id, { showWeekends: e.target.checked })}
                  />
                  Show Weekends
                </label>
              </div>

              <div className="setting-item checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    checked={activeCalendar.showTitle}
                    onChange={(e) => updateCalendar(activeCalendar.id, { showTitle: e.target.checked })}
                  />
                  Show Title
                </label>
              </div>

              <div className="setting-item checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    checked={activeCalendar.showNav}
                    onChange={(e) => updateCalendar(activeCalendar.id, { showNav: e.target.checked })}
                  />
                  Show Navigation
                </label>
              </div>

              <div className="setting-item checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    checked={activeCalendar.showDate}
                    onChange={(e) => updateCalendar(activeCalendar.id, { showDate: e.target.checked })}
                  />
                  Show Date
                </label>
              </div>

              <div className="setting-item checkbox-item">
                <label>
                  <input
                    type="checkbox"
                    checked={activeCalendar.showTabs}
                    onChange={(e) => updateCalendar(activeCalendar.id, { showTabs: e.target.checked })}
                  />
                  Show Tabs
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="calendar-content">
        {!settings.calendars || settings.calendars.length === 0 ? (
          <div className="calendar-setup">
            <div className="setup-message">
              <FontAwesomeIcon icon={faCalendarAlt} className="setup-icon" />
              <h4>Set up your Google Calendars</h4>
              <p>Click the settings button above to add your first Google Calendar.</p>
              <button
                className="setup-btn"
                onClick={() => setShowSettings(true)}
              >
                <FontAwesomeIcon icon={faCog} />
                Add Calendar
              </button>
            </div>
          </div>
        ) : (
          <div className="calendar-iframe-container">
            <iframe
              src={calendarUrl}
              className="calendar-iframe"
              frameBorder="0"
              scrolling="no"
              title={`Google Calendar - ${activeCalendar?.name || 'Calendar'}`}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default GoogleCalendar
