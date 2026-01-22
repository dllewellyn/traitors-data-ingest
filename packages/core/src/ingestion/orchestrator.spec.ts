import { runIngestionProcess } from "./orchestrator";
import { FirestoreStorageWriter } from "../persistence/firestore-writer";
import { WikipediaFetcher } from "../services/WikipediaFetcher";
import { DataMerger } from "../services/DataMerger";

// Mock dependencies
jest.mock("../services/WikipediaFetcher");
jest.mock("../services/DataMerger");
jest.mock("../services/CsvWriter");
jest.mock("../persistence/storage-writer-factory");
jest.mock("../persistence/firestore-writer");
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
}));
jest.mock("../scrapers/Series1Scraper", () => ({
  Series1Scraper: jest.fn().mockImplementation(() => ({
    parseCandidates: jest.fn().mockReturnValue([]),
    parseProgress: jest.fn().mockReturnValue([]),
  })),
}));
jest.mock("../scrapers/Series2Scraper", () => ({
  Series2Scraper: jest.fn().mockImplementation(() => ({
    parseCandidates: jest.fn().mockReturnValue([]),
    parseProgress: jest.fn().mockReturnValue([]),
  })),
}));
jest.mock("../scrapers/Series3Scraper", () => ({
  Series3Scraper: jest.fn().mockImplementation(() => ({
    parseCandidates: jest.fn().mockReturnValue([]),
    parseProgress: jest.fn().mockReturnValue([]),
  })),
}));
jest.mock("../scrapers/Series4Scraper", () => ({
  Series4Scraper: jest.fn().mockImplementation(() => ({
    parseCandidates: jest.fn().mockReturnValue([]),
    parseProgress: jest.fn().mockReturnValue([]),
  })),
}));

describe("runIngestionProcess", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Clear mock instances
    (FirestoreStorageWriter as jest.Mock).mockClear();
    (WikipediaFetcher as jest.Mock).mockImplementation(() => ({
        fetch: jest.fn().mockResolvedValue("<html></html>")
    }));
    (DataMerger as jest.Mock).mockImplementation(() => ({
      processVotes: jest.fn().mockReturnValue([]),
    }));
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should NOT use FirestoreStorageWriter when USE_FIRESTORE is not 'true'", async () => {
    process.env.USE_FIRESTORE = "false";
    await runIngestionProcess();
    expect(FirestoreStorageWriter).not.toHaveBeenCalled();
  });

  it("should use FirestoreStorageWriter when USE_FIRESTORE is 'true'", async () => {
    process.env.USE_FIRESTORE = "true";
    await runIngestionProcess();
    expect(FirestoreStorageWriter).toHaveBeenCalled();
    const mockWriterInstance = (FirestoreStorageWriter as jest.Mock).mock.instances[0];
    // It should be called for each series (4 series)
    expect(mockWriterInstance.write).toHaveBeenCalledTimes(4);
  });
});
