import { Series1Scraper } from "../scrapers/Series1Scraper";
import { Series2Scraper } from "../scrapers/Series2Scraper";
import { Series3Scraper } from "../scrapers/Series3Scraper";
import { Series4Scraper } from "../scrapers/Series4Scraper";
import { WikipediaFetcher, IWikipediaFetcher } from "../services/WikipediaFetcher";
import { DataMerger } from "../services/DataMerger";
import { createStorageWriter } from "../persistence/storage-writer-factory";
import { IStorageWriter } from "../persistence/IStorageWriter";
import { Candidate, Vote } from "../domain/models";
import { Series } from "../domain/series";
import { Firestore } from "firebase-admin/firestore";
import { Logger } from "../types";

export interface IngestionOptions {
  firestoreInstance?: Firestore;
  dryRun?: boolean;
  storageWriter?: IStorageWriter;
  series?: number[];
  fetcher?: IWikipediaFetcher;
  logger?: Logger;
}

class ConsoleLogger implements Logger {
  info(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
  warn(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.warn(message, ...args);
  }
  error(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(message, ...args);
  }
  debug(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.debug(message, ...args);
  }
}

export async function runIngestionProcess(options: IngestionOptions = {}): Promise<void> {
  const logger = options.logger || new ConsoleLogger();
  logger.info("Starting ingestion process...");

  const fetcher = options.fetcher || new WikipediaFetcher();
  const merger = new DataMerger();

  const useFirestore = process.env.USE_FIRESTORE === "true";
  let seriesWriter: IStorageWriter | undefined;

  if (options.storageWriter) {
    seriesWriter = options.storageWriter;
    logger.info("Using provided storage writer.");
  } else if (options.dryRun || useFirestore || options.firestoreInstance) {
    // Decide if we should write
    // We write if dryRun is true, OR if explicitly requested via env var or instance
    try {
      seriesWriter = createStorageWriter({
        dryRun: options.dryRun,
        firestore: options.firestoreInstance,
      });
      logger.info(
        options.dryRun
          ? "Dry run mode enabled. No data will be written to Firestore."
          : "Firestore writer initialized."
      );
    } catch (error) {
      logger.warn(
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
    logger.warn("No valid series selected for processing.");
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
      logger.info(`Fetching Series ${seriesNum} from ${url}...`);

      try {
        const html = await fetcher.fetch(url);

        logger.info(`Parsing Series ${seriesNum} candidates...`);
        const candidates = scraper.parseCandidates(html);

        logger.info(`Parsing Series ${seriesNum} progress...`);
        const progress = scraper.parseProgress(html);

        logger.info(`Processing Series ${seriesNum} votes...`);
        const votes = merger.processVotes(seriesNum, candidates, progress);

        if (seriesWriter) {
          logger.info(
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
        logger.error(`Error processing Series ${seriesNum}:`, error);
        return { candidates: [], votes: [] };
      }
    })
  );

  // Merge results
  results.forEach((res) => {
    allCandidates.push(...res.candidates);
    allVotes.push(...res.votes);
  });

  logger.info(`Total Candidates: ${allCandidates.length}`);
  logger.info(`Total Votes: ${allVotes.length}`);

  logger.info("Ingestion process finished.");
}
