import { SeriesUS3CandidateParser } from "./seriesUS3/SeriesUS3CandidateParser";
import { SeriesUS3ProgressParser } from "./seriesUS3/SeriesUS3ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";
import { ILogger } from "../types";
import { ConsoleLogger } from "../utils/ConsoleLogger";

/**
 * Scraper for Series 3 of The Traitors (US).
 * Acts as a facade for the specific candidate and progress parsers.
 */
export class SeriesUS3Scraper {
  private candidateParser: SeriesUS3CandidateParser;
  private progressParser: SeriesUS3ProgressParser;

  constructor(private logger: ILogger = new ConsoleLogger()) {
    this.candidateParser = new SeriesUS3CandidateParser(logger);
    this.progressParser = new SeriesUS3ProgressParser(logger);
  }

  /**
   * Parses candidates from the US Series 3 HTML content.
   * @param html The HTML content of the Wikipedia page.
   * @returns An array of Candidate objects.
   */
  parseCandidates(html: string): Candidate[] {
    const candidates = this.candidateParser.parse(html);
    return candidates.map((c) => ({ ...c, series: 3 }));
  }

  /**
   * Parses the progress (voting history) from the US Series 3 HTML content.
   * @param html The HTML content of the Wikipedia page.
   * @returns An array of CandidateProgressRow objects.
   */
  parseProgress(html: string): CandidateProgressRow[] {
    return this.progressParser.parse(html);
  }
}
