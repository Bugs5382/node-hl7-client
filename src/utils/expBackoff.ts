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
