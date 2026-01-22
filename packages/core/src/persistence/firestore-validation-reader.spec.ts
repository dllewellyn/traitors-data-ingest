import { firestore } from "firebase-admin";
import { FirestoreValidationReader } from "./firestore-validation-reader";
import { Candidate, Vote } from "../domain/models";
import { Role } from "../domain/enums";

describe("FirestoreValidationReader", () => {
  let reader: FirestoreValidationReader;
  let mockDb: Partial<firestore.Firestore>;
  let mockCollection: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(() => {
    mockGet = jest.fn();
    mockCollection = jest.fn().mockReturnValue({
      get: mockGet,
    });
    mockDb = {
      collection: mockCollection,
    };
    reader = new FirestoreValidationReader(mockDb as firestore.Firestore);
  });

  describe("readCandidates", () => {
    it("should fetch and map candidates correctly", async () => {
      const candidatesData: Partial<Candidate>[] = [
        {
          id: 1,
          name: "Alice",
          series: 1,
          originalRole: Role.Faithful,
          // other fields ignored by reader
        },
        {
          id: 2,
          name: "Bob",
          series: 1,
          originalRole: Role.Traitor,
        },
      ];

      mockGet.mockResolvedValue({
        docs: candidatesData.map((data) => ({
          data: () => data,
        })),
      });

      const result = await reader.readCandidates();

      expect(mockCollection).toHaveBeenCalledWith("candidates");
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: "Alice",
        series: 1,
        originalRole: "Faithful",
      });
      expect(result[1]).toEqual({
        id: 2,
        name: "Bob",
        series: 1,
        originalRole: "Traitor",
      });
    });
  });

  describe("readVotes", () => {
    it("should fetch and map votes correctly", async () => {
      const votesData: Partial<Vote>[] = [
        {
          series: 1,
          voterId: 1,
          targetId: 2,
          round: 1,
          episode: 1,
        },
      ];

      mockGet.mockResolvedValue({
        docs: votesData.map((data) => ({
          data: () => data,
        })),
      });

      const result = await reader.readVotes();

      expect(mockCollection).toHaveBeenCalledWith("votes");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        series: 1,
        voterId: 1,
        targetId: 2,
        round: 1,
        episode: 1,
      });
    });
  });
});
