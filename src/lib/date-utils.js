/**
 * @param {Date} date
 * @param {number} amount
 */
export function addMilliseconds (date, amount) {
  const newDate = new Date(date)
  newDate.setMilliseconds(newDate.getMilliseconds() + amount)
  return newDate
}

/**
 * @param {Date} date
 * @param {number} amount
 */
export function addSeconds (date, amount) {
  const newDate = new Date(date)
  newDate.setSeconds(newDate.getSeconds() + amount)
  return newDate
}

/**
 * @param {Date} date
 * @param {number} amount
 */
export function addMinutes (date, amount) {
  const newDate = new Date(date)
  newDate.setMinutes(newDate.getMinutes() + amount)
  return newDate
}

/**
 * @param {Date} date
 * @param {number} amount
 */
export function addHours (date, amount) {
  const newDate = new Date(date)
  newDate.setHours(newDate.getHours() + amount)
  return newDate
}

/**
 * @param {Date} date
 * @param {number} amount
 */
export function addDays (date, amount) {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + amount)
  return newDate
}

/**
 * @param {Date} date
 * @param {number} amount
 */
export function addWeeks (date, amount) {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + amount * 7)
  return newDate
}

/**
 * @param {Date} date
 * @param {number} amount
 */
export function addMonths (date, amount) {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + amount)
  return newDate
}

/**
 * @param {Date} date
 * @param {number} amount
 */
export function addYears (date, amount) {
  const newDate = new Date(date)
  newDate.setFullYear(newDate.getFullYear() + amount)
  return newDate
}
