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
