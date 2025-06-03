/**
 * Create a valid HL7 Date.
 * @remarks Custom for this package and based on HL7 standards.
 * @since 1.0.0
 * @param date - The JavaScript Date object to format.
 * @param length - Optional length of the HL7 date string.
 *                 Can be "8" (YYYYMMDD), "12" (YYYYMMDDHHMM), or "14" (YYYYMMDDHHMMSS).
 *                 Defaults to "14".
 * @returns A string formatted as an HL7-compatible date.
 */
export const createHL7Date = (
  date: Date,
  length?: "8" | "12" | "14",
): string => {
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
