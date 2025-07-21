import { useState, useEffect, useCallback } from 'react'

/**
 * Enhanced localStorage hook with better error handling for Vite
 * @param {string} key - localStorage key
 * @param {*} initialValue - initial value if nothing in localStorage
 * @returns {[any, function]} - [storedValue, setValue]
 */
function useLocalStorage(key, initialValue) {
  // Initialize state with localStorage value or initial value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

export default useLocalStorage
