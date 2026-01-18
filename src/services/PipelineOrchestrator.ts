import * as path from "path";
import { Series1Scraper } from "../scrapers/Series1Scraper";
import { Series2Scraper } from "../scrapers/Series2Scraper";
import { Series3Scraper } from "../scrapers/Series3Scraper";
import { Series4Scraper } from "../scrapers/Series4Scraper";
import { WikipediaFetcher } from "./WikipediaFetcher";
import { DataMerger } from "./DataMerger";
import { CsvWriter } from "./CsvWriter";
import { Candidate, Vote } from "../domain/models";
import { StoragePort } from "../infrastructure/storage/StoragePort";
import { FileSystemAdapter } from "../infrastructure/storage/FileSystemAdapter";

export class PipelineOrchestrator {
  private fetcher: WikipediaFetcher;
  private merger: DataMerger;
  private csvWriter: CsvWriter;

  constructor(storage: StoragePort = new FileSystemAdapter()) {
    this.fetcher = new WikipediaFetcher();
    this.merger = new DataMerger();
    this.csvWriter = new CsvWriter(storage);
  }

  public async run(): Promise<void> {
    console.log("Starting ingestion...");

    // URLs for each series
    const urls = [
      "https://en.wikipedia.org/wiki/The_Traitors_(British_series_1)",
      "https://en.wikipedia.org/wiki/The_Traitors_(British_series_2)",
      "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_3",
      "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_4",
    ];

    // Instantiate scrapers
    const scrapers = [
      new Series1Scraper(),
      new Series2Scraper(),
      new Series3Scraper(),
      new Series4Scraper(),
    ];

    const allCandidates: Candidate[] = [];
    const allVotes: Vote[] = [];

    // Parallel fetch and parse
    const results = await Promise.all(
      urls.map(async (url, index) => {
        const seriesNum = index + 1;
        const scraper = scrapers[index];
        console.log(`Fetching Series ${seriesNum} from ${url}...`);

        try {
          const html = await this.fetcher.fetch(url);

          console.log(`Parsing Series ${seriesNum} candidates...`);
          const candidates = scraper.parseCandidates(html);

          console.log(`Parsing Series ${seriesNum} progress...`);
          const progress = scraper.parseProgress(html);

          console.log(`Processing Series ${seriesNum} votes...`);
          const votes = this.merger.processVotes(seriesNum, candidates, progress);

          return { candidates, votes };
        } catch (error) {
          console.error(`Error processing Series ${seriesNum}:`, error);
          return { candidates: [], votes: [] };
        }
      })
    );

    // Merge results
    results.forEach((res) => {
      allCandidates.push(...res.candidates);
      allVotes.push(...res.votes);
    });

    console.log(`Total Candidates: ${allCandidates.length}`);
    console.log(`Total Votes: ${allVotes.length}`);

    // Data directory - this is slightly ambiguous with GCS, but GCS adapter should handle "data/filename" paths
    // For local fs, we want absolute path if possible or relative to cwd.
    // The FileSystemAdapter uses path.dirname(filePath) so it should work if we pass "data/filename"
    // However, the original script used path.join(process.cwd(), "data")

    // Let's decide on a convention: paths passed to CsvWriter are relative to the "root" of the storage.
    // For FS, that's process.cwd(). For GCS, that's the bucket root.
    // So we should pass "data/all_candidates.csv".

    // But wait, the original script did:
    // path.join(dataDir, "all_candidates.csv") where dataDir was process.cwd()/data
    // If I pass "data/all_candidates.csv" to FileSystemAdapter:
    // It will do path.dirname("data/all_candidates.csv") -> "data"
    // fs.mkdir("data") -> relative to CWD. This matches original behavior.

    const candidatesPath = path.join("data", "all_candidates.csv");
    const votesPath = path.join("data", "all_votes.csv");

    // Create all_candidates.csv
    console.log(`Writing ${candidatesPath}...`);
    await this.csvWriter.write(
      allCandidates,
      candidatesPath,
      ["series", "id", "name", "age", "job", "location", "originalRole"]
    );

    // Create all_votes.csv
    console.log(`Writing ${votesPath}...`);
    await this.csvWriter.write(allVotes, votesPath, [
      "series",
      "voterId",
      "targetId",
      "episode",
      "round",
    ]);

    console.log("Ingestion complete.");
  }
}
