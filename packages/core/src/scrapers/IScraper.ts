import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";

/**
 * Interface for a scraper that parses candidate and progress data.
 */
export interface Scraper {
  parseCandidates(html: string): Candidate[];
  parseProgress(html: string): CandidateProgressRow[];
}
