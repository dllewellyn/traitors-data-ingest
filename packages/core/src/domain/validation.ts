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
