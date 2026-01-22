import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series1CandidateParser } from "../../src/scrapers/series1/Series1CandidateParser";
import { Series1ProgressParser } from "../../src/scrapers/series1/Series1ProgressParser";

describe("Series 1 Scraper Integration", () => {
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(British_series_1)";

  it("should scrape candidates and progress correctly", async () => {
    // 1. Fetch
    const html = await fetcher.fetch(url);

    // 2. Parse Candidates
    const candidateParser = new Series1CandidateParser();
    const candidates = candidateParser.parse(html);

    expect(candidates).toHaveLength(22);
    expect(candidates[0].name).toBeDefined();

    // 3. Parse Progress
    const progressParser = new Series1ProgressParser();
    const progress = progressParser.parse(html);

    expect(progress).toHaveLength(22);
    expect(progress[0].name).toBeDefined();
  });
});
