import { split } from "@/utils/spilt";

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
