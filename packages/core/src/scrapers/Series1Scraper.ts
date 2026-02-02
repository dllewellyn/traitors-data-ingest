import { Series1CandidateParser } from "./series1/Series1CandidateParser";
import { Series1ProgressParser } from "./series1/Series1ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";
import { ILogger } from "../types";
import { ConsoleLogger } from "../utils/ConsoleLogger";

/**
 * Scraper for Series 1 of The Traitors (British).
 * Facade for specific parsers.
 */
export class Series1Scraper {
  private candidateParser: Series1CandidateParser;
  private progressParser: Series1ProgressParser;

  constructor(private logger: ILogger = new ConsoleLogger()) {
    this.candidateParser = new Series1CandidateParser(logger);
    this.progressParser = new Series1ProgressParser(logger);
  }

  /**
   * Parses candidates from the Series 1 HTML.
   * @param html The HTML content.
   */
  parseCandidates(html: string): Candidate[] {
    const candidates = this.candidateParser.parse(html);
    return candidates.map((c) => ({ ...c, series: 1 }));
  }

  /**
   * Parses progress (voting history) from the Series 1 HTML.
   * @param html The HTML content.
   */
  parseProgress(html: string): CandidateProgressRow[] {
    return this.progressParser.parse(html);
  }
}
