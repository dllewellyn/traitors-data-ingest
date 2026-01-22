import { CandidateRow, VoteRow } from "../domain/validation";

export interface ValidationDataReader {
  readCandidates(): Promise<CandidateRow[]>;
  readVotes(): Promise<VoteRow[]>;
}
