import {
  Banishment,
  Candidate,
  Episode,
  Murder,
  RoundState,
  Vote,
} from "../domain/models";
import { Role, Status } from "../domain/enums";

/**
 * Checks if a value is a string.
 * @param value The value to check.
 * @returns True if the value is a string, false otherwise.
 */
export const isString = (value: unknown): value is string =>
  typeof value === "string";

/**
 * Checks if a value is a number.
 * @param value The value to check.
 * @returns True if the value is a number, false otherwise.
 */
export const isNumber = (value: unknown): value is number =>
  typeof value === "number";

/**
 * Checks if a value is a boolean.
 * @param value The value to check.
 * @returns True if the value is a boolean, false otherwise.
 */
export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

/**
 * Checks if a value is an array of a specific type.
 * @template T The type of the array elements.
 * @param arr The value to check.
 * @param guard The type guard function for the array elements.
 * @returns True if the value is an array of the specified type, false otherwise.
 */
export const isArrayOf = <T>(
  arr: unknown,
  guard: (item: unknown) => item is T
): arr is T[] => Array.isArray(arr) && arr.every(guard);

/**
 * Checks if a value is a valid Role enum member.
 * @param value The value to check.
 * @returns True if the value is a valid Role, false otherwise.
 */
export const isRole = (value: unknown): value is Role =>
  isString(value) && Object.values(Role).includes(value as Role);

/**
 * Checks if a value is a valid Status enum member.
 * @param value The value to check.
 * @returns True if the value is a valid Status, false otherwise.
 */
export const isStatus = (value: unknown): value is Status =>
  isString(value) && Object.values(Status).includes(value as Status);

/**
 * Checks if an object is a valid RoundState.
 * @param obj The object to check.
 * @returns True if the object is a valid RoundState, false otherwise.
 */
export const isRoundState = (obj: unknown): obj is RoundState =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as RoundState).episode) &&
  isRole((obj as RoundState).role) &&
  isStatus((obj as RoundState).status);

/**
 * Checks if an object is a valid Candidate.
 * @param obj The object to check.
 * @returns True if the object is a valid Candidate, false otherwise.
 */
export const isCandidate = (obj: unknown): obj is Candidate =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Candidate).id) &&
  isString((obj as Candidate).name) &&
  isNumber((obj as Candidate).age) &&
  isString((obj as Candidate).job) &&
  isString((obj as Candidate).location) &&
  isRole((obj as Candidate).originalRole) &&
  isArrayOf((obj as Candidate).roundStates, isRoundState);

/**
 * Checks if an object is a valid Episode.
 * @param obj The object to check.
 * @returns True if the object is a valid Episode, false otherwise.
 */
export const isEpisode = (obj: unknown): obj is Episode =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Episode).series) &&
  isNumber((obj as Episode).episodeNumber) &&
  (obj as Episode).airDate instanceof Date;

/**
 * Checks if an object is a valid Vote.
 * @param obj The object to check.
 * @returns True if the object is a valid Vote, false otherwise.
 */
export const isVote = (obj: unknown): obj is Vote =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Vote).voterId) &&
  isNumber((obj as Vote).targetId) &&
  isNumber((obj as Vote).round) &&
  isNumber((obj as Vote).episode);

/**
 * Checks if an object is a valid Banishment.
 * @param obj The object to check.
 * @returns True if the object is a valid Banishment, false otherwise.
 */
export const isBanishment = (obj: unknown): obj is Banishment =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Banishment).banishedId) &&
  isNumber((obj as Banishment).episode) &&
  isNumber((obj as Banishment).round);

/**
 * Checks if an object is a valid Murder.
 * @param obj The object to check.
 * @returns True if the object is a valid Murder, false otherwise.
 */
export const isMurder = (obj: unknown): obj is Murder =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Murder).murderedId) &&
  isNumber((obj as Murder).episode);
