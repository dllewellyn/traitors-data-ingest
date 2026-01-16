import { Banishment, Candidate, Episode, Murder, Vote } from "../domain/models";

/**
 * Represents the structured data for a series.
 */
export interface SeriesData {
  candidates: Candidate[];
  episodes: Episode[];
  votes: Vote[];
  banishments: Banishment[];
  murders: Murder[];
}

/**
 * Defines the contract for a series scraper.
 */
export interface Scraper {
  /**
   * Scrapes the data for a series and returns it.
   * @returns A promise that resolves to the series data.
   */
  scrape(): Promise<SeriesData>;
}
