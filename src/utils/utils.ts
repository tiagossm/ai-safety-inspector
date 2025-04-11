
/**
 * Truncates text to a specified length and adds ellipsis if needed.
 * @param text The text to truncate
 * @param maxLength The maximum length of the text
 * @returns The truncated text with ellipsis if needed
 */
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Formats a date to a localized string
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
};

/**
 * Capitalizes the first letter of a string
 * @param text The string to capitalize
 * @returns The capitalized string
 */
export const capitalize = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
