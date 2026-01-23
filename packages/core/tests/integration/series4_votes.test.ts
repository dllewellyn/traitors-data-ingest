import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series4Scraper } from "../../src/scrapers/Series4Scraper";
import { DataMerger } from "../../src/services/DataMerger";

describe("Series 4 Vote Parsing Integration", () => {
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_4";
  let html: string;

  beforeAll(async () => {
    html = await fetcher.fetch(url);
  });

  it("should process votes without warnings", () => {
    const scraper = new Series4Scraper();
    const merger = new DataMerger();

    const candidates = scraper.parseCandidates(html);
    const progress = scraper.parseProgress(html);

    const warnSpy = jest.spyOn(console, "warn");

    const votes = merger.processVotes(4, candidates, progress);

    // Check for specific warnings related to vote resolution
    const voteResolutionWarnings = warnSpy.mock.calls.filter(args =>
      typeof args[0] === 'string' && args[0].includes("Could not resolve vote target")
    );

    if (voteResolutionWarnings.length > 0) {
      console.log("Captured Warnings:", voteResolutionWarnings.map(args => args[0]));
    }

    expect(voteResolutionWarnings).toHaveLength(0);
    expect(votes.length).toBeGreaterThan(0);

    warnSpy.mockRestore();
  });
});
