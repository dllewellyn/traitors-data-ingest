import axios from 'axios';
import { WikipediaFetcher } from './WikipediaFetcher';
import { FetchError } from '../errors/FetchError';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WikipediaFetcher', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return data on a successful fetch', async () => {
    const fetcher = new WikipediaFetcher();
    const url = 'http://test.com';
    const expectedData = '<html><body>Success</body></html>';

    mockedAxios.get.mockResolvedValue({ data: expectedData });

    const data = await fetcher.fetch(url);

    expect(data).toBe(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(url, {
      headers: { 'User-Agent': 'TraitorScraper/1.0' },
    });
  });

  it('should retry on a 503 error and succeed on the second attempt', async () => {
    const fetcher = new WikipediaFetcher();
    const url = 'http://test.com';
    const expectedData = '<html><body>Success</body></html>';

    mockedAxios.get
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValueOnce({ data: expectedData });

    const data = await fetcher.fetch(url);

    expect(data).toBe(expectedData);
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  }, 10000); // Increase timeout for this test

  it('should throw FetchError after max retries on network error', async () => {
    const fetcher = new WikipediaFetcher();
    const url = 'http://test.com';

    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(fetcher.fetch(url)).rejects.toThrow(FetchError);
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  }, 15000); // Increase timeout for this test

  it('should not retry on a 404 error', async () => {
    const fetcher = new WikipediaFetcher();
    const url = 'http://test.com';

    mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

    await expect(fetcher.fetch(url)).rejects.toThrow(FetchError);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
