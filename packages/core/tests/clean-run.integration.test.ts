import { runIngestionProcess } from "../src/ingestion/orchestrator";
import { FileBasedFetcher } from "./mocks/FileBasedFetcher";
import { IStorageWriter } from "../src/persistence/IStorageWriter";
import { ILogger } from "../src/types";

describe("Clean Run Integration Test", () => {
  it("should run the full ingestion process for all series without any data quality warnings", async () => {
    const fileFetcher = new FileBasedFetcher();

    // Mock writer that does nothing to avoid side effects and log spam
    const mockWriter: IStorageWriter = {
      write: jest.fn().mockResolvedValue(undefined),
    };

    // We don't explicitly type as ILogger here so that TypeScript knows
    // these are jest.Mock functions and allows access to .mock property.
    // They are still compatible with ILogger interface.
    const mockLogger = {
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    await runIngestionProcess({
      fetcher: fileFetcher,
      storageWriter: mockWriter,
      logger: mockLogger,
      // implicit: series defaults to all series (1-4)
    });

    // If there are warnings, print them so we can see what happened before failing
    if (mockLogger.warn.mock.calls.length > 0) {
      console.log("\n!!! CAPTURED WARNINGS START !!!\n");
      mockLogger.warn.mock.calls.forEach((args: any[], index: number) => {
        console.log(`Warning ${index + 1}:`, ...args);
      });
      console.log("\n!!! CAPTURED WARNINGS END !!!\n");
    }

    expect(mockLogger.warn).not.toHaveBeenCalled();
  }, 30000); // Increase timeout as processing all series might take time
});
