import axios, { AxiosError } from 'axios';
import { FetchError } from '../errors/FetchError';

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export interface IWikipediaFetcher {
  fetch(url: string): Promise<string>;
}

export class WikipediaFetcher implements IWikipediaFetcher {
  public async fetch(url: string): Promise<string> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'TraitorScraper/1.0',
          },
        });
        return response.data;
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 503 || !axiosError.response) {
          const backoffTime = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        } else {
          break; // Not a retriable error
        }
      }
    }

    throw new FetchError(
      `Failed to fetch from ${url} after ${MAX_RETRIES} attempts. Last error: ${
        lastError?.message ?? 'Unknown error'
      }`,
    );
  }
}
