import * as fs from "fs/promises";
import * as path from "path";
import { FileBasedFetcher } from "../mocks/FileBasedFetcher";
import { Series1CandidateParser } from "../../src/scrapers/series1/Series1CandidateParser";
import { Series1ProgressParser } from "../../src/scrapers/series1/Series1ProgressParser";
import { CsvWriter } from "../../src/services/CsvWriter";

describe("Series 1 Scraper Integration Snapshot", () => {
  let tempDir: string;
  const fetcher = new FileBasedFetcher();
  const url = "https://en.wikipedia.org/wiki/The_Traitors_(British_series_1)";

  beforeEach(async () => {
    tempDir = await fs.mkdtemp("series1-test-");
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should match the snapshot", async () => {
    // 1. Fetch
    const html = await fetcher.fetch(url);

    // 2. Parse Candidates
    const candidateParser = new Series1CandidateParser();
    const candidates = candidateParser.parse(html);

    // 3. Parse Progress (Votes)
    const progressParser = new Series1ProgressParser();
    const progress = progressParser.parse(html);

    // 4. Write CSVs
    const csvWriter = new CsvWriter();
    const candidatesPath = path.join(tempDir, "candidates.csv");
    const votesPath = path.join(tempDir, "votes.csv");

    // Flatten complex objects for CSV
    const candidateRows = candidates.map((c) => ({
      ...c,
      roundStates: JSON.stringify(c.roundStates),
    }));

    const progressRows = progress.map((p) => ({
      ...p,
      progress: JSON.stringify(p.progress),
    }));

    await csvWriter.write(candidateRows, candidatesPath);
    await csvWriter.write(progressRows, votesPath);

    // 5. Compare with Golden Snapshots
    const expectedCandidatesPath = path.resolve(
      __dirname,
      "../fixtures/series1/expected-candidates.csv"
    );
    const expectedVotesPath = path.resolve(
      __dirname,
      "../fixtures/series1/expected-votes.csv"
    );

    const expectedCandidates = await fs.readFile(
      expectedCandidatesPath,
      "utf-8"
    );
    const expectedVotes = await fs.readFile(expectedVotesPath, "utf-8");

    const actualCandidates = await fs.readFile(candidatesPath, "utf-8");
    const actualVotes = await fs.readFile(votesPath, "utf-8");

    expect(actualCandidates).toEqual(expectedCandidates);
    expect(actualVotes).toEqual(expectedVotes);
  });
});
