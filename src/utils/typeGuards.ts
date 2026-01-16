import {
  Banishment,
  Candidate,
  Episode,
  Murder,
  RoundState,
  Vote,
} from "../domain/models";
import { Role, Status } from "../domain/enums";

export const isString = (value: unknown): value is string =>
  typeof value === "string";

export const isNumber = (value: unknown): value is number =>
  typeof value === "number";

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

export const isArrayOf = <T>(
  arr: unknown,
  guard: (item: unknown) => item is T,
): arr is T[] => Array.isArray(arr) && arr.every(guard);

export const isRole = (value: unknown): value is Role =>
  isString(value) && Object.values(Role).includes(value as Role);

export const isStatus = (value: unknown): value is Status =>
  isString(value) && Object.values(Status).includes(value as Status);

export const isRoundState = (obj: unknown): obj is RoundState =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as RoundState).episode) &&
  isRole((obj as RoundState).role) &&
  isStatus((obj as RoundState).status);

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

export const isEpisode = (obj: unknown): obj is Episode =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Episode).series) &&
  isNumber((obj as Episode).episodeNumber) &&
  (obj as Episode).airDate instanceof Date;

export const isVote = (obj: unknown): obj is Vote =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Vote).voterId) &&
  isNumber((obj as Vote).targetId) &&
  isNumber((obj as Vote).round) &&
  isNumber((obj as Vote).episode);

export const isBanishment = (obj: unknown): obj is Banishment =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Banishment).banishedId) &&
  isNumber((obj as Banishment).episode) &&
  isNumber((obj as Banishment).round);

export const isMurder = (obj: unknown): obj is Murder =>
  typeof obj === "object" &&
  obj !== null &&
  isNumber((obj as Murder).murderedId) &&
  isNumber((obj as Murder).episode);
