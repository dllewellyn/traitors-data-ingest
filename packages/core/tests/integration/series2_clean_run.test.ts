import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series2Scraper } from "../../src/scrapers/Series2Scraper";
import { DataMerger } from "../../src/services/DataMerger";

describe("Series 2 Scraper - Clean Run", () => {
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(British_series_2)";
  const scraper = new Series2Scraper();
  const merger = new DataMerger();

  it("should parse and merge without logging any warnings", async () => {
    const html = await fetcher.fetch(url);

    const warnSpy = jest.spyOn(console, "warn");

    const candidates = scraper.parseCandidates(html);
    const progress = scraper.parseProgress(html);

    // Also test data merger which logs warnings for unresolved votes
    merger.processVotes(2, candidates, progress);

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
