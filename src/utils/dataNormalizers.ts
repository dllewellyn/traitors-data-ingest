/**
 * Normalizes a name by removing extra whitespace and annotations.
 *
 * @param name - The name to normalize.
 * @returns The normalized name.
 */
export const normalizeName = (name: string): string => {
  if (!name) {
    return "";
  }
  // Remove annotations like [a], [b], etc., and trim whitespace.
  return name.replace(/\[[a-z]\]/g, "").trim();
};

/**
 * Normalizes a date string into ISO 8601 format (YYYY-MM-DD).
 *
 * @param dateStr - The date string to normalize.
 * @returns The normalized date string, or an empty string if invalid.
 */
export const normalizeDate = (dateStr: string): string => {
  if (!dateStr) {
    return "";
  }
  try {
    const date = new Date(dateStr);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};
