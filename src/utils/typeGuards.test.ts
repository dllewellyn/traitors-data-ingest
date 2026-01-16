import {
  isString,
  isNumber,
  isBoolean,
  isArrayOf,
  isRole,
  isStatus,
  isRoundState,
  isCandidate,
  isEpisode,
  isVote,
  isBanishment,
  isMurder,
} from "./typeGuards";
import { Role, Status } from "../domain/enums";
import {
  Banishment,
  Candidate,
  Episode,
  Murder,
  RoundState,
  Vote,
} from "../domain/models";

describe("Primitive Type Guards", () => {
  describe("isString", () => {
    it("should return true for strings", () => {
      expect(isString("hello")).toBe(true);
    });
    it("should return false for non-strings", () => {
      expect(isString(123)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
    });
  });

  describe("isNumber", () => {
    it("should return true for numbers", () => {
      expect(isNumber(123)).toBe(true);
    });
    it("should return false for non-numbers", () => {
      expect(isNumber("hello")).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
    });
  });

  describe("isBoolean", () => {
    it("should return true for booleans", () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });
    it("should return false for non-booleans", () => {
      expect(isBoolean("hello")).toBe(false);
      expect(isBoolean(123)).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
      expect(isBoolean({})).toBe(false);
    });
  });
});

describe("isArrayOf", () => {
  it("should return true for an array of the correct type", () => {
    expect(isArrayOf([1, 2, 3], isNumber)).toBe(true);
  });
  it("should return false for an array with mixed types", () => {
    expect(isArrayOf([1, "2", 3], isNumber)).toBe(false);
  });
  it("should return false for a non-array", () => {
    expect(isArrayOf({}, isNumber)).toBe(false);
  });
});

describe("Enum Type Guards", () => {
  describe("isRole", () => {
    it("should return true for valid roles", () => {
      expect(isRole(Role.Faithful)).toBe(true);
      expect(isRole(Role.Traitor)).toBe(true);
    });
    it("should return false for invalid roles", () => {
      expect(isRole("NotARole")).toBe(false);
    });
  });

  describe("isStatus", () => {
    it("should return true for valid statuses", () => {
      expect(isStatus(Status.Active)).toBe(true);
      expect(isStatus(Status.Banished)).toBe(true);
      expect(isStatus(Status.Murdered)).toBe(true);
    });
    it("should return false for invalid statuses", () => {
      expect(isStatus("NotAStatus")).toBe(false);
    });
  });
});

describe("Domain Entity Type Guards", () => {
  describe("isRoundState", () => {
    const validRoundState: RoundState = {
      episode: 1,
      role: Role.Faithful,
      status: Status.Active,
    };
    it("should return true for a valid RoundState", () => {
      expect(isRoundState(validRoundState)).toBe(true);
    });
    it("should return false for an invalid RoundState", () => {
      expect(isRoundState({ ...validRoundState, episode: "1" })).toBe(false);
      expect(isRoundState({ ...validRoundState, role: "NotARole" })).toBe(
        false,
      );
    });
  });

  describe("isCandidate", () => {
    const validCandidate: Candidate = {
      id: 1,
      name: "Test",
      age: 30,
      job: "Tester",
      location: "Testville",
      originalRole: Role.Faithful,
      roundStates: [
        { episode: 1, role: Role.Faithful, status: Status.Active },
      ],
    };
    it("should return true for a valid Candidate", () => {
      expect(isCandidate(validCandidate)).toBe(true);
    });
    it("should return false for an invalid Candidate", () => {
      expect(isCandidate({ ...validCandidate, id: "1" })).toBe(false);
      expect(isCandidate({ ...validCandidate, roundStates: [1] })).toBe(false);
    });
  });

  describe("isEpisode", () => {
    const validEpisode: Episode = {
      series: 1,
      episodeNumber: 1,
      airDate: new Date(),
    };
    it("should return true for a valid Episode", () => {
      expect(isEpisode(validEpisode)).toBe(true);
    });
    it("should return false for an invalid Episode", () => {
      expect(isEpisode({ ...validEpisode, series: "1" })).toBe(false);
      expect(isEpisode({ ...validEpisode, airDate: "2023-01-01" })).toBe(false);
    });
  });

  describe("isVote", () => {
    const validVote: Vote = {
      voterId: 1,
      targetId: 2,
      round: 1,
      episode: 1,
    };
    it("should return true for a valid Vote", () => {
      expect(isVote(validVote)).toBe(true);
    });
    it("should return false for an invalid Vote", () => {
      expect(isVote({ ...validVote, voterId: "1" })).toBe(false);
    });
  });

  describe("isBanishment", () => {
    const validBanishment: Banishment = {
      banishedId: 1,
      episode: 1,
      round: 1,
    };
    it("should return true for a valid Banishment", () => {
      expect(isBanishment(validBanishment)).toBe(true);
    });
    it("should return false for an invalid Banishment", () => {
      expect(isBanishment({ ...validBanishment, banishedId: "1" })).toBe(
        false,
      );
    });
  });

  describe("isMurder", () => {
    const validMurder: Murder = {
      murderedId: 1,
      episode: 1,
    };
    it("should return true for a valid Murder", () => {
      expect(isMurder(validMurder)).toBe(true);
    });
    it("should return false for an invalid Murder", () => {
      expect(isMurder({ ...validMurder, murderedId: "1" })).toBe(false);
    });
  });
});
