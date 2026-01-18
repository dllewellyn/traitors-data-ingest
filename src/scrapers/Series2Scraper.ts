import { Series2CandidateParser } from "./series2/Series2CandidateParser";
import { Series2ProgressParser } from "./series2/Series2ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";

/**
 * Scraper for Series 2 of The Traitors (British).
 * Facade for specific parsers.
 */
export class Series2Scraper {
  private candidateParser = new Series2CandidateParser();
  private progressParser = new Series2ProgressParser();

  /**
   * Parses candidates from the Series 2 HTML.
   * @param html The HTML content.
   */
  parseCandidates(html: string): Candidate[] {
    const candidates = this.candidateParser.parse(html);
    return candidates.map((c) => ({ ...c, series: 2 }));
  }

  /**
   * Parses progress (voting history) from the Series 2 HTML.
   * @param html The HTML content.
   */
  parseProgress(html: string): CandidateProgressRow[] {
    return this.progressParser.parse(html);
  }
}
