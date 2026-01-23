import { getFirestore } from "firebase-admin/firestore";
import { searchCandidatesByName } from "./firestore";

// Mock firebase-admin/firestore
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(),
}));

describe("searchCandidatesByName", () => {
  let mockDb: any;
  let mockCollection: any;
  let mockQuery: any;

  beforeEach(() => {
    // Setup the chainable query mock
    mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Setup collection mock to return the query mock on first where
    mockCollection = {
      where: jest.fn().mockReturnValue(mockQuery),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };
    (getFirestore as jest.Mock).mockReturnValue(mockDb);
  });

  it("should search candidates by name lowercase", async () => {
    const mockCandidates = [
      { id: 1, name: "Alice", name_lowercase: "alice" },
    ];
    mockQuery.get.mockResolvedValue({
      docs: mockCandidates.map((c) => ({ data: () => c })),
    });

    const result = await searchCandidatesByName("Alice");

    expect(mockDb.collection).toHaveBeenCalledWith("candidates");
    // First where call is on collection
    expect(mockCollection.where).toHaveBeenCalledWith("name_lowercase", ">=", "alice");
    // Subsequent calls are on query
    expect(mockQuery.where).toHaveBeenCalledWith("name_lowercase", "<=", "alice\uf8ff");
    expect(mockQuery.orderBy).toHaveBeenCalledWith("name_lowercase");
    expect(result).toEqual(mockCandidates);
  });
});
