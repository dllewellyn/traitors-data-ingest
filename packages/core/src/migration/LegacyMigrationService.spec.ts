import { LegacyMigrationService } from "./LegacyMigrationService";
import { CsvReader } from "../services/CsvReader";
import { DataMerger } from "../services/DataMerger";
import { FirestoreStorageWriter } from "../persistence/firestore-writer";
import { Role } from "../domain/enums";

describe("LegacyMigrationService", () => {
  let service: LegacyMigrationService;
  let mockReader: jest.Mocked<CsvReader>;
  let mockMerger: jest.Mocked<DataMerger>;
  let mockWriter: jest.Mocked<FirestoreStorageWriter>;

  beforeEach(() => {
    mockReader = {
      read: jest.fn(),
    } as any;
    mockMerger = {
      processVotes: jest.fn(),
    } as any;
    mockWriter = {
      write: jest.fn(),
    } as any;

    service = new LegacyMigrationService(mockReader, mockMerger, mockWriter);
  });

  it("should migrate a series successfully", async () => {
    const seriesNum = 1;
    const dataDir = "/tmp/data";

    mockReader.read.mockResolvedValueOnce([
      {
        id: 1,
        name: "Test Candidate",
        age: 25,
        job: "Tester",
        location: "Testland",
        originalRole: "Faithful",
        roundStates: "[]",
      },
    ]); // Candidates

    mockReader.read.mockResolvedValueOnce([
      {
        name: "Test Candidate",
        progress: "{}",
      },
    ]); // Votes

    mockMerger.processVotes.mockReturnValue([]);

    await service.migrateSeries(seriesNum, dataDir);

    expect(mockReader.read).toHaveBeenCalledTimes(2);
    expect(mockMerger.processVotes).toHaveBeenCalled();
    expect(mockWriter.write).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "TRAITORS_UK_S1",
        seriesNumber: 1,
      })
    );
  });

  it("should throw error if JSON parsing fails", async () => {
    const seriesNum = 1;
    const dataDir = "/tmp/data";

    mockReader.read.mockResolvedValueOnce([
      {
        id: 1,
        name: "Test Candidate",
        age: 25,
        job: "Tester",
        location: "Testland",
        originalRole: "Faithful",
        roundStates: "invalid-json",
      },
    ]);

    await expect(service.migrateSeries(seriesNum, dataDir)).rejects.toThrow();
  });

  it("should throw error if originalRole is invalid", async () => {
    const seriesNum = 1;
    const dataDir = "/tmp/data";

    mockReader.read.mockResolvedValueOnce([
      {
        id: 1,
        name: "Test Candidate",
        age: 25,
        job: "Tester",
        location: "Testland",
        originalRole: "InvalidRole",
        roundStates: "[]",
      },
    ]);

    await expect(service.migrateSeries(seriesNum, dataDir)).rejects.toThrow(
      "Invalid role"
    );
  });

  it("should throw error if roundStates is invalid array", async () => {
    const seriesNum = 1;
    const dataDir = "/tmp/data";

    mockReader.read.mockResolvedValueOnce([
      {
        id: 1,
        name: "Test Candidate",
        age: 25,
        job: "Tester",
        location: "Testland",
        originalRole: "Faithful",
        roundStates: "null",
      },
    ]);

    await expect(service.migrateSeries(seriesNum, dataDir)).rejects.toThrow(
      "Invalid roundStates"
    );
  });

  it("should throw error if progress JSON parsing fails", async () => {
    const seriesNum = 1;
    const dataDir = "/tmp/data";

    mockReader.read.mockResolvedValueOnce([]); // No candidates
    mockReader.read.mockResolvedValueOnce([
      {
        name: "Test Candidate",
        progress: "invalid-json",
      },
    ]);

    await expect(service.migrateSeries(seriesNum, dataDir)).rejects.toThrow();
  });
});
