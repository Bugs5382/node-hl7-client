import { expect } from "vitest";
import { HL7FatalError } from "../../src"; // adjust path if needed

/**
 * Check for this Error handler Utility
 * @since 3.1.0
 * @param err
 * @param message
 */
export function expectHL7FatalError(err: unknown, message: string) {
  expect(err).toBeInstanceOf(HL7FatalError);
  if (err instanceof HL7FatalError) {
    expect(err.message).toBe(message);
  }
}
