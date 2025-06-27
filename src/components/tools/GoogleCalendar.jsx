import { useState, useEffect } from 'react'
import './GoogleCalendar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt, faCog, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

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
      return parsedSettings
    }
    console.log('📅 No saved calendar settings found')
    return {
      calendarId: '',
      showWeekends: true,
      showTitle: true,
      showNav: true,
      showDate: true,
      showTabs: true,
      showCalendarList: false,
      mode: 'WEEK' // WEEK, MONTH, AGENDA
    }
  } catch (error) {
    console.error('❌ Error loading calendar settings:', error)
    return {
      calendarId: '',
      showWeekends: true,
      showTitle: true,
      showNav: true,
      showDate: true,
      showTabs: true,
      showCalendarList: false,
      mode: 'WEEK'
    }
  }
}

function GoogleCalendar() {
  const [settings, setSettings] = useState(() => loadSettingsFromStorage())
  const [showSettings, setShowSettings] = useState(false)
  const [tempCalendarId, setTempCalendarId] = useState(settings.calendarId)

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    saveSettingsToStorage(settings)
  }, [settings])

  // Generate the Google Calendar embed URL
  const generateCalendarUrl = () => {
    if (!settings.calendarId) {
      return null
    }

    const baseUrl = 'https://calendar.google.com/calendar/embed'
    const params = new URLSearchParams({
      src: settings.calendarId,
      ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      mode: settings.mode,
      showTitle: settings.showTitle ? '1' : '0',
      showNav: settings.showNav ? '1' : '0',
      showDate: settings.showDate ? '1' : '0',
      showTabs: settings.showTabs ? '1' : '0',
      showCalendarList: settings.showCalendarList ? '1' : '0',
      wkst: '1', // Week starts on Sunday
      bgcolor: '%23ffffff'
    })

    if (!settings.showWeekends) {
      params.append('showWkEnd', '0')
    }

    return `${baseUrl}?${params.toString()}`
  }

  const handleSaveSettings = () => {
    setSettings(prev => ({
      ...prev,
      calendarId: tempCalendarId
    }))
    setShowSettings(false)
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const calendarUrl = generateCalendarUrl()

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

      {showSettings && (
        <div className="calendar-settings">
          <div className="settings-section">
            <h4>Calendar Setup</h4>
            <div className="setting-item">
              <label>Google Calendar ID:</label>
              <input
                type="text"
                value={tempCalendarId}
                onChange={(e) => setTempCalendarId(e.target.value)}
                placeholder="your-email@gmail.com or calendar-id"
                className="calendar-id-input"
              />
              <small className="help-text">
                Enter your Google Calendar ID or email address. For public calendars, you can find the Calendar ID in Google Calendar settings.
              </small>
            </div>
            <button className="save-btn" onClick={handleSaveSettings}>
              Save Calendar
            </button>
          </div>

          <div className="settings-section">
            <h4>Display Options</h4>
            <div className="setting-item">
              <label>View Mode:</label>
              <select
                value={settings.mode}
                onChange={(e) => handleSettingChange('mode', e.target.value)}
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
                  checked={settings.showWeekends}
                  onChange={(e) => handleSettingChange('showWeekends', e.target.checked)}
                />
                Show Weekends
              </label>
            </div>

            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showTitle}
                  onChange={(e) => handleSettingChange('showTitle', e.target.checked)}
                />
                Show Title
              </label>
            </div>

            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showNav}
                  onChange={(e) => handleSettingChange('showNav', e.target.checked)}
                />
                Show Navigation
              </label>
            </div>

            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showDate}
                  onChange={(e) => handleSettingChange('showDate', e.target.checked)}
                />
                Show Date
              </label>
            </div>

            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showTabs}
                  onChange={(e) => handleSettingChange('showTabs', e.target.checked)}
                />
                Show Tabs
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-content">
        {!settings.calendarId ? (
          <div className="calendar-setup">
            <div className="setup-message">
              <FontAwesomeIcon icon={faCalendarAlt} className="setup-icon" />
              <h4>Set up your Google Calendar</h4>
              <p>Click the settings button above to connect your Google Calendar.</p>
              <button
                className="setup-btn"
                onClick={() => setShowSettings(true)}
              >
                <FontAwesomeIcon icon={faCog} />
                Configure Calendar
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
              title="Google Calendar"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default GoogleCalendar
