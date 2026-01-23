import { getSeries, getCandidates, getVotes } from './apiClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('apiClient', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getSeries', () => {
    it('should fetch series successfully', async () => {
      const mockSeries = [{ id: 1, title: 'Series 1', year: 2022 }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSeries,
      });

      const result = await getSeries();
      expect(global.fetch).toHaveBeenCalledWith('/api/series');
      expect(result).toEqual(mockSeries);
    });

    it('should throw an error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(getSeries()).rejects.toThrow('Failed to fetch series');
    });
  });

  describe('getCandidates', () => {
    it('should fetch candidates successfully', async () => {
      const mockCandidates = [{ id: 101, name: 'Alice', role: 'Faithful', outcome: 'Winner' }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCandidates,
      });

      const result = await getCandidates('1');
      expect(global.fetch).toHaveBeenCalledWith('/api/series/1/candidates');
      expect(result).toEqual(mockCandidates);
    });

    it('should throw an error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(getCandidates('1')).rejects.toThrow('Failed to fetch candidates');
    });
  });

  describe('getVotes', () => {
    it('should fetch votes successfully', async () => {
      const mockVotes = [{ id: 1, episode: 1, voterId: 101, votedForId: 102, seriesId: 1 }];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockVotes,
      });

      const result = await getVotes('1');
      expect(global.fetch).toHaveBeenCalledWith('/api/series/1/votes');
      expect(result).toEqual(mockVotes);
    });

    it('should throw an error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(getVotes('1')).rejects.toThrow('Failed to fetch votes');
    });
  });
});
