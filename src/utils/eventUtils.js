import { isSameDay, parseISO, isValid, format } from 'date-fns'
import { generateRecurringDates, parseDate } from './dateUtils'

export const getEventsForDate = (events, date) => {
  if (!Array.isArray(events) || !isValid(date)) {
    return []
  }

  return events.filter(event => {
    try {
      if (event.recurring && event.recurrencePattern !== 'none') {
        const eventStartDate = parseDate(event.date)
        if (!isValid(eventStartDate)) return false
        
        const recurringDates = generateRecurringDates(
          eventStartDate,
          event.recurrencePattern,
          event.recurrenceInterval || 1
        )
        return recurringDates.some(recurringDate => isSameDay(recurringDate, date))
      }
      
      const eventDate = parseDate(event.date)
      return isValid(eventDate) && isSameDay(eventDate, date)
    } catch (error) {
      console.error('Error filtering events for date:', error)
      return false
    }
  })
}

export const checkEventConflicts = (newEvent, existingEvents) => {
  if (!newEvent || !Array.isArray(existingEvents)) {
    return []
  }

  try {
    const newStart = new Date(`${newEvent.date}T${newEvent.startTime}`)
    const newEnd = new Date(`${newEvent.date}T${newEvent.endTime}`)
    
    if (!isValid(newStart) || !isValid(newEnd)) {
      return []
    }
    
    const conflicts = existingEvents.filter(event => {
      try {
        if (event.id === newEvent.id) return false
        
        const eventDate = parseDate(event.date)
        const newEventDate = parseDate(newEvent.date)
        
        if (!isValid(eventDate) || !isValid(newEventDate)) return false
        if (!isSameDay(eventDate, newEventDate)) return false
        
        const existingStart = new Date(`${event.date}T${event.startTime}`)
        const existingEnd = new Date(`${event.date}T${event.endTime}`)
        
        if (!isValid(existingStart) || !isValid(existingEnd)) return false
        
        return (newStart < existingEnd && newEnd > existingStart)
      } catch (error) {
        console.error('Error checking individual event conflict:', error)
        return false
      }
    })
    
    return conflicts
  } catch (error) {
    console.error('Error checking event conflicts:', error)
    return []
  }
}

export const eventColors = {
  work: '#ef4444',
  personal: '#3b82f6',
  health: '#10b981',
  social: '#f59e0b',
  travel: '#8b5cf6',
  other: '#6b7280',
  meeting: '#06b6d4',
  deadline: '#dc2626',
  birthday: '#ec4899',
  holiday: '#84cc16'
}

export const getEventColor = (category) => {
  return eventColors[category] || eventColors.other
}

export const getContrastColor = (backgroundColor) => {
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

export const sortEventsByTime = (events) => {
  if (!Array.isArray(events)) return []
  
  return [...events].sort((a, b) => {
    try {
      const timeA = a.startTime || '00:00'
      const timeB = b.startTime || '00:00'
      return timeA.localeCompare(timeB)
    } catch (error) {
      console.error('Error sorting events:', error)
      return 0
    }
  })
}

export const validateEvent = (event) => {
  if (!event || typeof event !== 'object') return false
  
  const required = ['title', 'date', 'startTime', 'endTime']
  return required.every(field => event[field] && typeof event[field] === 'string')
}

export const generateSampleEvents = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  return [
    {
      id: 'sample-1',
      title: 'Team Meeting',
      date: format(today, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      description: 'Weekly team standup meeting',
      category: 'work',
      recurring: true,
      recurrencePattern: 'weekly',
      recurrenceInterval: 1
    },
    {
      id: 'sample-2',
      title: 'Lunch Break',
      date: format(today, 'yyyy-MM-dd'),
      startTime: '12:00',
      endTime: '13:00',
      description: 'Daily lunch break',
      category: 'personal',
      recurring: true,
      recurrencePattern: 'daily',
      recurrenceInterval: 1
    },
    {
      id: 'sample-3',
      title: 'Doctor Appointment',
      date: format(tomorrow, 'yyyy-MM-dd'),
      startTime: '14:30',
      endTime: '15:30',
      description: 'Annual checkup',
      category: 'health',
      recurring: false,
      recurrencePattern: 'none'
    }
  ]
}
