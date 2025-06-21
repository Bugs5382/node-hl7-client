export type HL7Date = string & { __brand: "HL7Date" };

export type DateLength = "8" | "12" | "14" | "19" | "24" | "26" | undefined;

/**
 * Create a valid HL7 Date.
 * @remarks Custom for this package and based on HL7 standards.
 * @since 1.0.0
 * @param date - The JavaScript Date object to format.
 * @param length - Length of the HL7 date string.
 *                 "8"  = YYYYMMDD
 *                 "12" = YYYYMMDDHHMM
 *                 "14" = YYYYMMDDHHMMSS (default)
 *                 "19" = YYYYMMDDHHMMSS.SSSS
 *                 "24" = YYYYMMDDHHMMSS.SSSS+ZZZZ (with timezone offset)
 * @returns A string formatted as an HL7-compatible date.
 */
export const createHL7Date = (date: Date, length?: DateLength): HL7Date => {
  const y = date.getFullYear();
  const mo = padHL7Date(date.getMonth() + 1, 2);
  const d = padHL7Date(date.getDate(), 2);
  const h = padHL7Date(date.getHours(), 2);
  const mi = padHL7Date(date.getMinutes(), 2);
  const s = padHL7Date(date.getSeconds(), 2);
  const ms = padHL7Date(date.getMilliseconds(), 4); // 0–999, zero-padded to 4 digits

  const result = (() => {
    switch (length) {
      case "8":
        return `${y}${mo}${d}`;
      case "12":
        return `${y}${mo}${d}${h}${mi}`;
      case "14":
        return `${y}${mo}${d}${h}${mi}${s}`;
      case "19":
        return `${y}${mo}${d}${h}${mi}${s}.${ms}`;
      case "24": {
        const base = `${y}${mo}${d}${h}${mi}${s}.${ms}`;
        const offset = -date.getTimezoneOffset(); // minutes offset from UTC
        const sign = offset >= 0 ? "+" : "-";
        const absOffset = Math.abs(offset);
        const offsetHours = padHL7Date(Math.floor(absOffset / 60), 2);
        const offsetMinutes = padHL7Date(absOffset % 60, 2);
        return `${base}${sign}${offsetHours}${offsetMinutes}`;
      }
      case "26": {
        const base = `${y}${mo}${d}${h}${mi}${s}`;
        const micros = padHL7Date(date.getMilliseconds() * 1000, 6); // convert ms to µs
        const offset = -date.getTimezoneOffset();
        const sign = offset >= 0 ? "+" : "-";
        const absOffset = Math.abs(offset);
        const offsetHours = padHL7Date(Math.floor(absOffset / 60), 2);
        const offsetMinutes = padHL7Date(absOffset % 60, 2);
        const tz = `${sign}${offsetHours}${offsetMinutes}`;
        return `${base}.${micros}${tz}` as HL7Date;
      }
      default:
        return `${y}${mo}${d}${h}${mi}${s}`;
    }
  })();

  return result as HL7Date;
};

/**
 * HL7 Padding for Date
 * @since 1.0.0
 */
export const padHL7Date = (
  n: number,
  width: number,
  z: string = "0",
): string => {
  const s = n.toString();
  return s.length >= width ? s : new Array(width - s.length + 1).join(z) + s;
};
