import React, { useState, useEffect } from 'react'
import './App.css'

// Simple calendar app with drag and drop events
function App() {
  // State: stores all our events
  const [events, setEvents] = useState([])
  
  // State: current month we're viewing
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // State: selected date for adding events
  const [selectedDate, setSelectedDate] = useState(null)
  
  // State: show/hide the add event form
  const [showForm, setShowForm] = useState(false)

  // State: currently dragging event (for visual feedback)
  const [draggedEvent, setDraggedEvent] = useState(null)

  // Load events from localStorage when app starts
  useEffect(() => {
    loadEvents()
  }, [])

  // Load events from localStorage
  const loadEvents = () => {
    try {
      const saved = localStorage.getItem('calendar-events')
      if (saved) {
        setEvents(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  // Save events to localStorage
  const saveEvents = (eventsToSave) => {
    localStorage.setItem('calendar-events', JSON.stringify(eventsToSave))
  }

  // Add new event
  const addEvent = (newEvent) => {
    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    saveEvents(updatedEvents)
  }

  // Move event to new date (drag and drop)
  const moveEvent = (eventId, newDate) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return { ...event, date: newDate.toDateString() }
      }
      return event
    })
    setEvents(updatedEvents)
    saveEvents(updatedEvents)
  }

  // Delete event (double-click)
  const deleteEvent = (eventId) => {
    if (window.confirm('Delete this event?')) {
      const updatedEvents = events.filter(event => event.id !== eventId)
      setEvents(updatedEvents)
      saveEvents(updatedEvents)
    }
  }

  return (
    <div className="app">
      <h1>📅 My Calendar with Drag & Drop</h1>
      
      <div className="instructions">
        <p>🖱️ Click a date to add an event | 🖱️ Drag events to reschedule | 🖱️ Double-click to delete</p>
      </div>
      
      {/* Calendar Component */}
      <Calendar 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        events={events}
        setShowForm={setShowForm}
        draggedEvent={draggedEvent}
        setDraggedEvent={setDraggedEvent}
        onMoveEvent={moveEvent}
        onDeleteEvent={deleteEvent}
      />
      
      {/* Event Form */}
      {showForm && (
        <EventForm 
          selectedDate={selectedDate}
          onAddEvent={addEvent}
          setShowForm={setShowForm}
        />
      )}
    </div>
  )
}

// Calendar component - shows the monthly grid with drag and drop
function Calendar({ 
  currentDate, 
  setCurrentDate, 
  selectedDate, 
  setSelectedDate, 
  events, 
  setShowForm,
  draggedEvent,
  setDraggedEvent,
  onMoveEvent,
  onDeleteEvent
}) {
  
  // Get current month and year for display
  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  // Get all days to show in calendar grid
  const calendarDays = getCalendarDays(currentDate)
  
  // Go to previous month
  const previousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() - 1)
    setCurrentDate(newDate)
  }
  
  // Go to next month
  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + 1)
    setCurrentDate(newDate)
  }
  
  // Handle clicking on a date
  const handleDateClick = (date) => {
    setSelectedDate(date)
    setShowForm(true)
  }

  return (
    <div className="calendar">
      {/* Header with navigation */}
      <div className="calendar-header">
        <button onClick={previousMonth}>‹ Previous</button>
        <h2>{monthYear}</h2>
        <button onClick={nextMonth}>Next ›</button>
      </div>
      
      {/* Days of week header */}
      <div className="weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      
      {/* Calendar grid */}
      <div className="calendar-grid">
        {calendarDays.map(date => (
          <CalendarDay 
            key={date.toDateString()}
            date={date}
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            draggedEvent={draggedEvent}
            setDraggedEvent={setDraggedEvent}
            onClick={handleDateClick}
            onMoveEvent={onMoveEvent}
            onDeleteEvent={onDeleteEvent}
          />
        ))}
      </div>
    </div>
  )
}

