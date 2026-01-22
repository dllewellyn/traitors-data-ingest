import { runIngestionProcess } from "./orchestrator";
import { DryRunStorageWriter } from "../persistence/DryRunStorageWriter";
import { FirestoreStorageWriter } from "../persistence/firestore-writer";
import { WikipediaFetcher } from "../services/WikipediaFetcher";
import { DataMerger } from "../services/DataMerger";
import { Series1Scraper } from "../scrapers/Series1Scraper";
import { Series2Scraper } from "../scrapers/Series2Scraper";
import { Series3Scraper } from "../scrapers/Series3Scraper";
import { Series4Scraper } from "../scrapers/Series4Scraper";

// Mock dependencies
jest.mock("../services/WikipediaFetcher");
jest.mock("../services/DataMerger");
jest.mock("../persistence/firestore-writer");
jest.mock("../persistence/DryRunStorageWriter");
jest.mock("../scrapers/Series1Scraper");
jest.mock("../scrapers/Series2Scraper");
jest.mock("../scrapers/Series3Scraper");
jest.mock("../scrapers/Series4Scraper");
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(),
}));

describe("Ingestion Orchestrator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (WikipediaFetcher as jest.Mock).mockImplementation(() => ({
      fetch: jest.fn().mockResolvedValue("<html></html>"),
    }));
    (Series1Scraper as jest.Mock).mockImplementation(() => ({
      parseCandidates: jest.fn().mockReturnValue([]),
      parseProgress: jest.fn().mockReturnValue([]),
    }));
    (Series2Scraper as jest.Mock).mockImplementation(() => ({
        parseCandidates: jest.fn().mockReturnValue([]),
        parseProgress: jest.fn().mockReturnValue([]),
    }));
    (Series3Scraper as jest.Mock).mockImplementation(() => ({
        parseCandidates: jest.fn().mockReturnValue([]),
        parseProgress: jest.fn().mockReturnValue([]),
    }));
    (Series4Scraper as jest.Mock).mockImplementation(() => ({
        parseCandidates: jest.fn().mockReturnValue([]),
        parseProgress: jest.fn().mockReturnValue([]),
    }));
    (DataMerger as jest.Mock).mockImplementation(() => ({
        processVotes: jest.fn().mockReturnValue([]),
    }));
  });

  it("should use DryRunStorageWriter when dryRun is true", async () => {
    const mockDryRunWrite = jest.fn();
    (DryRunStorageWriter as jest.Mock).mockImplementation(() => ({
      write: mockDryRunWrite,
    }));

    await runIngestionProcess({ dryRun: true });

    expect(DryRunStorageWriter).toHaveBeenCalled();
    expect(FirestoreStorageWriter).not.toHaveBeenCalled();
    // We process 4 series, so write should be called 4 times
    expect(mockDryRunWrite).toHaveBeenCalledTimes(4);
  });

  it("should use FirestoreStorageWriter when firestoreInstance is provided", async () => {
    const mockFirestoreWrite = jest.fn();
    (FirestoreStorageWriter as jest.Mock).mockImplementation(() => ({
      write: mockFirestoreWrite,
    }));
    const mockFirestore = {} as any;

    await runIngestionProcess({ firestoreInstance: mockFirestore });

    expect(FirestoreStorageWriter).toHaveBeenCalledWith(mockFirestore);
    expect(DryRunStorageWriter).not.toHaveBeenCalled();
    expect(mockFirestoreWrite).toHaveBeenCalledTimes(4);
  });
});
