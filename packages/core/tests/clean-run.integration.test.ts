import { runIngestionProcess } from "../src/ingestion/orchestrator";
import { FileBasedFetcher } from "./mocks/FileBasedFetcher";
import { IStorageWriter } from "../src/persistence/IStorageWriter";

describe("Clean Run Integration Test", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.warn and suppress output to keep test clean.
    // We will inspect calls if the test fails.
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("should run the full ingestion process for all series without any data quality warnings", async () => {
    const fileFetcher = new FileBasedFetcher();

    // Mock writer that does nothing to avoid side effects and log spam
    const mockWriter: IStorageWriter = {
      write: jest.fn().mockResolvedValue(undefined),
    };

    await runIngestionProcess({
      fetcher: fileFetcher,
      storageWriter: mockWriter,
      // implicit: series defaults to all series (1-4)
    });

    // If there are warnings, print them so we can see what happened before failing
    if (warnSpy.mock.calls.length > 0) {
      console.log("\n!!! CAPTURED WARNINGS START !!!\n");
      warnSpy.mock.calls.forEach((args, index) => {
        console.log(`Warning ${index + 1}:`, ...args);
      });
      console.log("\n!!! CAPTURED WARNINGS END !!!\n");
    }

    expect(warnSpy).not.toHaveBeenCalled();
  }, 30000); // Increase timeout as processing all series might take time
});
