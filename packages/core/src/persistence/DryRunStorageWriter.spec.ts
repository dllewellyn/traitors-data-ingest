import { DryRunStorageWriter } from "./DryRunStorageWriter";
import { Series } from "../domain/series";

describe("DryRunStorageWriter", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("should log series data to console without throwing error", async () => {
    const writer = new DryRunStorageWriter();
    const mockSeries: Series = {
      id: "TEST_SERIES",
      seriesNumber: 99,
      candidates: [],
      votes: [],
    };

    await expect(writer.write(mockSeries)).resolves.not.toThrow();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[DRY RUN] Would write data for Series TEST_SERIES:")
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`"id": "TEST_SERIES"`)
    );
  });
});
