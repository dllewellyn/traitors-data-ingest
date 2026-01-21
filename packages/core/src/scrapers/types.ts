/**
 * Represents a row of candidate progress data scraped from the Game History table.
 */
export interface CandidateProgressRow {
  /** The name of the candidate. */
  name: string;
  /** A map of episode number to the status of the candidate in that episode. */
  progress: Record<number, string>;
}
