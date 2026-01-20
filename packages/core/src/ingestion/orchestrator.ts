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

export async function runIngestionProcess(): Promise<void> {
  console.log("Starting ingestion process...");

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
  // NOTE: When running in functions, process.cwd() is the function directory.
  // We need to write to the data directory in the root of the project.
  // BUT, in Cloud Functions, the filesystem is read-only except /tmp.
  // However, this is for LOCAL testing via emulator, which maps local files?
  // No, the emulator runs the function.
  // If we want to persist data to the `data/` folder in the repo during `npm run trigger:local`,
  // we need to know where the repo root is.
  // `process.cwd()` in emulator is usually the `functions` dir.

  // Let's attempt to find the root.
  // If we assume we are in `functions/`, the root is `../`.
  // If we are running via CLI `npm run ingest`, we are in root.

  let dataDir = path.join(process.cwd(), "data");

  // Simple check: if "functions" is in cwd, try to go up.
  if (process.cwd().endsWith("functions")) {
     dataDir = path.join(process.cwd(), "../data");
  }

  // Also check if dataDir exists, if not, maybe we are deep in node_modules?
  // For now, let's just log where we are writing.
  console.log(`Writing data to ${dataDir}`);

  if (!fs.existsSync(dataDir)) {
    // In strict read-only envs this will fail, but for local trigger it should work if we have permissions.
    // In actual cloud functions, this will likely fail unless we write to /tmp.
    // But the requirement is "on-demand data refreshes during local development".
    try {
        fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
        console.warn(`Could not create data directory at ${dataDir}. Trying /tmp...`);
        dataDir = "/tmp";
    }
  }

  // Create all_candidates.csv
  console.log("Writing all_candidates.csv...");
  await csvWriter.write(
    allCandidates,
    path.join(dataDir, "all_candidates.csv"),
    ["series", "id", "name", "age", "job", "location", "originalRole"]
  );

  // Create all_votes.csv
  console.log("Writing all_votes.csv...");
  await csvWriter.write(allVotes, path.join(dataDir, "all_votes.csv"), [
    "series",
    "voterId",
    "targetId",
    "episode",
    "round",
  ]);

  console.log("Ingestion process finished.");
}
