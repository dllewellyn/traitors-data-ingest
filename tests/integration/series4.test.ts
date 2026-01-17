import * as fs from "fs/promises";
import * as path from "path";
import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series4Scraper } from "../../src/scrapers/Series4Scraper";
import { Role } from "../../src/domain/enums";

describe("Series 4 Scraper Integration", () => {
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_4";
  let html: string;

  beforeAll(async () => {
    html = await fetcher.fetch(url);
  });

  it("should parse 22 candidates", () => {
    const scraper = new Series4Scraper();
    const candidates = scraper.parseCandidates(html);
    expect(candidates).toHaveLength(22);

    // Spot check a few candidates (based on public knowledge or inspection of source)
    // Note: Since I haven't implemented it yet, this test will fail.
    // I'll pick a known candidate if I can see the source or just wait.
  });

  it("should parse progress for all candidates", () => {
    const scraper = new Series4Scraper();
    const progress = scraper.parseProgress(html);
    expect(progress.length).toBeGreaterThan(0);
    // Should match candidate count roughly (some might be hidden if code is buggy)
    expect(progress).toHaveLength(22);
  });
});
