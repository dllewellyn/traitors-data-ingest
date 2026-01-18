import * as fs from "fs";
import * as path from "path";
import { Series1Scraper } from "../scrapers/Series1Scraper";
import { Series2Scraper } from "../scrapers/Series2Scraper";
import { Series3Scraper } from "../scrapers/Series3Scraper";
import { Series4Scraper } from "../scrapers/Series4Scraper";
import { WikipediaFetcher } from "../services/WikipediaFetcher";
import { DataMerger } from "../services/DataMerger";
import { CsvWriter } from "../services/CsvWriter";
import { Candidate, Vote } from "../domain/models";

async function main() {
  console.log("Starting ingestion...");

  const fetcher = new WikipediaFetcher();
  const merger = new DataMerger();
  const csvWriter = new CsvWriter();

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
        const html = await fetcher.fetch(url);

        console.log(`Parsing Series ${seriesNum} candidates...`);
        const candidates = scraper.parseCandidates(html);

        console.log(`Parsing Series ${seriesNum} progress...`);
        const progress = scraper.parseProgress(html);

        console.log(`Processing Series ${seriesNum} votes...`);
        const votes = merger.processVotes(seriesNum, candidates, progress);

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

  // Write to CSV
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create all_candidates.csv
  console.log("Writing all_candidates.csv...");
  // CsvWriter expects keys of T. For simple usage, we can pass just the keys we want.
  // However, CsvWriter implementation uses columns: headers as string[].
  // But the interface is headers?: (keyof T)[].
  // So I should pass ["series", "id", "name", ...]

  await csvWriter.write(
    allCandidates,
    path.join(dataDir, "all_candidates.csv"),
    ["series", "id", "name", "age", "job", "location", "originalRole"]
  );

  // Create all_votes.csv
  console.log("Writing all_votes.csv...");
  await csvWriter.write(
    allVotes,
    path.join(dataDir, "all_votes.csv"),
    ["series", "voterId", "targetId", "episode", "round"]
  );

  console.log("Ingestion complete.");
}

main().catch((err) => {
  console.error("Fatal error during ingestion:", err);
  process.exit(1);
});
