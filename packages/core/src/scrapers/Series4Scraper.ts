import { Series4CandidateParser } from "./series4/Series4CandidateParser";
import { Series4ProgressParser } from "./series4/Series4ProgressParser";
import { Candidate } from "../domain/models";
import { CandidateProgressRow } from "./types";
import { ILogger } from "../types";
import { ConsoleLogger } from "../utils/ConsoleLogger";

export class Series4Scraper {
  private candidateParser: Series4CandidateParser;
  private progressParser: Series4ProgressParser;

  constructor(private logger: ILogger = new ConsoleLogger()) {
    this.candidateParser = new Series4CandidateParser(logger);
    this.progressParser = new Series4ProgressParser(logger);
  }

  parseCandidates(html: string): Candidate[] {
    const candidates = this.candidateParser.parse(html);
    return candidates.map((c) => ({ ...c, series: 4 }));
  }

  parseProgress(html: string): CandidateProgressRow[] {
    return this.progressParser.parse(html);
  }
}
