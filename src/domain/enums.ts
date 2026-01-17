/**
 * Represents the role of a candidate in the game.
 */
export enum Role {
  /** A candidate who is a Traitor. */
  Traitor = "Traitor",
  /** A candidate who is a Faithful. */
  Faithful = "Faithful",
}

/**
 * Represents the status of a candidate in the game.
 */
export enum Status {
  /** The candidate is currently in the game. */
  Active = "Active",
  /** The candidate was banished from the game. */
  Banished = "Banished",
  /** The candidate was murdered by the Traitors. */
  Murdered = "Murdered",
  /** The candidate was eliminated from the game. */
  Eliminated = "Eliminated",
  /** The candidate was recruited to be a Traitor. */
  Recruited = "Recruited",
  /** The candidate won the game. */
  Winner = "Winner",
  /** The candidate was a runner-up in the game. */
  RunnerUp = "RunnerUp",
}

/**
 * Represents the type of action taken in the game.
 */
export enum ActionType {
  /** A vote to banish a candidate. */
  Vote = "Vote",
  /** A murder of a candidate by the Traitors. */
  Murder = "Murder",
  /** A candidate is protected by the shield. */
  Shield = "Shield",
}
