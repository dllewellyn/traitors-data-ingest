import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as path from "path";
import {
  CsvReader,
  DataMerger,
  FirestoreStorageWriter,
  Candidate,
  Series,
  CandidateProgressRow,
} from "@gcp-adl/core";
// Define interfaces for Raw CSV rows
// CsvReader auto-casts numbers, so we need to account for that in types
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

async function main() {
  const args = process.argv.slice(2);
  const isEmulator = args.includes("--emulator");
  const projectIndex = args.indexOf("--project");
  const projectId = projectIndex !== -1 ? args[projectIndex + 1] : undefined;

  if (isEmulator) {
    console.log("Running in emulator mode...");
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    process.env.GCLOUD_PROJECT = "demo-test";
    initializeApp({ projectId: "demo-test" });
  } else {
    console.log("Running in production mode...");
    if (projectId) {
      console.log(`Targeting project: ${projectId}`);
      initializeApp({ projectId });
    } else {
      console.log(
        "No project ID specified. Using default credentials/project."
      );
      initializeApp();
    }
  }

  const db = getFirestore();
  const writer = new FirestoreStorageWriter(db);
  const reader = new CsvReader();
  const merger = new DataMerger();

  const seriesList = [1, 2, 3, 4];

  for (const seriesNum of seriesList) {
    console.log(`Migrating Series ${seriesNum}...`);
    try {
      const dataDir = path.join(process.cwd(), "data", `series${seriesNum}`);
      const candidatesPath = path.join(dataDir, "candidates.csv");
      const votesPath = path.join(dataDir, "votes.csv");

      // Read Candidates
      const rawCandidates = await reader.read<RawCandidateRow>(candidatesPath);
      const candidates: Candidate[] = rawCandidates.map((row) => {
        let roundStates: unknown[] = [];
        try {
          // Ensure roundStates is a string before parsing
          const jsonString = String(row.roundStates);
          roundStates = JSON.parse(jsonString);
        } catch (e) {
          console.error(`Error parsing roundStates for ${row.name}:`, e);
        }

        return {
          series: seriesNum,
          id: Number(row.id),
          name: row.name,
          age: Number(row.age),
          job: row.job,
          location: row.location,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          originalRole: row.originalRole as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          roundStates: roundStates as any,
        };
      });

      // Read Votes (Progress)
      const rawVotes = await reader.read<RawVoteRow>(votesPath);
      const progressRows: CandidateProgressRow[] = rawVotes.map((row) => {
        let progress: Record<number, string> = {};
        try {
          const jsonString = String(row.progress);
          progress = JSON.parse(jsonString);
        } catch (e) {
          console.error(`Error parsing progress for ${row.name}:`, e);
        }
        return {
          name: row.name,
          progress: progress,
        };
      });

      // Process Votes
      const votes = merger.processVotes(seriesNum, candidates, progressRows);

      // Construct Series
      const seriesId = `TRAITORS_UK_S${seriesNum}`;
      const series: Series = {
        id: seriesId,
        seriesNumber: seriesNum,
        candidates: candidates,
        votes: votes,
      };

      // Write to Firestore
      await writer.write(series);
      console.log(`Successfully migrated Series ${seriesNum}.`);
    } catch (error) {
      console.error(`Failed to migrate Series ${seriesNum}:`, error);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
