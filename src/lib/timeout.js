export class Timeout extends Error {
  constructor (message = 'timeout', code = 'TIMEOUT_ERROR') {
    super(message)
    Error.captureStackTrace(this, this.constructor)
    this.code = code
  }
}

/**
 * @template TValue
 * @param {Promise<TValue>} promise
 * @param {number} delay
 * @param {object} [options]
 * @param {string} [options.message]
 * @param {string} [options.code]
 */
export default function timeout (promise, delay, { message, code } = {}) {
  /** @type {NodeJS.Timeout} */
  let timeout
  return Promise.race([
    promise.then(value => {
      clearTimeout(timeout)
      return value
    }),
    new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Timeout(message, code)), delay)
    })
  ])
}
