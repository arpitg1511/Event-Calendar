import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
  addWeeks,
  addYears,
  isValid,
  startOfDay
} from 'date-fns'

export const getCalendarDays = (date) => {
  if (!isValid(date)) {
    console.warn('Invalid date passed to getCalendarDays')
    return []
  }
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const days = []
  let currentDate = startDate
  while (currentDate <= endDate) {
    days.push(new Date(currentDate))
    currentDate = addDays(currentDate, 1)
  }
  return days
}

export const formatDate = (date, formatString = 'yyyy-MM-dd') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : 'Invalid Date'
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

export const isCurrentMonth = (date, monthDate) => {
  return isValid(date) && isValid(monthDate) ? isSameMonth(date, monthDate) : false
}

export const isDateToday = (date) => {
  return isValid(date) ? isToday(date) : false
}

export const isSameDateDay = (date1, date2) => {
  return isValid(date1) && isValid(date2) ? isSameDay(date1, date2) : false
}

export const getPreviousMonth = (date) => {
  return isValid(date) ? subMonths(date, 1) : new Date()
}

export const getNextMonth = (date) => {
  return isValid(date) ? addMonths(date, 1) : new Date()
}

export const parseDate = (dateString) => {
  try {
    const parsed = parseISO(dateString)
    return isValid(parsed) ? parsed : new Date()
  } catch (error) {
    console.error('Error parsing date:', error)
    return new Date()
  }
}

export const generateRecurringDates = (startDate, pattern, interval = 1, endDate) => {
  if (!isValid(startDate)) {
    console.warn('Invalid start date for recurring event')
    return []
  }
  const dates = [startOfDay(startDate)]
  let currentDate = new Date(startDate)
  const maxDate = endDate && isValid(endDate) ? endDate : addYears(startDate, 1)
  const safeInterval = Math.max(1, Math.min(interval || 1, 365))
  let iterations = 0
  const maxIterations = 1000
  while (currentDate < maxDate && iterations < maxIterations) {
    iterations++
    switch (pattern) {
      case 'daily':
        currentDate = addDays(currentDate, safeInterval)
        break
      case 'weekly':
        currentDate = addWeeks(currentDate, safeInterval)
        break
      case 'monthly':
        currentDate = addMonths(currentDate, safeInterval)
        break
      default:
        return dates
    }
    if (currentDate <= maxDate) {
      dates.push(startOfDay(new Date(currentDate)))
    }
  }
  return dates
}

export const generateTimestampId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
