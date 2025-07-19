import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { checkEventConflicts, eventColors, validateEvent } from '../utils/eventUtils'

const EventModal = ({ event, selectedDate, onSave, onClose, existingEvents, isLoading }) => {
  // Form state with Vite-optimized initial values
  const initialFormData = useMemo(() => ({
    title: '',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    category: 'other',
    recurring: false,
    recurrencePattern: 'none',
    recurrenceInterval: 1
  }), [selectedDate])

  const [formData, setFormData] = useState(initialFormData)
  const [conflicts, setConflicts] = useState([])
  const [showConflictWarning, setShowConflictWarning] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Populate form with existing event data
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        date: event.date || format(new Date(), 'yyyy-MM-dd'),
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '10:00',
        description: event.description || '',
        category: event.category || 'other',
        recurring: event.recurring || false,
        recurrencePattern: event.recurrencePattern || 'none',
        recurrenceInterval: event.recurrenceInterval || 1
      })
    }
  }, [event])

  // Handle form input changes with validation
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }

      // Reset recurrence pattern if not recurring
      if (name === 'recurring' && !checked) {
        newData.recurrencePattern = 'none'
      }

      return newData
    })

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }, [formErrors])

  // Validate form data
  const validateForm = useCallback(() => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Event title is required'
    }
    
    if (!formData.date) {
      errors.date = 'Date is required'
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required'
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required'
    }
    
    if (formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time'
    }

    if (formData.recurring && formData.recurrenceInterval < 1) {
      errors.recurrenceInterval = 'Interval must be at least 1'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Check for conflicts when relevant fields change
  useEffect(() => {
    if (validateEvent(formData)) {
      const eventConflicts = checkEventConflicts(formData, existingEvents)
      setConflicts(eventConflicts)
      setShowConflictWarning(eventConflicts.length > 0)
    }
  }, [formData.date, formData.startTime, formData.endTime, formData.title, existingEvents])

  // Handle form submission with validation
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Show conflict warning but allow saving
    if (conflicts.length > 0 && showConflictWarning) {
      const confirmSave = window.confirm(
        `This event conflicts with ${conflicts.length} existing event(s). Do you want to save anyway?`
      )
      if (!confirmSave) return
    }

    await onSave(formData)
  }, [formData, validateForm, conflicts.length, showConflictWarning, onSave])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Add New Event'}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {/* Event Title */}
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className={formErrors.title ? 'error' : ''}
              required
            />
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>

          {/* Date and Time */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={formErrors.date ? 'error' : ''}
                required
              />
              {formErrors.date && <span className="error-message">{formErrors.date}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={formErrors.startTime ? 'error' : ''}
                required
              />
              {formErrors.startTime && <span className="error-message">{formErrors.startTime}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={formErrors.endTime ? 'error' : ''}
                required
              />
              {formErrors.endTime && <span className="error-message">{formErrors.endTime}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description (optional)"
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <div className="category-select">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="social">Social</option>
                <option value="travel">Travel</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="birthday">Birthday</option>
                <option value="holiday">Holiday</option>
                <option value="other">Other</option>
              </select>
              <div 
                className="color-preview"
                style={{ backgroundColor: eventColors[formData.category] }}
              ></div>
            </div>
          </div>

          {/* Recurring Options */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleChange}
              />
              <span>Recurring Event</span>
            </label>
          </div>

          {formData.recurring && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recurrencePattern">Repeat</label>
                <select
                  id="recurrencePattern"
                  name="recurrencePattern"
                  value={formData.recurrencePattern}
                  onChange={handleChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="recurrenceInterval">Every</label>
                <input
                  type="number"
                  id="recurrenceInterval"
                  name="recurrenceInterval"
                  value={formData.recurrenceInterval}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  className={formErrors.recurrenceInterval ? 'error' : ''}
                />
                <span className="interval-label">
                  {formData.recurrencePattern === 'daily' ? 'day(s)' :
                   formData.recurrencePattern === 'weekly' ? 'week(s)' : 'month(s)'}
                </span>
                {formErrors.recurrenceInterval && (
                  <span className="error-message">{formErrors.recurrenceInterval}</span>
                )}
              </div>
            </div>
          )}

          {/* Conflict Warning */}
          {showConflictWarning && conflicts.length > 0 && (
            <div className="conflict-warning">
              <strong>⚠️ Time Conflict Detected!</strong>
              <p>This event overlaps with:</p>
              <ul>
                {conflicts.slice(0, 3).map(conflict => (
                  <li key={conflict.id}>
                    {conflict.title} ({conflict.startTime} - {conflict.endTime})
                  </li>
                ))}
                {conflicts.length > 3 && (
                  <li>...and {conflicts.length - 3} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={isLoading}>
              {isLoading ? 'Saving...' : (event ? 'Update Event' : 'Save Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
