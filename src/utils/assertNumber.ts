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
