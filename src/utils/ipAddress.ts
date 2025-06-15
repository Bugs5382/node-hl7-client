/**
 * Valid IPv4 Checker
 * @since 1.0.0
 * @param ip
 */
export const validIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    return ip.split(".").every((part) => parseInt(part) <= 255);
  }
  return false;
};

/**
 * Valid IPv6 Checker
 * @since 1.0.0
 * @param ip
 */
export const validIPv6 = (ip: string): boolean => {
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i;
  if (ipv6Regex.test(ip)) {
    return ip.split(":").every((part) => part.length <= 4);
  }
  return false;
};
