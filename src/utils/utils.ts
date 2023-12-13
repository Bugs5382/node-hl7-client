import EventEmitter from 'node:events'

/** @internal */
export const sleep = async (ms: number): Promise<unknown> => {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

/** @internal */
export const expectEvent = async <T=any>(emitter: EventEmitter, name: string | symbol): Promise<T> => {
  return await new Promise<T>((resolve) => { emitter.once(name, resolve) })
}

/**
 * Calculate exponential backoff/retry delay.
 * Where attempts >= 1, exp > 1
 * @example expBackoff(1000, 30000, attempts)
 *   ---------------------------------
 *    attempts | possible delay
 *   ----------+----------------------
 *        1    | 1000 to 2000
 *        2    | 1000 to 4000
 *        3    | 1000 to 8000
 *        4    | 1000 to 16000
 *        5    | 1000 to 30000
 *   ---------------------------------
 * Attempts required before max delay is possible = Math.ceil(Math.log(high/step) / Math.log(exp))
 * @internal
 */
export const expBackoff = (step: number, high: number, attempts: number, exp = 2): number => {
  const slots = Math.ceil(Math.min(high / step, Math.pow(exp, attempts)))
  const max = Math.min(slots * step, high)
  return Math.floor(Math.random() * (max - step) + step)
}

/** @internal */
export interface Deferred<T=any> {
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
  promise: Promise<T>
}

/** @internal */
export const createDeferred = <T=any>(noUncaught?: boolean): Deferred<T> => {
  const dfd: any = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  /* istanbul ignore next */
  if (noUncaught === false) {
    dfd.promise.catch(() => {})
  }
  return dfd
}

/** @internal */
export const assertNumber = (props: Record<string, number>, name: string, min: number, max?: number): void => {
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
  return !isNaN(value) || !Number.isFinite(value)
}

/** @internal */
export const isString = (value: any): boolean => typeof value === 'string'

/** @internal */
export const validIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(part => parseInt(part) <= 255)
  }
  return false
}

/** @internal */
export const validIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i
  if (ipv6Regex.test(ip)) {
    return ip.split(':').every(part => part.length <= 4)
  }
  return false
}

/** @internal */
export const createHL7Date = (date: Date, length: '8' | '12' | '14' = '14'): string => {
  switch (length) {
    case '14':
      return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}${pad(date.getHours(), 2)}${pad(date.getMinutes(), 2)}${pad(date.getSeconds(), 2)}`
    case '12':
      return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}${pad(date.getHours(), 2)}${pad(date.getMinutes(), 2)}`
    case '8':
      return `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}`
  }
}

/** @internal */
export const isBatch = (data: string): boolean => {
  return data.startsWith('BHS')
}

/** @internal */
export const isFile = (data: string): boolean => {
  return data.startsWith('FSH')
}

/** @internal */
export const pad = (n: number, width: number, z: string = '0'): string => {
  const s = n.toString()
  return s.length >= width ? s : new Array(width - s.length + 1).join(z) + s
}

/** @internal */
export const escapeForRegExp = (value: string): string => {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/** @internal */
export const decodeHexString = (value: string): string => {
  const result = new Array(value.length / 2)
  for (let i = 0; i < value.length; i += 2) {
    result[i / 2] = String.fromCharCode(parseInt(value.slice(i, i + 2), 16))
  }
  return result.join('')
}

/** @internal */
export const randomString = (length = 20): string => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
