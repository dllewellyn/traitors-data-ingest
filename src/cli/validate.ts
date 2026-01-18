/* eslint-disable no-console */
import * as path from "path";
import { CsvReader } from "../services/CsvReader";
import { DataValidator, CandidateRow, VoteRow } from "../services/DataValidator";

const DATA_DIR = path.join(process.cwd(), "data");

async function main() {
  const reader = new CsvReader();
  const validator = new DataValidator();

  console.log("Starting data validation...");

  const candidatesPath = path.join(DATA_DIR, "all_candidates.csv");
  const votesPath = path.join(DATA_DIR, "all_votes.csv");

  // Read data
  console.log(`Reading candidates from ${candidatesPath}...`);
  const candidates = await reader.read<CandidateRow>(candidatesPath);

  console.log(`Reading votes from ${votesPath}...`);
  const votes = await reader.read<VoteRow>(votesPath);

  if (candidates.length === 0) {
      console.warn("No candidates found or file missing. Validation aborted.");
      process.exit(1);
  }

  // Validate Candidates
  console.log("Validating candidates...");
  const candidateValidation = validator.validateCandidates(candidates);
  if (!candidateValidation.valid) {
    console.error("Candidate validation failed:");
    candidateValidation.errors.forEach(err => console.error(`  - ${err}`));
  } else {
    console.log("Candidate validation passed.");
  }

  // Validate Votes
  console.log("Validating votes...");
  const voteValidation = validator.validateVotes(votes, candidates);
  if (!voteValidation.valid) {
    console.error("Vote validation failed:");
    voteValidation.errors.forEach(err => console.error(`  - ${err}`));
  } else {
    console.log("Vote validation passed.");
  }

  if (!candidateValidation.valid || !voteValidation.valid) {
    console.error("\nData integrity check FAILED.");
    process.exit(1);
  }

  console.log("\nData integrity check PASSED.");
}

main().catch(error => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
