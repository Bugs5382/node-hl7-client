/**
 * Assert Number on a Property
 * @since 1.0.0
 * @param props Property Object
 * @param name Property Name
 * @param min Min Number
 * @param max Max Number
 */
export const assertNumber = (
  props: Record<string, number>,
  name: string,
  min: number,
  max?: number,
): void => {
  const val = props[name];
  if (
    isNaN(val) ||
    !Number.isFinite(val) ||
    val < min ||
    (max != null && val > max)
  ) {
    throw new TypeError(
      max != null
        ? `${name} must be a number (${min}, ${max}).`
        : `${name} must be a number >= ${min}.`,
    );
  }
};

/**
 * Create a valid HL7 Date.
 * @remarks Custom for this package and based of HL7 specification.
 * @since 1.0.0
 * @param date
 * @param length
 */
export const createHL7Date = (date: Date, length?: string): string => {
  switch (length) {
    case "8":
      return `${date.getFullYear()}${padHL7Date(date.getMonth() + 1, 2)}${padHL7Date(date.getDate(), 2)}`;
    case "12":
      return `${date.getFullYear()}${padHL7Date(date.getMonth() + 1, 2)}${padHL7Date(date.getDate(), 2)}${padHL7Date(date.getHours(), 2)}${padHL7Date(date.getMinutes(), 2)}`;
    case "14":
    default:
      return `${date.getFullYear()}${padHL7Date(date.getMonth() + 1, 2)}${padHL7Date(date.getDate(), 2)}${padHL7Date(date.getHours(), 2)}${padHL7Date(date.getMinutes(), 2)}${padHL7Date(date.getSeconds(), 2)}`;
  }
};

/**
 * Decode Hex String
 * @since 1.0.0
 * @param value
 */
export const decodeHexString = (value: string): string => {
  const result = new Array(value.length / 2);
  for (let i = 0; i < value.length; i += 2) {
    result[i / 2] = String.fromCharCode(parseInt(value.slice(i, i + 2), 16));
  }
  return result.join("");
};

/**
 * Escape for RegEx Expressing
 * @since 1.0.0
 * @param value
 */
export const escapeForRegExp = (value: string): string => {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

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
 * @since 1.0.0
 * @param step
 * @param high
 * @param attempts
 * @param exp
 */
export const expBackoff = (
  step: number,
  high: number,
  attempts: number,
  exp = 2,
): number => {
  const slots = Math.ceil(Math.min(high / step, Math.pow(exp, attempts)));
  const max = Math.min(slots * step, high);
  return Math.floor(Math.random() * (max - step) + step);
};

/**
 * Check to see if the message starts with Batch (BHS) header segment.
 * @since 1.0.0
 * @param message
 */
export const isBatch = (message: string): boolean => {
  const lines =
    split(message).filter((line) => line.startsWith("MSH")).length > 1 || false;
  if (lines) {
    return true;
  } else if (message.startsWith("MSH") && !lines) {
    return false;
  }
  return message.startsWith("BHS");
};

/**
 * Check to see if the message starts with a File Batch (FHS) header segment.
 * @param message
 */
export const isFile = (message: string): boolean => {
  return message.startsWith("FHS");
};

/**
 * Is Number
 * @remarks Custom for this package.
 * @since 1.0.0
 * @param value
 */
export const isHL7Number = (value: string | number): boolean => {
  value = typeof value === "string" ? parseInt(value) : value;
  return !isNaN(value) || !Number.isFinite(value);
};

/**
 * Is String
 * @remarks Custom for this package.
 * @since 1.0.0
 * @param value
 */
export const isHL7String = (value: any): boolean => typeof value === "string";

/**
 * HL7 Padding for Date
 * @since 1.0.0
 * @param n
 * @param width
 * @param z
 */
export const padHL7Date = (
  n: number,
  width: number,
  z: string = "0",
): string => {
  const s = n.toString();
  return s.length >= width ? s : new Array(width - s.length + 1).join(z) + s;
};

/**
 * Valid IPv4 Checker
 * @since 1.0.0
 * @param ip
 */
export const validIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    return ip.split(".").every((part) => parseInt(part) <= 255);
  }
  return false;
};

/**
 * Valid IPv6 Checker
 * @since 1.0.0
 * @param ip
 */
export const validIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i;
  if (ipv6Regex.test(ip)) {
    return ip.split(":").every((part) => part.length <= 4);
  }
  return false;
};

/**
 * Generate a random string
 * @since 1.0.0
 * @param length
 */
export const randomString = (length = 20): string => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

/**
 * Split the message.
 * @remarks Split the message into its parts.
 * @since 1.0.0
 * @param data
 * @param segments
 */
export const split = (data: string, segments: string[] = []): string[] => {
  const getSegIndex = [
    ...getSegIndexes(["FHS", "BHS", "MSH", "BTS", "FTS"], data),
  ];
  getSegIndex.sort((a, b) => parseInt(a) - parseInt(b));
  for (let i = 0; i < getSegIndex.length; i++) {
    const start = parseInt(getSegIndex[i]);
    let end = parseInt(getSegIndex[i + 1]);
    if (i + 1 === getSegIndex.length) {
      end = data.length;
    }
    segments.push(data.slice(start, end));
  }
  return segments;
};

/**
 * Get Segment Indexes
 * @remarks Helper for {@link split}
 * @since 1.0.0
 * @param names
 * @param data
 * @param list
 */
const getSegIndexes = (
  names: string[],
  data: string,
  list: string[] = [],
): string[] => {
  for (let i = 0; i < names.length; i++) {
    const regex = new RegExp(`(\\n|\\r|)(${names[i]})\\|`, "g");
    let m;
    while ((m = regex.exec(data)) != null) {
      const s = m[0];
      if (s.includes("\r\n")) {
        m.index = m.index + 2;
      } else if (s.includes("\n")) {
        m.index++;
      } else if (s.includes("\r")) {
        m.index++;
      }
      if (m.index !== null) {
        list.push(m.index.toString());
      }
    }
  }
  return list;
};

/**
 * @since 2.0.0
 */
export interface Deferred<T = any> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  promise: Promise<T>;
}

/**
 * Create Deferred
 * @since 2.0.0
 * @param noUncaught
 */
export const createDeferred = <T = any>(noUncaught?: boolean): Deferred<T> => {
  const dfd: any = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  /* istanbul ignore next */
  if (noUncaught === false) {
    dfd.promise.catch(() => {});
  }
  return dfd;
};
