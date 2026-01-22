/* eslint-disable no-console */
import * as path from "path";
import {
  CsvValidationReader,
  FirestoreValidationReader,
  ValidationDataReader,
  DataValidator,
} from "@gcp-adl/core";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DATA_DIR = path.join(process.cwd(), "data");

async function main() {
  const args = process.argv.slice(2);
  const sourceArgIndex = args.indexOf("--source");
  const source = sourceArgIndex !== -1 ? args[sourceArgIndex + 1] : "csv";

  console.log(`Starting data validation (Source: ${source})...`);

  let reader: ValidationDataReader;

  if (source === "firestore") {
    // Check for emulator
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log(
        `Using Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`
      );
      initializeApp({ projectId: "demo-test" });
    } else {
      // Production/Default
      console.log("Using Production Firestore (Default Credentials)");
      initializeApp();
    }
    const db = getFirestore();
    reader = new FirestoreValidationReader(db);
  } else {
    // CSV
    reader = new CsvValidationReader(DATA_DIR);
  }

  const validator = new DataValidator();

  // Read data
  console.log("Reading candidates...");
  const candidates = await reader.readCandidates();
  console.log(`Read ${candidates.length} candidates.`);

  console.log("Reading votes...");
  const votes = await reader.readVotes();
  console.log(`Read ${votes.length} votes.`);

  if (candidates.length === 0) {
    console.warn("No candidates found. Validation aborted.");
    process.exit(1);
  }

  // Validate Candidates
  console.log("Validating candidates...");
  const candidateValidation = validator.validateCandidates(candidates);
  if (!candidateValidation.valid) {
    console.error("Candidate validation failed:");
    candidateValidation.errors.forEach((err) => console.error(`  - ${err}`));
  } else {
    console.log("Candidate validation passed.");
  }

  // Validate Votes
  console.log("Validating votes...");
  const voteValidation = validator.validateVotes(votes, candidates);
  if (!voteValidation.valid) {
    console.error("Vote validation failed:");
    voteValidation.errors.forEach((err) => console.error(`  - ${err}`));
  } else {
    console.log("Vote validation passed.");
  }

  if (!candidateValidation.valid || !voteValidation.valid) {
    console.error("\nData integrity check FAILED.");
    process.exit(1);
  }

  console.log("\nData integrity check PASSED.");
}

main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
