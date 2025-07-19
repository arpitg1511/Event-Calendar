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

/**
 * Get calendar days for a given month (Vite optimized)
 * @param {Date} date - The date to get calendar for
 * @returns {Date[]} Array of dates for the calendar grid
 */
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

/**
 * Format date for display with fallback
 * @param {Date|string} date 
 * @param {string} formatString 
 * @returns {string}
 */
export const formatDate = (date, formatString = 'yyyy-MM-dd') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? format(dateObj, formatString) : 'Invalid Date'
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Check if date is in current month
 * @param {Date} date 
 * @param {Date} monthDate 
 * @returns {boolean}
 */
export const isCurrentMonth = (date, monthDate) => {
  return isValid(date) && isValid(monthDate) ? isSameMonth(date, monthDate) : false
}

/**
 * Check if date is today
 * @param {Date} date 
 * @returns {boolean}
 */
export const isDateToday = (date) => {
  return isValid(date) ? isToday(date) : false
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean}
 */
export const isSameDateDay = (date1, date2) => {
  return isValid(date1) && isValid(date2) ? isSameDay(date1, date2) : false
}

/**
 * Navigate to previous month
 * @param {Date} date 
 * @returns {Date}
 */
export const getPreviousMonth = (date) => {
  return isValid(date) ? subMonths(date, 1) : new Date()
}

/**
 * Navigate to next month
 * @param {Date} date 
 * @returns {Date}
 */
export const getNextMonth = (date) => {
  return isValid(date) ? addMonths(date, 1) : new Date()
}

/**
 * Parse ISO string to date with validation
 * @param {string} dateString 
 * @returns {Date}
 */
export const parseDate = (dateString) => {
  try {
    const parsed = parseISO(dateString)
    return isValid(parsed) ? parsed : new Date()
  } catch (error) {
    console.error('Error parsing date:', error)
    return new Date()
  }
}

/**
 * Generate recurring dates based on recurrence pattern
 * Enhanced for Vite's fast refresh
 * @param {Date} startDate - Start date of recurrence
 * @param {string} pattern - 'daily', 'weekly', 'monthly', 'custom'
 * @param {number} interval - For custom pattern (e.g., every 2 weeks)
 * @param {Date} endDate - End date to generate until
 * @returns {Date[]}
 */
export const generateRecurringDates = (startDate, pattern, interval = 1, endDate) => {
  if (!isValid(startDate)) {
    console.warn('Invalid start date for recurring event')
    return []
  }

  const dates = [startOfDay(startDate)]
  let currentDate = new Date(startDate)
  
  // Default end date to 1 year from start if not provided
  const maxDate = endDate && isValid(endDate) ? endDate : addYears(startDate, 1)
  const safeInterval = Math.max(1, Math.min(interval || 1, 365)) // Prevent infinite loops
  
  let iterations = 0
  const maxIterations = 1000 // Safety limit for Vite dev mode
  
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

// Vite-specific utilities
/**
 * Get current timestamp for unique IDs (Vite compatible)
 * @returns {string}
 */
export const generateTimestampId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Debounce function for Vite's fast refresh
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
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
