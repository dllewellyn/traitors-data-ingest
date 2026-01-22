import { Candidate, Vote } from "./models";

/**
 * Represents a complete series of The Traitors, including all candidates and votes.
 */
export interface Series {
  /**
   * The unique identifier for the series document (e.g., "TRAITORS_UK_S1").
   */
  id: string;

  /**
   * The series number (e.g., 1).
   */
  seriesNumber: number;

  /**
   * The list of candidates participating in this series.
   */
  candidates: Candidate[];

  /**
   * The list of votes cast during this series.
   */
  votes: Vote[];
}
