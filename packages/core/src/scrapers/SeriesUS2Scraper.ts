import { SeriesUS2CandidateParser } from "./seriesUS2/SeriesUS2CandidateParser";
import { SeriesUS2ProgressParser } from "./seriesUS2/SeriesUS2ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";

export class SeriesUS2Scraper {
  private candidateParser = new SeriesUS2CandidateParser();
  private progressParser = new SeriesUS2ProgressParser();

  parseCandidates(html: string): Candidate[] {
    const candidates = this.candidateParser.parse(html);
    return candidates.map((c) => ({ ...c, series: 2 }));
  }

  parseProgress(html: string): CandidateProgressRow[] {
    return this.progressParser.parse(html);
  }
}
