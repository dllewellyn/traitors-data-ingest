/**
 * @file Contains pure functions for cleaning and normalizing raw string data.
 * @author Jules
 */

/**
 * Trims whitespace, removes non-breaking spaces, and handles empty strings.
 *
 * @param {string | null | undefined} input The raw string to clean.
 * @returns {string} The cleaned string, or an empty string if the input is nullish.
 */
export const cleanText = (input: string | null | undefined): string => {
  if (!input) {
    return '';
  }
  return input.trim().replace(/\u00a0/g, ' ');
};

/**
 * Parses a date string from Wikipedia into a Date object.
 *
 * @param {string} input The date string (e.g., "15 January 2026").
 * @returns {Date | null} A Date object, or null if parsing fails.
 */
export const parseDate = (input: string): Date | null => {
  if (!input) {
    return null;
  }
  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Normalizes a candidate's name to a standard format (e.g., title case).
 *
 * @param {string} input The raw name string.
 * @returns {string} The normalized name.
 */
export const normalizeName = (input: string): string => {
  if (!input) {
    return '';
  }
  return input
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
