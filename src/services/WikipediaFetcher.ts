import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import UserAgent from 'user-agents';

// Custom Error types for more specific error handling
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * @class WikipediaFetcher
 * @description A service to robustly fetch HTML content from Wikipedia.
 */
export class WikipediaFetcher {
  private readonly client = axios.create();
  private readonly userAgent = new UserAgent();

  constructor() {
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (!!error.response && error.response.status >= 500)
        );
      },
    });
  }

  /**
   * Fetches the HTML content of a Wikipedia page.
   *
   * @param {string} url The full URL of the Wikipedia page.
   * @returns {Promise<string>} A promise that resolves with the page's HTML content.
   * @throws {NetworkError} If the request fails due to network issues.
   * @throws {RateLimitError} If the request is rate-limited (HTTP 429).
   * @throws {Error} For other HTTP errors.
   */
  public async fetchPage(url: string): Promise<string> {
    try {
      const response = await this.client.get<string>(url, {
        headers: {
          'User-Agent': this.userAgent.toString(),
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new RateLimitError('Rate limit exceeded.');
        }
        if (error.code && ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)) {
          throw new NetworkError(`Request timed out: ${error.message}`);
        }
        if (!error.response) {
          throw new NetworkError(`Network error: ${error.message}`);
        }
        throw new Error(`HTTP Error: ${error.response?.status}`);
      }
      throw new Error(`An unknown error occurred: ${(error as Error).message}`);
    }
  }
}
