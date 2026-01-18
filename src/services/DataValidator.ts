import { CsvReader } from "./CsvReader";
import { Role } from "../domain/enums";

export interface CandidateRow {
  id: number;
  name: string;
  series: number;
  originalRole: string; // CSV might contain string
  // other fields...
}

export interface VoteRow {
  series: number;
  voterId: number;
  targetId: number;
  round: number;
  episode: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class DataValidator {
  public validateCandidates(candidates: CandidateRow[]): ValidationResult {
    const errors: string[] = [];
    const ids = new Set<string>();

    for (const candidate of candidates) {
      const idKey = `${candidate.series}-${candidate.id}`;
      if (ids.has(idKey)) {
        errors.push(`Duplicate candidate ID found: ${idKey} (${candidate.name})`);
      }
      ids.add(idKey);

      if (!Object.values(Role).includes(candidate.originalRole as Role) && candidate.originalRole !== 'None') { // 'None' handling as per memory
         // Wait, Role enum is Traitor, Faithful. 'None' is sometimes used for early eliminated.
         // Let's check strict enum compliance or normalized values.
         // Memory says "If a candidate's affiliation is listed as 'None'... parsers default the role to Role.Faithful".
         // So the CSV should ideally have 'Faithful' or 'Traitor'.
         // I will strict check against Role enum.
         errors.push(`Invalid role for candidate ${candidate.id}: ${candidate.originalRole}`);
      }

      // Status isn't in the flat CandidateRow usually, as it's per round.
      // But if there was a status field, we'd validate it.
      // Based on Candidate model, status is in roundStates.
      // But the generated CSV usually flattens data or writes the Candidate object fields.
      // Let's assume CandidateRow matches the CSV structure.
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public validateVotes(votes: VoteRow[], candidates: CandidateRow[]): ValidationResult {
    const errors: string[] = [];
    // candidate key: series-id
    const candidateIds = new Set(candidates.map(c => `${c.series}-${c.id}`));

    for (const vote of votes) {
      const voterKey = `${vote.series}-${vote.voterId}`;
      const targetKey = `${vote.series}-${vote.targetId}`;

      if (!candidateIds.has(voterKey)) {
        errors.push(`Orphaned vote: Voter ${voterKey} not found in candidates (Round ${vote.round})`);
      }

      if (!candidateIds.has(targetKey)) {
        errors.push(`Orphaned vote: Target ${targetKey} not found in candidates (Round ${vote.round})`);
      }

      if (vote.round <= 0) {
        errors.push(`Invalid round number: ${vote.round} for vote by ${voterKey}`);
      }

      if (vote.episode <= 0) {
         errors.push(`Invalid episode number: ${vote.episode} for vote by ${voterKey}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
