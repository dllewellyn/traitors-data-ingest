import { Series1Scraper } from "../scrapers/Series1Scraper";
import { Series2Scraper } from "../scrapers/Series2Scraper";
import { Series3Scraper } from "../scrapers/Series3Scraper";
import { Series4Scraper } from "../scrapers/Series4Scraper";
import { WikipediaFetcher } from "../services/WikipediaFetcher";
import { DataMerger } from "../services/DataMerger";
import { createStorageWriter } from "../persistence/storage-writer-factory";
import { IStorageWriter } from "../persistence/IStorageWriter";
import { Candidate, Vote } from "../domain/models";
import { Series } from "../domain/series";
import { Firestore } from "firebase-admin/firestore";

export interface IngestionOptions {
  firestoreInstance?: Firestore;
  dryRun?: boolean;
  storageWriter?: IStorageWriter;
  series?: number[];
}

export async function runIngestionProcess(options: IngestionOptions = {}): Promise<void> {
  console.log("Starting ingestion process...");

  const fetcher = new WikipediaFetcher();
  const merger = new DataMerger();

  const useFirestore = process.env.USE_FIRESTORE === "true";
  let seriesWriter: IStorageWriter | undefined;

  if (options.storageWriter) {
    seriesWriter = options.storageWriter;
    console.log("Using provided storage writer.");
  } else if (options.dryRun || useFirestore || options.firestoreInstance) {
    // Decide if we should write
    // We write if dryRun is true, OR if explicitly requested via env var or instance
    try {
      seriesWriter = createStorageWriter({
        dryRun: options.dryRun,
        firestore: options.firestoreInstance,
      });
      console.log(
        options.dryRun
          ? "Dry run mode enabled. No data will be written to Firestore."
          : "Firestore writer initialized."
      );
    } catch (error) {
      console.warn(
        "Failed to initialize Firestore writer. Ensure firebase-admin is initialized.",
        error
      );
    }
  }

  // URLs for each series
  const allUrls = [
    "https://en.wikipedia.org/wiki/The_Traitors_(British_series_1)",
    "https://en.wikipedia.org/wiki/The_Traitors_(British_series_2)",
    "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_3",
    "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_4",
  ];

  // Instantiate scrapers
  const allScrapers = [
    new Series1Scraper(),
    new Series2Scraper(),
    new Series3Scraper(),
    new Series4Scraper(),
  ];

  // Determine which series to process
  const targetSeriesIndices = options.series
    ? options.series.map((s) => s - 1).filter((i) => i >= 0 && i < allUrls.length)
    : allUrls.map((_, i) => i);

  if (targetSeriesIndices.length === 0) {
    console.warn("No valid series selected for processing.");
    return;
  }

  const allCandidates: Candidate[] = [];
  const allVotes: Vote[] = [];

  // Parallel fetch and parse
  const results = await Promise.all(
    targetSeriesIndices.map(async (index) => {
      const url = allUrls[index];
      const scraper = allScrapers[index];
      const seriesNum = index + 1;
      console.log(`Fetching Series ${seriesNum} from ${url}...`);

      try {
        const html = await fetcher.fetch(url);

        console.log(`Parsing Series ${seriesNum} candidates...`);
        const candidates = scraper.parseCandidates(html);

        console.log(`Parsing Series ${seriesNum} progress...`);
        const progress = scraper.parseProgress(html);

        console.log(`Processing Series ${seriesNum} votes...`);
        const votes = merger.processVotes(seriesNum, candidates, progress);

        if (seriesWriter) {
          console.log(
            options.dryRun
              ? `Simulating write for Series ${seriesNum}...`
              : `Writing Series ${seriesNum} to Firestore...`
          );
          const series: Series = {
            id: `TRAITORS_UK_S${seriesNum}`,
            seriesNumber: seriesNum,
            candidates,
            votes,
          };
          await seriesWriter.write(series);
        }

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

  console.log("Ingestion process finished.");
}
