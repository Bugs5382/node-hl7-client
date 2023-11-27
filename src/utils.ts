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

/** @internal */
function pad2(n: number): string {  // always returns a string
  return (n < 10 ? '0' : '') + n;
}

/** @internal */
export function createDateTime(): string {

  const date = new Date()
  return date.getFullYear() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds())
}