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
  // Remove annotations like [a], [b], etc., citation markers like ^, and trim whitespace.
  return name
    .replace(/\[.*?\]/g, "")
    .replace(/\[.*$/, "")
    .replace(/\^/g, "")
    .trim();
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

/**
 * Normalizes a game status string from the Game History table.
 *
 * @param status - The raw status string.
 * @returns The normalized status string.
 */
export const normalizeGameStatus = (status: string): string => {
  if (!status) {
    return "";
  }
  // Remove references like [a], [1] and trim
  const clean = status.replace(/\[.*?\]/g, "").replace(/\[.*$/, "").trim();

  if (/^safe/i.test(clean)) return "Safe";
  if (/^banished/i.test(clean)) return "Banished";
  if (/^murdered/i.test(clean)) return "Murdered";
  if (/^traitor/i.test(clean)) return "Traitor";
  if (/^faithful/i.test(clean)) return "Faithful";
  if (/^winner/i.test(clean)) return "Winner";
  if (/^runner-up/i.test(clean)) return "RunnerUp";
  if (/^eliminated/i.test(clean)) return "Eliminated";
  if (/^no\s*vote/i.test(clean)) return "Safe"; // No vote means they were present/safe

  return clean;
};
