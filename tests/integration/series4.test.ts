import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series4Scraper } from "../../src/scrapers/Series4Scraper";

describe("Series 4 Scraper Integration", () => {
  const fetcher = new FileBasedFetcher();
  const url =
    "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_4";
  let html: string;

  beforeAll(async () => {
    html = await fetcher.fetch(url);
  });

  it("should parse 22 candidates", () => {
    const scraper = new Series4Scraper();
    const candidates = scraper.parseCandidates(html);
    expect(candidates).toHaveLength(22);
  });

  it("should parse progress for all candidates", () => {
    const scraper = new Series4Scraper();
    const progress = scraper.parseProgress(html);
    expect(progress.length).toBeGreaterThan(0);
    // Should match candidate count roughly (some might be hidden if code is buggy)
    expect(progress).toHaveLength(22);
  });
});
