import { runIngestionProcess } from "./orchestrator";
import { DryRunStorageWriter } from "../persistence/DryRunStorageWriter";
import { FirestoreStorageWriter } from "../persistence/firestore-writer";
import { WikipediaFetcher } from "../services/WikipediaFetcher";
import { DataMerger } from "../services/DataMerger";
import { Series1Scraper } from "../scrapers/Series1Scraper";
import { Series2Scraper } from "../scrapers/Series2Scraper";
import { Series3Scraper } from "../scrapers/Series3Scraper";
import { Series4Scraper } from "../scrapers/Series4Scraper";
import * as writerFactory from "../persistence/storage-writer-factory";

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

// Spy on console methods
const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

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

  afterAll(() => {
    jest.restoreAllMocks();
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

  it("should handle initialization error for Firestore writer", async () => {
    // Mock createStorageWriter to throw error
    // Note: We need to spy on the factory directly if it's not mocked at the module level
    // In the previous plan, we removed the module-level mock for storage-writer-factory
    // So here we are using the real factory, which imports FirestoreStorageWriter.
    // However, FirestoreStorageWriter is mocked.
    // If we want to simulate an error during initialization inside `runIngestionProcess`,
    // we need `createStorageWriter` to fail.

    // We can spy on `createStorageWriter` if we imported it as a module
    const createWriterSpy = jest.spyOn(writerFactory, "createStorageWriter");
    createWriterSpy.mockImplementation(() => {
      throw new Error("Init failed");
    });

    await runIngestionProcess({ firestoreInstance: {} as any });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to initialize Firestore writer"),
      expect.any(Error)
    );
  });

  it("should handle error during series processing", async () => {
    // Make fetch fail for the first call
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue("<html></html>");

    (WikipediaFetcher as jest.Mock).mockImplementation(() => ({
      fetch: mockFetch,
    }));

    await runIngestionProcess({ dryRun: true });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error processing Series 1"),
      expect.any(Error)
    );
    // Should still process other series
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it("should use provided storageWriter when provided in options", async () => {
    const mockWrite = jest.fn();
    const mockStorageWriter = { write: mockWrite };

    await runIngestionProcess({ storageWriter: mockStorageWriter });

    expect(DryRunStorageWriter).not.toHaveBeenCalled();
    expect(FirestoreStorageWriter).not.toHaveBeenCalled();
    expect(mockWrite).toHaveBeenCalledTimes(4);
  });

  it("should filter series based on series option", async () => {
    const mockWrite = jest.fn();
    const mockStorageWriter = { write: mockWrite };

    await runIngestionProcess({
        storageWriter: mockStorageWriter,
        series: [1, 3]
    });

    // Should only fetch and write for Series 1 and Series 3
    // Fetcher is mocked to return generic HTML, so logic proceeds to write
    expect(mockWrite).toHaveBeenCalledTimes(2);
    // Series IDs are TRAITORS_UK_S1, TRAITORS_UK_S2, etc.
    // Check call arguments to confirm series numbers
    expect(mockWrite).toHaveBeenCalledWith(expect.objectContaining({ seriesNumber: 1 }));
    expect(mockWrite).toHaveBeenCalledWith(expect.objectContaining({ seriesNumber: 3 }));
    expect(mockWrite).not.toHaveBeenCalledWith(expect.objectContaining({ seriesNumber: 2 }));
    expect(mockWrite).not.toHaveBeenCalledWith(expect.objectContaining({ seriesNumber: 4 }));
  });

  it("should handle invalid series numbers gracefully", async () => {
    const mockWrite = jest.fn();
    const mockStorageWriter = { write: mockWrite };

    await runIngestionProcess({
        storageWriter: mockStorageWriter,
        series: [99] // Invalid series number
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith("No valid series selected for processing.");
    expect(mockWrite).not.toHaveBeenCalled();
  });
});
