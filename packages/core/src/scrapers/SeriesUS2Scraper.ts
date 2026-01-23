import { SeriesUS2CandidateParser } from "./seriesUS2/SeriesUS2CandidateParser";
import { SeriesUS2ProgressParser } from "./seriesUS2/SeriesUS2ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";

/**
 * Scraper for Series 2 of The Traitors (US).
 * Acts as a facade for the specific candidate and progress parsers.
 */
export class SeriesUS2Scraper {
  private candidateParser = new SeriesUS2CandidateParser();
  private progressParser = new SeriesUS2ProgressParser();

  /**
   * Parses candidates from the US Series 2 HTML content.
   * @param html The HTML content of the Wikipedia page.
   * @returns An array of Candidate objects.
   */
  parseCandidates(html: string): Candidate[] {
    const candidates = this.candidateParser.parse(html);
    return candidates.map((c) => ({ ...c, series: 2 }));
  }

  /**
   * Parses the progress (voting history) from the US Series 2 HTML content.
   * @param html The HTML content of the Wikipedia page.
   * @returns An array of CandidateProgressRow objects.
   */
  parseProgress(html: string): CandidateProgressRow[] {
    return this.progressParser.parse(html);
  }
}
