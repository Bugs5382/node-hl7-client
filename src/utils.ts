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
export const isNumber = (value: string | number): boolean => {
  value = typeof value === 'string' ? parseInt(value) : value
  return isNaN(value) || !Number.isFinite(value);
}

/** @internal */
export const isString = (value: any) => typeof value === 'string';

/**
 * Check if valid IPv4 Address Format
 * @since 1.0.0
 * @param ip
 * @return boolean
 */
export const validIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(part => parseInt(part) <= 255)
  }
  return false
}

/**
 * Check if valid IPv6 Address Format
 * @since 1.0.0
 * @param ip
 * @return boolean
 */
export const validIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i
  if (ipv6Regex.test(ip)) {
    return ip.split(':').every(part => part.length <= 4)
  }
  return false
}

/**
 * Create Date
 * @since 1.0.0
 * @param date
 * @example
 * const date = Util.createDate(new Date())
 * // date = 2023120305123434 or YYYYMMDDHHMMSS
 */
export const createDate = (date: Date) => {
  return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}${pad(date.getHours(), 2)}${pad(date.getMinutes(), 2)}${pad(date.getSeconds(), 2)}`
}

/**
 * Converts a number to a string-padded n characters.
 * From http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript.
 * @since 1.0.0
 * @param n The number to convert to a string.
 * @param width The number of characters that should be in the resulting string.
 * @param z Optional. The character to use for padding. Defaults to '0'.
 */
export const pad = (n: number, width: number, z: string = '0'): string => {
  const s = n.toString()
  return s.length >= width ? s : new Array(width - s.length + 1).join(z) + s
}

/**
 * Escape a string for use in a regular express.
 * From http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711.
 * @since 1.0.0
 * @param value The string to escape
 */
export const escapeForRegExp = (value: string): string => {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * Decode Hex String
 * @since 1.0.0
 * @param value
 */
export const decodeHexString = (value: string): string => {
  const result = new Array(value.length / 2)
  for (let i = 0; i < value.length; i += 2) {
    result[i / 2] = String.fromCharCode(parseInt(value.slice(i, i + 2), 16))
  }
  return result.join('')
}
