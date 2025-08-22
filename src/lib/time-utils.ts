/**
 * Time utility functions for consistent time handling across the application
 */

/**
 * Format time from 24-hour format to 12-hour format for display
 * @param timeString Time in 24-hour format (e.g., "14:00")
 * @returns Formatted time in 12-hour format (e.g., "2:00 PM")
 */
export function formatTimeForDisplay(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12 // Convert 0 to 12
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * Format date string to localized time
 * @param dateString ISO date string
 * @returns Formatted time in 12-hour format
 */
export function formatDateTimeForDisplay(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}

/**
 * Format date string to localized date and time
 * @param dateString ISO date string
 * @returns Formatted date and time string
 */
export function formatDateAndTimeForDisplay(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format date string to localized date only
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDateForDisplay(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Convert day number to day name
 * @param dayNumber Day number (0 = Sunday, 1 = Monday, etc.)
 * @returns Day name
 */
export function dayNumberToName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNumber] || 'Sunday'
}

/**
 * Convert day name to day number
 * @param dayName Day name
 * @returns Day number (0 = Sunday, 1 = Monday, etc.)
 */
export function dayNameToNumber(dayName: string): number {
  const days: { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  }
  return days[dayName] || 0
}

/**
 * Get user's timezone
 * @returns User's timezone string
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Convert time to user's local timezone
 * @param dateString ISO date string
 * @returns Date object in user's local timezone
 */
export function toLocalTime(dateString: string): Date {
  const date = new Date(dateString)
  return new Date(date.toLocaleString("en-US", { timeZone: getUserTimezone() }))
}

/**
 * Check if a date is in the future
 * @param dateString ISO date string
 * @returns True if date is in the future
 */
export function isUpcoming(dateString: string): boolean {
  return new Date(dateString) > new Date()
}

/**
 * Generate time slots for a day
 * @param startHour Start hour (24-hour format)
 * @param endHour End hour (24-hour format)
 * @param intervalMinutes Interval in minutes
 * @returns Array of time slots
 */
export function generateTimeSlots(startHour: number = 8, endHour: number = 22, intervalMinutes: number = 60): string[] {
  const slots: string[] = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
}

/**
 * Calculate duration between two times
 * @param startTime Start time in HH:MM format
 * @param endTime End time in HH:MM format
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const startTotalMinutes = startHours * 60 + startMinutes
  const endTotalMinutes = endHours * 60 + endMinutes
  
  return endTotalMinutes - startTotalMinutes
}

/**
 * Format duration in minutes to human-readable format
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`
  }
  
  return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min`
}