export type HL7Date = string & { __brand: "HL7Date" };

/**
 * Create a valid HL7 Date.
 * @remarks Custom for this package and based on HL7 standards.
 * @since 1.0.0
 * @param date - The JavaScript Date object to format.
 * @param length - Optional length of the HL7 date string.
 *                 "8"  = YYYYMMDD
 *                 "12" = YYYYMMDDHHMM
 *                 "14" = YYYYMMDDHHMMSS (default)
 *                 "19" = YYYYMMDDHHMMSS.SSSS (fractional seconds)
 * @returns A string formatted as an HL7-compatible date.
 */
export const createHL7Date = (
  date: Date,
  length?: "8" | "12" | "14" | "19",
) => {
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
      default:
        return `${y}${mo}${d}${h}${mi}${s}`;
    }
  })();

  return result as HL7Date;
};

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
