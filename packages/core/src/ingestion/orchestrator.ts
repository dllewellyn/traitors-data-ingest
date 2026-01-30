import { Series1Scraper } from "../scrapers/Series1Scraper";
import { Series2Scraper } from "../scrapers/Series2Scraper";
import { Series3Scraper } from "../scrapers/Series3Scraper";
import { Series4Scraper } from "../scrapers/Series4Scraper";
import { SeriesUS2Scraper } from "../scrapers/SeriesUS2Scraper";
import { SeriesUS3Scraper } from "../scrapers/SeriesUS3Scraper";
import { WikipediaFetcher, IWikipediaFetcher } from "../services/WikipediaFetcher";
import { DataMerger } from "../services/DataMerger";
import { createStorageWriter } from "../persistence/storage-writer-factory";
import { IStorageWriter } from "../persistence/IStorageWriter";
import { Candidate, Vote } from "../domain/models";
import { Series } from "../domain/series";
import { Firestore } from "firebase-admin/firestore";
import { ILogger } from "../types";

export interface IngestionOptions {
  firestoreInstance?: Firestore;
  dryRun?: boolean;
  storageWriter?: IStorageWriter;
  series?: number[];
  seriesIds?: string[];
  fetcher?: IWikipediaFetcher;
  logger?: ILogger;
}

class ConsoleLogger implements ILogger {
  log(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }
  info(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }
  warn(message: string, ...args: any[]): void {
    console.warn(message, ...args);
  }
  error(message: string, ...args: any[]): void {
    console.error(message, ...args);
  }
  debug(message: string, ...args: any[]): void {
    console.debug(message, ...args);
  }
}

interface SeriesConfig {
  url: string;
  scraper: any; // Using any to accommodate different scraper classes
  id: string;
  seriesNumber: number;
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

  // Configuration for all series
  const seriesConfigs: SeriesConfig[] = [
    {
      url: "https://en.wikipedia.org/wiki/The_Traitors_(British_series_1)",
      scraper: new Series1Scraper(),
      id: "TRAITORS_UK_S1",
      seriesNumber: 1,
    },
    {
      url: "https://en.wikipedia.org/wiki/The_Traitors_(British_series_2)",
      scraper: new Series2Scraper(),
      id: "TRAITORS_UK_S2",
      seriesNumber: 2,
    },
    {
      url: "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_3",
      scraper: new Series3Scraper(),
      id: "TRAITORS_UK_S3",
      seriesNumber: 3,
    },
    {
      url: "https://en.wikipedia.org/wiki/The_Traitors_(British_TV_series)_series_4",
      scraper: new Series4Scraper(),
      id: "TRAITORS_UK_S4",
      seriesNumber: 4,
    },
    {
      url: "https://en.wikipedia.org/wiki/The_Traitors_(American_TV_series)_season_2",
      scraper: new SeriesUS2Scraper(),
      id: "TRAITORS_US_S2",
      seriesNumber: 2,
    },
    {
      url: "https://en.wikipedia.org/wiki/The_Traitors_(American_TV_series)_season_3",
      scraper: new SeriesUS3Scraper(),
      id: "TRAITORS_US_S3",
      seriesNumber: 3,
    },
  ];

  // Determine which series to process
  const targetSeries = seriesConfigs.filter((config) => {
    if (options.seriesIds && options.seriesIds.length > 0) {
      return options.seriesIds.includes(config.id);
    }
    if (options.series && options.series.length > 0) {
      return options.series.includes(config.seriesNumber);
    }
    // Default: Process ALL if no filter provided
    return true;
  });

  if (targetSeries.length === 0) {
    logger.warn("No valid series selected for processing.");
    return;
  }

  const allCandidates: Candidate[] = [];
  const allVotes: Vote[] = [];

  // Parallel fetch and parse
  const results = await Promise.all(
    targetSeries.map(async (config) => {
      const { url, scraper, id, seriesNumber } = config;
      logger.info(`Fetching ${id} (Series ${seriesNumber}) from ${url}...`);

      try {
        const html = await fetcher.fetch(url);

        logger.info(`Parsing ${id} candidates...`);
        const candidates = scraper.parseCandidates(html);

        logger.info(`Parsing ${id} progress...`);
        const progress = scraper.parseProgress(html);

        logger.info(`Processing ${id} votes...`);
        const votes = merger.processVotes(seriesNumber, candidates, progress);

        if (seriesWriter) {
          logger.info(
            options.dryRun
              ? `Simulating write for ${id}...`
              : `Writing ${id} to Firestore...`
          );
          const series: Series = {
            id: id,
            seriesNumber: seriesNumber,
            candidates,
            votes,
          };
          await seriesWriter.write(series);
        }

        return { candidates, votes };
      } catch (error) {
        logger.error(`Error processing ${id}:`, error);
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
