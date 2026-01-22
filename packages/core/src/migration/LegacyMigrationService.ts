import {
  CsvReader,
  DataMerger,
  FirestoreStorageWriter,
  Series,
  Candidate,
  CandidateProgressRow,
} from "..";
import { RoundState, Role } from "../domain/models";
import { isRole, isRoundState, isArrayOf } from "../utils/typeGuards";
import * as path from "path";

// Define interfaces for Raw CSV rows
interface RawCandidateRow {
  id: number | string;
  name: string;
  age: number | string;
  job: string;
  location: string;
  originalRole: string;
  roundStates: string; // JSON string
}

interface RawVoteRow {
  name: string;
  progress: string; // JSON string
}

/**
 * Service for migrating legacy CSV data to Firestore.
 * Handles reading, parsing, merging, and writing series data.
 */
export class LegacyMigrationService {
  private reader: CsvReader;
  private merger: DataMerger;
  private writer: FirestoreStorageWriter;

  /**
   * Creates a new instance of LegacyMigrationService.
   * @param reader The CsvReader to read legacy data.
   * @param merger The DataMerger to combine disparate data sources.
   * @param writer The FirestoreStorageWriter to persist the migrated series.
   */
  constructor(
    reader: CsvReader,
    merger: DataMerger,
    writer: FirestoreStorageWriter
  ) {
    this.reader = reader;
    this.merger = merger;
    this.writer = writer;
  }

  /**
   * Migrates a single series from CSV files in a given directory to Firestore.
   * @param seriesNum The number of the series to migrate (e.g. 1).
   * @param dataDir The directory containing 'candidates.csv' and 'votes.csv'.
   * @returns A promise that resolves when the migration is complete.
   * @throws Error if parsing fails or data is invalid.
   */
  async migrateSeries(seriesNum: number, dataDir: string): Promise<void> {
    const candidatesPath = path.join(dataDir, "candidates.csv");
    const votesPath = path.join(dataDir, "votes.csv");

    // Read Candidates
    const rawCandidates = await this.reader.read<RawCandidateRow>(
      candidatesPath
    );
    const candidates: Candidate[] = rawCandidates.map((row) => {
      let roundStates: unknown[] = [];
      try {
        const jsonString = String(row.roundStates);
        roundStates = JSON.parse(jsonString);
      } catch (e) {
        console.error(`Error parsing roundStates for ${row.name}:`, e);
        throw e;
      }

      if (!isRole(row.originalRole)) {
        throw new Error(`Invalid role for candidate ${row.name}: ${row.originalRole}`);
      }

      if (!isArrayOf(roundStates, isRoundState)) {
         throw new Error(`Invalid roundStates for candidate ${row.name}`);
      }

      return {
        series: seriesNum,
        id: Number(row.id),
        name: row.name,
        age: Number(row.age),
        job: row.job,
        location: row.location,
        originalRole: row.originalRole,
        roundStates: roundStates,
      };
    });

    // Read Votes (Progress)
    const rawVotes = await this.reader.read<RawVoteRow>(votesPath);
    const progressRows: CandidateProgressRow[] = rawVotes.map((row) => {
      let progress: Record<number, string> = {};
      try {
        const jsonString = String(row.progress);
        progress = JSON.parse(jsonString);
      } catch (e) {
        console.error(`Error parsing progress for ${row.name}:`, e);
        throw e;
      }
      return {
        name: row.name,
        progress: progress,
      };
    });

    // Process Votes
    const votes = this.merger.processVotes(seriesNum, candidates, progressRows);

    // Construct Series
    const seriesId = `TRAITORS_UK_S${seriesNum}`;
    const series: Series = {
      id: seriesId,
      seriesNumber: seriesNum,
      candidates: candidates,
      votes: votes,
    };

    // Write to Firestore
    await this.writer.write(series);
  }
}
