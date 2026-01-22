import {
  CsvReader,
  DataMerger,
  FirestoreStorageWriter,
  Series,
  Candidate,
  CandidateProgressRow,
} from "..";
import { RoundState, Role } from "../domain/models";
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

export class LegacyMigrationService {
  private reader: CsvReader;
  private merger: DataMerger;
  private writer: FirestoreStorageWriter;

  constructor(
    reader: CsvReader,
    merger: DataMerger,
    writer: FirestoreStorageWriter
  ) {
    this.reader = reader;
    this.merger = merger;
    this.writer = writer;
  }

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

      return {
        series: seriesNum,
        id: Number(row.id),
        name: row.name,
        age: Number(row.age),
        job: row.job,
        location: row.location,
        originalRole: row.originalRole as unknown as Role,
        roundStates: roundStates as unknown as RoundState[],
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
