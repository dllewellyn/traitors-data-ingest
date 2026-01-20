import { Role } from "./enums";

/**
 * Represents a row in the candidates.csv file.
 */
export interface CandidateRow {
  /** The unique identifier for the candidate. */
  id: number;
  /** The name of the candidate. */
  name: string;
  /** The age of the candidate. */
  age: number;
  /** The job of the candidate. */
  job: string;
  /** The location of the candidate. */
  location: string;
  /** The original role of the candidate. */
  originalRole: Role;
}

/**
 * Represents a row in the votes.csv file.
 */
export interface VoteRow {
  /** The series number. */
  series: number;
  /** The episode number. */
  episode: number;
  /** The round of voting. */
  round: number;
  /** The name of the voter. */
  voter: string;
  /** The name of the candidate being voted for. */
  target: string;
  /** The role of the voter at the time of the vote. */
  role: Role;
}

/**
 * Represents a row in the episodes.csv file.
 */
export interface EpisodeRow {
  /** The series number. */
  series: number;
  /** The episode number. */
  episode: number;
  /** The original air date of the episode. */
  airDate: string;
}
