/**
 * Get Segment Indexes
 * @remarks Helper for {@link split}
 * @since 1.0.0
 * @param names
 * @param data
 * @param list
 */
export const getSegIndexes = (
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
