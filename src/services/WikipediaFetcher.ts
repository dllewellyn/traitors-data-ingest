import axios, { AxiosError } from "axios";
import { FetchError } from "../errors/FetchError";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Defines the contract for a service that fetches content from a URL.
 */
export interface IWikipediaFetcher {
  /**
   * Fetches content from the given URL.
   * @param url The URL to fetch content from.
   * @returns A promise that resolves to the fetched content as a string.
   */
  fetch(url: string): Promise<string>;
}

export class WikipediaFetcher implements IWikipediaFetcher {
  /**
   * Fetches content from a URL with a robust retry mechanism.
   *
   * This method attempts to fetch content up to `MAX_RETRIES` times. If a request
   * fails due to a network error or a 503 status code, it will wait for an
   * exponentially increasing amount of time before retrying. This strategy,
   * known as exponential backoff, helps to avoid overwhelming a server that
   * may be temporarily unavailable.
   *
   * For other HTTP errors (e.g., 404 Not Found), the method will fail immediately
   * without retrying, as these are typically not transient issues.
   *
   * @param url The URL to fetch the content from.
   * @returns A promise that resolves with the raw HTML content of the page.
   * @throws {FetchError} If the request fails after all retry attempts, or if a non-retriable HTTP error occurs.
   */
  public async fetch(url: string): Promise<string> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(url, {
          headers: {
            "User-Agent": "TraitorScraper/1.0",
          },
        });
        return response.data;
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 503 || !axiosError.response) {
          const backoffTime = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        } else {
          break; // Not a retriable error
        }
      }
    }

    throw new FetchError(
      `Failed to fetch from ${url} after ${MAX_RETRIES} attempts. Last error: ${
        lastError?.message ?? "Unknown error"
      }`
    );
  }
}
