import { firestore } from "firebase-admin";
import { FirestoreStorageWriter } from "./firestore-writer";
import { Series } from "../domain/series";
import { Role } from "../domain/enums";

describe("FirestoreStorageWriter", () => {
  let writer: FirestoreStorageWriter;
  // Use Partial to allow mocking only the necessary methods
  let mockDb: Partial<firestore.Firestore>;
  let mockBatch: Partial<firestore.WriteBatch>;

  beforeEach(() => {
    mockBatch = {
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue([]),
    };

    const mockCollection = (name: string) => ({
      doc: (id: string) => ({ path: `${name}/${id}` }),
    });

    mockDb = {
      batch: jest.fn(() => mockBatch as firestore.WriteBatch),
      collection: jest.fn(mockCollection as unknown as (path: string) => firestore.CollectionReference),
    };

    // Cast the mockDb to the expected type
    writer = new FirestoreStorageWriter(mockDb as firestore.Firestore);
  });

  it("should write series, candidates, and votes to Firestore", async () => {
    const series: Series = {
      id: "TEST_S1",
      seriesNumber: 1,
      candidates: [
        {
          id: 1,
          name: "Alice",
          series: 1,
          roundStates: [],
          age: 30,
          job: "Engineer",
          location: "London",
          originalRole: Role.Faithful,
        },
      ],
      votes: [
        {
          series: 1,
          episode: 1,
          round: 1,
          voterId: 1,
          targetId: 2,
        },
      ],
    };

    await writer.write(series);

    expect(mockDb.batch).toHaveBeenCalled();

    // Check series write
    expect(mockBatch.set).toHaveBeenCalledWith(
      expect.objectContaining({ path: "series/TEST_S1" }),
      expect.objectContaining({ id: "TEST_S1", seriesNumber: 1 })
    );

    // Check candidate write
    expect(mockBatch.set).toHaveBeenCalledWith(
      expect.objectContaining({ path: "candidates/TEST_S1_ALICE" }),
      expect.objectContaining({
        name: "Alice",
        seriesId: "TEST_S1",
        job: "Engineer",
      })
    );

    // Check vote write
    expect(mockBatch.set).toHaveBeenCalledWith(
      expect.objectContaining({ path: "votes/TEST_S1_EP1_R1_V1_T2" }),
      expect.objectContaining({
        seriesId: "TEST_S1",
        voterId: 1,
        targetId: 2,
      })
    );

    expect(mockBatch.commit).toHaveBeenCalled();
  });

  it("should handle special characters in candidate names", async () => {
    const series: Series = {
      id: "TEST_S2",
      seriesNumber: 2,
      candidates: [
        {
          id: 2,
          name: "John-Doe (The First)",
          series: 2,
          roundStates: [],
          age: 40,
          job: "Actor",
          location: "Paris",
          originalRole: Role.Traitor,
        },
      ],
      votes: [],
    };

    await writer.write(series);

    // Expect ID to be sanitized: JOHN_DOE_THE_FIRST_ or similar
    // The regex is [^a-zA-Z0-9] -> _
    // "John-Doe (The First)" -> "JOHN_DOE__THE_FIRST_"

    // Let's verify exact expectation
    const expectedSuffix = "JOHN_DOE__THE_FIRST_";

    expect(mockBatch.set).toHaveBeenCalledWith(
      expect.objectContaining({ path: `candidates/TEST_S2_${expectedSuffix}` }),
      expect.anything()
    );
  });
});
