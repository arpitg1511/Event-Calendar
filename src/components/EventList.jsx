import React from 'react'
import { format } from 'date-fns'
import { getEventColor, sortEventsByTime } from '../utils/eventUtils'

const EventList = ({ date, events, onClose, onEdit, onDelete, onAddEvent }) => {
  const sortedEvents = sortEventsByTime(events)
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy')

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content event-list-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Events for {formattedDate}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="event-list-content">
          {sortedEvents.length === 0 ? (
            <div className="no-events">
              <div className="no-events-icon">📅</div>
              <p>No events scheduled for this day</p>
              <button onClick={onAddEvent} className="add-event-button">
                + Add First Event
              </button>
            </div>
          ) : (
            <div className="events-list">
              {sortedEvents.map(event => (
                <div 
                  key={event.id}
                  className="event-item"
                  style={{ borderLeftColor: getEventColor(event.category) }}
                >
                  <div className="event-time">
                    <span className="time-display">
                      {event.startTime} - {event.endTime}
                    </span>
                    {event.recurring && (
                      <span className="recurring-badge">
                        🔁 {event.recurrencePattern}
                      </span>
                    )}
                  </div>
                  
                  <div className="event-details">
                    <div className="event-title">{event.title}</div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                    <div className="event-category">
                      <span 
                        className="category-dot"
                        style={{ backgroundColor: getEventColor(event.category) }}
                      ></span>
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </div>
                  </div>
                  
                  <div className="event-actions">
                    <button 
                      onClick={() => onEdit(event)}
                      className="edit-button"
                      title="Edit event"
                      aria-label={`Edit ${event.title}`}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                          onDelete(event.id)
                        }
                      }}
                      className="delete-button"
                      title="Delete event"
                      aria-label={`Delete ${event.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="event-list-actions">
            <button onClick={onAddEvent} className="add-event-button">
              + Add New Event
            </button>
            <div className="keyboard-hint">
              <small>Press ESC to close</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventList
