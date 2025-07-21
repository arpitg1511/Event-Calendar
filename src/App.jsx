import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState(null)

  useEffect(() => {
    loadEvents()
  }, [])

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

  const saveEvents = (eventsToSave) => {
    localStorage.setItem('calendar-events', JSON.stringify(eventsToSave))
  }

  const addEvent = (newEvent) => {
    const updatedEvents = [...events, newEvent]
    setEvents(updatedEvents)
    saveEvents(updatedEvents)
  }

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
  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const calendarDays = getCalendarDays(currentDate)

  const previousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setShowForm(true)
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={previousMonth}>‹ Previous</button>
        <h2>{monthYear}</h2>
        <button onClick={nextMonth}>Next ›</button>
      </div>

      <div className="weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

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
  const isToday = isSameDay(date, new Date())
  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
  const isSelected = selectedDate && isSameDay(date, selectedDate)
  const dayEvents = getEventsForDate(events, date)
  const [isDragOver, setIsDragOver] = useState(false)

  let dayClass = 'calendar-day'
  if (isToday) dayClass += ' today'
  if (!isCurrentMonth) dayClass += ' other-month'
  if (isSelected) dayClass += ' selected'
  if (isDragOver) dayClass += ' drag-over'

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const draggedEventId = e.dataTransfer.getData('text/plain')
    if (draggedEvent && draggedEventId) {
      if (draggedEvent.date !== date.toDateString()) {
        onMoveEvent(draggedEvent.id, date)
      }
      setDraggedEvent(null)
    }
  }

  const handleDayClick = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('day-number')) {
      onClick(date)
    }
  }

  return (
    <div
      className={dayClass}
      onClick={handleDayClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="day-number">{date.getDate()}</span>
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

function DraggableEvent({ event, setDraggedEvent, onDelete }) {
  const handleDragStart = (e) => {
    setDraggedEvent(event)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', event.id)
    e.target.style.opacity = '0.6'
  }

  const handleDragEnd = (e) => {
    setDraggedEvent(null)
    e.target.style.opacity = '1'
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    onDelete(event.id)
  }

  return (
    <div
      className="event draggable"
      style={{ backgroundColor: event.color }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
      title={`${event.title} - Drag to reschedule, double-click to delete`}
    >
      {event.title}
    </div>
  )
}

function EventForm({ selectedDate, onAddEvent, setShowForm }) {
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('#3498db')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Please enter an event title')
      return
    }
    const newEvent = {
      id: Date.now(),
      title: title.trim(),
      date: selectedDate.toDateString(),
      color: color
    }
    onAddEvent(newEvent)
    setTitle('')
    setShowForm(false)
  }

  const handleCancel = () => {
    setTitle('')
    setShowForm(false)
  }

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

function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString()
}

function getEventsForDate(events, date) {
  return events.filter(event => event.date === date.toDateString())
}

function getCalendarDays(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())

  const endDate = new Date(lastDay)
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

  const days = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
}

export default App
