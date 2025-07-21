import React, { useState, useCallback, useMemo } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { 
  getCalendarDays, 
  isCurrentMonth, 
  isDateToday, 
  isSameDateDay,
  generateTimestampId 
} from '../utils/dateUtils'
import { getEventsForDate, generateSampleEvents } from '../utils/eventUtils'
import useLocalStorage from '../hooks/useLocalStorage'
import EventModal from './EventModal'
import EventList from './EventList'
import DraggableEvent from './DraggableEvent'
import '../styles/Calendar.css'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useLocalStorage('vite-calendar-events', [])
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [showEventList, setShowEventList] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const calendarData = useMemo(() => ({
    days: getCalendarDays(currentDate),
    monthYear: format(currentDate, 'MMMM yyyy'),
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }), [currentDate])

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1))
  }, [])

  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }, [])

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date)
    setShowEventList(true)
  }, [])

  const handleAddEvent = useCallback(() => {
    setEditingEvent(null)
    setShowModal(true)
  }, [])

  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event)
    setShowModal(true)
  }, [])

  const handleDeleteEvent = useCallback((eventId) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
  }, [setEvents])

  const handleSaveEvent = useCallback(async (eventData) => {
    setIsLoading(true)
    
    try {
      if (editingEvent) {
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : event
          )
        )
      } else {
        const newEvent = {
          ...eventData,
          id: generateTimestampId()
        }
        setEvents(prevEvents => [...prevEvents, newEvent])
      }
      
      setShowModal(false)
      setEditingEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [editingEvent, setEvents])


  const handleEventDrop = useCallback((eventId, newDate) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      const updatedEvent = {
        ...event,
        date: format(newDate, 'yyyy-MM-dd')
      }
      setEvents(prevEvents => 
        prevEvents.map(e => e.id === eventId ? updatedEvent : e)
      )
    }
  }, [events, setEvents])


  const loadSampleEvents = useCallback(() => {
    if (import.meta.env.DEV) {
      const samples = generateSampleEvents()
      setEvents(prevEvents => [...prevEvents, ...samples])
    }
  }, [setEvents])


  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleAddEvent()
      }
      if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        goToToday()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleAddEvent, goToToday])

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="navigation">
          <button 
            onClick={goToPreviousMonth} 
            className="nav-button"
            aria-label="Previous month"
          >
            &#8249;
          </button>
          <h2 className="month-year">{calendarData.monthYear}</h2>
          <button 
            onClick={goToNextMonth} 
            className="nav-button"
            aria-label="Next month"
          >
            &#8250;
          </button>
        </div>
        
        <div className="header-info">
          <span className="events-count">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
          {import.meta.env.DEV && (
            <span className="dev-indicator">🔥 Vite Dev</span>
          )}
        </div>

        <div className="header-actions">
          <button onClick={goToToday} className="today-button">
            Today
          </button>
          {import.meta.env.DEV && events.length === 0 && (
            <button onClick={loadSampleEvents} className="sample-button">
              Load Samples
            </button>
          )}
          <button 
            onClick={handleAddEvent} 
            className="add-event-button"
            disabled={isLoading}
          >
            + Add Event
          </button>
        </div>
      </div>

      <div className="calendar-grid">

        <div className="week-header">
          {calendarData.weekDays.map(day => (
            <div key={day} className="week-day">
              {day}
            </div>
          ))}
        </div>

        <div className="days-grid">
          {calendarData.days.map(date => {
            const dayEvents = getEventsForDate(events, date)
            const isToday = isDateToday(date)
            const isCurrentMonthDate = isCurrentMonth(date, currentDate)
            const isSelected = selectedDate && isSameDateDay(date, selectedDate)

            return (
              <div
                key={date.toISOString()}
                className={`calendar-day ${!isCurrentMonthDate ? 'other-month' : ''} ${
                  isToday ? 'today' : ''
                } ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateClick(date)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDateClick(date)
                  }
                }}
              >
                <span className="day-number">
                  {format(date, 'd')}
                </span>
                
                <div className="day-events">
                  {dayEvents.slice(0, 3).map(event => (
                    <DraggableEvent
                      key={`${event.id}-${format(date, 'yyyy-MM-dd')}`}
                      event={event}
                      onEdit={handleEditEvent}
                      onDrop={handleEventDrop}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="more-events">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showModal && (
        <EventModal
          event={editingEvent}
          selectedDate={selectedDate}
          onSave={handleSaveEvent}
          onClose={() => {
            setShowModal(false)
            setEditingEvent(null)
          }}
          existingEvents={events}
          isLoading={isLoading}
        />
      )}

      {showEventList && selectedDate && (
        <EventList
          date={selectedDate}
          events={getEventsForDate(events, selectedDate)}
          onClose={() => setShowEventList(false)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onAddEvent={handleAddEvent}
        />
      )}
    </div>
  )
}

export default Calendar
