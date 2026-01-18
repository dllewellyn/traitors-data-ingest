import { Role, Status } from "./enums";

/**
 * Represents the state of a candidate in a specific round.
 */
export interface RoundState {
  /** The episode number. */
  episode: number;
  /** The role of the candidate in that round. */
  role: Role;
  /** The status of the candidate in that round. */
  status: Status;
}

/**
 * Represents a candidate in the game.
 */
export interface Candidate {
  /** The series number. */
  series: number;
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
  /** An array of the candidate's state in each round. */
  roundStates: RoundState[];
}

/**
 * Represents an episode of the show.
 */
export interface Episode {
  /** The series number. */
  series: number;
  /** The episode number within the series. */
  episodeNumber: number;
  /** The original air date of the episode. */
  airDate: Date;
}

/**
 * Represents a vote cast by one candidate against another.
 */
export interface Vote {
  /** The series number. */
  series: number;
  /** The ID of the candidate who cast the vote. */
  voterId: number;
  /** The ID of the candidate who received the vote. */
  targetId: number;
  /** The round in which the vote was cast. */
  round: number;
  /** The episode in which the vote was cast. */
  episode: number;
}

/**
 * Represents a banishment event.
 */
export interface Banishment {
  /** The ID of the candidate who was banished. */
  banishedId: number;
  /** The episode in which the banishment occurred. */
  episode: number;
  /** The round in which the banishment occurred. */
  round: number;
}

/**
 * Represents a murder event.
 */
export interface Murder {
  /** The ID of the candidate who was murdered. */
  murderedId: number;
  /** The episode in which the murder occurred. */
  episode: number;
}
