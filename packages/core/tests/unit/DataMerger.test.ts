import { DataMerger } from "../../src/services/DataMerger";
import { Candidate } from "../../src/domain/models";
import { Role, Status } from "../../src/domain/enums";
import { CandidateProgressRow } from "../../src/scrapers/types";
import { normalizeGameStatus } from "../../src/utils/dataNormalizers";

describe("DataMerger", () => {
  const merger = new DataMerger();

  // Spy on console.warn
  const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("mergeCandidates", () => {
    it("should merge arrays of candidates", () => {
      const candidates1: Candidate[] = [
        {
          series: 1,
          id: 1,
          name: "Alice",
          age: 25,
          job: "Engineer",
          location: "London",
          originalRole: Role.Faithful,
          roundStates: [],
        },
      ];
      const candidates2: Candidate[] = [
        {
          series: 2,
          id: 1,
          name: "Bob",
          age: 30,
          job: "Designer",
          location: "Paris",
          originalRole: Role.Traitor,
          roundStates: [],
        },
      ];

      const result = merger.mergeCandidates([candidates1, candidates2]);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Alice");
      expect(result[1].name).toBe("Bob");
    });
  });

  describe("processVotes", () => {
    const candidates: Candidate[] = [
      {
        series: 1,
        id: 1,
        name: "Alice Smith",
        age: 25,
        job: "Engineer",
        location: "London",
        originalRole: Role.Faithful,
        roundStates: [],
      },
      {
        series: 1,
        id: 2,
        name: "Bob Jones",
        age: 30,
        job: "Designer",
        location: "Paris",
        originalRole: Role.Traitor,
        roundStates: [],
      },
      {
        series: 1,
        id: 3,
        name: "Charlie 'Chaz' Brown",
        age: 22,
        job: "Student",
        location: "Berlin",
        originalRole: Role.Faithful,
        roundStates: [],
      },
    ];

    it("should extract votes based on full names", () => {
      const progress: CandidateProgressRow[] = [
        {
          name: "Alice Smith",
          progress: {
            1: "Bob Jones",
          },
        },
      ];

      const votes = merger.processVotes(1, candidates, progress);
      expect(votes).toHaveLength(1);
      expect(votes[0].voterId).toBe(1);
      expect(votes[0].targetId).toBe(2);
    });

    it("should extract votes based on nicknames", () => {
      const progress: CandidateProgressRow[] = [
        {
          name: "Chaz",
          progress: {
            1: "Alice Smith",
          },
        },
      ];

      const votes = merger.processVotes(1, candidates, progress);
      expect(votes).toHaveLength(1);
      expect(votes[0].voterId).toBe(3);
      expect(votes[0].targetId).toBe(1);
    });

    it("should extract votes based on first names", () => {
      const progress: CandidateProgressRow[] = [
        {
          name: "Bob",
          progress: {
            1: "Alice",
          },
        },
      ];

      const votes = merger.processVotes(1, candidates, progress);
      expect(votes).toHaveLength(1);
      expect(votes[0].voterId).toBe(2);
      expect(votes[0].targetId).toBe(1);
    });

    it("should ignore status values", () => {
      const progress: CandidateProgressRow[] = [
        {
          name: "Alice Smith",
          progress: {
            1: "Banished",
            2: "Safe",
          },
        },
      ];

      const votes = merger.processVotes(1, candidates, progress);
      expect(votes).toHaveLength(0);
    });

    it("should log warning if voter ID not found", () => {
      const progress: CandidateProgressRow[] = [
        {
          name: "Unknown Person",
          progress: {
            1: "Bob Jones",
          },
        },
      ];

      const votes = merger.processVotes(1, candidates, progress);
      expect(votes).toHaveLength(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Could not find voter ID for 'Unknown Person'")
      );
    });

    it("should log warning if vote target ID not found", () => {
      const progress: CandidateProgressRow[] = [
        {
          name: "Alice Smith",
          progress: {
            1: "Unknown Target",
          },
        },
      ];

      const votes = merger.processVotes(1, candidates, progress);
      expect(votes).toHaveLength(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Could not resolve vote target 'Unknown Target' for voter 'Alice Smith'")
      );
    });

    it("should handle status with episode info if normalized", () => {
      const rawStatus = "Withdrew (Episode 5)";
      const progress: CandidateProgressRow[] = [
        {
          name: "Alice Smith",
          progress: {
            1: normalizeGameStatus(rawStatus),
          },
        },
      ];

      const votes = merger.processVotes(1, candidates, progress);
      expect(votes).toHaveLength(0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe("mergeVotes", () => {
    it("should merge arrays of votes", () => {
      const votes1 = [{ series: 1, episode: 1, round: 1, voterId: 1, targetId: 2 }];
      const votes2 = [{ series: 2, episode: 1, round: 1, voterId: 3, targetId: 4 }];

      const result = merger.mergeVotes([votes1, votes2]);
      expect(result).toHaveLength(2);
      expect(result).toContain(votes1[0]);
      expect(result).toContain(votes2[0]);
    });
  });
});
