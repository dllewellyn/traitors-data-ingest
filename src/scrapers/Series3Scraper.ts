import { Series3CandidateParser } from "./series3/Series3CandidateParser";
import { Series3ProgressParser } from "./series3/Series3ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";

/**
 * Scraper for Series 3 of The Traitors (British).
 * Facade for specific parsers.
 */
export class Series3Scraper {
  private candidateParser = new Series3CandidateParser();
  private progressParser = new Series3ProgressParser();

  /**
   * Parses candidates from the Series 3 HTML.
   * @param html The HTML content.
   */
  parseCandidates(html: string): Candidate[] {
    const candidates = this.candidateParser.parse(html);
    return candidates.map((c) => ({ ...c, series: 3 }));
  }

  /**
   * Parses progress (voting history) from the Series 3 HTML.
   * @param html The HTML content.
   */
  parseProgress(html: string): CandidateProgressRow[] {
    return this.progressParser.parse(html);
  }
}
