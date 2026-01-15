import axios from 'axios';
import { WikipediaFetcher, NetworkError, RateLimitError } from './WikipediaFetcher';

// Mock axios and its dependencies
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock UserAgent to return a predictable value
jest.mock('user-agents', () => {
  return jest.fn().mockImplementation(() => {
    return {
      toString: () => 'Test User Agent',
    };
  });
});

// Mock axios-retry, as its functionality is tested via the axios mock
jest.mock('axios-retry', () => jest.fn());

// Create a mock for the axios instance that axios.create() returns
const mockedAxiosInstance = {
  get: jest.fn(),
};

// Mock axios.isAxiosError to identify our test error objects
mockedAxios.isAxiosError.mockImplementation(
  (payload: any): payload is any => payload && payload.isAxiosError === true,
);

// Mock axios.create() to return our mocked instance
mockedAxios.create.mockReturnValue(mockedAxiosInstance as any);

describe('WikipediaFetcher', () => {
  let fetcher: WikipediaFetcher;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Re-create the fetcher, which will call the mocked axios.create()
    fetcher = new WikipediaFetcher();
  });

  it('should fetch a page successfully', async () => {
    const mockHtml = '<html><body><h1>Test Page</h1></body></html>';
    // Use the instance's get mock
    mockedAxiosInstance.get.mockResolvedValue({ data: mockHtml });

    const html = await fetcher.fetchPage('https://example.com');

    expect(html).toBe(mockHtml);
    expect(mockedAxiosInstance.get).toHaveBeenCalledWith('https://example.com', {
      headers: { 'User-Agent': 'Test User Agent' },
    });
    expect(mockedAxiosInstance.get).toHaveBeenCalledTimes(1);
  });

  it('should throw a RateLimitError on HTTP 429', async () => {
    mockedAxiosInstance.get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 429 },
    });

    await expect(fetcher.fetchPage('https://example.com')).rejects.toThrow(RateLimitError);
  });

  it('should throw a NetworkError for connection timeouts', async () => {
    mockedAxiosInstance.get.mockRejectedValue({
      isAxiosError: true,
      code: 'ETIMEDOUT',
      message: 'Request timed out',
    });

    await expect(fetcher.fetchPage('https://example.com')).rejects.toThrow(NetworkError);
  });

  it('should throw a generic HTTP error for other status codes', async () => {
    mockedAxiosInstance.get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });

    await expect(fetcher.fetchPage('https://example.com')).rejects.toThrow('HTTP Error: 404');
  });

  it('should throw a NetworkError for non-response errors', async () => {
    mockedAxiosInstance.get.mockRejectedValue({
      isAxiosError: true,
      message: 'Network error',
      // No 'response' property
    });

    await expect(fetcher.fetchPage('https://example.com')).rejects.toThrow(NetworkError);
  });

  it('should throw a generic error for non-axios errors', async () => {
    // This error does NOT have isAxiosError: true
    mockedAxiosInstance.get.mockRejectedValue(new Error('Something went wrong'));

    await expect(fetcher.fetchPage('https://example.com')).rejects.toThrow('An unknown error occurred: Something went wrong');
  });
});
