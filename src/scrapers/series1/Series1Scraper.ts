import { SeriesData, Scraper } from "../interfaces";
import { WikipediaFetcher } from "../../services/WikipediaFetcher";
import { CandidateTableParser } from "./CandidateTableParser";
import { VotingTableParser } from "./VotingTableParser";

export class Series1Scraper implements Scraper {
  private fetcher = new WikipediaFetcher();
  private candidateParser = new CandidateTableParser();
  private votingParser = new VotingTableParser();

  private readonly SERIES1_URL =
    "https://en.wikipedia.org/wiki/The_Traitors_(British_series_1)";

  public async scrape(): Promise<SeriesData> {
    const html = await this.fetcher.fetch(this.SERIES1_URL);

    const candidates = this.candidateParser.parse(html);
    const [eliminationHistory] = this.votingParser.parse(html);
    const { episodes, votes, banishments, murders } = eliminationHistory;

    return {
      candidates,
      episodes,
      votes,
      banishments,
      murders,
    };
  }
}
