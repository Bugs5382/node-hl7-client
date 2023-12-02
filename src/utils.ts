/** @internal */
export function assertNumber (props: Record<string, number>, name: string, min: number, max?: number): void {
  const val = props[name]
  if (isNaN(val) || !Number.isFinite(val) || val < min || (max != null && val > max)) {
    throw new TypeError(max != null
      ? `${name} must be a number (${min}, ${max}).`
      : `${name} must be a number >= ${min}.`)
  }
}

/** @internal */
export function validIPv4 (ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(part => parseInt(part) <= 255)
  }
  return false
}

/** @internal */
export function validIPv6 (ip: string): boolean {
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i
  if (ipv6Regex.test(ip)) {
    return ip.split(':').every(part => part.length <= 4)
  }
  return false
}

/**
 * Converts a number to a string padded n characters.
 * From http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript.
 * @param n The number to convert to a string.
 * @param width The number of characters that should be in the resulting string.
 * @param z Optional. The character to use for padding. Defaults to '0'.
 * @since 1.0.0
 */
export function pad (n: number, width: number, z: string = '0'): string {
  const s = n.toString()
  return s.length >= width ? s : new Array(width - s.length + 1).join(z) + s
}

/**
 * Escape a string for use in a regular express.
 * From http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711.
 * @param value The string to escape
 * @since 1.0.0
 */
export function escapeForRegExp (value: string): string {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * Decode Hex String
 * @param value
 * @since 1.0.0
 */
export function decodeHexString (value: string): string {
  const result = new Array(value.length / 2)
  for (let i = 0; i < value.length; i += 2) {
    result[i / 2] = String.fromCharCode(parseInt(value.slice(i, i + 2), 16))
  }
  return result.join('')
}
