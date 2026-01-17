import { Series4CandidateParser } from "./series4/Series4CandidateParser";
import { Series4ProgressParser } from "./series4/Series4ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";

export class Series4Scraper {
  private candidateParser = new Series4CandidateParser();
  private progressParser = new Series4ProgressParser();

  parseCandidates(html: string): Candidate[] {
    return this.candidateParser.parse(html);
  }

  parseProgress(html: string): CandidateProgressRow[] {
    return this.progressParser.parse(html);
  }
}