// Individual calendar day component with drop zone - FIXED VERSION
function CalendarDay({ 
  date, 
  currentDate, 
  selectedDate, 
  events, 
  draggedEvent,
  setDraggedEvent,
  onClick, 
  onMoveEvent,
  onDeleteEvent
}) {
  
  // Check if this date is today
  const isToday = isSameDay(date, new Date())
  
  // Check if this date is in the current month
  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
  
  // Check if this date is selected
  const isSelected = selectedDate && isSameDay(date, selectedDate)
  
  // Get events for this specific date
  const dayEvents = getEventsForDate(events, date)
  
  // State for drag over styling
  const [isDragOver, setIsDragOver] = useState(false)
  
  // Create CSS classes based on date properties
  let dayClass = 'calendar-day'
  if (isToday) dayClass += ' today'
  if (!isCurrentMonth) dayClass += ' other-month'
  if (isSelected) dayClass += ' selected'
  if (isDragOver) dayClass += ' drag-over'

  // FIXED: Handle drag over (MUST prevent default to allow drop)
  const handleDragOver = (e) => {
    e.preventDefault() // CRITICAL: This prevents the cross cursor!
    e.dataTransfer.dropEffect = 'move' // Show move cursor instead of cross
    setIsDragOver(true)
  }

  // FIXED: Handle drag enter
  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  // FIXED: Handle drag leave (prevent flickering)
  const handleDragLeave = (e) => {
    // Only set to false if actually leaving the target element
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  // FIXED: Handle drop with proper data retrieval
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    // Get the dragged event ID from data transfer
    const draggedEventId = e.dataTransfer.getData('text/plain')
    
    if (draggedEvent && draggedEventId) {
      // Don't move if dropping on same date
      if (draggedEvent.date !== date.toDateString()) {
        onMoveEvent(draggedEvent.id, date)
        console.log(`✅ Successfully moved "${draggedEvent.title}" to ${date.toLocaleDateString()}`)
      } else {
        console.log(`ℹ️ Event "${draggedEvent.title}" is already on ${date.toLocaleDateString()}`)
      }
      setDraggedEvent(null)
    }
  }

  // Handle clicking on empty area of day
  const handleDayClick = (e) => {
    // Only trigger if clicking on the day itself, not on an event
    if (e.target === e.currentTarget || e.target.classList.contains('day-number')) {
      onClick(date)
    }
  }

  return (
    <div 
      className={dayClass} 
      onClick={handleDayClick}
      onDragOver={handleDragOver}      // FIXED: Now prevents default
      onDragEnter={handleDragEnter}    // FIXED: Added for better feedback
      onDragLeave={handleDragLeave}    // FIXED: Prevents flickering
      onDrop={handleDrop}              // FIXED: Proper data handling
    >
      <span className="day-number">{date.getDate()}</span>
      
      {/* Show events for this day */}
      <div className="day-events">
        {dayEvents.map(event => (
          <DraggableEvent
            key={event.id}
            event={event}
            setDraggedEvent={setDraggedEvent}
            onDelete={onDeleteEvent}
          />
        ))}
      </div>
    </div>
  )
}

// FIXED: Draggable Event Component with proper drag setup
function DraggableEvent({ event, setDraggedEvent, onDelete }) {
  
  // FIXED: Handle drag start with proper data transfer
  const handleDragStart = (e) => {
    setDraggedEvent(event)
    
    // CRITICAL: Set up data transfer properly
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', event.id) // Required for drop to work
    
    // Visual feedback: make dragged item semi-transparent
    e.target.style.opacity = '0.6'
    
    console.log(`🎯 Started dragging "${event.title}"`)
  }

  // FIXED: Handle drag end with cleanup
  const handleDragEnd = (e) => {
    setDraggedEvent(null)
    
    // Restore opacity
    e.target.style.opacity = '1'
    
    console.log(`🏁 Finished dragging "${event.title}"`)
  }

  // Handle double click to delete
  const handleDoubleClick = (e) => {
    e.stopPropagation() // Don't trigger day click
    onDelete(event.id)
  }

  return (
    <div 
      className="event draggable"
      style={{ backgroundColor: event.color }}
      draggable={true}                    // Make element draggable
      onDragStart={handleDragStart}       // FIXED: Proper drag start
      onDragEnd={handleDragEnd}           // FIXED: Clean up on drag end
      onDoubleClick={handleDoubleClick}
      title={`${event.title} - Drag to reschedule, double-click to delete`}
    >
      {event.title}
    </div>
  )
}

// Form for adding new events
function EventForm({ selectedDate, onAddEvent, setShowForm }) {
  
  // Form input states
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('#3498db')
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate - make sure title is not empty
    if (!title.trim()) {
      alert('Please enter an event title')
      return
    }
    
    // Create new event object
    const newEvent = {
      id: Date.now(), // Simple ID using timestamp
      title: title.trim(),
      date: selectedDate.toDateString(),
      color: color
    }
    
    // Add new event
    onAddEvent(newEvent)
    
    // Reset form and close
    setTitle('')
    setShowForm(false)
  }
  
  // Handle cancel button
  const handleCancel = () => {
    setTitle('')
    setShowForm(false)
  }

  // Handle clicking on overlay (close form)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  return (
    <div className="form-overlay" onClick={handleOverlayClick}>
      <div className="event-form">
        <h3>Add Event for {selectedDate?.toLocaleDateString()}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title:</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              autoFocus
              maxLength={50}
            />
          </div>
          
          <div className="form-group">
            <label>Color:</label>
            <div className="color-options">
              {/* Predefined color options */}
              {[
                '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
                '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
              ].map(colorOption => (
                <button
                  key={colorOption}
                  type="button"
                  className={`color-option ${color === colorOption ? 'selected' : ''}`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>
          
          <div className="form-buttons">
            <button type="submit">Add Event</button>
            <button type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper function: Check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString()
}

// Helper function: Get all events for a specific date
function getEventsForDate(events, date) {
  return events.filter(event => event.date === date.toDateString())
}

// Helper function: Get all days to show in calendar (including previous/next month)
function getCalendarDays(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  
  // Start from Sunday of the first week
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())
  
  // End on Saturday of the last week
  const endDate = new Date(lastDay)
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()))
  
  // Generate array of all days
  const days = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
}

export default App
