/**
 * @template TReturnValue
 * @param {() => TReturnValue} fn
 */
export function once (fn) {
  let called = false
  /** @type {TReturnValue} */
  let value
  return () => {
    if (!called) {
      value = fn()
      called = true
    }
    return value
  }
}
