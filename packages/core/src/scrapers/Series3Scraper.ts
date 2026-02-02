import { Series3CandidateParser } from "./series3/Series3CandidateParser";
import { Series3ProgressParser } from "./series3/Series3ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";
import { ILogger } from "../types";
import { ConsoleLogger } from "../utils/ConsoleLogger";

/**
 * Scraper for Series 3 of The Traitors (British).
 * Facade for specific parsers.
 */
export class Series3Scraper {
  private candidateParser: Series3CandidateParser;
  private progressParser: Series3ProgressParser;

  constructor(private logger: ILogger = new ConsoleLogger()) {
    this.candidateParser = new Series3CandidateParser(logger);
    this.progressParser = new Series3ProgressParser(logger);
  }

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
