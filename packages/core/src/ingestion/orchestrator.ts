import { Series1Scraper } from "../scrapers/Series1Scraper";
import { Series2Scraper } from "../scrapers/Series2Scraper";
import { Series3Scraper } from "../scrapers/Series3Scraper";
import { Series4Scraper } from "../scrapers/Series4Scraper";
import { WikipediaFetcher } from "../services/WikipediaFetcher";
import { DataMerger } from "../services/DataMerger";
import { getFirestore } from "firebase-admin/firestore";
import { FirestoreStorageWriter } from "../persistence/firestore-writer";
import { DryRunStorageWriter } from "../persistence/DryRunStorageWriter";
import { IStorageWriter } from "../persistence/IStorageWriter";
import { Candidate, Vote } from "../domain/models";
import { Series } from "../domain/series";
import { Firestore } from "firebase-admin/firestore";

export interface IngestionOptions {
  firestoreInstance?: Firestore;
  dryRun?: boolean;
}

export async function runIngestionProcess(options: IngestionOptions = {}): Promise<void> {
  console.log("Starting ingestion process...");

  const fetcher = new WikipediaFetcher();
  const merger = new DataMerger();

  let seriesWriter: IStorageWriter;

  if (options.dryRun) {
    seriesWriter = new DryRunStorageWriter();
    console.log("Dry run mode enabled. No data will be written to Firestore.");
  } else {
    try {
      const db = options.firestoreInstance || getFirestore();
      seriesWriter = new FirestoreStorageWriter(db);
      console.log("Firestore writer initialized.");
    } catch (error) {
      console.error(
        "Failed to initialize Firestore writer. Ensure firebase-admin is initialized.",
        error
      );
      throw error;
    }
  }

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
