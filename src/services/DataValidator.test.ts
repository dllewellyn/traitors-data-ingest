import { DataValidator, CandidateRow, VoteRow } from "./DataValidator";
import { Role } from "../domain/enums";

describe("DataValidator", () => {
  let validator: DataValidator;

  beforeEach(() => {
    validator = new DataValidator();
  });

  describe("validateCandidates", () => {
    it("should pass for valid candidates", () => {
      const candidates: CandidateRow[] = [
        { id: 1, name: "Alice", series: 1, originalRole: Role.Faithful },
        { id: 2, name: "Bob", series: 1, originalRole: Role.Traitor },
      ];
      const result = validator.validateCandidates(candidates);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail for duplicate candidate IDs (series + id combination)", () => {
      const candidates: CandidateRow[] = [
        { id: 1, name: "Alice", series: 1, originalRole: Role.Faithful },
        { id: 1, name: "Alice Clone", series: 1, originalRole: Role.Faithful },
      ];
      const result = validator.validateCandidates(candidates);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Duplicate candidate ID found");
    });

    it("should fail for invalid role", () => {
      const candidates: CandidateRow[] = [
        { id: 1, name: "Alice", series: 1, originalRole: "Jester" },
      ];
      const result = validator.validateCandidates(candidates);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Invalid role");
    });
  });

  describe("validateVotes", () => {
    const candidates: CandidateRow[] = [
      { id: 1, name: "Alice", series: 1, originalRole: Role.Faithful },
      { id: 2, name: "Bob", series: 1, originalRole: Role.Traitor },
    ];

    it("should pass for valid votes", () => {
      const votes: VoteRow[] = [
        { series: 1, voterId: 1, targetId: 2, round: 1, episode: 1 },
      ];
      const result = validator.validateVotes(votes, candidates);
      expect(result.valid).toBe(true);
    });

    it("should fail for orphaned voter", () => {
      const votes: VoteRow[] = [
        { series: 1, voterId: 99, targetId: 2, round: 1, episode: 1 },
      ];
      const result = validator.validateVotes(votes, candidates);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Orphaned vote: Voter");
    });

    it("should fail for orphaned target", () => {
      const votes: VoteRow[] = [
        { series: 1, voterId: 1, targetId: 99, round: 1, episode: 1 },
      ];
      const result = validator.validateVotes(votes, candidates);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Orphaned vote: Target");
    });

    it("should fail for invalid round", () => {
      const votes: VoteRow[] = [
        { series: 1, voterId: 1, targetId: 2, round: -1, episode: 1 },
      ];
      const result = validator.validateVotes(votes, candidates);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Invalid round");
    });
  });
});
