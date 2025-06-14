import { getSegIndexes } from "@/utils/getSegIndexes";

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
